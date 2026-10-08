import React, { useState } from 'react';
import { 
  Bell, 
  PenSquare, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Film, 
  Settings, 
  LogOut, 
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { User } from '../types';
import { sound } from '../utils/soundEngine';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenComposer: () => void;
  onSelectProfile: (user: User) => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenComposer,
  onSelectProfile,
  onOpenSettings,
  onOpenAuth,
  onLogout,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  const navItems = [
    { id: 'feed', label: 'Feed' },
    { id: 'reels', label: 'Reels' },
    { id: 'explore', label: 'Explore' },
    { id: 'channels', label: 'Channels' },
    { id: 'bookmarks', label: 'Bookmarks' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('feed');
          }}
          className="group flex items-center gap-2 text-left transition-opacity hover:opacity-90 shrink-0"
        >
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            Pulse
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 transition-transform group-hover:scale-125" />
        </button>

        {/* Clean Text Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id);
                }}
                className={`relative py-1 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Primary Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Audio Feedback Switch */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute tactile UI sounds' : 'Enable tactile UI sounds'}
            title={soundEnabled ? 'Tactile clicks ON (click to mute)' : 'Tactile clicks MUTED (click to enable)'}
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border transition-colors ${
              soundEnabled
                ? 'border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50'
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </button>

          {/* Notifications Trigger */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNotifications();
            }}
            aria-label="View notifications"
            className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
          >
            <Bell className="h-4 w-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
            )}
          </button>

          {/* New Post Button */}
          {currentUser && (
            <button
              onClick={() => {
                sound.playClick();
                onOpenComposer();
              }}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-[0.98] whitespace-nowrap"
            >
              <PenSquare className="h-4 w-4" />
              <span>Create Pulse</span>
            </button>
          )}

          {/* Current User Dropdown / Sign in button */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-1 pr-1.5 transition-colors hover:border-neutral-700 hover:bg-neutral-800/60"
                title="Account menu"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-neutral-800"
                  />
                ) : (
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${currentUser.avatarGradient} text-xs font-bold text-white shadow-inner`}
                  >
                    {currentUser.avatarInitials}
                  </div>
                )}
                <ChevronDown className="h-3 w-3 text-neutral-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-2xl border border-neutral-800 bg-neutral-950 p-2 shadow-2xl animate-in fade-in duration-100">
                  <div className="px-3 py-2 border-b border-neutral-800/60 mb-1">
                    <div className="text-xs font-bold text-white truncate">{currentUser.name}</div>
                    <div className="text-[10px] text-neutral-400 truncate">{currentUser.handle}</div>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onSelectProfile(currentUser);
                    }}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-neutral-400" />
                    <span>My Profile</span>
                  </button>

                  {onOpenSettings && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenSettings();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Settings & Privacy</span>
                    </button>
                  )}

                  {onLogout && (
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/20 transition-colors border-t border-neutral-800/60 mt-1 pt-1.5"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Log Out</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-colors"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
