import React from 'react';
import { 
  Compass, 
  Users, 
  Bookmark, 
  MessageSquare, 
  Layers, 
  Flame, 
  Hash, 
  Check, 
  UserCheck, 
  ArrowRight,
  Zap,
  Film,
  Settings,
  LogOut
} from 'lucide-react';
import { User, Channel } from '../types';

interface LeftSidebarProps {
  currentUser: User;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  channels: Channel[];
  availableUsers: User[];
  onSwitchUser: (user: User) => void;
  onSelectProfile: (user: User) => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentUser,
  activeFilter,
  setActiveFilter,
  activeTab,
  setActiveTab,
  channels,
  availableUsers,
  onSwitchUser,
  onSelectProfile,
  onOpenSettings,
  onLogout,
}) => {
  const feedFilters = [
    { id: 'all', label: 'For You', icon: Flame },
    { id: 'intent_circles', label: 'Intent Circles (Help)', icon: Zap, highlight: true },
    { id: 'following', label: 'Following', icon: UserCheck },
    { id: 'design', label: 'Design & Craft', icon: Layers },
    { id: 'tech', label: 'Tech & Engineering', icon: Hash },
    { id: 'lab', label: 'Creative Lab', icon: Compass },
  ];

  return (
    <aside className="sticky top-20 flex flex-col gap-5 w-full">
      {/* Current User Card */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onSelectProfile(currentUser)}
            className="group relative shrink-0"
          >
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-12 w-12 rounded-xl object-cover shadow-md transition-transform group-hover:scale-105 ring-1 ring-neutral-800"
              />
            ) : (
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${currentUser.avatarGradient} text-sm font-bold text-white shadow-md transition-transform group-hover:scale-105`}
              >
                {currentUser.avatarInitials}
              </div>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <button
              onClick={() => onSelectProfile(currentUser)}
              className="text-left font-semibold text-neutral-100 hover:text-indigo-400 transition-colors truncate block w-full text-sm"
            >
              {currentUser.name}
            </button>
            <div className="text-xs text-neutral-400 truncate">
              {currentUser.handle} · {currentUser.role}
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="mt-4 flex items-center justify-between border-t border-neutral-800/60 pt-3 text-xs text-neutral-400">
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-200 tabular-nums">{currentUser.followingCount}</span>
            <span className="text-[11px] text-neutral-500">Following</span>
          </div>
          <span className="text-neutral-700" aria-hidden="true">·</span>
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-200 tabular-nums">{currentUser.followersCount}</span>
            <span className="text-[11px] text-neutral-500">Followers</span>
          </div>
          <span className="text-neutral-700" aria-hidden="true">·</span>
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-200 tabular-nums">{currentUser.postsCount}</span>
            <span className="text-[11px] text-neutral-500">Posts</span>
          </div>
        </div>
      </div>

      {/* Main Discoveries & Reels */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-2.5 backdrop-blur-sm space-y-1">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
            activeTab === 'feed'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Flame className="h-4 w-4 text-indigo-400" />
            <span>Feed & Pulses</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
            activeTab === 'reels'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Film className="h-4 w-4 text-rose-400" />
            <span>Reels & Video Clips</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/20">
            Live
          </span>
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
            activeTab === 'explore'
              ? 'bg-neutral-800 text-white font-semibold'
              : 'text-neutral-400 hover:bg-neutral-800/40 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Compass className="h-4 w-4 text-teal-400" />
            <span>Explore Grid</span>
          </div>
        </button>
      </div>

      {/* Feed Filters */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-3 backdrop-blur-sm">
        <div className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase text-neutral-400">
          Feed Channels
        </div>
        <div className="space-y-1">
          {feedFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeTab === 'feed' && activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveTab('feed');
                  setActiveFilter(filter.id);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-neutral-800 text-white font-semibold shadow-inner'
                    : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-indigo-400' : 'text-neutral-500'}`} />
                  <span>{filter.label}</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Persona Switcher - Allows exploring platform as different creators */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-3 backdrop-blur-sm">
        <div className="px-3 py-1.5 text-xs font-semibold tracking-wider uppercase text-neutral-400">
          Demo Creator Personas
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto no-scrollbar">
          {availableUsers.map((user) => {
            const isCurrent = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => onSwitchUser(user)}
                className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-xs transition-colors ${
                  isCurrent
                    ? 'bg-indigo-950/40 border border-indigo-500/30 text-neutral-100'
                    : 'hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-6 w-6 rounded-md object-cover ring-1 ring-neutral-800"
                    />
                  ) : (
                    <div
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-tr ${user.avatarGradient} text-[10px] font-bold text-white`}
                    >
                      {user.avatarInitials}
                    </div>
                  )}
                  <span className="truncate font-medium">{user.name}</span>
                </div>
                {isCurrent ? (
                  <Check className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                ) : (
                  <span className="text-[10px] text-neutral-500 shrink-0">Switch</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Settings Action */}
      {onOpenSettings && (
        <button
          onClick={onOpenSettings}
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 p-2.5 text-xs text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors"
        >
          <Settings className="h-3.5 w-3.5" />
          <span>App Settings & Preferences</span>
        </button>
      )}

      {/* Switch / Sign In with PIN */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="flex items-center justify-center gap-2 rounded-xl border border-neutral-800/80 bg-neutral-900/30 p-2.5 text-xs text-neutral-400 hover:text-rose-300 hover:border-rose-500/30 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Switch / PIN Sign In</span>
        </button>
      )}
    </aside>
  );
};
