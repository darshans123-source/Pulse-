import React, { useState } from 'react';
import { Bell, PenSquare, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { User } from '../types';
import { sound } from '../utils/soundEngine';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  onOpenComposer: () => void;
  onSelectProfile: (user: User) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  unreadNotificationsCount,
  onOpenNotifications,
  onOpenComposer,
  onSelectProfile,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);

  const toggleSound = () => {
    const next = sound.toggle();
    setSoundEnabled(next);
  };

  const navItems = [
    { id: 'feed', label: 'Feed' },
    { id: 'explore', label: 'Explore' },
    { id: 'channels', label: 'Channels' },
    { id: 'bookmarks', label: 'Bookmarks' },
    { id: 'messages', label: 'Messages' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('feed');
          }}
          className="group flex items-center gap-2 text-left transition-opacity hover:opacity-90"
        >
          <span className="font-display text-2xl font-bold tracking-tight text-white">
            Pulse
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 transition-transform group-hover:scale-125" />
        </button>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
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

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Tactile Audio Feedback Switch */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute tactile UI sounds' : 'Enable tactile UI sounds'}
            title={soundEnabled ? 'Tactile clicks ON (click to mute)' : 'Tactile clicks MUTED (click to enable)'}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
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
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-300 transition-colors hover:border-neutral-700 hover:text-white"
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
          <button
            onClick={() => {
              sound.playClick();
              onOpenComposer();
            }}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-[0.98] whitespace-nowrap"
          >
            <PenSquare className="h-4 w-4" />
            <span>Create Post</span>
          </button>

          {/* Current User Avatar */}
          <button
            onClick={() => {
              sound.playClick();
              onSelectProfile(currentUser);
            }}
            className="flex items-center gap-2 rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-1 transition-colors hover:border-neutral-700 hover:bg-neutral-800/60"
            title="View your profile"
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${currentUser.avatarGradient} text-xs font-bold text-white shadow-inner`}
            >
              {currentUser.avatarInitials}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
