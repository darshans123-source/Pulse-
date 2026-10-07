export interface User {
  id: string;
  name: string;
  handle: string;
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
  type: 'gradient' | 'quote' | 'code' | 'abstract';
  gradient?: string;
  title?: string;
  subtitle?: string;
  quoteAuthor?: string;
  codeSnippet?: CodeSnippet;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  tags: string[];
  media?: PostMedia;
  poll?: Poll;
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
  gradient: string;
  headline: string;
  subtext: string;
  timestamp: string;
}

export interface Story {
  id: string;
  author: User;
  items: StoryItem[];
  hasUnseen: boolean;
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
  type: 'like' | 'comment' | 'follow' | 'repost' | 'mention';
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
  timestamp: string;
}

export interface Conversation {
  id: string;
  participant: User;
  messages: Message[];
  unreadCount: number;
}
