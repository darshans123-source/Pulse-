import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Repeat2, 
  Bookmark, 
  Share2, 
  Check, 
  Copy, 
  MoreHorizontal,
  Lightbulb,
  Target,
  Sparkles 
} from 'lucide-react';
import { Post, User } from '../types';
import { IntentCircleWidget } from './IntentCircleWidget';
import { PollView } from './PollView';
import { AudioWaveformPlayer } from './AudioWaveformPlayer';
import { sound } from '../utils/soundEngine';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onRepost: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onOpenComments: (post: Post) => void;
  onSelectTag: (tag: string) => void;
  onSelectProfile: (user: User) => void;
  onShare: (post: Post) => void;
  onInviteHelper?: (postId: string, helperUserId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onLike,
  onBookmark,
  onRepost,
  onVotePoll,
  onOpenComments,
  onSelectTag,
  onSelectProfile,
  onShare,
  onInviteHelper,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [brilliantReactions, setBrilliantReactions] = useState(post.likesCount > 80 ? 12 : 3);
  const [hasReactedBrilliant, setHasReactedBrilliant] = useState(false);
  const [preciseReactions, setPreciseReactions] = useState(post.likesCount > 100 ? 18 : 5);
  const [hasReactedPrecise, setHasReactedPrecise] = useState(false);

  const handleCopyCode = (code: string) => {
    sound.playClick();
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleToggleBrilliant = () => {
    sound.playPop();
    setHasReactedBrilliant(!hasReactedBrilliant);
    setBrilliantReactions((c) => (hasReactedBrilliant ? c - 1 : c + 1));
  };

  const handleTogglePrecise = () => {
    sound.playPop();
    setHasReactedPrecise(!hasReactedPrecise);
    setPreciseReactions((c) => (hasReactedPrecise ? c - 1 : c + 1));
  };

  const isAudioPost = post.channel === 'Creative Lab' || post.tags.includes('SoundDesign');

  return (
    <article className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 backdrop-blur-sm transition-colors hover:border-neutral-700/80">
      {/* Author Header & Clean Unboxed Metadata */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onSelectProfile(post.author)}
            className="group relative shrink-0"
            title={`View ${post.author.name}'s profile`}
          >
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${post.author.avatarGradient} text-sm font-bold text-white shadow-md transition-transform group-hover:scale-105`}
            >
              {post.author.avatarInitials}
            </div>
          </button>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => onSelectProfile(post.author)}
                className="font-semibold text-neutral-100 hover:text-indigo-400 transition-colors text-sm"
              >
                {post.author.name}
              </button>
              {post.author.isVerified && (
                <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[9px] font-bold">
                  ✓
                </span>
              )}
            </div>

            {/* Zero-Pill Metadata Discipline: Clean unboxed text with subtle typographic separators */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span>{post.author.handle}</span>
              <span aria-hidden="true">·</span>
              <span>{post.createdAt}</span>
              {post.channel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-400 font-medium">{post.channel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quiet share dropdown or more button */}
        <button
          onClick={() => onShare(post)}
          className="text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          title="Share pulse"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      {/* Post Text Body */}
      <div className="mt-3 text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>

      {/* Embedded Media / Generative Card */}
      {isAudioPost ? (
        <div className="mt-4">
          <AudioWaveformPlayer
            title={post.media?.title || 'Sonic Archival Session'}
            subtitle={post.media?.subtitle || 'Archival Tape Recording'}
          />
        </div>
      ) : post.media ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60">
          {post.media.type === 'abstract' && (
            <div className={`relative p-6 bg-gradient-to-br ${post.media.gradient || 'from-indigo-950 to-neutral-950'}`}>
              <div className="relative z-10 space-y-1">
                <div className="font-display text-lg font-bold text-white">
                  {post.media.title}
                </div>
                <div className="text-xs text-neutral-300 font-medium">
                  {post.media.subtitle}
                </div>
              </div>
            </div>
          )}

          {post.media.type === 'quote' && (
            <div className={`relative p-6 bg-gradient-to-br ${post.media.gradient || 'from-purple-950 to-neutral-950'} border-l-2 border-indigo-400`}>
              <div className="font-display text-base font-semibold italic text-neutral-100">
                “{post.media.title}”
              </div>
              {post.media.quoteAuthor && (
                <div className="mt-2 text-xs text-indigo-300 font-medium">
                  — {post.media.quoteAuthor}
                </div>
              )}
            </div>
          )}

          {post.media.type === 'code' && post.media.codeSnippet && (
            <div className="text-xs font-mono">
              <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/80 px-4 py-2 text-neutral-400">
                <span>{post.media.codeSnippet.language}</span>
                <button
                  onClick={() => handleCopyCode(post.media?.codeSnippet?.code || '')}
                  className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="overflow-x-auto p-4 text-neutral-200 bg-neutral-950/90 leading-relaxed">
                <code>{post.media.codeSnippet.code}</code>
              </pre>
            </div>
          )}
        </div>
      ) : null}

      {/* Embedded Poll with Real-Time Animated Bar Chart */}
      {post.poll && (
        <PollView
          postId={post.id}
          poll={post.poll}
          onVote={onVotePoll}
        />
      )}

      {/* Embedded Intent Circle Widget */}
      {post.intent && post.intent.isIntentCircleActive && (
        <IntentCircleWidget
          intent={post.intent}
          post={post}
          currentUser={currentUser}
          onInviteHelper={(postId, helperId) => {
            if (onInviteHelper) onInviteHelper(postId, helperId);
          }}
          onOpenComments={onOpenComments}
          onSelectProfile={onSelectProfile}
        />
      )}

      {/* Tags row */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onSelectTag(tag)}
              className="text-xs text-neutral-400 hover:text-indigo-400 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Interaction Bar - 44px min touch target compliant */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-800/60 pt-3 text-neutral-400">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Like Button */}
          <button
            onClick={() => {
              sound.playPop();
              onLike(post.id);
            }}
            className={`flex min-h-[44px] min-w-[44px] items-center gap-1.5 px-2 text-xs font-medium transition-colors ${
              post.isLiked
                ? 'text-rose-500'
                : 'hover:text-rose-400'
            }`}
            title={post.isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`h-4 w-4 transition-transform active:scale-125 ${post.isLiked ? 'fill-current' : ''}`} />
            <span className="tabular-nums">{post.likesCount}</span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenComments(post);
            }}
            className="flex min-h-[44px] min-w-[44px] items-center gap-1.5 px-2 text-xs font-medium hover:text-indigo-400 transition-colors"
            title="View comments"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="tabular-nums">{post.comments.length}</span>
          </button>

          {/* Repost Button */}
          <button
            onClick={() => {
              sound.playSuccess();
              onRepost(post.id);
            }}
            className={`flex min-h-[44px] min-w-[44px] items-center gap-1.5 px-2 text-xs font-medium transition-colors ${
              post.isReposted
                ? 'text-emerald-400'
                : 'hover:text-emerald-400'
            }`}
            title={post.isReposted ? 'Undo repost' : 'Repost'}
          >
            <Repeat2 className="h-4 w-4" />
            <span className="tabular-nums">{post.repostsCount}</span>
          </button>
        </div>

        {/* Micro-Reactions & Bookmark */}
        <div className="flex items-center gap-1">
          {/* Brilliant Reaction */}
          <button
            type="button"
            onClick={handleToggleBrilliant}
            className={`flex min-h-[44px] items-center gap-1 px-2 text-xs font-medium transition-colors rounded-lg ${
              hasReactedBrilliant
                ? 'text-amber-400 bg-amber-950/40'
                : 'hover:text-amber-400'
            }`}
            title="React: Brilliant insight"
          >
            <Lightbulb className={`h-3.5 w-3.5 ${hasReactedBrilliant ? 'fill-current' : ''}`} />
            <span className="tabular-nums text-[11px]">{brilliantReactions}</span>
          </button>

          {/* Precise Reaction */}
          <button
            type="button"
            onClick={handleTogglePrecise}
            className={`flex min-h-[44px] items-center gap-1 px-2 text-xs font-medium transition-colors rounded-lg ${
              hasReactedPrecise
                ? 'text-indigo-400 bg-indigo-950/40'
                : 'hover:text-indigo-400'
            }`}
            title="React: Precise craft"
          >
            <Target className={`h-3.5 w-3.5 ${hasReactedPrecise ? 'stroke-[2.5]' : ''}`} />
            <span className="tabular-nums text-[11px]">{preciseReactions}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={() => {
              sound.playClick();
              onBookmark(post.id);
            }}
            className={`flex min-h-[44px] min-w-[44px] items-center justify-center text-xs font-medium transition-colors ${
              post.isBookmarked
                ? 'text-amber-400'
                : 'hover:text-amber-400'
            }`}
            title={post.isBookmarked ? 'Remove bookmark' : 'Bookmark'}
          >
            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
};
