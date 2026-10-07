import React from 'react';
import { Plus } from 'lucide-react';
import { Story, User } from '../types';

interface StoriesBarProps {
  stories: Story[];
  currentUser: User;
  onOpenStory: (story: Story) => void;
  onAddStory: () => void;
}

export const StoriesBar: React.FC<StoriesBarProps> = ({
  stories,
  currentUser,
  onOpenStory,
  onAddStory,
}) => {
  return (
    <div className="relative w-full rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        {/* Current User Add Story Action */}
        <button
          onClick={onAddStory}
          className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none"
        >
          <div className="relative">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr ${currentUser.avatarGradient} text-sm font-bold text-white shadow-md transition-transform group-hover:scale-105`}
            >
              {currentUser.avatarInitials}
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-neutral-900 bg-indigo-600 text-white shadow-sm">
              <Plus className="h-3 w-3 stroke-[3]" />
            </div>
          </div>
          <span className="w-16 truncate text-center text-[11px] font-medium text-neutral-300">
            Add Story
          </span>
        </button>

        {/* Stories List */}
        {stories.map((story) => {
          const isCurrentUser = story.author.id === currentUser.id;
          return (
            <button
              key={story.id}
              onClick={() => onOpenStory(story)}
              className="group flex flex-col items-center gap-1.5 shrink-0 focus:outline-none"
            >
              <div
                className={`p-0.5 rounded-2xl transition-transform group-hover:scale-105 ${
                  story.hasUnseen
                    ? 'bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-sm shadow-indigo-500/20'
                    : 'border border-neutral-700 bg-neutral-800/50'
                }`}
              >
                <div
                  className={`flex h-13 w-13 items-center justify-center rounded-[14px] bg-gradient-to-tr ${story.author.avatarGradient} text-sm font-bold text-white`}
                >
                  {story.author.avatarInitials}
                </div>
              </div>
              <span className="w-16 truncate text-center text-[11px] font-medium text-neutral-300">
                {isCurrentUser ? 'Your Story' : story.author.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
