import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Music, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Check
} from 'lucide-react';
import { Reel, User, Post } from '../types';
import { sound } from '../utils/soundEngine';

interface ReelsViewProps {
  reels: Reel[];
  currentUser: User;
  onLikeReel: (reelId: string) => void;
  onBookmarkReel: (reelId: string) => void;
  onShareReel: (reel: Reel) => void;
  onOpenComments: (reelAsPost: Post) => void;
  onSelectProfile: (user: User) => void;
  onToggleFollow: (userId: string) => void;
}

export const ReelsView: React.FC<ReelsViewProps> = ({
  reels,
  currentUser,
  onLikeReel,
  onBookmarkReel,
  onShareReel,
  onOpenComments,
  onSelectProfile,
  onToggleFollow,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentReel = reels[currentIndex];

  useEffect(() => {
    // Reset play state and play video when current reel changes
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // Keyboard navigation up / down
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reels.length]);

  const handleNext = () => {
    if (currentIndex < reels.length - 1) {
      sound.playClick();
      setCurrentIndex((idx) => idx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      sound.playClick();
      setCurrentIndex((idx) => idx - 1);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleDoubleTap = () => {
    if (!currentReel.isLiked) {
      onLikeReel(currentReel.id);
    }
    sound.playPop();
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 900);
  };

  // Convert reel to Post shape for standard CommentsDrawer
  const handleOpenComments = () => {
    const postShape: Post = {
      id: currentReel.id,
      author: currentReel.author,
      content: currentReel.caption,
      tags: currentReel.tags,
      createdAt: currentReel.createdAt,
      likesCount: currentReel.likesCount,
      commentsCount: currentReel.commentsCount,
      repostsCount: currentReel.sharesCount,
      bookmarksCount: 0,
      isLiked: currentReel.isLiked,
      isReposted: false,
      isBookmarked: currentReel.isBookmarked,
      comments: currentReel.comments,
    };
    onOpenComments(postShape);
  };

  if (!currentReel) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-12 text-center text-neutral-400">
        No reels available.
      </div>
    );
  }

  return (
    <div className="relative mx-auto flex w-full max-w-sm sm:max-w-md items-center justify-center h-[76vh] max-h-[720px] select-none">
      {/* Reel Phone Canvas */}
      <div className="relative h-full w-full overflow-hidden rounded-3xl border border-neutral-800 bg-black shadow-2xl">
        {/* Video Surface */}
        <div
          className="relative h-full w-full cursor-pointer"
          onClick={togglePlay}
          onDoubleClick={handleDoubleTap}
        >
          <video
            ref={videoRef}
            src={currentReel.videoUrl}
            poster={currentReel.posterUrl}
            loop
            playsInline
            muted={isMuted}
            autoPlay
            className="h-full w-full object-cover"
          />

          {/* Double Tap Big Heart Animation */}
          {showHeartBurst && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center animate-in zoom-in-50 fade-in duration-200">
              <Heart className="h-28 w-28 fill-rose-500 text-rose-500 drop-shadow-lg animate-pulse" />
            </div>
          )}

          {/* Pause overlay icon if paused */}
          {!isPlaying && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm">
                <Play className="h-8 w-8 ml-1" />
              </div>
            </div>
          )}

          {/* Vignette gradients for readable text */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/70 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>

        {/* Top Controls: Reel Counter & Audio Mute */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between text-xs text-white z-20">
          <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 backdrop-blur-md border border-white/10 font-medium">
            <span>Reels</span>
            <span className="text-neutral-400">·</span>
            <span>{currentIndex + 1} / {reels.length}</span>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
            title={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>

        {/* Right Action Floating Bar */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
          {/* Like Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                sound.playPop();
                onLikeReel(currentReel.id);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-transform active:scale-90 hover:bg-black/60"
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  currentReel.isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'
                }`}
              />
            </button>
            <span className="text-[11px] font-semibold tabular-nums drop-shadow">
              {currentReel.likesCount}
            </span>
          </div>

          {/* Comments Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={handleOpenComments}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-transform active:scale-90 hover:bg-black/60"
            >
              <MessageSquare className="h-5 w-5 text-white" />
            </button>
            <span className="text-[11px] font-semibold tabular-nums drop-shadow">
              {currentReel.commentsCount}
            </span>
          </div>

          {/* Bookmark Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => {
                sound.playClick();
                onBookmarkReel(currentReel.id);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-transform active:scale-90 hover:bg-black/60"
            >
              <Bookmark
                className={`h-5 w-5 transition-colors ${
                  currentReel.isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-white'
                }`}
              />
            </button>
            <span className="text-[11px] font-semibold tabular-nums drop-shadow">
              Save
            </span>
          </div>

          {/* Share Button */}
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => onShareReel(currentReel)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 transition-transform active:scale-90 hover:bg-black/60"
            >
              <Share2 className="h-5 w-5 text-white" />
            </button>
            <span className="text-[11px] font-semibold tabular-nums drop-shadow">
              {currentReel.sharesCount}
            </span>
          </div>
        </div>

        {/* Bottom Left Info Overlays */}
        <div className="absolute left-4 right-16 bottom-4 z-20 space-y-2 text-white">
          {/* Creator Profile Chip */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectProfile(currentReel.author)}
              className="flex items-center gap-2 group"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr ${currentReel.author.avatarGradient} text-xs font-bold ring-2 ring-white/60 group-hover:scale-105 transition-transform`}
              >
                {currentReel.author.avatarInitials}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight flex items-center gap-1 hover:underline">
                  <span>{currentReel.author.name}</span>
                  {currentReel.author.isVerified && (
                    <span className="flex h-3 w-3 items-center justify-center rounded-full bg-indigo-500 text-[8px] font-bold">
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-300">{currentReel.author.handle}</div>
              </div>
            </button>

            {currentReel.author.id !== currentUser.id && (
              <button
                onClick={() => onToggleFollow(currentReel.author.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  currentReel.author.isFollowing
                    ? 'bg-white/20 text-white backdrop-blur-md'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {currentReel.author.isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Caption with Expand/Collapse */}
          <div className="text-xs text-neutral-100 pr-2 leading-relaxed">
            <span className={expandedCaption ? '' : 'line-clamp-2'}>
              {currentReel.caption}
            </span>
            {currentReel.caption.length > 80 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedCaption(!expandedCaption);
                }}
                className="text-neutral-400 font-semibold ml-1 hover:text-white"
              >
                {expandedCaption ? 'less' : 'more'}
              </button>
            )}
          </div>

          {/* Audio Music Track Marquee */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-300 font-medium">
            <Music className="h-3.5 w-3.5 shrink-0 text-indigo-400 animate-spin" />
            <span className="truncate">{currentReel.musicTrack}</span>
          </div>
        </div>
      </div>

      {/* Floating Vertical Prev/Next Navigation Controls for Desktop */}
      <div className="hidden lg:flex absolute -right-16 inset-y-0 flex-col items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/80 text-white backdrop-blur-md transition-colors ${
            currentIndex === 0
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-neutral-800 hover:border-neutral-700'
          }`}
          title="Previous reel (Up arrow)"
        >
          <ChevronUp className="h-5 w-5" />
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === reels.length - 1}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/80 text-white backdrop-blur-md transition-colors ${
            currentIndex === reels.length - 1
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-neutral-800 hover:border-neutral-700'
          }`}
          title="Next reel (Down arrow)"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
