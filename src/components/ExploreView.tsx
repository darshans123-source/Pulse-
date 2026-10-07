import React, { useState } from 'react';
import { Search, Flame, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { Post, User } from '../types';
import { PostCard } from './PostCard';

interface ExploreViewProps {
  posts: Post[];
  currentUser: User;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onRepost: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onOpenComments: (post: Post) => void;
  onSelectTag: (tag: string) => void;
  onSelectProfile: (user: User) => void;
  onShare: (post: Post) => void;
  selectedTag?: string;
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  posts,
  currentUser,
  onLike,
  onBookmark,
  onRepost,
  onVotePoll,
  onOpenComments,
  onSelectTag,
  onSelectProfile,
  onShare,
  selectedTag,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>(selectedTag || 'all');

  const categories = [
    { id: 'all', label: 'All Spotlights' },
    { id: 'Architecture', label: 'Architecture' },
    { id: 'WebDev', label: 'Engineering' },
    { id: 'InteractionDesign', label: 'Interfaces' },
    { id: 'SoundDesign', label: 'Sound' },
    { id: 'Craft', label: 'Physical Craft' },
  ];

  const filteredPosts = posts.filter((post) => {
    if (filterCategory === 'all') return true;
    return post.tags.some(
      (t) => t.toLowerCase() === filterCategory.toLowerCase()
    );
  });

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-6 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-2">
          <Compass className="h-4 w-4" />
          <span>Curated Discovery</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">
          Explore Ideas, Prototypes & Spatial Craft
        </h2>
        <p className="mt-1 text-sm text-neutral-400 max-w-xl">
          Deep-dive into architectural notebooks, low-level browser engineering breakthroughs, tactile audio recordings, and contemporary studio craft.
        </p>

        {/* Category Tabs - Clean functional segmented control buttons */}
        <div className="mt-5 flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
          {categories.map((cat) => {
            const isActive = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-neutral-800 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Spotlight Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-indigo-950/40 via-neutral-900/40 to-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
              Community Spotlight
            </span>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">
            Monolithic Daylight Studies
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            How physical granite corridors shape natural light refraction and acoustic damping in contemporary European baths.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onSelectTag('Architecture')}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              Browse #Architecture archive →
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-emerald-950/30 via-neutral-900/40 to-neutral-900/60 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Engineering Deep-Dive
            </span>
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          <h3 className="font-display text-lg font-bold text-white">
            Sub-Pixel Font Metric Overrides
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Eliminating cumulative layout shifts on mobile devices using CSS `size-adjust` and `ascent-override`.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onSelectTag('Engineering')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              Browse #Engineering archive →
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Posts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>Showing {filteredPosts.length} pulses</span>
          {filterCategory !== 'all' && (
            <button
              onClick={() => setFilterCategory('all')}
              className="text-indigo-400 hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        {filteredPosts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLike={onLike}
            onBookmark={onBookmark}
            onRepost={onRepost}
            onVotePoll={onVotePoll}
            onOpenComments={onOpenComments}
            onSelectTag={onSelectTag}
            onSelectProfile={onSelectProfile}
            onShare={onShare}
          />
        ))}
      </div>
    </div>
  );
};
