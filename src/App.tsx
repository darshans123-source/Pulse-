import React, { useState, useEffect } from 'react';
import { 
  CURRENT_USER, 
  SEED_USERS, 
  SEED_POSTS, 
  SEED_STORIES, 
  SEED_CHANNELS, 
  SEED_NOTIFICATIONS, 
  SEED_CONVERSATIONS,
  SEED_REELS
} from './data/seedData';
import { 
  User, 
  Post, 
  Story, 
  StoryItem, 
  Channel, 
  Notification, 
  Conversation, 
  Comment,
  Reel,
  Message 
} from './types';
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
import { ReelsView } from './components/ReelsView';
import { AuthModal } from './components/AuthModal';
import { SettingsModal } from './components/SettingsModal';
import { PostDetailModal } from './components/PostDetailModal';
import { LoginPage } from './components/LoginPage';
import { 
  getStoredActiveUser, 
  setStoredActiveUser, 
  clearStoredActiveUser 
} from './utils/authStorage';
import { Bookmark, Sparkles, Filter, Loader2, RefreshCw } from 'lucide-react';
import { sound } from './utils/soundEngine';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'feed' | 'reels' | 'explore' | 'channels' | 'bookmarks' | 'messages' | 'profile'>('feed');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  // User Authentication State from Local Store
  const [currentUser, setCurrentUser] = useState<User>(() => {
    return getStoredActiveUser() || CURRENT_USER;
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return !!getStoredActiveUser();
  });
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [posts, setPosts] = useState<Post[]>(SEED_POSTS);
  const [stories, setStories] = useState<Story[]>(SEED_STORIES);
  const [reels, setReels] = useState<Reel[]>(SEED_REELS);
  const [channels, setChannels] = useState<Channel[]>(SEED_CHANNELS);
  const [notifications, setNotifications] = useState<Notification[]>(SEED_NOTIFICATIONS);
  const [conversations, setConversations] = useState<Conversation[]>(SEED_CONVERSATIONS);

  // Active overlays
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<Post | null>(null);
  const [selectedPostDetail, setSelectedPostDetail] = useState<Post | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Infinite Scroll / Feed Pagination Simulation
  const [feedLimit, setFeedLimit] = useState(4);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Keyboard shortcut listener for fast "real-feel" UX
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        sound.playClick();
      } else if (e.key === 'Escape') {
        setIsComposerOpen(false);
        setEditingPost(null);
        setActiveStory(null);
        setIsAddStoryOpen(false);
        setActiveCommentsPost(null);
        setSelectedPostDetail(null);
        setIsNotificationsOpen(false);
        setIsAuthModalOpen(false);
        setIsSettingsOpen(false);
      } else if (!isInput && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        sound.playClick();
        setEditingPost(null);
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
    setStoredActiveUser(user);
    showToast(`Switched active profile to ${user.name}`);
  };

  // User Auth Handlers with Local Store Integration
  const handleLoginFromPage = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setStoredActiveUser(user);
    setUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [user, ...prev]));
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setStoredActiveUser(user);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleSignUp = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setStoredActiveUser(newUser);
    showToast(`Welcome to Pulse Social, ${newUser.name}!`);
  };

  const handleLogout = () => {
    clearStoredActiveUser();
    setIsLoggedIn(false);
    showToast('Signed out of local store');
  };

  const handleUpdateCurrentUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setStoredActiveUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast('Profile updated in local store');
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

  // Delete own post
  const handleDeletePost = (postId: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    setCurrentUser((prev) => ({ ...prev, postsCount: Math.max(0, prev.postsCount - 1) }));
    if (selectedPostDetail?.id === postId) setSelectedPostDetail(null);
    showToast('Pulse deleted successfully');
  };

  // Edit own post
  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsComposerOpen(true);
  };

  const handleUpdatePost = (updated: Post) => {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingPost(null);
    setIsComposerOpen(false);
    showToast('Pulse updated successfully');
  };

  // Reels interactions
  const handleLikeReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const willLike = !r.isLiked;
          return {
            ...r,
            isLiked: willLike,
            likesCount: willLike ? r.likesCount + 1 : Math.max(0, r.likesCount - 1),
          };
        }
        return r;
      })
    );
  };

  const handleBookmarkReel = (reelId: string) => {
    setReels((prev) =>
      prev.map((r) => {
        if (r.id === reelId) {
          const willBookmark = !r.isBookmarked;
          showToast(willBookmark ? 'Reel saved to bookmarks' : 'Reel removed from bookmarks');
          return { ...r, isBookmarked: willBookmark };
        }
        return r;
      })
    );
  };

  const handleShareReel = (reel: Reel) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/#reel-${reel.id} — "${reel.caption.slice(0, 60)}..."`
    );
    showToast('Reel link copied to clipboard');
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
          if (selectedPostDetail?.id === postId) {
            setSelectedPostDetail(updatedPost);
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
          if (selectedPostDetail?.id === postId) {
            setSelectedPostDetail(updatedPost);
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

  // Direct message send with image attachment and visual feedback for sender
  const handleSendMessage = (recipientId: string, text: string, imageUrl?: string) => {
    const msgId = `msg_${Date.now()}`;
    const newMsg: Message = {
      id: msgId,
      senderId: currentUser.id,
      recipientId,
      text,
      imageUrl,
      timestamp: 'Just now',
      status: 'sent',
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
        const targetUser = users.find((u) => u.id === recipientId) || users[0];
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

    // Visual feedback for sender:
    // 1. Progress to delivered in 700ms
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.participant.id === recipientId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, status: 'delivered' } : m
              ),
            };
          }
          return c;
        })
      );
    }, 700);

    // 2. Progress to read with visual feedback in 1800ms
    setTimeout(() => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.participant.id === recipientId) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === msgId ? { ...m, status: 'read', readAt: 'Just now' } : m
              ),
            };
          }
          return c;
        })
      );
    }, 1800);
  };

  const handleMarkConversationRead = (convId: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === convId) {
          return {
            ...c,
            unreadCount: 0,
            messages: c.messages.map((m) =>
              m.senderId === currentUser.id
                ? { ...m, status: 'read', readAt: m.readAt || 'Just now' }
                : m
            ),
          };
        }
        return c;
      })
    );
    showToast('Read receipts updated with visual feedback');
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

  // Infinite Scroll "Load More" Simulation
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    sound.playClick();
    setTimeout(() => {
      setFeedLimit((prev) => prev + 4);
      setIsLoadingMore(false);
      showToast('Loaded more pulses');
    }, 600);
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

  const displayedFeedPosts = filteredFeedPosts.slice(0, feedLimit);
  const hasMorePosts = feedLimit < filteredFeedPosts.length;

  const intentSeekingPosts = posts.filter(
    (p) =>
      p.intent?.isIntentCircleActive &&
      p.intent?.matchedHelpers.some((h) => h.user.id === currentUser.id) &&
      p.author.id !== currentUser.id
  );

  const bookmarkedPosts = posts.filter((p) => p.isBookmarked);

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLoginFromPage} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/90 px-4 py-2.5 text-xs font-medium text-white shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'profile') setViewingProfileUser(currentUser);
          setActiveTab(tab as any);
        }}
        currentUser={currentUser}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenComposer={() => {
          setEditingPost(null);
          setIsComposerOpen(true);
        }}
        onSelectProfile={(u) => handleSelectProfile(u)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Viewport Grid Layout */}
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
              availableUsers={[currentUser, ...users.filter((u) => u.id !== currentUser.id)]}
              onSwitchUser={handleSwitchUser}
              onSelectProfile={handleSelectProfile}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onLogout={handleLogout}
            />
          </div>

          {/* Center Column: Primary Work Area & Views (6 cols) */}
          <div className="col-span-1 lg:col-span-6 space-y-6">
            
            {/* 1. Feed View */}
            {activeTab === 'feed' && (
              <>
                {/* Stories Reel */}
                <StoriesBar
                  stories={stories}
                  currentUser={currentUser}
                  onOpenStory={(s) => setActiveStory(s)}
                  onAddStory={() => setIsAddStoryOpen(true)}
                />

                {/* Feed Header Tabs: For You vs Following */}
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveFilter('all');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        activeFilter === 'all'
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      For You
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveFilter('following');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        activeFilter === 'following'
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      Following
                    </button>
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveFilter('intent_circles');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        activeFilter === 'intent_circles'
                          ? 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-300'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      ⚡ Help Circles
                    </button>
                  </div>
                </div>

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
                  {displayedFeedPosts.length === 0 ? (
                    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/30 p-12 text-center text-xs text-neutral-500">
                      No pulses match your current filter. Try selecting "For You" or clearing the search.
                    </div>
                  ) : (
                    displayedFeedPosts.map((post) => (
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
                        onDeletePost={handleDeletePost}
                        onEditPost={handleEditPost}
                      />
                    ))
                  )}

                  {/* Infinite Scroll / Load More Action */}
                  {hasMorePosts && (
                    <div className="pt-2 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
                      >
                        {isLoadingMore ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                            <span>Loading more pulses...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3.5 w-3.5" />
                            <span>Load More Pulses</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 2. Reels View */}
            {activeTab === 'reels' && (
              <div className="py-2">
                <ReelsView
                  reels={reels}
                  currentUser={currentUser}
                  onLikeReel={handleLikeReel}
                  onBookmarkReel={handleBookmarkReel}
                  onShareReel={handleShareReel}
                  onOpenComments={(p) => setActiveCommentsPost(p)}
                  onSelectProfile={handleSelectProfile}
                  onToggleFollow={handleToggleFollow}
                />
              </div>
            )}

            {/* 3. Explore View */}
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
                onSelectPostDetail={(p) => setSelectedPostDetail(p)}
                onToggleFollow={handleToggleFollow}
                selectedTag={selectedTag}
              />
            )}

            {/* 4. Channels View */}
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

            {/* 5. Bookmarks View */}
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
                      onDeletePost={handleDeletePost}
                      onEditPost={handleEditPost}
                    />
                  ))
                )}
              </div>
            )}

            {/* 6. Messages View */}
            {activeTab === 'messages' && (
              <MessagesView
                conversations={conversations}
                currentUser={currentUser}
                onSendMessage={handleSendMessage}
                onSelectProfile={handleSelectProfile}
                onMarkConversationRead={handleMarkConversationRead}
              />
            )}

            {/* 7. Profile View */}
            {activeTab === 'profile' && (
              <ProfileView
                user={viewingProfileUser || currentUser}
                currentUser={currentUser}
                posts={posts}
                onToggleFollow={handleToggleFollow}
                onUpdateUser={(updated) => {
                  handleUpdateCurrentUser(updated);
                  setViewingProfileUser(updated);
                }}
                onLike={handleLikePost}
                onBookmark={handleBookmarkPost}
                onRepost={handleRepostPost}
                onVotePoll={handleVotePoll}
                onOpenComments={(p) => setActiveCommentsPost(p)}
                onSelectTag={handleSelectTag}
                onSelectProfile={handleSelectProfile}
                onShare={handleShare}
                onSelectPostDetail={(p) => setSelectedPostDetail(p)}
                onDeletePost={handleDeletePost}
                onEditPost={handleEditPost}
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

      {/* Mobile Ergonomic Bottom Tab Bar */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={(t) => {
          if (t === 'profile') setViewingProfileUser(currentUser);
          setActiveTab(t as any);
        }}
        currentUser={currentUser}
        onOpenComposer={() => {
          setEditingPost(null);
          setIsComposerOpen(true);
        }}
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
          onSendMessage={(recId, txt) => handleSendMessage(recId, txt)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg">
            <PostComposer
              currentUser={currentUser}
              allUsers={[CURRENT_USER, ...users]}
              onAddPost={handleAddPost}
              onClose={() => {
                setIsComposerOpen(false);
                setEditingPost(null);
              }}
              isModal={true}
              editingPost={editingPost || undefined}
              onUpdatePost={handleUpdatePost}
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

      {/* Post Detail Lightbox Modal (from Explore Grid or Profile Grid) */}
      {selectedPostDetail && (
        <PostDetailModal
          post={selectedPostDetail}
          onClose={() => setSelectedPostDetail(null)}
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
          onDeletePost={handleDeletePost}
          onEditPost={handleEditPost}
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

      {/* Auth Modal (Sign In, Sign Up, Forgot Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />

      {/* Settings Modal (Account, Privacy, Notifications, Theme) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => {
          handleUpdateCurrentUser(updated);
        }}
        onLogout={handleLogout}
      />
    </div>
  );
}
