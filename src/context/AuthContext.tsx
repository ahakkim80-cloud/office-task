import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { User, Workspace, Role } from '../../shared/types/index';

interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  currentUserRole: Role;
  loading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<void>;
  register: (name: string, email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  setCurrentWorkspace: (workspace: Workspace) => void;
  switchRole: (role: Role) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initAuth = async () => {
    setLoading(true);
    try {
      // Check existing token or auto-login with default admin demo user
      if (!api.getToken()) {
        const res = await api.login('alex@taskflow.dev', 'password123');
        setUser(res.user);
      }
      const data = await api.getMe();
      setUser(data.user);
      setWorkspaces(data.workspaces);
      if (data.workspaces.length > 0) {
        setCurrentWorkspace(data.workspaces[0]);
      }
    } catch (err: any) {
      console.warn('Auth initialization fallback:', err);
      // Auto-fallback with demo account
      try {
        const res = await api.login('alex@taskflow.dev', 'password123');
        setUser(res.user);
        const data = await api.getMe();
        setWorkspaces(data.workspaces);
        if (data.workspaces.length > 0) setCurrentWorkspace(data.workspaces[0]);
      } catch (innerErr) {
        setError('Failed to initialize session');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password = 'password123') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      const data = await api.getMe();
      setWorkspaces(data.workspaces);
      if (data.workspaces.length > 0) {
        setCurrentWorkspace(data.workspaces[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password = 'password123') => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.register(name, email, password);
      setUser(res.user);
      const data = await api.getMe();
      setWorkspaces(data.workspaces);
      if (data.workspaces.length > 0) {
        setCurrentWorkspace(data.workspaces[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: Role) => {
    const roleEmailMap: Record<Role, string> = {
      admin: 'alex@taskflow.dev',
      manager: 'elena@taskflow.dev',
      member: 'marcus@taskflow.dev',
      viewer: 'sarah@taskflow.dev',
    };
    await login(roleEmailMap[role], 'password123');
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    setCurrentWorkspace(null);
    setWorkspaces([]);
  };

  const refreshWorkspaces = async () => {
    try {
      const data = await api.getWorkspaces();
      setWorkspaces(data.workspaces);
      if (currentWorkspace) {
        const updated = data.workspaces.find((w) => w._id === currentWorkspace._id);
        if (updated) setCurrentWorkspace(updated);
      }
    } catch (err) {
      console.error('Failed to refresh workspaces:', err);
    }
  };

  // Determine current user's role in the current workspace
  const currentUserRole: Role = React.useMemo(() => {
    if (!user || !currentWorkspace) return 'viewer';
    const member = currentWorkspace.members.find((m) => {
      const memberId = typeof m.user === 'object' ? m.user._id : m.user;
      return memberId === user._id;
    });
    return member ? member.role : (user.role || 'viewer');
  }, [user, currentWorkspace]);

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        currentWorkspace,
        currentUserRole,
        loading,
        error,
        login,
        register,
        logout,
        setCurrentWorkspace,
        switchRole,
        refreshWorkspaces,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
