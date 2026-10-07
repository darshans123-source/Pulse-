import React from 'react';
import { Search, Plus, Check, TrendingUp, Users, Hash, Zap, ArrowRight, MessageSquare, Radio } from 'lucide-react';
import { User, Channel, Post } from '../types';
import { sound } from '../utils/soundEngine';

interface RightSidebarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  users: User[];
  currentUser: User;
  intentSeekingPosts?: Post[];
  onToggleFollow: (userId: string) => void;
  channels: Channel[];
  onToggleJoinChannel: (channelId: string) => void;
  onSelectTag: (tag: string) => void;
  onSelectProfile: (user: User) => void;
  onOpenComments?: (post: Post) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  searchQuery,
  setSearchQuery,
  users,
  currentUser,
  intentSeekingPosts = [],
  onToggleFollow,
  channels,
  onToggleJoinChannel,
  onSelectTag,
  onSelectProfile,
  onOpenComments,
}) => {
  const trendingTags = [
    { tag: 'Architecture', postCount: '1.4k posts' },
    { tag: 'WebDev', postCount: '2.8k posts' },
    { tag: 'Materials', postCount: '920 posts' },
    { tag: 'SoundDesign', postCount: '780 posts' },
    { tag: 'Ceramics', postCount: '450 posts' },
  ];

  return (
    <aside className="sticky top-20 flex flex-col gap-6 w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search posts, creators, #tags..."
          className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/60 py-2.5 pl-10 pr-4 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Active Intent Circles Seeking Your Skills (Intent Engine Core Feature) */}
      {intentSeekingPosts.length > 0 && (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-neutral-900/40 p-4 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
                <Zap className="h-3 w-3" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">
                Seeking Your Skills ({intentSeekingPosts.length})
              </span>
            </div>
            <span className="text-[10px] text-indigo-300 font-mono">
              Intent Engine
            </span>
          </div>

          <div className="space-y-2.5">
            {intentSeekingPosts.slice(0, 3).map((post) => (
              <div
                key={post.id}
                className="p-2.5 rounded-xl border border-neutral-800 bg-neutral-950/60 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-indigo-400">
                    {post.intent?.category}
                  </span>
                  <span className={`text-[9px] font-medium px-1.5 py-0.2 rounded border ${
                    post.intent?.urgency === 'High' ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                  }`}>
                    {post.intent?.urgency}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`h-5 w-5 rounded-md bg-gradient-to-tr ${post.author.avatarGradient} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                    {post.author.avatarInitials}
                  </div>
                  <span className="text-xs font-medium text-neutral-200 truncate">
                    {post.author.name}
                  </span>
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  "{post.content}"
                </p>

                {onOpenComments && (
                  <button
                    onClick={() => onOpenComments(post)}
                    className="w-full mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 py-1 text-[11px] font-medium text-indigo-200 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Offer Advice / Answer</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Who To Follow */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
            Creators to Follow
          </span>
          <Users className="h-3.5 w-3.5 text-neutral-500" />
        </div>
        <div className="divide-y divide-neutral-800/40">
          {users.slice(0, 4).map((user) => (
            <div key={user.id} className="flex items-center justify-between py-3">
              <button
                onClick={() => onSelectProfile(user)}
                className="flex items-center gap-2.5 min-w-0 text-left group"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${user.avatarGradient} text-xs font-bold text-white shadow-sm`}
                >
                  {user.avatarInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-semibold text-neutral-200 group-hover:text-indigo-400 transition-colors">
                    {user.name}
                  </div>
                  <div className="truncate text-[11px] text-neutral-500">
                    {user.handle}
                  </div>
                </div>
              </button>

              <button
                onClick={() => onToggleFollow(user.id)}
                className={`ml-2 inline-flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  user.isFollowing
                    ? 'border border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:border-rose-800 hover:text-rose-400'
                    : 'bg-white text-neutral-900 hover:bg-neutral-200 shadow-sm'
                }`}
              >
                {user.isFollowing ? (
                  <>
                    <Check className="h-3 w-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Topics / Tags */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
            Trending Discussions
          </span>
          <TrendingUp className="h-3.5 w-3.5 text-neutral-500" />
        </div>
        <div className="mt-2 space-y-2">
          {trendingTags.map((item) => (
            <button
              key={item.tag}
              onClick={() => onSelectTag(item.tag)}
              className="group flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-neutral-800/50"
            >
              <div>
                <div className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-400 transition-colors">
                  #{item.tag}
                </div>
                <div className="text-[11px] text-neutral-500">{item.postCount}</div>
              </div>
              <span className="text-xs text-neutral-600 group-hover:text-neutral-400">→</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Communities */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800/60">
          <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
            Curated Channels
          </span>
          <Hash className="h-3.5 w-3.5 text-neutral-500" />
        </div>
        <div className="mt-2 space-y-3">
          {channels.slice(0, 3).map((channel) => (
            <div key={channel.id} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-200 truncate">
                  {channel.name}
                </div>
                <div className="text-[11px] text-neutral-500 line-clamp-1">
                  {channel.description}
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playSuccess();
                  onToggleJoinChannel(channel.id);
                }}
                className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  channel.isJoined
                    ? 'border border-neutral-700 bg-neutral-800 text-neutral-300'
                    : 'border border-indigo-500/40 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/50'
                }`}
              >
                {channel.isJoined ? 'Joined' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Network Presence & Engine Health */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-3.5 backdrop-blur-sm space-y-2 text-xs">
        <div className="flex items-center justify-between text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span className="font-semibold text-neutral-200">Network Presence</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">Live</span>
        </div>
        <div className="space-y-1 text-[11px] text-neutral-400">
          <div className="flex justify-between">
            <span>Online creators</span>
            <span className="font-mono tabular-nums text-neutral-200">142</span>
          </div>
          <div className="flex justify-between">
            <span>Intent Engine status</span>
            <span className="text-indigo-400 font-medium">gemini-3.8-flash</span>
          </div>
          <div className="flex justify-between">
            <span>Tactile audio engine</span>
            <span className="text-neutral-300">WebAudio API 48kHz</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
