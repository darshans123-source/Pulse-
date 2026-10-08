import React, { useState } from 'react';
import { 
  Search, 
  Flame, 
  Compass, 
  Sparkles, 
  TrendingUp, 
  Grid3X3, 
  List, 
  Heart, 
  MessageSquare, 
  Video, 
  UserPlus, 
  UserCheck 
} from 'lucide-react';
import { Post, User } from '../types';
import { PostCard } from './PostCard';
import { SEED_USERS } from '../data/seedData';
import { sound } from '../utils/soundEngine';

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
  onSelectPostDetail?: (post: Post) => void;
  onToggleFollow?: (userId: string) => void;
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
  onSelectPostDetail,
  onToggleFollow,
  selectedTag,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>(selectedTag || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'feed'>('grid');

  const categories = [
    { id: 'all', label: 'All Spotlights' },
    { id: 'Architecture', label: 'Architecture' },
    { id: 'WebDev', label: 'Engineering' },
    { id: 'Materials', label: 'Materials' },
    { id: 'SoundDesign', label: 'Sound' },
    { id: 'CeramicCraft', label: 'Craft' },
  ];

  const trendingTags = [
    { tag: 'Architecture', count: '1.4k pulses' },
    { tag: 'WebDev', count: '3.2k pulses' },
    { tag: 'SoundDesign', count: '890 pulses' },
    { tag: 'CeramicCraft', count: '640 pulses' },
    { tag: 'InterviewPrep', count: '2.1k pulses' },
    { tag: 'Django', count: '1.1k pulses' },
  ];

  const recommendedUsers = SEED_USERS.filter((u) => u.id !== currentUser.id);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = post.content.toLowerCase().includes(q);
      const matchAuthor = post.author.name.toLowerCase().includes(q) || post.author.handle.toLowerCase().includes(q);
      const matchTags = post.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchAuthor && !matchTags) return false;
    }

    if (filterCategory === 'all') return true;
    return post.tags.some(
      (t) => t.toLowerCase() === filterCategory.toLowerCase()
    );
  });

  // Media posts for the 3x3 discovery grid
  const mediaPosts = posts.filter((p) => p.media);

  return (
    <div className="space-y-6">
      {/* Search Header Bar */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 sm:p-5 backdrop-blur-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search creators, keywords, #hashtags, or topics..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/80 py-2.5 pl-10 pr-4 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Category Tabs & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-neutral-950/60 rounded-xl border border-neutral-800/60">
            {categories.map((cat) => {
              const isActive = filterCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sound.playClick();
                    setFilterCategory(cat.id);
                  }}
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

          <div className="flex items-center gap-1 p-1 bg-neutral-950/60 rounded-xl border border-neutral-800/60 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('grid');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Media grid discovery"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setViewMode('feed');
              }}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'feed' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
              title="Feed cards"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Trending Topics & Hashtags */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-2.5">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Trending on Pulse</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {trendingTags.map((item) => (
            <button
              key={item.tag}
              onClick={() => {
                sound.playClick();
                setFilterCategory(item.tag);
              }}
              className="group flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-1.5 text-xs hover:border-neutral-700 transition-colors"
            >
              <span className="font-semibold text-neutral-200 group-hover:text-indigo-400">
                #{item.tag}
              </span>
              <span className="text-[10px] text-neutral-500 tabular-nums">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Creators to Discover */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Recommended Creators
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {recommendedUsers.slice(0, 3).map((user) => (
            <div
              key={user.id}
              className="rounded-xl border border-neutral-800/80 bg-neutral-950/40 p-3 flex items-center justify-between gap-2.5"
            >
              <button
                onClick={() => onSelectProfile(user)}
                className="flex items-center gap-2.5 text-left min-w-0 flex-1 group"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-10 w-10 rounded-xl object-cover ring-1 ring-neutral-800 group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${user.avatarGradient} text-xs font-bold text-white group-hover:scale-105 transition-transform`}
                  >
                    {user.avatarInitials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-white truncate group-hover:text-indigo-400 transition-colors">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-neutral-500 truncate">{user.role}</div>
                </div>
              </button>

              {onToggleFollow && (
                <button
                  onClick={() => {
                    sound.playClick();
                    onToggleFollow(user.id);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors shrink-0 ${
                    user.isFollowing
                      ? 'border border-neutral-800 text-neutral-400 hover:text-white'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Media Grid Discovery View (Instagram / Pinterest style 3-column media grid) */}
      {viewMode === 'grid' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span>Visual Discovery Grid</span>
            <span className="text-[11px] text-neutral-500">{mediaPosts.length} media items</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {mediaPosts.map((post) => {
              const isVideo = post.media?.type === 'video';
              const imageUrl = post.media?.url || post.media?.thumbnailUrl;

              return (
                <div
                  key={post.id}
                  onClick={() => {
                    sound.playClick();
                    if (onSelectPostDetail) {
                      onSelectPostDetail(post);
                    } else {
                      onOpenComments(post);
                    }
                  }}
                  className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800/80 cursor-pointer shadow-sm hover:border-neutral-700 transition-all"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={post.media?.title || 'Explore media'}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`h-full w-full p-4 flex flex-col justify-end bg-gradient-to-br ${
                        post.media?.gradient || 'from-indigo-950 to-neutral-950'
                      }`}
                    >
                      <span className="font-display text-xs font-bold text-white line-clamp-2">
                        {post.media?.title || post.content.slice(0, 40)}
                      </span>
                    </div>
                  )}

                  {/* Top Right Media Type Badge */}
                  {isVideo && (
                    <div className="absolute top-2 right-2 rounded-md bg-black/60 p-1 text-white backdrop-blur-sm">
                      <Video className="h-3 w-3" />
                    </div>
                  )}

                  {/* Hover Overlay with Likes & Comments Count */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white text-xs font-semibold backdrop-blur-[2px]">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 fill-white" />
                      <span>{post.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 fill-white" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Traditional Feed Card View */}
      {viewMode === 'feed' && (
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12 text-center text-xs text-neutral-500">
              No pulses match your search criteria.
            </div>
          ) : (
            filteredPosts.map((post) => (
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
            ))
          )}
        </div>
      )}
    </div>
  );
};
