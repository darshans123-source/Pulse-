import React, { useState, useEffect } from 'react';
import { 
  CURRENT_USER, 
  SEED_USERS, 
  SEED_POSTS, 
  SEED_STORIES, 
  SEED_CHANNELS, 
  SEED_NOTIFICATIONS, 
  SEED_CONVERSATIONS 
} from './data/seedData';
import { User, Post, Story, StoryItem, Channel, Notification, Conversation, Comment } from './types';
import { Navbar } from './components/Navbar';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { StoriesBar } from './components/StoriesBar';
import { StoryModal } from './components/StoryModal';
import { AddStoryModal } from './components/AddStoryModal';
import { PostComposer } from './components/PostComposer';
import { PostCard } from './components/PostCard';
import { CommentsDrawer } from './components/CommentsDrawer';
import { ExploreView } from './components/ExploreView';
import { ChannelsView } from './components/ChannelsView';
import { MessagesView } from './components/MessagesView';
import { ProfileView } from './components/ProfileView';
import { NotificationsModal } from './components/NotificationsModal';
import { BottomNav } from './components/BottomNav';
import { Bookmark, Sparkles, Filter } from 'lucide-react';
import { sound } from './utils/soundEngine';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'channels' | 'bookmarks' | 'messages' | 'profile'>('feed');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  // Entities State
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [stories, setStories] = useState<Story[]>(SEED_STORIES);
  const [channels, setChannels] = useState<Channel[]>(SEED_CHANNELS);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);

  // Active overlays
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Keyboard shortcut listener for fast "real-feel" UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or textarea
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        sound.playClick();
      } else if (e.key === 'Escape') {
        setIsComposerOpen(false);
        setActiveStory(null);
        setIsAddStoryOpen(false);
        setActiveCommentsPost(null);
        setIsNotificationsOpen(false);
      } else if (!isInput && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        sound.playClick();
        setIsComposerOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast feedback helper
  const showToast = (msg: string) => {
    sound.playSuccess();
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  // Switch persona helper
  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    showToast(`Switched persona to ${user.name}`);
  };

  // Toggle follow user
  const handleToggleFollow = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextFollowing = !u.isFollowing;
          return {
            ...u,
            isFollowing: nextFollowing,
            followersCount: nextFollowing ? u.followersCount + 1 : Math.max(0, u.followersCount - 1),
          };
        }
        return u;
      })
    );

    // Update currentUser following count
    const target = users.find((u) => u.id === userId);
    if (target) {
      const willFollow = !target.isFollowing;
      setCurrentUser((prev) => ({
        ...prev,
        followingCount: willFollow ? prev.followingCount + 1 : Math.max(0, prev.followingCount - 1),
      }));
      showToast(willFollow ? `Now following ${target.name}` : `Unfollowed ${target.name}`);
    }
  };

  // Toggle join channel
  const handleToggleJoinChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((ch) => {
        if (ch.id === channelId) {
          const nextJoined = !ch.isJoined;
          showToast(nextJoined ? `Joined #${ch.name}` : `Left #${ch.name}`);
          return {
            ...ch,
            isJoined: nextJoined,
            membersCount: nextJoined ? ch.membersCount + 1 : Math.max(0, ch.membersCount - 1),
          };
        }
        return ch;
      })
    );
  };

  // Like a post
  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const willLike = !p.isLiked;
          return {
            ...p,
            isLiked: willLike,
            likesCount: willLike ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          };
        }
        return p;
      })
    );
  };

  // Bookmark a post
  const handleBookmarkPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const willBookmark = !p.isBookmarked;
          showToast(willBookmark ? 'Pulse saved to your bookmarks' : 'Pulse removed from bookmarks');
          return {
            ...p,
            isBookmarked: willBookmark,
            bookmarksCount: willBookmark ? p.bookmarksCount + 1 : Math.max(0, p.bookmarksCount - 1),
          };
        }
        return p;
      })
    );
  };

  // Repost a pulse
  const handleRepostPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const willRepost = !p.isReposted;
          showToast(willRepost ? 'Reposted to your followers' : 'Undo repost');
          return {
            ...p,
            isReposted: willRepost,
            repostsCount: willRepost ? p.repostsCount + 1 : Math.max(0, p.repostsCount - 1),
          };
        }
        return p;
      })
    );
  };

  // Invite helper to Intent Circle
  const handleInviteHelper = (postId: string, helperUserId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.intent) {
          const updatedHelpers = p.intent.matchedHelpers.map((h) =>
            h.user.id === helperUserId ? { ...h, isInvited: true } : h
          );
          return {
            ...p,
            intent: {
              ...p.intent,
              matchedHelpers: updatedHelpers,
            },
          };
        }
        return p;
      })
    );

    const helperUser = [CURRENT_USER, ...users].find((u) => u.id === helperUserId);
    showToast(`Invited ${helperUser?.name || 'specialist'} to Intent Circle`);

    // Create live notification for the invited helper
    const newNotif: Notification = {
      id: `notif_invite_${Date.now()}`,
      type: 'mention',
      actor: currentUser,
      postId,
      postSnippet: 'Invited your demonstrated domain expertise to an active Intent Circle',
      createdAt: 'Just now',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Vote on a poll
  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId && p.poll && !p.poll.userVotedOptionId) {
          const updatedOptions = p.poll.options.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...p,
            poll: {
              ...p.poll,
              options: updatedOptions,
              totalVotes: p.poll.totalVotes + 1,
              userVotedOptionId: optionId,
            },
          };
        }
        return p;
      })
    );
    showToast('Vote recorded');
  };

  // Add Comment
  const handleAddComment = (postId: string, commentText: string) => {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      author: currentUser,
      content: commentText,
      createdAt: 'Just now',
      likesCount: 0,
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = [...p.comments, newComment];
          const updatedPost = {
            ...p,
            comments: updatedComments,
            commentsCount: p.commentsCount + 1,
          };
          if (activeCommentsPost?.id === postId) {
            setActiveCommentsPost(updatedPost);
          }
          return updatedPost;
        }
        return p;
      })
    );
    showToast('Reply published');
  };

  // Like comment
  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const updatedComments = p.comments.map((c) => {
            if (c.id === commentId) {
              const willLike = !c.isLiked;
              return {
                ...c,
                isLiked: willLike,
                likesCount: willLike ? c.likesCount + 1 : Math.max(0, c.likesCount - 1),
              };
            }
            return c;
          });
          const updatedPost = { ...p, comments: updatedComments };
          if (activeCommentsPost?.id === postId) {
            setActiveCommentsPost(updatedPost);
          }
          return updatedPost;
        }
        return p;
      })
    );
  };

  // Add new post from composer
  const handleAddPost = (
    newPostData: Omit<
      Post,
      'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'repostsCount' | 'bookmarksCount' | 'isLiked' | 'isReposted' | 'isBookmarked' | 'comments'
    >
  ) => {
    const newPost: Post = {
      ...newPostData,
      id: `post_${Date.now()}`,
      createdAt: 'Just now',
      likesCount: 0,
      commentsCount: 0,
      repostsCount: 0,
      bookmarksCount: 0,
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setCurrentUser((prev) => ({ ...prev, postsCount: prev.postsCount + 1 }));
    showToast('Pulse published successfully');
  };

  // Add item to currentUser story
  const handleAddStoryItem = (item: StoryItem) => {
    setStories((prev) => {
      const myStoryIndex = prev.findIndex((s) => s.author.id === currentUser.id);
      if (myStoryIndex >= 0) {
        const copy = [...prev];
        copy[myStoryIndex] = {
          ...copy[myStoryIndex],
          items: [item, ...copy[myStoryIndex].items],
        };
        return copy;
      } else {
        const newStory: Story = {
          id: `story_${currentUser.id}`,
          author: currentUser,
          items: [item],
          hasUnseen: true,
        };
        return [newStory, ...prev];
      }
    });
    showToast('Published to your story');
  };

  // Direct message send
  const handleSendMessage = (recipientId: string, text: string) => {
    const newMsg = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      recipientId,
      text,
      timestamp: 'Just now',
    };

    setConversations((prev) => {
      const existingConv = prev.find((c) => c.participant.id === recipientId);
      if (existingConv) {
        return prev.map((c) =>
          c.participant.id === recipientId
            ? { ...c, messages: [...c.messages, newMsg] }
            : c
        );
      } else {
        const targetUser = users.find((u) => u.id === recipientId) || CURRENT_USER;
        return [
          {
            id: `conv_${Date.now()}`,
            participant: targetUser,
            unreadCount: 0,
            messages: [newMsg],
          },
          ...prev,
        ];
      }
    });
    showToast('Message sent');
  };

  // Select creator profile
  const handleSelectProfile = (user: User) => {
    setViewingProfileUser(user);
    setActiveTab('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Select tag
  const handleSelectTag = (tag: string) => {
    setSelectedTag(tag);
    setActiveTab('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Share pulse
  const handleShare = (post: Post) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/#pulse-${post.id} — "${post.content.slice(0, 80)}..."`
    );
    showToast('Pulse link copied to clipboard');
  };

  // Notifications
  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  // Filter feed pulses based on activeFilter and searchQuery
  const filteredFeedPosts = posts.filter((post) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = post.content.toLowerCase().includes(q);
      const matchAuthor = post.author.name.toLowerCase().includes(q) || post.author.handle.toLowerCase().includes(q);
      const matchTags = post.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchContent && !matchAuthor && !matchTags) return false;
    }

    if (activeFilter === 'intent_circles') {
      return Boolean(post.intent?.isIntentCircleActive);
    }
    if (activeFilter === 'following') {
      return post.author.isFollowing || post.author.id === currentUser.id;
    }
    if (activeFilter === 'design') {
      return post.channel === 'Design Craft' || post.tags.includes('Architecture') || post.tags.includes('Materials');
    }
    if (activeFilter === 'tech') {
      return post.channel === 'Tech & Engineering' || post.tags.includes('WebDev') || post.tags.includes('Engineering');
    }
    if (activeFilter === 'lab') {
      return post.channel === 'Interface Lab' || post.channel === 'Creative Lab' || post.tags.includes('SoundDesign');
    }

    return true;
  });

  // Calculate posts specifically seeking current user's demonstrated expertise
  const intentSeekingPosts = posts.filter(
    (p) =>
      p.intent?.isIntentCircleActive &&
      p.intent?.matchedHelpers.some((h) => h.user.id === currentUser.id) &&
      p.author.id !== currentUser.id
  );

  const bookmarkedPosts = posts.filter((p) => p.isBookmarked);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/90 px-4 py-2.5 text-xs font-medium text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Contract Compliant Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'profile') setViewingProfileUser(currentUser);
          setActiveTab(tab as any);
        }}
        currentUser={currentUser}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenComposer={() => setIsComposerOpen(true)}
        onSelectProfile={(u) => handleSelectProfile(u)}
      />

      {/* Main Viewport Grid Layout: Desktop baseline 1440px wide */}
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Navigation, personas, quick feeds (3 cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <LeftSidebar
              currentUser={currentUser}
              activeFilter={activeFilter}
              setActiveFilter={(filter) => {
                setActiveFilter(filter);
                setActiveTab('feed');
              }}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                if (tab === 'profile') setViewingProfileUser(currentUser);
                setActiveTab(tab as any);
              }}
              channels={channels}
              availableUsers={[CURRENT_USER, ...users]}
              onSwitchUser={handleSwitchUser}
              onSelectProfile={handleSelectProfile}
            />
          </div>

          {/* Center Column: Primary Work Area & Feed (6 cols) */}
          <div className="col-span-1 lg:col-span-6 space-y-6">
            {/* View Switching */}
            {activeTab === 'feed' && (
              <>
                {/* Stories Reel */}
                <StoriesBar
                  stories={stories}
                  currentUser={currentUser}
                  onOpenStory={(s) => setActiveStory(s)}
                  onAddStory={() => setIsAddStoryOpen(true)}
                />

                {/* Inline Post Composer */}
                <PostComposer
                  currentUser={currentUser}
                  allUsers={[CURRENT_USER, ...users]}
                  onAddPost={handleAddPost}
                />

                {/* Filter state indicator if applied */}
                {activeFilter !== 'all' && (
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/30 px-4 py-2 text-xs text-neutral-400">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Filtered view: <strong className="text-white capitalize">{activeFilter}</strong></span>
                    </div>
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="text-indigo-400 hover:underline"
                    >
                      Clear filter
                    </button>
                  </div>
                )}

                {/* Search query feedback */}
                {searchQuery && (
                  <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-900/30 px-4 py-2 text-xs text-neutral-400">
                    <span>Search results for: "<strong className="text-white">{searchQuery}</strong>" ({filteredFeedPosts.length} matches)</span>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-indigo-400 hover:underline"
                    >
                      Reset
                    </button>
                  </div>
                )}

                {/* Posts Feed */}
                <div className="space-y-4">
                  {filteredFeedPosts.length === 0 ? (
                    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-12 text-center text-xs text-neutral-500">
                      No pulses match your current filter. Try selecting "For You" or clearing the search.
                    </div>
                  ) : (
                    filteredFeedPosts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUser={currentUser}
                        onLike={handleLikePost}
                        onBookmark={handleBookmarkPost}
                        onRepost={handleRepostPost}
                        onVotePoll={handleVotePoll}
                        onOpenComments={(p) => setActiveCommentsPost(p)}
                        onSelectTag={handleSelectTag}
                        onSelectProfile={handleSelectProfile}
                        onShare={handleShare}
                        onInviteHelper={handleInviteHelper}
                      />
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === 'explore' && (
              <ExploreView
                posts={posts}
                currentUser={currentUser}
                onLike={handleLikePost}
                onBookmark={handleBookmarkPost}
                onRepost={handleRepostPost}
                onVotePoll={handleVotePoll}
                onOpenComments={(p) => setActiveCommentsPost(p)}
                onSelectTag={handleSelectTag}
                onSelectProfile={handleSelectProfile}
                onShare={handleShare}
                selectedTag={selectedTag}
              />
            )}

            {activeTab === 'channels' && (
              <ChannelsView
                channels={channels}
                onToggleJoinChannel={handleToggleJoinChannel}
                posts={posts}
                currentUser={currentUser}
                onLike={handleLikePost}
                onBookmark={handleBookmarkPost}
                onRepost={handleRepostPost}
                onVotePoll={handleVotePoll}
                onOpenComments={(p) => setActiveCommentsPost(p)}
                onSelectTag={handleSelectTag}
                onSelectProfile={handleSelectProfile}
                onShare={handleShare}
              />
            )}

            {activeTab === 'bookmarks' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 p-5 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-amber-400" />
                    <h2 className="font-display text-lg font-bold text-white">
                      Saved Pulses
                    </h2>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Your personal library of archived code snippets, architectural essays, and research notes.
                  </p>
                </div>

                {bookmarkedPosts.length === 0 ? (
                  <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-12 text-center text-xs text-neutral-500">
                    No bookmarked pulses yet. Click the bookmark icon on any post to save it for later.
                  </div>
                ) : (
                  bookmarkedPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUser={currentUser}
                      onLike={handleLikePost}
                      onBookmark={handleBookmarkPost}
                      onRepost={handleRepostPost}
                      onVotePoll={handleVotePoll}
                      onOpenComments={(p) => setActiveCommentsPost(p)}
                      onSelectTag={handleSelectTag}
                      onSelectProfile={handleSelectProfile}
                      onShare={handleShare}
                      onInviteHelper={handleInviteHelper}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <MessagesView
                conversations={conversations}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onSelectProfile={handleSelectProfile}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileView
                user={viewingProfileUser || currentUser}
                currentUser={currentUser}
                posts={posts}
                onToggleFollow={handleToggleFollow}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  setViewingProfileUser(updated);
                  showToast('Profile updated');
                }}
                onLike={handleLikePost}
                onBookmark={handleBookmarkPost}
                onRepost={handleRepostPost}
                onVotePoll={handleVotePoll}
                onOpenComments={(p) => setActiveCommentsPost(p)}
                onSelectTag={handleSelectTag}
                onSelectProfile={handleSelectProfile}
                onShare={handleShare}
              />
            )}
          </div>

          {/* Right Column: Search, Who to follow, Trending (3 cols) */}
          <div className="hidden lg:block lg:col-span-3">
            <RightSidebar
              searchQuery={searchQuery}
              setSearchQuery={(q) => {
                setSearchQuery(q);
                if (q && activeTab !== 'feed') setActiveTab('feed');
              }}
              users={users}
              currentUser={currentUser}
              intentSeekingPosts={intentSeekingPosts}
              onToggleFollow={handleToggleFollow}
              channels={channels}
              onToggleJoinChannel={handleToggleJoinChannel}
              onSelectTag={handleSelectTag}
              onSelectProfile={handleSelectProfile}
              onOpenComments={(p) => setActiveCommentsPost(p)}
            />
          </div>

        </div>
      </main>

      {/* Mobile Ergonomic Bottom Tab Bar (< 15% height cap compliant) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(t) => {
          if (t === 'profile') setViewingProfileUser(currentUser);
          setActiveTab(t as any);
        }}
        currentUser={currentUser}
        onOpenComposer={() => setIsComposerOpen(true)}
        onSelectProfile={handleSelectProfile}
        unreadMessagesCount={conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
      />

      {/* Story Viewer Modal */}
      {activeStory && (
        <StoryModal
          story={activeStory}
          currentUser={currentUser}
          onClose={() => setActiveStory(null)}
          onNextStory={() => {
            const currentIdx = stories.findIndex((s) => s.id === activeStory.id);
            if (currentIdx >= 0 && currentIdx < stories.length - 1) {
              setActiveStory(stories[currentIdx + 1]);
            } else {
              setActiveStory(null);
            }
          }}
          onPrevStory={() => {
            const currentIdx = stories.findIndex((s) => s.id === activeStory.id);
            if (currentIdx > 0) {
              setActiveStory(stories[currentIdx - 1]);
            }
          }}
          onSendMessage={handleSendMessage}
        />
      )}

      {/* Add Story Modal */}
      {isAddStoryOpen && (
        <AddStoryModal
          currentUser={currentUser}
          onClose={() => setIsAddStoryOpen(false)}
          onAddStoryItem={handleAddStoryItem}
        />
      )}

      {/* Dedicated Floating Post Composer Modal */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg">
            <PostComposer
              currentUser={currentUser}
              allUsers={[CURRENT_USER, ...users]}
              onAddPost={handleAddPost}
              onClose={() => setIsComposerOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}

      {/* Threaded Comments Drawer */}
      {activeCommentsPost && (
        <CommentsDrawer
          post={activeCommentsPost}
          currentUser={currentUser}
          onClose={() => setActiveCommentsPost(null)}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onSelectProfile={handleSelectProfile}
        />
      )}

      {/* Notifications Drawer Modal */}
      {isNotificationsOpen && (
        <NotificationsModal
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onSelectNotification={(n) => {
            if (n.postId) {
              const targetPost = posts.find((p) => p.id === n.postId);
              if (targetPost) {
                setActiveCommentsPost(targetPost);
                setIsNotificationsOpen(false);
              }
            } else {
              handleSelectProfile(n.actor);
              setIsNotificationsOpen(false);
            }
          }}
          onSelectProfile={(u) => {
            handleSelectProfile(u);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </div>
  );
}
