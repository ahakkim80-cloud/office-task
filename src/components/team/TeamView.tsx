import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Users, UserPlus, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Role, WorkspaceMember } from '../../../shared/types/index';

export const TeamView: React.FC = () => {
  const { currentWorkspace, currentUserRole, refreshWorkspaces } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const canInvite = currentUserRole === 'admin' || currentUserRole === 'manager';
  const canChangeRole = currentUserRole === 'admin';

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !inviteEmail.trim() || !canInvite) return;

    setIsSubmitting(true);
    setFeedback(null);
    try {
      await api.inviteMember(currentWorkspace._id, inviteEmail.trim(), inviteRole);
      setFeedback({
        type: 'success',
        message: `Invited ${inviteEmail} as ${inviteRole} to ${currentWorkspace.name}.`,
      });
      setInviteEmail('');
      await refreshWorkspaces();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to invite member' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (memberUserId: string, newRole: Role) => {
    if (!currentWorkspace || !canChangeRole) return;
    try {
      await api.updateMemberRole(currentWorkspace._id, memberUserId, newRole);
      setFeedback({ type: 'success', message: 'Member role updated successfully.' });
      await refreshWorkspaces();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update member role' });
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-y-auto bg-neutral-50/60 p-6 md:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">Team & Permissions</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Manage workspace collaborators, access permissions, and 4-tier RBAC security.
          </p>
        </div>

        {feedback && (
          <div
            className={`p-3 text-xs rounded-lg border flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Invite Member Card */}
        {canInvite ? (
          <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus className="w-4 h-4 text-neutral-700" />
              <h3 className="text-sm font-bold text-neutral-900">Invite New Collaborator</h3>
            </div>
            <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-center">
              <input
                type="email"
                required
                placeholder="colleague@taskflow.dev"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1 min-w-[220px] text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="text-xs px-3 py-2 border border-neutral-200 rounded-lg focus:outline-none bg-white font-medium capitalize cursor-pointer"
              >
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Inviting...' : 'Send Invite'}
              </button>
            </form>
          </div>
        ) : (
          <div className="p-4 bg-neutral-100 rounded-xl border border-neutral-200 text-xs text-neutral-600">
            You are viewing this workspace with <strong className="capitalize">{currentUserRole}</strong> privileges. Only Admins and Managers can invite new members.
          </div>
        )}

        {/* Members List Table */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">
              Workspace Members ({currentWorkspace?.members.length || 0})
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Workspace: {currentWorkspace?.name}
            </span>
          </div>

          <div className="divide-y divide-neutral-200">
            {currentWorkspace?.members.map((member, idx) => {
              const u = typeof member.user === 'object' ? member.user : null;
              const userId = typeof member.user === 'object' ? member.user._id : member.user;
              const name = u ? u.name : 'Team Member';
              const email = u ? u.email : 'member@taskflow.dev';

              return (
                <div key={idx} className="p-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">{name}</h4>
                      <p className="text-[11px] text-neutral-400 font-mono">{email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs text-neutral-400 font-mono hidden sm:inline tabular-nums">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </span>

                    {canChangeRole ? (
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(userId, e.target.value as Role)}
                        className="text-xs px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded-lg font-semibold text-neutral-800 focus:outline-none capitalize cursor-pointer"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md capitalize">
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
