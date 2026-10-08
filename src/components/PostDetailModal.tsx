import React from 'react';
import { X } from 'lucide-react';
import { Post, User } from '../types';
import { PostCard } from './PostCard';

interface PostDetailModalProps {
  post: Post | null;
  onClose: () => void;
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

export const PostDetailModal: React.FC<PostDetailModalProps> = ({
  post,
  onClose,
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
  if (!post) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-neutral-950 border border-neutral-800 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-xl bg-neutral-900/80 p-1.5 text-neutral-400 hover:text-white backdrop-blur-sm transition-colors"
          title="Close detail view"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-4 sm:p-6">
          <PostCard
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
            onInviteHelper={onInviteHelper}
            onDeletePost={onDeletePost}
            onEditPost={onEditPost}
          />
        </div>
      </div>
    </div>
  );
};
