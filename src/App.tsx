import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { TaskDetailModal } from './components/task/TaskDetailModal';
import { TaskCreateModal } from './components/task/TaskCreateModal';
import { ArchitectureView } from './components/architecture/ArchitectureView';
import { TeamView } from './components/team/TeamView';
import { AuthModal } from './components/auth/AuthModal';
import { api } from './services/api';
import type { Board, Task, ActivityLog, Priority } from '../shared/types/index';

function AppContent() {
  const { currentWorkspace, currentUserRole, user } = useAuth();

  const [currentTab, setCurrentTab] = useState<'board' | 'architecture' | 'api' | 'team'>('board');
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [activeBoard, setActiveBoard] = useState<Board | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string | undefined>(undefined);

  // Fetch boards when workspace changes
  useEffect(() => {
    if (!currentWorkspace) return;

    const fetchBoards = async () => {
      try {
        const data = await api.getBoards(currentWorkspace._id);
        setBoards(data.boards);
        if (data.boards.length > 0) {
          setSelectedBoardId(data.boards[0]._id);
        } else {
          setSelectedBoardId(null);
          setActiveBoard(null);
          setTasks([]);
        }
      } catch (err: any) {
        console.error('Failed to load workspace boards:', err);
      }
    };

    fetchBoards();
  }, [currentWorkspace]);

  // Fetch board details, tasks, and activities when selected board changes
  const loadBoardData = async (boardId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getBoardDetails(boardId);
      setActiveBoard(data.board);
      setTasks(data.tasks);
      setActivities(data.activities);
    } catch (err: any) {
      setError(err.message || 'Failed to load board tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBoardId) {
      loadBoardData(selectedBoardId);
    }
  }, [selectedBoardId]);

  // Task Move with Optimistic Updates & Rollback
  const handleMoveTask = async (taskId: string, targetColumnId: string, newOrder: number) => {
    const previousTasks = [...tasks];

    // Optimistic state mutation
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, columnId: targetColumnId, order: newOrder } : t))
    );

    try {
      const res = await api.moveTask(taskId, targetColumnId, newOrder);
      // Re-sync with server response
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.task : t)));

      // Refresh activity log
      if (selectedBoardId) {
        const data = await api.getBoardDetails(selectedBoardId);
        setActivities(data.activities);
      }
    } catch (err: any) {
      console.error('Move failed, rolling back:', err);
      // Rollback on failure (e.g. WIP limit exceeded or RBAC violation)
      setTasks(previousTasks);
      alert(err.message || 'Failed to move task. Check WIP limit or permissions.');
    }
  };

  // Task Update
  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const res = await api.updateTask(taskId, updates);
      setTasks((prev) => prev.map((t) => (t._id === taskId ? res.task : t)));
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(res.task);
      }
      if (selectedBoardId) {
        const data = await api.getBoardDetails(selectedBoardId);
        setActivities(data.activities);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  };

  // Task Delete
  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(null);
      }
      if (selectedBoardId) {
        const data = await api.getBoardDetails(selectedBoardId);
        setActivities(data.activities);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  // Task Create
  const handleCreateTask = async (taskData: {
    columnId: string;
    title: string;
    description: string;
    priority: Priority;
    labels: string[];
    dueDate?: string;
  }) => {
    if (!selectedBoardId) return;
    try {
      const res = await api.createTask(selectedBoardId, {
        ...taskData,
        assignees: user ? [user._id] : [],
      });
      setTasks((prev) => [...prev, res.task]);
      if (selectedBoardId) {
        const data = await api.getBoardDetails(selectedBoardId);
        setActivities(data.activities);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
      throw err;
    }
  };

  // Create new board
  const handleCreateBoard = async () => {
    if (!currentWorkspace) return;
    const title = prompt('Enter new board title (e.g., Sprint 25 - Frontend Roadmap):');
    if (!title || !title.trim()) return;

    try {
      const res = await api.createBoard(currentWorkspace._id, title.trim(), 'Active sprint board');
      setBoards((prev) => [...prev, res.board]);
      setSelectedBoardId(res.board._id);
    } catch (err: any) {
      alert(err.message || 'Failed to create board');
    }
  };

  // Filter tasks by active preset
  const displayTasks = tasks.filter((t) => {
    if (activeFilter === 'my_tasks') {
      if (!user) return true;
      return t.assignees.some((a) => (typeof a === 'object' ? a._id : a) === user._id);
    }
    if (activeFilter === 'urgent') {
      return t.priority === 'urgent' || t.priority === 'high';
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 font-sans antialiased selection:bg-neutral-900 selection:text-white">
      {/* Top Bar (3-Zone Contract) */}
      <TopBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenCreateTask={() => {
          setCreateTaskColumnId(undefined);
          setIsCreateTaskOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (shown on Kanban tab) */}
        {currentTab === 'board' && (
          <Sidebar
            boards={boards}
            selectedBoardId={selectedBoardId}
            onSelectBoard={setSelectedBoardId}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
            onOpenCreateBoard={handleCreateBoard}
          />
        )}

        {/* View Switcher */}
        {currentTab === 'board' && (
          <>
            {loading ? (
              <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-neutral-500 font-medium">Hydrating Kanban Board...</p>
                </div>
              </div>
            ) : activeBoard ? (
              <KanbanBoard
                board={activeBoard}
                tasks={displayTasks}
                activities={activities}
                userRole={currentUserRole}
                onSelectTask={setSelectedTask}
                onMoveTask={handleMoveTask}
                onQuickAddTask={(colId) => {
                  setCreateTaskColumnId(colId);
                  setIsCreateTaskOpen(true);
                }}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white text-center">
                <h3 className="text-base font-bold text-neutral-900 mb-1">No Active Board</h3>
                <p className="text-xs text-neutral-500 mb-4 max-w-sm">
                  Create your first sprint board to begin organizing tasks into collaborative Kanban lanes.
                </p>
                {currentUserRole !== 'viewer' && (
                  <button
                    onClick={handleCreateBoard}
                    className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                  >
                    Create Starter Board
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {currentTab === 'architecture' && <ArchitectureView />}
        {currentTab === 'api' && <ArchitectureView />}
        {currentTab === 'team' && <TeamView />}
      </div>

      {/* Modals */}
      {selectedTask && activeBoard && (
        <TaskDetailModal
          task={selectedTask}
          columns={activeBoard.columns}
          userRole={currentUserRole}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}

      {isCreateTaskOpen && activeBoard && (
        <TaskCreateModal
          columns={activeBoard.columns}
          defaultColumnId={createTaskColumnId}
          onClose={() => setIsCreateTaskOpen(false)}
          onCreate={handleCreateTask}
        />
      )}

      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
