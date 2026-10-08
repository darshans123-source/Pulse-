import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Check, 
  CheckCheck, 
  User as UserIcon, 
  Search, 
  Image as ImageIcon, 
  Smile, 
  Sparkles, 
  Upload, 
  X,
  Phone,
  Video,
  Info,
  Clock,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Conversation, User, Message } from '../types';
import { sound } from '../utils/soundEngine';

interface MessagesViewProps {
  conversations: Conversation[];
  currentUser: User;
  onSendMessage: (recipientId: string, text: string, imageUrl?: string) => void;
  onSelectProfile: (user: User) => void;
  onMarkConversationRead?: (convId: string) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  currentUser,
  onSendMessage,
  onSelectProfile,
  onMarkConversationRead,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTooltipMessageId, setActiveTooltipMessageId] = useState<string | null>(null);
  const [localMessageStatuses, setLocalMessageStatuses] = useState<Record<string, { status: 'sent' | 'delivered' | 'read'; readAt?: string }>>({});
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isTyping, localMessageStatuses]);

  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.participant.name.toLowerCase().includes(q) ||
      c.participant.handle.toLowerCase().includes(q)
    );
  });

  const getEffectiveStatus = (msg: Message): { status: 'sent' | 'delivered' | 'read'; readAt?: string } => {
    if (localMessageStatuses[msg.id]) {
      return localMessageStatuses[msg.id];
    }
    return {
      status: msg.status || 'read',
      readAt: msg.readAt,
    };
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputMessage.trim() && !attachedImage) || !activeConversation) return;

    sound.playSuccess();
    const textToSend = inputMessage.trim();
    const imageToSend = attachedImage || undefined;
    const tempId = `msg_temp_${Date.now()}`;
    
    // Set immediate visual feedback: sent
    setLocalMessageStatuses((prev) => ({
      ...prev,
      [tempId]: { status: 'sent' },
    }));

    onSendMessage(activeConversation.participant.id, textToSend, imageToSend);
    setInputMessage('');
    setAttachedImage(null);

    // Dynamic progression: delivered in 800ms
    setTimeout(() => {
      setLocalMessageStatuses((prev) => ({
        ...prev,
        [tempId]: { status: 'delivered' },
      }));
    }, 800);

    // Recipient starts typing in 1.4s
    setTimeout(() => {
      setIsTyping(true);
      // Mark as read when recipient is typing
      setLocalMessageStatuses((prev) => ({
        ...prev,
        [tempId]: { status: 'read', readAt: 'Just now' },
      }));
      sound.playClick();
    }, 1600);

    // Recipient finishes typing
    setTimeout(() => {
      setIsTyping(false);
      sound.playPop();
    }, 3200);
  };

  const handleSimulateReadReceipts = () => {
    if (!activeConversation) return;
    sound.playSuccess();
    
    const updates: Record<string, { status: 'sent' | 'delivered' | 'read'; readAt: string }> = {};
    activeConversation.messages.forEach((m) => {
      if (m.senderId === currentUser.id) {
        updates[m.id] = { status: 'read', readAt: 'Just now' };
      }
    });

    setLocalMessageStatuses((prev) => ({
      ...prev,
      ...updates,
    }));

    if (onMarkConversationRead) {
      onMarkConversationRead(activeConversation.id);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAttachedImage(reader.result);
          sound.playSuccess();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row h-[78vh] shadow-xl">
      {/* Left Conversations List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-800/80 flex flex-col bg-neutral-950/60 shrink-0">
        <div className="p-3.5 border-b border-neutral-800/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-white">Direct Messages</h2>
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Connected" />
              <span className="text-[10px] text-emerald-400 font-medium">Live</span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/80 py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-900">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            const lastMsg = conv.messages[conv.messages.length - 1];
            const isLastMsgMe = lastMsg?.senderId === currentUser.id;
            const lastStatus = lastMsg ? getEffectiveStatus(lastMsg) : null;

            return (
              <button
                key={conv.id}
                onClick={() => {
                  sound.playClick();
                  setSelectedConvId(conv.id);
                }}
                className={`flex w-full items-center gap-3 p-3.5 text-left transition-colors relative ${
                  isSelected ? 'bg-neutral-800/60' : 'hover:bg-neutral-800/30'
                }`}
              >
                <div className="relative shrink-0">
                  {conv.participant.avatarUrl ? (
                    <img
                      src={conv.participant.avatarUrl}
                      alt={conv.participant.name}
                      className="h-11 w-11 rounded-xl object-cover shadow-sm ring-1 ring-neutral-800"
                    />
                  ) : (
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${conv.participant.avatarGradient} text-xs font-bold text-white shadow-sm`}
                    >
                      {conv.participant.avatarInitials}
                    </div>
                  )}
                  {/* Online dot */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-neutral-950 bg-emerald-500" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-neutral-200 truncate">
                      {conv.participant.name}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {lastMsg?.timestamp || ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isLastMsgMe && lastStatus && (
                      <span className="shrink-0" title={lastStatus.status === 'read' ? 'Read' : lastStatus.status === 'delivered' ? 'Delivered' : 'Sent'}>
                        {lastStatus.status === 'read' ? (
                          <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                        ) : lastStatus.status === 'delivered' ? (
                          <CheckCheck className="h-3 w-3 text-neutral-400" />
                        ) : (
                          <Check className="h-3 w-3 text-neutral-500" />
                        )}
                      </span>
                    )}
                    <p className="text-xs text-neutral-400 truncate">
                      {lastMsg?.imageUrl ? '📷 Shared photo' : lastMsg?.text || 'No messages yet'}
                    </p>
                  </div>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-neutral-900/30">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-neutral-800/60 flex items-center justify-between bg-neutral-950/60">
            <button
              onClick={() => onSelectProfile(activeConversation.participant)}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="relative">
                {activeConversation.participant.avatarUrl ? (
                  <img
                    src={activeConversation.participant.avatarUrl}
                    alt={activeConversation.participant.name}
                    className="h-9 w-9 rounded-xl object-cover ring-1 ring-neutral-800"
                  />
                ) : (
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${activeConversation.participant.avatarGradient} text-xs font-bold text-white`}
                  >
                    {activeConversation.participant.avatarInitials}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-neutral-950 bg-emerald-500" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                  <span>{activeConversation.participant.name}</span>
                  {activeConversation.participant.isVerified && (
                    <span className="text-indigo-400 text-[10px]">✓</span>
                  )}
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Active now</span>
                  <span className="text-neutral-500">·</span>
                  <span className="text-sky-400 text-[10px] font-medium">Read receipts on</span>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateReadReceipts}
                title="Mark all as read to see visual feedback"
                className="hidden sm:inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs border border-indigo-500/30 bg-indigo-950/30 text-indigo-300 hover:bg-indigo-900/40 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                <span>Mark Read</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectProfile(activeConversation.participant)}
                className="rounded-xl px-2.5 py-1 text-xs border border-neutral-800 hover:text-white hover:border-neutral-700 transition-colors text-neutral-300"
              >
                View Profile
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {/* Read Receipt Feedback Banner */}
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950/70 border border-neutral-800/80 px-3 py-1 text-[10px] text-neutral-400 shadow-sm">
                <CheckCheck className="h-3 w-3 text-sky-400" />
                <span>Read receipts active · Double blue checks indicate delivered and read</span>
              </div>
            </div>

            {activeConversation.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const { status, readAt } = getEffectiveStatus(msg);
              const isRead = status === 'read';
              const isDelivered = status === 'delivered';
              const showTooltip = activeTooltipMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* The Message Bubble with exact CSS selector .message-bubble */}
                  <div
                    onClick={() => {
                      if (isMe) {
                        setActiveTooltipMessageId(showTooltip ? null : msg.id);
                      }
                    }}
                    className={`message-bubble relative max-w-[80%] sm:max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed transition-all cursor-pointer ${
                      isMe
                        ? `is-sender ${
                            isRead ? 'is-read shadow-md shadow-sky-500/10' : ''
                          } bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none`
                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700/60'
                    }`}
                  >
                    {msg.imageUrl && (
                      <div className="mb-2 overflow-hidden rounded-xl bg-neutral-900 border border-black/20">
                        <img
                          src={msg.imageUrl}
                          alt="Shared attachment"
                          className="max-h-56 w-full object-cover"
                        />
                      </div>
                    )}

                    {msg.text && <p className="text-[13px] leading-relaxed">{msg.text}</p>}

                    {/* Footer with Read Status Visual Feedback */}
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end gap-1.5 ${
                        isMe ? 'text-indigo-200' : 'text-neutral-500'
                      }`}
                    >
                      <span>{msg.timestamp}</span>

                      {/* Visual Read Status Indicators for the Sender */}
                      {isMe && (
                        <div
                          className={`read-status-indicator inline-flex items-center gap-1 font-medium transition-all ${
                            isRead
                              ? 'status-read text-sky-300'
                              : isDelivered
                              ? 'status-delivered text-neutral-300'
                              : 'status-sent text-neutral-400'
                          }`}
                          title={
                            isRead
                              ? `Read by ${activeConversation.participant.name} (${readAt || 'Seen'})`
                              : isDelivered
                              ? 'Delivered to device'
                              : 'Sent'
                          }
                        >
                          {isRead ? (
                            <>
                              <span className="text-[10px] font-semibold tracking-wide text-sky-200">
                                Read
                              </span>
                              <CheckCheck className="h-3.5 w-3.5 text-sky-300 drop-shadow-sm transition-transform hover:scale-110" />
                            </>
                          ) : isDelivered ? (
                            <>
                              <span className="text-[10px] text-neutral-300">
                                Delivered
                              </span>
                              <CheckCheck className="h-3 w-3 text-neutral-300" />
                            </>
                          ) : (
                            <>
                              <span className="text-[10px] text-neutral-400">
                                Sent
                              </span>
                              <Check className="h-3 w-3 text-neutral-400" />
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* On-Click / Hover Info Tooltip Popup */}
                    {isMe && showTooltip && (
                      <div className="absolute right-0 -bottom-8 z-30 flex items-center gap-1.5 rounded-lg bg-neutral-950 border border-neutral-700/80 px-2.5 py-1 text-[10px] text-neutral-200 shadow-xl whitespace-nowrap animate-in fade-in">
                        <Eye className="h-3 w-3 text-sky-400" />
                        <span>
                          {isRead
                            ? `Read by ${activeConversation.participant.name} · ${readAt || msg.timestamp}`
                            : isDelivered
                            ? `Delivered to ${activeConversation.participant.name}`
                            : 'Message sent to server'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Realistic Typing Indicator UI */}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <div className="message-bubble flex items-center gap-1.5 rounded-2xl bg-neutral-800 border border-neutral-700/60 px-3.5 py-2 text-xs text-neutral-400 rounded-bl-none">
                  <span className="text-[11px] font-medium">
                    {activeConversation.participant.name.split(' ')[0]} is reading & typing
                  </span>
                  <span className="flex gap-1 items-center ml-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce" />
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="px-3 pt-2 bg-neutral-950/60 border-t border-neutral-800 flex items-center gap-2">
              <div className="relative">
                <img
                  src={attachedImage}
                  alt="Attachment preview"
                  className="h-14 w-14 object-cover rounded-xl border border-neutral-700"
                />
                <button
                  type="button"
                  onClick={() => setAttachedImage(null)}
                  className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-white"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
              <span className="text-xs text-neutral-400">Photo attached · Ready to send</span>
            </div>
          )}

          {/* Message Composer */}
          <form onSubmit={handleSend} className="p-3 border-t border-neutral-800/60 bg-neutral-950/60">
            <div className="flex items-center gap-2">
              {/* Photo Upload from device */}
              <label
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white hover:border-neutral-700 cursor-pointer transition-colors shrink-0"
                title="Send photo"
              >
                <ImageIcon className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${activeConversation.participant.name.split(' ')[0]}...`}
                className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() && !attachedImage}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-40 shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-xs text-neutral-500">
          Select a contact to begin messaging
        </div>
      )}
    </div>
  );
};
