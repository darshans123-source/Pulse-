import React, { useState } from 'react';
import { Hash, Users, Check, Plus, Compass } from 'lucide-react';
import { Channel, Post, User } from '../types';
import { PostCard } from './PostCard';

interface ChannelsViewProps {
  channels: Channel[];
  onToggleJoinChannel: (channelId: string) => void;
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
}

export const ChannelsView: React.FC<ChannelsViewProps> = ({
  channels,
  onToggleJoinChannel,
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
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>(channels[0]?.id || '');

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];
  const channelPosts = posts.filter(
    (p) => p.channel?.toLowerCase() === activeChannel?.name.toLowerCase()
  );

  return (
    <div className="space-y-6">
      {/* Channels Directory Grid */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl font-bold text-white">
              Guilds & Channels
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Curated circles centered on high-craft technical & design topics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {channels.map((ch) => {
            const isSelected = ch.id === activeChannel?.id;
            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChannelId(ch.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-indigo-500/80 bg-indigo-950/20'
                    : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-bold text-white flex items-center gap-1.5">
                      <Hash className="h-4 w-4 text-indigo-400" />
                      {ch.name}
                    </span>
                    <span className="text-[11px] text-neutral-500 tabular-nums">
                      {ch.membersCount.toLocaleString()} members
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-indigo-400 font-medium">
                    {ch.category}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleJoinChannel(ch.id);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      ch.isJoined
                        ? 'border border-neutral-700 bg-neutral-800 text-neutral-300'
                        : 'bg-white text-neutral-950 hover:bg-neutral-200'
                    }`}
                  >
                    {ch.isJoined ? 'Joined' : 'Join'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Channel Feed */}
      {activeChannel && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {activeChannel.name} Feed
              </span>
              <span className="text-xs text-neutral-600">·</span>
              <span className="text-xs text-neutral-500">
                {channelPosts.length} pulses published
              </span>
            </div>
          </div>

          {channelPosts.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-10 text-center text-xs text-neutral-500">
              No pulses in this channel yet. Use the Create Post button to publish the first!
            </div>
          ) : (
            channelPosts.map((post) => (
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
