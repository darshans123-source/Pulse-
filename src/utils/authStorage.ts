import { User } from '../types';

export interface StoredAccount {
  id: string;
  name: string;
  pin: string;
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
  isVerified?: boolean;
  lastLoginAt: number;
}

const STORAGE_KEY_ACTIVE = 'pulse_social_active_user';
const STORAGE_KEY_ACCOUNTS = 'pulse_social_accounts';
const STORAGE_KEY_STATUS = 'pulse_social_auth_status';

const GRADIENTS = [
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-cyan-500 via-blue-500 to-indigo-500',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-amber-400 via-orange-500 to-rose-500',
  'from-fuchsia-500 via-rose-500 to-amber-500',
  'from-violet-600 via-indigo-600 to-sky-500',
];

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getHandleFromName(name: string): string {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `@${clean || 'user'}`;
}

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr_me',
    name: 'Alex Morgan',
    pin: '1234',
    handle: '@alexmorgan',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    avatarGradient: 'from-indigo-500 via-purple-500 to-pink-500',
    avatarInitials: 'AM',
    bio: 'Product architect & systems engineer. Exploring distributed consensus and generative interfaces.',
    role: 'Systems Architect',
    location: 'San Francisco, CA',
    website: 'alexmorgan.design',
    followersCount: 1420,
    followingCount: 388,
    postsCount: 44,
    joinedDate: 'Joined January 2024',
    isVerified: true,
    lastLoginAt: Date.now(),
  },
  {
    id: 'usr_1',
    name: 'Elena Rostova',
    pin: '1234',
    handle: '@elena_arch',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    avatarGradient: 'from-amber-400 via-rose-500 to-indigo-600',
    avatarInitials: 'ER',
    bio: 'Architectural photographer & urban designer. Documenting the intersection of brutalism and modern botanical structures.',
    role: 'Urban Architect',
    location: 'Berlin / Zurich',
    website: 'rostovastudio.ch',
    followersCount: 8420,
    followingCount: 412,
    postsCount: 128,
    joinedDate: 'Joined March 2023',
    isVerified: true,
    lastLoginAt: Date.now() - 3600000,
  },
  {
    id: 'usr_2',
    name: 'Kaito Takahashi',
    pin: '1234',
    handle: '@kaito_t',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    avatarGradient: 'from-cyan-400 via-teal-500 to-emerald-600',
    avatarInitials: 'KT',
    bio: 'Founding engineer & Rust fanatic. Building high-throughput transactional engines & audio DSP synthesizers.',
    role: 'Systems Engineer',
    location: 'Tokyo / Remote',
    website: 'kaitotakahashi.dev',
    followersCount: 12300,
    followingCount: 195,
    postsCount: 86,
    joinedDate: 'Joined November 2022',
    isVerified: true,
    lastLoginAt: Date.now() - 7200000,
  },
];

export function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
    return DEFAULT_ACCOUNTS;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

export function saveStoredAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (err) {
    console.error('Failed to save accounts in local store:', err);
  }
}

export function getStoredActiveUser(): User | null {
  try {
    const status = localStorage.getItem(STORAGE_KEY_STATUS);
    if (status === 'logged_out') {
      return null;
    }
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredActiveUser(user: User, pin: string = '1234') {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_STATUS, 'logged_in');

    // Update in stored accounts list
    const accounts = getStoredAccounts();
    const existingIndex = accounts.findIndex(
      (a) => a.id === user.id || a.name.toLowerCase() === user.name.toLowerCase()
    );

    if (existingIndex >= 0) {
      accounts[existingIndex] = {
        ...accounts[existingIndex],
        ...user,
        pin: pin || accounts[existingIndex].pin || '1234',
        lastLoginAt: Date.now(),
      };
    } else {
      const gradient = GRADIENTS[accounts.length % GRADIENTS.length];
      const newAccount: StoredAccount = {
        id: user.id || `usr_local_${Date.now()}`,
        name: user.name,
        pin: pin || '1234',
        handle: user.handle || getHandleFromName(user.name),
        avatarUrl: user.avatarUrl,
        avatarGradient: user.avatarGradient || gradient,
        avatarInitials: user.avatarInitials || getInitials(user.name),
        bio: user.bio || 'Pulse Social member.',
        role: user.role || 'Creator',
        location: user.location || 'Global',
        website: user.website,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        postsCount: user.postsCount || 0,
        joinedDate: user.joinedDate || 'Joined Recently',
        isVerified: user.isVerified || false,
        lastLoginAt: Date.now(),
      };
      accounts.unshift(newAccount);
    }
    saveStoredAccounts(accounts);
  } catch (err) {
    console.error('Failed to set active user in local store:', err);
  }
}

export function clearStoredActiveUser() {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE);
    localStorage.setItem(STORAGE_KEY_STATUS, 'logged_out');
  } catch (err) {
    console.error('Failed to clear active user in local store:', err);
  }
}

export function loginWithPin(name: string, pin: string): { success: boolean; user?: User; error?: string } {
  const cleanName = name.trim();
  const cleanPin = pin.trim();

  if (!cleanName) {
    return { success: false, error: 'Please enter your name.' };
  }

  if (!cleanPin || cleanPin.length !== 4 || !/^\d{4}$/.test(cleanPin)) {
    return { success: false, error: 'Please enter a valid 4-digit PIN.' };
  }

  const accounts = getStoredAccounts();
  const existing = accounts.find(
    (a) =>
      a.name.toLowerCase() === cleanName.toLowerCase() ||
      a.handle.toLowerCase() === cleanName.toLowerCase() ||
      a.handle.toLowerCase() === `@${cleanName.toLowerCase()}`
  );

  if (existing) {
    if (existing.pin !== cleanPin) {
      return { success: false, error: 'Incorrect 4-digit PIN. Please try again.' };
    }
    const userObj: User = {
      id: existing.id,
      name: existing.name,
      handle: existing.handle,
      avatarUrl: existing.avatarUrl,
      avatarGradient: existing.avatarGradient,
      avatarInitials: existing.avatarInitials,
      bio: existing.bio,
      role: existing.role,
      location: existing.location,
      website: existing.website,
      followersCount: existing.followersCount,
      followingCount: existing.followingCount,
      postsCount: existing.postsCount,
      joinedDate: existing.joinedDate,
      isVerified: existing.isVerified,
    };
    setStoredActiveUser(userObj, cleanPin);
    return { success: true, user: userObj };
  }

  // Create new user profile in local store
  const gradient = GRADIENTS[accounts.length % GRADIENTS.length];
  const newId = `usr_local_${Date.now()}`;
  const newUser: User = {
    id: newId,
    name: cleanName,
    handle: getHandleFromName(cleanName),
    avatarGradient: gradient,
    avatarInitials: getInitials(cleanName),
    bio: 'Creator & pulse explorer on Pulse Social.',
    role: 'Member',
    location: 'Everywhere',
    followersCount: 1,
    followingCount: 3,
    postsCount: 0,
    joinedDate: 'Joined Today',
    isVerified: false,
  };

  setStoredActiveUser(newUser, cleanPin);
  return { success: true, user: newUser };
}

export function deleteStoredAccount(id: string) {
  const accounts = getStoredAccounts().filter((a) => a.id !== id);
  saveStoredAccounts(accounts);
}
