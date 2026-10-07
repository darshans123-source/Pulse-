import React, { useState } from 'react';
import { X, Heart, MessageSquare, UserPlus, Repeat2, Check, Zap } from 'lucide-react';
import { Notification, User } from '../types';

interface NotificationsModalProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onSelectNotification: (notification: Notification) => void;
  onSelectProfile: (user: User) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllAsRead,
  onSelectNotification,
  onSelectProfile,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'like':
        return <Heart className="h-3.5 w-3.5 text-rose-400 fill-current" />;
      case 'comment':
        return <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />;
      case 'follow':
        return <UserPlus className="h-3.5 w-3.5 text-emerald-400" />;
      case 'repost':
        return <Repeat2 className="h-3.5 w-3.5 text-cyan-400" />;
      case 'mention':
        return <Zap className="h-3.5 w-3.5 text-amber-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 pt-16 sm:pt-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
          <div>
            <h3 className="font-display text-base font-bold text-white">Notifications</h3>
            <p className="text-xs text-neutral-400">Activity and interactions across your network</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter & Actions Bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-neutral-950/50 border-b border-neutral-800/60 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === 'unread' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Unread
            </button>
          </div>

          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            <Check className="h-3 w-3" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              No notifications at the moment.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectNotification(item)}
                className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer ${
                  item.isRead ? 'hover:bg-neutral-800/30' : 'bg-neutral-800/20 hover:bg-neutral-800/40'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProfile(item.actor);
                  }}
                  className="relative shrink-0"
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr ${item.actor.avatarGradient} text-xs font-bold text-white shadow-sm`}
                  >
                    {item.actor.avatarInitials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neutral-900 border border-neutral-700">
                    {getIcon(item.type)}
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="text-xs text-neutral-300 leading-relaxed">
                    <span className="font-semibold text-white">{item.actor.name}</span>{' '}
                    {item.type === 'like' && 'appreciated your pulse'}
                    {item.type === 'comment' && 'commented on your pulse'}
                    {item.type === 'follow' && 'started following your architectural notes'}
                    {item.type === 'repost' && 'reposted your pulse'}
                    {item.type === 'mention' && 'invited your demonstrated domain expertise to an Intent Circle'}
                  </div>

                  {item.postSnippet && (
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-1 italic">
                      "{item.postSnippet}"
                    </p>
                  )}

                  <div className="mt-1 text-[11px] text-neutral-500">
                    {item.createdAt}
                  </div>
                </div>

                {!item.isRead && (
                  <span className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
