import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Shield, LogOut, CheckCircle2 } from 'lucide-react';
import type { Role } from '../../../shared/types/index';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { user, login, register, logout, switchRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickSwitch = async (role: Role) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await switchRole(role);
      onClose();
    } catch (err: any) {
      setErrorMsg('Failed to switch role');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-md overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              {user ? 'Account & Session' : isRegister ? 'Create Account' : 'Sign In'}
            </h3>
            {user && (
              <p className="text-xs text-neutral-500">
                Logged in as <span className="font-semibold text-neutral-800">{user.email}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Quick Demo Switcher Section */}
          <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <span className="text-xs font-semibold text-neutral-700 block mb-2">
              Quick Role Switcher (Pre-configured personas)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: 'admin' as Role, name: 'Alex (Admin)', sub: 'Full access' },
                { role: 'manager' as Role, name: 'Elena (Manager)', sub: 'Board & Member lead' },
                { role: 'member' as Role, name: 'Marcus (Member)', sub: 'Tasks & Checklists' },
                { role: 'viewer' as Role, name: 'Sarah (Viewer)', sub: 'Read-only view' },
              ].map((item) => (
                <button
                  key={item.role}
                  onClick={() => handleQuickSwitch(item.role)}
                  className="p-2 text-left bg-white border border-neutral-200 rounded-lg hover:border-neutral-900 hover:shadow-2xs transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </div>
                  <div className="text-[10px] text-neutral-400">{item.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Regular Login / Register Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
              Or Custom Credentials
            </span>

            {errorMsg && (
              <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                {errorMsg}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="developer@taskflow.dev"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-700 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
              >
                {isRegister ? 'Already have an account? Sign In' : 'Need an account? Register'}
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : isRegister ? 'Register' : 'Sign In'}
              </button>
            </div>
          </form>

          {user && (
            <div className="pt-3 border-t border-neutral-100 flex justify-end">
              <button
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
