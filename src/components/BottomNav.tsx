import React from 'react';
import { Home, Compass, Plus, MessageSquare, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { sound } from '../utils/soundEngine';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  onOpenComposer: () => void;
  onSelectProfile: (user: User) => void;
  unreadMessagesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenComposer,
  onSelectProfile,
  unreadMessagesCount,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-md border-t border-neutral-800">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1: Home / Feed */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('feed');
          }}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center transition-colors ${
            activeTab === 'feed' ? 'text-indigo-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Feed</span>
        </button>

        {/* Tab 2: Explore */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('explore');
          }}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center transition-colors ${
            activeTab === 'explore' ? 'text-indigo-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Explore</span>
        </button>

        {/* Tab 3: Action: Create Post */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenComposer();
          }}
          className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 active:scale-95 transition-transform">
            <Plus className="h-5 w-5 stroke-[2.5]" />
          </div>
        </button>

        {/* Tab 4: Messages */}
        <button
          onClick={() => {
            sound.playClick();
            setActiveTab('messages');
          }}
          className={`relative flex min-h-[44px] min-w-[44px] flex-col items-center justify-center transition-colors ${
            activeTab === 'messages' ? 'text-indigo-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-2 right-4 flex h-2 w-2 rounded-full bg-indigo-500" />
          )}
          <span className="text-[10px] font-medium tracking-tight mt-1">Chat</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          onClick={() => {
            sound.playClick();
            onSelectProfile(currentUser);
            setActiveTab('profile');
          }}
          className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center transition-colors ${
            activeTab === 'profile' ? 'text-indigo-400' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <div
            className={`flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr ${currentUser.avatarGradient} text-[9px] font-bold text-white`}
          >
            {currentUser.avatarInitials}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1">Profile</span>
        </button>
      </div>
    </nav>
  );
};
