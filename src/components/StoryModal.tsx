import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Send, Heart } from 'lucide-react';
import { Story, User } from '../types';
import { sound } from '../utils/soundEngine';

interface StoryModalProps {
  story: Story;
  onClose: () => void;
  onNextStory?: () => void;
  onPrevStory?: () => void;
  currentUser: User;
  onSendMessage: (recipientId: string, text: string) => void;
}

export const StoryModal: React.FC<StoryModalProps> = ({
  story,
  onClose,
  onNextStory,
  onPrevStory,
  onSendMessage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [hasLikedStory, setHasLikedStory] = useState(false);

  const currentItem = story.items[currentIndex] || story.items[0];

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < story.items.length - 1) {
            setCurrentIndex((idx) => idx + 1);
            return 0;
          } else {
            if (onNextStory) {
              onNextStory();
            } else {
              onClose();
            }
            return 100;
          }
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, story.items.length, onNextStory, onClose]);

  const handlePrev = () => {
    sound.playClick();
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setProgress(0);
    } else if (onPrevStory) {
      onPrevStory();
    }
  };

  const handleNext = () => {
    sound.playClick();
    if (currentIndex < story.items.length - 1) {
      setCurrentIndex((i) => i + 1);
      setProgress(0);
    } else if (onNextStory) {
      onNextStory();
    } else {
      onClose();
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    sound.playSuccess();
    onSendMessage(story.author.id, `Replied to your story: "${replyText.trim()}"`);
    setReplyText('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }}
      tabIndex={0}
    >
      {/* Top close button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        className="hidden md:flex absolute left-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-neutral-900/60 text-white hover:bg-neutral-800 transition-colors"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-8 z-50 h-12 w-12 items-center justify-center rounded-full bg-neutral-900/60 text-white hover:bg-neutral-800 transition-colors"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Story Card */}
      <div 
        className="relative flex h-[82vh] w-full max-w-md flex-col justify-between overflow-hidden rounded-3xl border border-neutral-800 shadow-2xl"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Dynamic Background Image or Gradient */}
        {currentItem.mediaUrl ? (
          <div className="absolute inset-0 bg-neutral-950">
            <img
              src={currentItem.mediaUrl}
              alt={currentItem.headline}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
          </div>
        ) : (
          <>
            <div className={`absolute inset-0 bg-gradient-to-br ${currentItem.gradient} opacity-90`} />
            <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px]" />
          </>
        )}

        {/* Invisible Tap Zones: Left 30% for prev, Right 70% for next */}
        <div className="absolute inset-0 z-0 flex">
          <div className="h-full w-1/3 cursor-pointer" onClick={handlePrev} />
          <div className="h-full w-2/3 cursor-pointer" onClick={handleNext} />
        </div>

        {/* Story Header & Multi-item Progress Bars */}
        <div className="relative z-10 p-4 space-y-3 bg-gradient-to-b from-black/60 to-transparent pointer-events-auto">
          {/* Progress Indicators */}
          <div className="flex gap-1.5">
            {story.items.map((item, idx) => {
              let width = '0%';
              if (idx < currentIndex) width = '100%';
              else if (idx === currentIndex) width = `${progress}%`;
              return (
                <div key={item.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
                  <div
                    className="h-full bg-white transition-all duration-100 ease-linear"
                    style={{ width }}
                  />
                </div>
              );
            })}
          </div>

          {/* Author bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${story.author.avatarGradient} text-xs font-bold text-white shadow-sm ring-1 ring-white/40`}
              >
                {story.author.avatarInitials}
              </div>
              <div>
                <div className="text-xs font-semibold text-white drop-shadow">
                  {story.author.name}
                </div>
                <div className="text-[11px] text-white/80 drop-shadow flex items-center gap-1">
                  <span>{currentItem.timestamp}</span>
                  {currentItem.location && (
                    <>
                      <span>·</span>
                      <span>{currentItem.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-end p-8 text-center pointer-events-none pb-4">
          <div className="max-w-xs space-y-2 bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <h2 className="font-display text-xl font-bold text-white drop-shadow-md">
              {currentItem.headline}
            </h2>
            <p className="text-xs font-medium leading-relaxed text-neutral-200 drop-shadow">
              {currentItem.subtext}
            </p>
          </div>
        </div>

        {/* Bottom Interactive Bar */}
        <div className="relative z-10 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${story.author.name.split(' ')[0]}...`}
              className="flex-1 rounded-xl border border-white/20 bg-black/40 px-3.5 py-2 text-xs text-white placeholder:text-white/60 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white transition-colors hover:bg-white/30 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setHasLikedStory(!hasLikedStory)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                hasLikedStory
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Heart className={`h-4 w-4 ${hasLikedStory ? 'fill-current' : ''}`} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
