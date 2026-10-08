import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Shield, 
  Bell, 
  Palette, 
  LogOut, 
  User as UserIcon, 
  Check, 
  Moon, 
  Sun, 
  Lock, 
  Eye, 
  Trash2,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { sound } from '../utils/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'theme'>('account');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Form states
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [bio, setBio] = useState(currentUser.bio);
  const [location, setLocation] = useState(currentUser.location);
  const [website, setWebsite] = useState(currentUser.website || '');
  const [isPrivate, setIsPrivate] = useState(Boolean(currentUser.isPrivate));
  
  // Privacy & Notifications toggles
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [allowTagging, setAllowTagging] = useState(true);
  const [pushLikes, setPushLikes] = useState(true);
  const [pushComments, setPushComments] = useState(true);
  const [pushMessages, setPushMessages] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'midnight' | 'dim'>('dark');

  if (!isOpen) return null;

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSuccess();
    onUpdateUser({
      ...currentUser,
      name,
      handle,
      bio,
      location,
      website,
      isPrivate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative flex flex-col md:flex-row w-full max-w-3xl h-[85vh] max-h-[640px] rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
        {/* Mobile Header Close */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 z-10 text-neutral-400 hover:text-white p-1 rounded-lg bg-neutral-900"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Left Settings Sidebar */}
        <div className="w-full md:w-56 border-b md:border-b-0 md:border-r border-neutral-800/80 bg-neutral-900/30 p-4 flex flex-col shrink-0">
          <div className="flex items-center gap-2 mb-4 px-2">
            <Settings className="h-4 w-4 text-indigo-400" />
            <h3 className="font-display text-sm font-bold text-white">Settings</h3>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'account'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
              }`}
            >
              <UserIcon className="h-3.5 w-3.5 text-neutral-400" />
              <span>Account & Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'privacy'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
              }`}
            >
              <Shield className="h-3.5 w-3.5 text-neutral-400" />
              <span>Privacy & Security</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'notifications'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
              }`}
            >
              <Bell className="h-3.5 w-3.5 text-neutral-400" />
              <span>Notifications</span>
            </button>

            <button
              onClick={() => setActiveTab('theme')}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap text-left ${
                activeTab === 'theme'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:bg-neutral-900 hover:text-neutral-200'
              }`}
            >
              <Palette className="h-3.5 w-3.5 text-neutral-400" />
              <span>Appearance</span>
            </button>
          </nav>

          <div className="mt-auto hidden md:block pt-4 border-t border-neutral-800/60">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/20 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950">
          <div className="hidden md:flex items-center justify-between pb-4 border-b border-neutral-800/80 mb-6">
            <div>
              <h2 className="text-base font-bold text-white capitalize">
                {activeTab === 'account' && 'Account & Profile Settings'}
                {activeTab === 'privacy' && 'Privacy & Account Safety'}
                {activeTab === 'notifications' && 'Notification Preferences'}
                {activeTab === 'theme' && 'Visual Style & Themes'}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Manage your credentials, presence, and personal customizations.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-900"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tab 1: Account */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-4 max-w-lg">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${currentUser.avatarGradient} text-sm font-bold text-white`}
                >
                  {currentUser.avatarInitials}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">{currentUser.name}</div>
                  <div className="text-[11px] text-neutral-400">{currentUser.handle}</div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Website URL
                  </label>
                  <input
                    type="text"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Privacy */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div>
                  <div className="text-xs font-semibold text-white">Private Account</div>
                  <div className="text-[11px] text-neutral-400">
                    Only approved followers can view your pulses and stories
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div>
                  <div className="text-xs font-semibold text-white">Active Status</div>
                  <div className="text-[11px] text-neutral-400">
                    Show green indicator when active in direct messages
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showActivityStatus}
                  onChange={(e) => setShowActivityStatus(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div>
                  <div className="text-xs font-semibold text-white">Read Receipts</div>
                  <div className="text-[11px] text-neutral-400">
                    Allow people to see when you have read their messages
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={readReceipts}
                  onChange={(e) => setReadReceipts(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div>
                  <div className="text-xs font-semibold text-white">Mentions & Tagging</div>
                  <div className="text-[11px] text-neutral-400">
                    Allow other community members to tag you in comments & reels
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowTagging}
                  onChange={(e) => setAllowTagging(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    onClose();
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Save Privacy Preferences
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Notifications */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div>
                  <div className="text-xs font-semibold text-white">Likes & Reactions</div>
                  <div className="text-[11px] text-neutral-400">
                    Notify when someone likes your pulses or reels
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushLikes}
                  onChange={(e) => setPushLikes(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div>
                  <div className="text-xs font-semibold text-white">Comments & Replies</div>
                  <div className="text-[11px] text-neutral-400">
                    Notify when someone responds to your pulses
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushComments}
                  onChange={(e) => setPushComments(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div>
                  <div className="text-xs font-semibold text-white">Direct Messages</div>
                  <div className="text-[11px] text-neutral-400">
                    Notify when a creator sends you a new message
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushMessages}
                  onChange={(e) => setPushMessages(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40">
                <div>
                  <div className="text-xs font-semibold text-white">Weekly Digest Email</div>
                  <div className="text-[11px] text-neutral-400">
                    Receive summary of top trending posts and highlights
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="h-4 w-4 rounded accent-indigo-600"
                />
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    sound.playSuccess();
                    onClose();
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                >
                  Save Notification Settings
                </button>
              </div>
            </div>
          )}

          {/* Tab 4: Theme / Appearance */}
          {activeTab === 'theme' && (
            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('dark');
                    sound.playClick();
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    themeMode === 'dark'
                      ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                  }`}
                >
                  <div className="h-6 w-full rounded bg-[#0a0a0c] border border-neutral-800 mb-2" />
                  <div className="text-xs font-semibold text-white">Obsidian</div>
                  <div className="text-[10px] text-neutral-400">Pulse Dark Default</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('midnight');
                    sound.playClick();
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    themeMode === 'midnight'
                      ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                  }`}
                >
                  <div className="h-6 w-full rounded bg-black border border-neutral-800 mb-2" />
                  <div className="text-xs font-semibold text-white">OLED Black</div>
                  <div className="text-[10px] text-neutral-400">Pure 0% Lumens</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setThemeMode('dim');
                    sound.playClick();
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    themeMode === 'dim'
                      ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500'
                      : 'border-neutral-800 bg-neutral-900/50 hover:border-neutral-700'
                  }`}
                >
                  <div className="h-6 w-full rounded bg-[#16181e] border border-neutral-700 mb-2" />
                  <div className="text-xs font-semibold text-white">Slate Dim</div>
                  <div className="text-[10px] text-neutral-400">Muted Contrast</div>
                </button>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/30 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-neutral-200">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <span>UI Tactile Acoustics</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Pulse Social features subtle mechanical haptic sound effects on vote submissions, likes, and message dispatches. Toggle sound anytime via the audio icon in the top navigation bar.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-800 bg-neutral-950 p-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
              <LogOut className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Log out of Pulse Social?</h4>
              <p className="text-xs text-neutral-400 mt-1">
                You will be returned to the sign-in screen. You can log back in at any time.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl bg-neutral-900 py-2.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setShowLogoutConfirm(false);
                  onClose();
                  onLogout();
                }}
                className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
