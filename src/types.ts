export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  avatarGradient: string;
  avatarInitials: string;
  bio: string;
  role: string;
  location: string;
  website?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  joinedDate: string;
  isFollowing?: boolean;
  isVerified?: boolean;
  isPrivate?: boolean;
  demonstratedSkills?: string[];
  activityHighlights?: string[];
}

export type IntentCategory =
  | 'Career & Interview Prep'
  | 'Technical Debugging'
  | 'Design Critique & Feedback'
  | 'Architecture & Systems'
  | 'Creative & Audio Craft'
  | 'Collaboration & Hiring'
  | 'Knowledge Sharing'
  | 'General Discussion';

export interface MatchedHelper {
  user: User;
  matchScore: number;
  expertiseReason: string;
  relevantSkills: string[];
  isInvited?: boolean;
}

export interface IntentAnalysis {
  category: IntentCategory;
  urgency: 'High' | 'Medium' | 'Low' | 'Evergreen';
  confidence: number;
  summary: string;
  userNeeds: string[];
  extractedSkills: string[];
  matchedHelpers: MatchedHelper[];
  isIntentCircleActive: boolean;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Poll {
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVotedOptionId?: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface PostMedia {
  type: 'image' | 'video' | 'gradient' | 'quote' | 'code' | 'abstract';
  url?: string;
  thumbnailUrl?: string;
  gradient?: string;
  title?: string;
  subtitle?: string;
  quoteAuthor?: string;
  codeSnippet?: CodeSnippet;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

export interface Post {
  id: string;
  author: User;
  content: string;
  tags: string[];
  media?: PostMedia;
  poll?: Poll;
  location?: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  bookmarksCount: number;
  isLiked: boolean;
  isReposted: boolean;
  isBookmarked: boolean;
  comments: Comment[];
  channel?: string;
  intent?: IntentAnalysis;
}

export interface StoryItem {
  id: string;
  mediaType?: 'gradient' | 'image';
  mediaUrl?: string;
  gradient: string;
  headline: string;
  subtext: string;
  timestamp: string;
  location?: string;
}

export interface Story {
  id: string;
  author: User;
  items: StoryItem[];
  hasUnseen: boolean;
}

export interface Reel {
  id: string;
  author: User;
  videoUrl: string;
  posterUrl?: string;
  caption: string;
  musicTrack: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  comments: Comment[];
  createdAt: string;
}

export interface Channel {
  id: string;
  name: string;
  tag: string;
  description: string;
  membersCount: number;
  isJoined: boolean;
  category: string;
}

export interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'repost' | 'mention' | 'story';
  actor: User;
  postId?: string;
  postSnippet?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  readAt?: string;
}

export interface Conversation {
  id: string;
  participant: User;
  messages: Message[];
  unreadCount: number;
  isOnline?: boolean;
}
