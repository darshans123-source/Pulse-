import React, { useState } from 'react';
import { Send, CheckCheck, User as UserIcon } from 'lucide-react';
import { Conversation, User, Message } from '../types';

interface MessagesViewProps {
  conversations: Conversation[];
  currentUser: User;
  onSendMessage: (recipientId: string, text: string) => void;
  onSelectProfile: (user: User) => void;
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  conversations,
  currentUser,
  onSendMessage,
  onSelectProfile,
}) => {
  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [inputMessage, setInputMessage] = useState('');

  const activeConversation = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConversation) return;

    onSendMessage(activeConversation.participant.id, inputMessage.trim());
    setInputMessage('');
  };

  return (
    <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/40 backdrop-blur-sm overflow-hidden flex flex-col md:flex-row h-[75vh]">
      {/* Left Conversations List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-neutral-800/80 flex flex-col bg-neutral-950/40">
        <div className="p-4 border-b border-neutral-800/60">
          <h2 className="font-display text-base font-bold text-white">Direct Messages</h2>
          <p className="text-xs text-neutral-500 mt-0.5">Encrypted creator-to-creator notes</p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-neutral-800/40">
          {conversations.map((conv) => {
            const isSelected = conv.id === selectedConvId;
            const lastMsg = conv.messages[conv.messages.length - 1];

            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`flex w-full items-center gap-3 p-3.5 text-left transition-colors ${
                  isSelected ? 'bg-neutral-800/60' : 'hover:bg-neutral-800/30'
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${conv.participant.avatarGradient} text-xs font-bold text-white shadow-sm`}
                >
                  {conv.participant.avatarInitials}
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
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {lastMsg?.text || 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col bg-neutral-900/30">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-neutral-800/60 flex items-center justify-between bg-neutral-950/40">
            <button
              onClick={() => onSelectProfile(activeConversation.participant)}
              className="flex items-center gap-2.5 text-left group"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${activeConversation.participant.avatarGradient} text-xs font-bold text-white`}
              >
                {activeConversation.participant.avatarInitials}
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-200 group-hover:text-indigo-400 transition-colors">
                  {activeConversation.participant.name}
                </div>
                <div className="text-[11px] text-neutral-500">
                  {activeConversation.participant.handle} · {activeConversation.participant.role}
                </div>
              </div>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeConversation.messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                        : 'bg-neutral-800 text-neutral-200 rounded-bl-none border border-neutral-700/60'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`text-[10px] mt-1 flex items-center justify-end gap-1 ${
                        isMe ? 'text-indigo-200' : 'text-neutral-500'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isMe && <CheckCheck className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Composer */}
          <form onSubmit={handleSend} className="p-3 border-t border-neutral-800/60 bg-neutral-950/60">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${activeConversation.participant.name.split(' ')[0]}...`}
                className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-500 disabled:opacity-40"
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
