import React, { useState } from 'react';
import { X, Send, Heart, Sparkles, RefreshCw } from 'lucide-react';
import { Post, User, Comment } from '../types';
import { sound } from '../utils/soundEngine';

interface CommentsDrawerProps {
  post: Post;
  currentUser: User;
  onClose: () => void;
  onAddComment: (postId: string, commentText: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  onSelectProfile: (user: User) => void;
  initialDraftText?: string;
}

export const CommentsDrawer: React.FC<CommentsDrawerProps> = ({
  post,
  currentUser,
  onClose,
  onAddComment,
  onLikeComment,
  onSelectProfile,
  initialDraftText = '',
}) => {
  const [commentText, setCommentText] = useState(initialDraftText);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    sound.playSuccess();
    onAddComment(post.id, commentText.trim());
    setCommentText('');
  };

  const handleGenerateAiPerspective = async () => {
    setIsGeneratingAi(true);
    sound.playAiPing();

    try {
      const res = await fetch('/api/generate-perspective', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postContent: post.content,
          userName: currentUser.name,
          userRole: currentUser.role,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.draftText) {
          setCommentText(data.draftText);
          return;
        }
      }
    } catch {
      // Fallback
    } finally {
      setIsGeneratingAi(false);
    }

    // Dynamic tailored expert fallback based on post topic
    if (post.content.toLowerCase().includes('java') || post.content.toLowerCase().includes('interview')) {
      setCommentText(
        `Having interviewed many candidates for Java backend roles: emphasize clean thread safety trade-offs (e.g. read-write locks vs volatile reads) and explain your reasoning clearly before writing code.`
      );
    } else if (post.content.toLowerCase().includes('django') || post.content.toLowerCase().includes('lock')) {
      setCommentText(
        `For 2M+ row Postgres migrations: set lock_timeout to 2s, add the column without default first, and backfill in batches of 5,000 rows to prevent table lock cascades.`
      );
    } else {
      setCommentText(
        `From an architectural viewpoint, isolating this boundary with a lightweight event buffer will eliminate the synchronous bottleneck and allow graceful degradation.`
      );
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[85vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Grab Handle for mobile */}
        <div className="sm:hidden w-10 h-1.5 bg-neutral-700 rounded-full mx-auto my-3" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-sm font-bold text-white">
              Discussion
            </h3>
            <span className="text-xs text-neutral-500 tabular-nums">
              ({post.comments.length})
            </span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Original Post Snippet */}
        <div className="px-5 py-3 bg-neutral-950/40 border-b border-neutral-800/60 text-xs">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-neutral-300">{post.author.name}</span>
            <span className="text-neutral-500">{post.author.handle}</span>
            {post.intent && (
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-1.5 py-0.2 rounded ml-auto">
                Intent: {post.intent.category}
              </span>
            )}
          </div>
          <p className="text-neutral-400 line-clamp-2">{post.content}</p>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {post.comments.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No replies yet. Be the first to share your perspective!
            </div>
          ) : (
            post.comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-3">
                <button
                  onClick={() => {
                    sound.playClick();
                    onSelectProfile(comment.author);
                  }}
                  className="shrink-0"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr ${comment.author.avatarGradient} text-xs font-bold text-white shadow-sm`}
                  >
                    {comment.author.avatarInitials}
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectProfile(comment.author);
                        }}
                        className="text-xs font-semibold text-neutral-200 hover:text-indigo-400 transition-colors"
                      >
                        {comment.author.name}
                      </button>
                      <span className="text-[11px] text-neutral-500">
                        {comment.createdAt}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        sound.playPop();
                        onLikeComment(post.id, comment.id);
                      }}
                      className={`flex items-center gap-1 text-[11px] transition-colors ${
                        comment.isLiked ? 'text-rose-400' : 'text-neutral-500 hover:text-rose-400'
                      }`}
                    >
                      <Heart className={`h-3 w-3 ${comment.isLiked ? 'fill-current' : ''}`} />
                      <span className="tabular-nums">{comment.likesCount}</span>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Input Form with AI Assistance */}
        <div className="border-t border-neutral-800 bg-neutral-950/80 p-3 space-y-2">
          {/* AI Perspective Trigger */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] text-neutral-500">
              Replying as <strong className="text-neutral-300">{currentUser.name}</strong> ({currentUser.role})
            </span>
            <button
              type="button"
              onClick={handleGenerateAiPerspective}
              disabled={isGeneratingAi}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 px-2 py-0.5 rounded-lg transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              <span>{isGeneratingAi ? 'Synthesizing...' : '✨ AI Suggest Perspective'}</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr ${currentUser.avatarGradient} text-xs font-bold text-white`}
            >
              {currentUser.avatarInitials}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a thoughtful, high-craft reply..."
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
