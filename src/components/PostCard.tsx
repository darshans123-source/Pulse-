import React, { useState, useRef } from 'react';
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
  Sparkles,
  MapPin,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Edit3,
  Trash2,
  AlertTriangle
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
  onDeletePost?: (postId: string) => void;
  onEditPost?: (post: Post) => void;
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
  onDeletePost,
  onEditPost,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [brilliantReactions, setBrilliantReactions] = useState(post.likesCount > 80 ? 12 : 3);
  const [hasReactedBrilliant, setHasReactedBrilliant] = useState(false);
  const [preciseReactions, setPreciseReactions] = useState(post.likesCount > 100 ? 18 : 5);
  const [hasReactedPrecise, setHasReactedPrecise] = useState(false);
  
  // Media video states
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const isAuthor = currentUser.id === post.author.id;

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

  const handleDoubleTapMedia = () => {
    if (!post.isLiked) {
      onLike(post.id);
    }
    sound.playPop();
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);
  };

  const toggleVideoPlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const isAudioPost = post.channel === 'Creative Lab' || post.tags.includes('SoundDesign');

  return (
    <article className="relative rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 backdrop-blur-sm transition-colors hover:border-neutral-700/80">
      {/* Author Header & Clean Metadata */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onSelectProfile(post.author)}
            className="group relative shrink-0"
            title={`View ${post.author.name}'s profile`}
          >
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="h-11 w-11 rounded-xl object-cover shadow-md transition-transform group-hover:scale-105"
              />
            ) : (
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${post.author.avatarGradient} text-sm font-bold text-white shadow-md transition-transform group-hover:scale-105`}
              >
                {post.author.avatarInitials}
              </div>
            )}
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

            {/* Clean unboxed text with subtle typographic separators */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5 flex-wrap">
              <span>{post.author.handle}</span>
              <span aria-hidden="true">·</span>
              <span>{post.createdAt}</span>
              {post.location && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-0.5 text-neutral-400">
                    <MapPin className="h-3 w-3 text-neutral-500" />
                    <span>{post.location}</span>
                  </span>
                </>
              )}
              {post.channel && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-400 font-medium">{post.channel}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Header Menu */}
        <div className="relative flex items-center gap-1">
          <button
            onClick={() => onShare(post)}
            className="text-neutral-500 hover:text-neutral-300 transition-colors p-1.5 rounded-lg hover:bg-neutral-800/60"
            title="Share pulse"
          >
            <Share2 className="h-4 w-4" />
          </button>

          {isAuthor && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-neutral-500 hover:text-neutral-300 transition-colors p-1.5 rounded-lg hover:bg-neutral-800/60"
                title="Post options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-8 z-30 w-36 rounded-xl border border-neutral-800 bg-neutral-950 p-1.5 shadow-xl animate-in fade-in duration-100">
                  {onEditPost && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEditPost(post);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-neutral-900 hover:text-white"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Edit post</span>
                    </button>
                  )}
                  {onDeletePost && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete post</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Text Body */}
      <div className="mt-3 text-sm text-neutral-200 leading-relaxed whitespace-pre-line">
        {post.content}
      </div>

      {/* Embedded Media / Photo / Video / Generative Card */}
      {isAudioPost ? (
        <div className="mt-4">
          <AudioWaveformPlayer
            title={post.media?.title || 'Sonic Archival Session'}
            subtitle={post.media?.subtitle || 'Archival Tape Recording'}
          />
        </div>
      ) : post.media ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/60 relative group">
          {/* Double Tap Heart Feedback */}
          {showHeartBurst && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center animate-in zoom-in-50 fade-in duration-200">
              <Heart className="h-20 w-20 fill-rose-500 text-rose-500 drop-shadow-xl animate-pulse" />
            </div>
          )}

          {/* Photo Post */}
          {post.media.type === 'image' && post.media.url && (
            <div
              className="relative cursor-pointer overflow-hidden max-h-[520px] bg-neutral-950"
              onDoubleClick={handleDoubleTapMedia}
            >
              <img
                src={post.media.url}
                alt={post.media.title || 'Post photo'}
                loading="lazy"
                className="w-full object-cover max-h-[520px] transition-transform duration-300 group-hover:scale-[1.01]"
              />
              {post.media.title && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-8">
                  <div className="font-display text-sm font-bold text-white drop-shadow">
                    {post.media.title}
                  </div>
                  {post.media.subtitle && (
                    <div className="text-xs text-neutral-300 drop-shadow">
                      {post.media.subtitle}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Video Post */}
          {post.media.type === 'video' && post.media.url && (
            <div
              className="relative cursor-pointer max-h-[520px] bg-black overflow-hidden"
              onClick={toggleVideoPlay}
              onDoubleClick={handleDoubleTapMedia}
            >
              <video
                ref={videoRef}
                src={post.media.url}
                poster={post.media.thumbnailUrl}
                loop
                playsInline
                muted={isVideoMuted}
                className="w-full max-h-[520px] object-cover"
              />

              {/* Video Play Overlay */}
              {!isVideoPlaying && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                    <Play className="h-6 w-6 ml-1" />
                  </div>
                </div>
              )}

              {/* Video Control Bar */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-between text-white text-xs">
                <div>
                  {post.media.title && (
                    <div className="font-semibold text-xs drop-shadow">{post.media.title}</div>
                  )}
                  {post.media.subtitle && (
                    <div className="text-[11px] text-neutral-300">{post.media.subtitle}</div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsVideoMuted(!isVideoMuted);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 transition-colors"
                  title={isVideoMuted ? 'Unmute' : 'Mute'}
                >
                  {isVideoMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          )}

          {/* Abstract Generative Card */}
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

          {/* Quote Card */}
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

          {/* Code Card */}
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
            <Heart className={`h-4 w-4 transition-transform active:scale-125 ${post.isLiked ? 'fill-current text-rose-500' : ''}`} />
            <span className="tabular-nums font-semibold">{post.likesCount}</span>
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
            <span className="tabular-nums font-semibold">{post.comments.length}</span>
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
            <span className="tabular-nums font-semibold">{post.repostsCount}</span>
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
            <Bookmark className={`h-4 w-4 ${post.isBookmarked ? 'fill-current text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Delete this pulse?</h4>
              <p className="text-xs text-neutral-400 mt-1">
                This action cannot be undone. It will permanently remove this post and all its comments.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl bg-neutral-900 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setShowDeleteConfirm(false);
                  if (onDeletePost) onDeletePost(post.id);
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

