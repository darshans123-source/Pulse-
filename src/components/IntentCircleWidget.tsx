import React, { useState } from 'react';
import { 
  Compass, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  HelpCircle, 
  AlertCircle, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Zap
} from 'lucide-react';
import { IntentAnalysis, User, Post } from '../types';

interface IntentCircleWidgetProps {
  intent: IntentAnalysis;
  post: Post;
  currentUser: User;
  onInviteHelper: (postId: string, helperUserId: string) => void;
  onOpenComments: (post: Post) => void;
  onSelectProfile: (user: User) => void;
}

export const IntentCircleWidget: React.FC<IntentCircleWidgetProps> = ({
  intent,
  post,
  currentUser,
  onInviteHelper,
  onOpenComments,
  onSelectProfile,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'High':
        return {
          label: 'High Urgency',
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
        };
      case 'Medium':
        return {
          label: 'Medium Urgency',
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
        };
      default:
        return {
          label: 'Evergreen Discussion',
          color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
        };
    }
  };

  const urgencyInfo = getUrgencyBadge(intent.urgency);
  const isPostAuthor = currentUser.id === post.author.id;

  return (
    <div className="mt-4 rounded-xl border border-indigo-500/30 bg-neutral-950/70 overflow-hidden shadow-inner">
      {/* Intent Header Bar */}
      <div 
        className="flex items-center justify-between p-3.5 bg-gradient-to-r from-indigo-950/40 via-neutral-900/50 to-neutral-950/40 border-b border-indigo-500/20 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
            <Zap className="h-3.5 w-3.5" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-wide">
                Intent Circle: {intent.category}
              </span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${urgencyInfo.color}`}>
                {urgencyInfo.label}
              </span>
              <span className="text-[11px] text-neutral-400 tabular-nums">
                · {intent.confidence}% confidence
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
              {intent.summary}
            </p>
          </div>
        </div>

        <button
          className="text-neutral-400 hover:text-white transition-colors p-1"
          title={isExpanded ? 'Collapse Intent Circle' : 'Expand Intent Circle'}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4 text-xs">
          {/* User Needs Section */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 flex items-center gap-1.5">
              <span>Detected Needs</span>
            </div>
            <ul className="space-y-1.5 pl-1">
              {intent.userNeeds.map((need, idx) => (
                <li key={idx} className="flex items-start gap-2 text-neutral-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{need}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* People who may be able to help you */}
          <div className="pt-2 border-t border-neutral-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span className="font-semibold text-neutral-200">
                  People Who Can Help You
                </span>
              </div>
              <span className="text-[10px] text-neutral-500">
                Matched by demonstrated expertise, not proximity
              </span>
            </div>

            <div className="space-y-2">
              {intent.matchedHelpers.map((helper) => {
                const isCurrentUserHelper = helper.user.id === currentUser.id;

                return (
                  <div
                    key={helper.user.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2.5 rounded-xl border border-neutral-800/80 bg-neutral-900/60 transition-colors hover:border-neutral-700"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <button
                        onClick={() => onSelectProfile(helper.user)}
                        className="group shrink-0"
                      >
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${helper.user.avatarGradient} text-xs font-bold text-white shadow-sm transition-transform group-hover:scale-105`}
                        >
                          {helper.user.avatarInitials}
                        </div>
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => onSelectProfile(helper.user)}
                            className="font-semibold text-neutral-200 hover:text-indigo-400 transition-colors truncate"
                          >
                            {helper.user.name}
                          </button>
                          <span className="text-[11px] text-neutral-500">
                            {helper.user.handle}
                          </span>
                          <span className="text-[10px] font-mono tabular-nums text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-1.5 py-0.2 rounded">
                            {helper.matchScore}% capability match
                          </span>
                        </div>

                        <p className="text-[11px] text-indigo-300 font-medium mt-0.5 leading-relaxed">
                          ↳ {helper.expertiseReason}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {isCurrentUserHelper ? (
                        <button
                          onClick={() => onOpenComments(post)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors whitespace-nowrap"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Offer Advice</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onInviteHelper(post.id, helper.user.id)}
                          disabled={helper.isInvited}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                            helper.isInvited
                              ? 'border border-neutral-700 bg-neutral-800 text-neutral-400 cursor-default'
                              : 'border border-indigo-500/40 bg-indigo-950/50 text-indigo-300 hover:bg-indigo-900/60'
                          }`}
                        >
                          {helper.isInvited ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span>Invited to Circle</span>
                            </>
                          ) : (
                            <>
                              <span>Request Perspective</span>
                              <ArrowRight className="h-3 w-3" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
