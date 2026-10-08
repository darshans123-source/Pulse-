import React, { useState } from 'react';
import { 
  MapPin, 
  Globe, 
  Calendar, 
  Edit3, 
  Check, 
  Plus, 
  Grid, 
  Heart, 
  Bookmark, 
  Layers,
  Grid3X3,
  List,
  Video,
  MessageSquare
} from 'lucide-react';
import { User, Post } from '../types';
import { PostCard } from './PostCard';
import { FollowersModal } from './FollowersModal';
import { SEED_USERS } from '../data/seedData';
import { sound } from '../utils/soundEngine';

interface ProfileViewProps {
  user: User;
  currentUser: User;
  posts: Post[];
  onToggleFollow: (userId: string) => void;
  onUpdateUser: (updatedUser: User) => void;
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onRepost: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  onOpenComments: (post: Post) => void;
  onSelectTag: (tag: string) => void;
  onSelectProfile: (user: User) => void;
  onShare: (post: Post) => void;
  onSelectPostDetail?: (post: Post) => void;
  onDeletePost?: (postId: string) => void;
  onEditPost?: (post: Post) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  currentUser,
  posts,
  onToggleFollow,
  onUpdateUser,
  onLike,
  onBookmark,
  onRepost,
  onVotePoll,
  onOpenComments,
  onSelectTag,
  onSelectProfile,
  onShare,
  onSelectPostDetail,
  onDeletePost,
  onEditPost,
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'bookmarks' | 'likes'>('posts');
  const [viewStyle, setViewStyle] = useState<'grid' | 'feed'>('grid');
  const [isEditing, setIsEditing] = useState(false);
  const [followersModalTitle, setFollowersModalTitle] = useState<'Followers' | 'Following' | null>(null);

  // Edit state
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [editRole, setEditRole] = useState(user.role);
  const [editLocation, setEditLocation] = useState(user.location);
  const [editWebsite, setEditWebsite] = useState(user.website || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(user.avatarUrl || '');

  const isMe = user.id === currentUser.id;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onUpdateUser({
      ...user,
      name: editName,
      bio: editBio,
      role: editRole,
      location: editLocation,
      website: editWebsite,
      avatarUrl: editAvatarUrl || undefined,
    });
    setIsEditing(false);
  };

  const userPosts = posts.filter((p) => p.author.id === user.id);
  const userMediaPosts = userPosts.filter((p) => p.media);
  const userBookmarkedPosts = posts.filter((p) => p.isBookmarked);
  const userLikedPosts = posts.filter((p) => p.isLiked);

  let displayedPosts = userPosts;
  if (activeTab === 'media') displayedPosts = userMediaPosts;
  if (activeTab === 'bookmarks') displayedPosts = userBookmarkedPosts;
  if (activeTab === 'likes') displayedPosts = userLikedPosts;

  // Mock followers / following lists based on seed users
  const modalUsers = SEED_USERS.filter((u) => u.id !== user.id);

  return (
    <div className="space-y-6">
      {/* Profile Header Box */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
        {/* Cover Canvas */}
        <div className={`h-36 w-full bg-gradient-to-r ${user.avatarGradient} opacity-30`} />

        <div className="p-6 relative pt-0">
          {/* Avatar and Action Button */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-24 w-24 rounded-2xl object-cover shadow-xl ring-4 ring-neutral-950"
                />
              ) : (
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr ${user.avatarGradient} text-2xl font-bold text-white shadow-xl ring-4 ring-neutral-950`}
                >
                  {user.avatarInitials}
                </div>
              )}
            </div>

            {isMe ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleFollow(user.id);
                }}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  user.isFollowing
                    ? 'border border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-rose-900 hover:text-rose-400'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30'
                }`}
              >
                {user.isFollowing ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* User Bio Details */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl font-bold text-white">
                {user.name}
              </h2>
              {user.isVerified && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5">
              {user.handle} · {user.role}
            </div>

            <p className="mt-3 text-sm text-neutral-300 leading-relaxed max-w-2xl">
              {user.bio}
            </p>

            {/* Metadata unboxed text */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-500">
              {user.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-indigo-400 hover:underline">{user.website}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>{user.joinedDate}</span>
              </div>
            </div>

            {/* Follow stats - Clickable to open followers/following modal */}
            <div className="mt-4 flex items-center gap-6 border-t border-neutral-800/60 pt-4 text-xs">
              <button
                type="button"
                onClick={() => setFollowersModalTitle('Following')}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <span className="font-bold text-neutral-100 tabular-nums">{user.followingCount}</span>
                <span className="text-neutral-400">Following</span>
              </button>
              <button
                type="button"
                onClick={() => setFollowersModalTitle('Followers')}
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <span className="font-bold text-neutral-100 tabular-nums">{user.followersCount}</span>
                <span className="text-neutral-400">Followers</span>
              </button>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-100 tabular-nums">{userPosts.length}</span>
                <span className="text-neutral-400">Pulses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs & View Switcher */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 px-4 bg-neutral-950/40">
          <div className="flex overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'posts'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Pulses ({userPosts.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'media'
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Grid className="h-3.5 w-3.5" />
              <span>Artifacts ({userMediaPosts.length})</span>
            </button>
            {isMe && (
              <>
                <button
                  onClick={() => setActiveTab('bookmarks')}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'bookmarks'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Saved ({userBookmarkedPosts.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('likes')}
                  className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === 'likes'
                      ? 'border-indigo-500 text-white'
                      : 'border-transparent text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <Heart className="h-3.5 w-3.5" />
                  <span>Liked ({userLikedPosts.length})</span>
                </button>
              </>
            )}
          </div>

          {/* Grid vs Feed toggle button */}
          <div className="flex items-center gap-1 py-1">
            <button
              onClick={() => setViewStyle('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewStyle === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Grid view"
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewStyle('feed')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewStyle === 'feed' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Feed view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
            <h3 className="font-display text-base font-bold text-white mb-4">Edit Profile</h3>
            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-400">Display Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400">Avatar Image URL (Optional)</label>
                <input
                  type="text"
                  value={editAvatarUrl}
                  onChange={(e) => setEditAvatarUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400">Role / Profession</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-neutral-400">Bio</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-neutral-400">Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-400">Website</label>
                  <input
                    type="text"
                    value={editWebsite}
                    onChange={(e) => setEditWebsite(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl px-4 py-2 text-xs text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Followers / Following Modal */}
      {followersModalTitle && (
        <FollowersModal
          isOpen={Boolean(followersModalTitle)}
          onClose={() => setFollowersModalTitle(null)}
          title={followersModalTitle}
          users={modalUsers}
          currentUser={currentUser}
          onToggleFollow={onToggleFollow}
          onSelectProfile={onSelectProfile}
        />
      )}

      {/* View Style 1: 3-column media grid */}
      {viewStyle === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {displayedPosts.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-12 text-center text-xs text-neutral-500">
              No items in this section yet.
            </div>
          ) : (
            displayedPosts.map((post) => {
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
                      alt={post.media?.title || 'Post artifact'}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`h-full w-full p-4 flex flex-col justify-end bg-gradient-to-br ${
                        post.media?.gradient || 'from-indigo-950 to-neutral-950'
                      }`}
                    >
                      <span className="font-display text-xs font-bold text-white line-clamp-3">
                        {post.media?.title || post.content}
                      </span>
                    </div>
                  )}

                  {isVideo && (
                    <div className="absolute top-2 right-2 rounded-md bg-black/60 p-1 text-white backdrop-blur-sm">
                      <Video className="h-3 w-3" />
                    </div>
                  )}

                  {/* Hover stats */}
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
            })
          )}
        </div>
      )}

      {/* View Style 2: Feed Cards list */}
      {viewStyle === 'feed' && (
        <div className="space-y-4">
          {displayedPosts.length === 0 ? (
            <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-12 text-center text-xs text-neutral-500">
              No pulses found in this section.
            </div>
          ) : (
            displayedPosts.map((post) => (
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
                onDeletePost={onDeletePost}
                onEditPost={onEditPost}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
