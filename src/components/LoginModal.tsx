import React, { useState } from 'react';
import type { User } from '../types/pos';
import { loginApi, registerApi } from '../services/api';
import { ShieldCheck, UserCheck, Mail, Lock, User as UserIcon, LogIn, UserPlus, AlertCircle, X, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  currentUser: User | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAdminRole = () => {
    setIdentifier('sathyapathi555@gmail.com');
    setPassword('');
    setError('Please enter your secret Admin Password to authenticate.');
  };

  const handleSelectWorkerRole = () => {
    setIdentifier('cashier@store.com');
    setPassword('worker123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        if (!identifier.trim() || !password) {
          setError('Please enter your email/username and secret password.');
          setLoading(false);
          return;
        }

        // Try API server password authentication
        const res = await loginApi(identifier.trim(), password);
        if ('user' in res && res.user) {
          onLoginSuccess(res.user);
          onClose();
        } else if ('error' in res && res.error) {
          // Check if server rejected password
          if (res.error.toLowerCase().includes('invalid')) {
            setError('Access Denied: Incorrect password for this account.');
            setLoading(false);
            return;
          }

          // Local fallback for offline mode - enforce password check for sathyapathi555@gmail.com
          const cleanId = identifier.trim().toLowerCase();
          if (cleanId === 'sathyapathi555@gmail.com' || cleanId === 'admin') {
            if (password !== 'admin123') {
              setError('Access Denied: Incorrect Admin Password.');
              setLoading(false);
              return;
            }
            const adminUser: User = {
              id: 'local-admin',
              username: 'Sathyapathi (Admin)',
              email: 'sathyapathi555@gmail.com',
              role: 'admin',
              createdAt: new Date().toISOString()
            };
            onLoginSuccess(adminUser);
            onClose();
          } else {
            const workerUser: User = {
              id: `local-worker-${Date.now()}`,
              username: identifier.trim(),
              email: identifier.includes('@') ? identifier.trim() : `${identifier.trim()}@store.com`,
              role: 'worker',
              createdAt: new Date().toISOString()
            };
            onLoginSuccess(workerUser);
            onClose();
          }
        }
      } else {
        if (!username.trim() || !email.trim() || !password) {
          setError('All fields are required for sign up.');
          setLoading(false);
          return;
        }

        const res = await registerApi(username.trim(), email.trim(), password);
        if ('user' in res && res.user) {
          setSuccessMessage(`Account created successfully as ${res.user.role.toUpperCase()}! Logging you in...`);
          setTimeout(() => {
            onLoginSuccess(res.user);
            onClose();
          }, 800);
        } else if ('error' in res && res.error) {
          setError(res.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {mode === 'login' ? <LogIn className="w-5 h-5 text-cyan-400" /> : <UserPlus className="w-5 h-5 text-amber-400" />}
            <h3 className="font-bold text-slate-100 text-base">
              {mode === 'login' ? 'Staff & Admin Login' : 'Create New Account'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center justify-center gap-2 ${
              mode === 'login' ? 'border-cyan-400 text-cyan-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition border-b-2 flex items-center justify-center gap-2 ${
              mode === 'register' ? 'border-amber-400 text-amber-400 bg-slate-900/60' : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Admin Email Notice */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Admin Authentication Security:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Accounts registered with <strong className="text-white font-mono">sathyapathi555@gmail.com</strong> require entering your secret password. Unauthenticated users cannot access Admin features.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Full Name / Staff Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Sathyapathi or Cashier 1"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              {mode === 'login' ? 'Email or Username' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type={mode === 'register' ? 'email' : 'text'}
                placeholder={mode === 'register' ? 'sathyapathi555@gmail.com' : 'sathyapathi555@gmail.com or username'}
                value={mode === 'login' ? identifier : email}
                onChange={(e) => mode === 'login' ? setIdentifier(e.target.value) : setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition disabled:opacity-50 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-400 hover:to-teal-500 text-slate-950 shadow-cyan-950/50'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-amber-950/50'
            }`}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Log In & Authenticate</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create & Authenticate Account</span>
              </>
            )}
          </button>

          {/* Quick Select Account */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <div className="text-[10px] uppercase font-bold text-slate-500 text-center tracking-wider">
              Select Account to Login
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSelectAdminRole}
                disabled={loading}
                className="py-2 px-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/80 text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin (Password Required)</span>
              </button>
              <button
                type="button"
                onClick={handleSelectWorkerRole}
                disabled={loading}
                className="py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Worker Cashier</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
