import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { User } from '../types';
import { SEED_USERS, CURRENT_USER } from '../data/seedData';
import { sound } from '../utils/soundEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  onSignUp: (newUser: User) => void;
  initialMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onSignUp,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'login') {
      if (!email.trim() || !password.trim()) {
        setError('Please enter your email or username and password');
        return;
      }
      sound.playSuccess();
      // Find matching demo user or default to CURRENT_USER
      const matched = [CURRENT_USER, ...SEED_USERS].find(
        (u) => u.handle.toLowerCase() === email.toLowerCase() || u.name.toLowerCase() === email.toLowerCase()
      ) || CURRENT_USER;
      onLogin(matched);
      onClose();
    } else if (mode === 'signup') {
      if (!fullName.trim() || !username.trim() || !email.trim()) {
        setError('Please complete all required fields');
        return;
      }
      sound.playSuccess();
      const initials = fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'PS';

      const newUser: User = {
        id: `usr_${Date.now()}`,
        name: fullName.trim(),
        handle: username.startsWith('@') ? username.trim() : `@${username.trim()}`,
        avatarGradient: 'from-indigo-500 via-purple-600 to-pink-500',
        avatarInitials: initials,
        bio: 'Explorer of digital craft, media, and connected communities on Pulse Social.',
        role: 'Pulse Creator',
        location: 'Global',
        followersCount: 1,
        followingCount: 4,
        postsCount: 0,
        joinedDate: 'Joined Just now',
        isVerified: false,
      };
      onSignUp(newUser);
      onClose();
    } else if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please provide your registered email address');
        return;
      }
      sound.playSuccess();
      setForgotSent(true);
    }
  };

  const handleQuickLoginAs = (user: User) => {
    sound.playClick();
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-950 p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-neutral-900"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              Pulse
            </span>
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>
          <h3 className="text-lg font-bold text-neutral-100">
            {mode === 'login' && 'Sign in to Pulse Social'}
            {mode === 'signup' && 'Create your Pulse account'}
            {mode === 'forgot' && 'Reset your password'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login' && 'Connect with creators, share stories, and explore live media'}
            {mode === 'signup' && 'Join the independent social network designed for real craft'}
            {mode === 'forgot' && 'Enter your email to receive a password recovery link'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2 text-xs text-red-300">
            {error}
          </div>
        )}

        {mode === 'forgot' && forgotSent ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-xs text-neutral-300">
              Recovery instructions have been simulated and dispatched to <strong className="text-white">{email}</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                setForgotSent(false);
                setMode('login');
              }}
              className="w-full rounded-xl bg-neutral-800 py-2.5 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                    <input
                      type="text"
                      placeholder="e.g. Jordan Hayes"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-2.5 pl-10 pr-3 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-neutral-500 font-bold">@</span>
                    <input
                      type="text"
                      placeholder="jordanhayes"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-2.5 pl-10 pr-3 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                {mode === 'login' ? 'Email or Username' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  placeholder={mode === 'login' ? 'alex or alex@design' : 'you@example.com'}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-2.5 pl-10 pr-3 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-500" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-2.5 pl-10 pr-3 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-colors active:scale-[0.99] mt-2"
            >
              <span>
                {mode === 'login' && 'Sign In'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Send Reset Link'}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </form>
        )}

        {/* Quick Demo Switcher */}
        <div className="mt-6 border-t border-neutral-800/80 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium text-neutral-400">Quick sign in as demo creator:</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[CURRENT_USER, SEED_USERS[0], SEED_USERS[1], SEED_USERS[4]].map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleQuickLoginAs(user)}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 hover:text-white shrink-0 transition-colors"
              >
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr ${user.avatarGradient} text-[9px] font-bold text-white`}
                >
                  {user.avatarInitials}
                </div>
                <span>{user.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode Toggle Footer */}
        <div className="mt-4 text-center text-xs text-neutral-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('signup');
                }}
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Sign up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode('login');
                }}
                className="font-semibold text-indigo-400 hover:text-indigo-300"
              >
                Sign in
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
