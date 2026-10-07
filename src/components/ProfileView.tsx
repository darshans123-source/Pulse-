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
  Layers 
} from 'lucide-react';
import { User, Post } from '../types';
import { PostCard } from './PostCard';

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
}) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'bookmarks' | 'likes'>('posts');
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
  const [editName, setEditName] = useState(user.name);
  const [editBio, setEditBio] = useState(user.bio);
  const [editRole, setEditRole] = useState(user.role);
  const [editLocation, setEditLocation] = useState(user.location);
  const [editWebsite, setEditWebsite] = useState(user.website || '');

  const isMe = user.id === currentUser.id;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: editName,
      bio: editBio,
      role: editRole,
      location: editLocation,
      website: editWebsite,
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

  return (
    <div className="space-y-6">
      {/* Profile Header Box */}
      <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm overflow-hidden">
        {/* Cover Canvas */}
        <div className={`h-36 w-full bg-gradient-to-r ${user.avatarGradient} opacity-40`} />

        <div className="p-6 relative pt-0">
          {/* Avatar and Action Button */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr ${user.avatarGradient} text-2xl font-bold text-white shadow-xl ring-4 ring-neutral-950`}
            >
              {user.avatarInitials}
            </div>

            {isMe ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition-colors"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                onClick={() => onToggleFollow(user.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                  user.isFollowing
                    ? 'border border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-rose-900 hover:text-rose-400'
                    : 'bg-white text-neutral-900 hover:bg-neutral-200'
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

            {/* Follow stats */}
            <div className="mt-4 flex items-center gap-6 border-t border-neutral-800/60 pt-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-100 tabular-nums">{user.followingCount}</span>
                <span className="text-neutral-500">Following</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-100 tabular-nums">{user.followersCount}</span>
                <span className="text-neutral-500">Followers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-neutral-100 tabular-nums">{userPosts.length}</span>
                <span className="text-neutral-500">Pulses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-t border-neutral-800/80 px-4 bg-neutral-950/40">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
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
            className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
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
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
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
                className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
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
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
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

      {/* Posts Stream */}
      <div className="space-y-4">
        {displayedPosts.length === 0 ? (
          <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-8 text-center text-xs text-neutral-500">
            No items found in this section.
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
            />
          ))
        )}
      </div>
    </div>
  );
};
