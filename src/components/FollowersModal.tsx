import React from 'react';
import { X, UserCheck, UserPlus } from 'lucide-react';
import { User } from '../types';
import { sound } from '../utils/soundEngine';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: 'Followers' | 'Following';
  users: User[];
  currentUser: User;
  onToggleFollow: (userId: string) => void;
  onSelectProfile: (user: User) => void;
}

export const FollowersModal: React.FC<FollowersModalProps> = ({
  isOpen,
  onClose,
  title,
  users,
  currentUser,
  onToggleFollow,
  onSelectProfile,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80 mb-3">
          <h3 className="font-display text-sm font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2.5 divide-y divide-neutral-900 pr-1">
          {users.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No {title.toLowerCase()} found.
            </div>
          ) : (
            users.map((user) => {
              const isMe = user.id === currentUser.id;
              return (
                <div key={user.id} className="pt-2 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      onSelectProfile(user);
                      onClose();
                    }}
                    className="flex items-center gap-2.5 text-left min-w-0 flex-1 group"
                  >
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${user.avatarGradient} text-xs font-bold text-white group-hover:scale-105 transition-transform`}
                    >
                      {user.avatarInitials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {user.handle}
                      </div>
                    </div>
                  </button>

                  {!isMe && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onToggleFollow(user.id);
                      }}
                      className={`shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                        user.isFollowing
                          ? 'border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white'
                          : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/30'
                      }`}
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
