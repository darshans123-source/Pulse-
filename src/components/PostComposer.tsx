import React, { useState, useMemo } from 'react';
import { 
  Image, 
  BarChart2, 
  Code, 
  Quote, 
  Smile, 
  X, 
  Sparkles, 
  Send, 
  Zap, 
  Check, 
  HelpCircle, 
  Users 
} from 'lucide-react';
import { User, Post, PostMedia, Poll, IntentAnalysis } from '../types';
import { analyzePostIntent } from '../utils/intentEngine';
import { AiRefinerModal } from './AiRefinerModal';
import { sound } from '../utils/soundEngine';

interface PostComposerProps {
  currentUser: User;
  allUsers?: User[];
  onAddPost: (post: Omit<Post, 'id' | 'createdAt' | 'likesCount' | 'commentsCount' | 'repostsCount' | 'bookmarksCount' | 'isLiked' | 'isReposted' | 'isBookmarked' | 'comments'>) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  currentUser,
  allUsers = [],
  onAddPost,
  onClose,
  isModal = false,
}) => {
  const [content, setContent] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('Design Craft');
  const [activeMode, setActiveMode] = useState<'text' | 'poll' | 'code' | 'quote' | 'visual'>('text');
  const [tags, setTags] = useState<string[]>(['DesignCraft']);
  const [tagInput, setTagInput] = useState('');
  const [enableIntentCircle, setEnableIntentCircle] = useState(true);
  const [isAiRefinerOpen, setIsAiRefinerOpen] = useState(false);

  // Poll state
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);

  // Code state
  const [codeLanguage, setCodeLanguage] = useState('typescript');
  const [codeContent, setCodeContent] = useState('');

  // Quote state
  const [quoteAuthor, setQuoteAuthor] = useState('');

  // Visual card state
  const [visualTitle, setVisualTitle] = useState('');
  const [visualSubtitle, setVisualSubtitle] = useState('');
  const [visualGradient, setVisualGradient] = useState('from-indigo-950 via-purple-950 to-neutral-950');

  // Compute live intent analysis dynamically as user types
  const liveIntent: IntentAnalysis = useMemo(() => {
    return analyzePostIntent(content, allUsers, currentUser.id);
  }, [content, allUsers, currentUser.id]);

  const presetPrompts = [
    {
      label: 'Java Interview (User Example)',
      category: 'Career Help',
      text: "I have an interview tomorrow and I'm nervous. Anyone who has attended a Java interview, please give me some advice on what hiring managers really look for in concurrency and Spring design questions?",
      channel: 'Tech & Engineering',
      tags: ['CareerAdvice', 'Java', 'InterviewPrep'],
    },
    {
      label: 'Django Migration Lock (User Example)',
      category: 'Debugging',
      text: "My Python project is giving me a Django migration error with table locks on Postgres. Has anyone run into `relation locked by another transaction` when altering a nullable foreign key on a table with 2M+ rows?",
      channel: 'Tech & Engineering',
      tags: ['Python', 'Django', 'PostgreSQL', 'Debugging'],
    },
    {
      label: 'Typography Hierarchy Critique',
      category: 'Design Feedback',
      text: "Could someone review our mobile typography scale? We are seeing awkward measure wrapping and would love critique on our line-height and cap-height balance.",
      channel: 'Design Craft',
      tags: ['Typography', 'DesignCraft', 'Feedback'],
    },
  ];

  const handleApplyPreset = (preset: typeof presetPrompts[0]) => {
    setContent(preset.text);
    setSelectedChannel(preset.channel);
    setTags(preset.tags);
  };

  const gradients = [
    { label: 'Deep Indigo', val: 'from-indigo-950 via-purple-950 to-neutral-950' },
    { label: 'Warm Amber', val: 'from-amber-950 via-rose-950 to-neutral-900' },
    { label: 'Cyan Ocean', val: 'from-cyan-950 via-teal-950 to-slate-950' },
    { label: 'Emerald Forest', val: 'from-emerald-950 via-slate-900 to-zinc-950' },
  ];

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.trim().replace(/^#/, '');
      if (cleaned && !tags.includes(cleaned)) {
        setTags([...tags, cleaned]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && activeMode === 'text') return;

    let media: PostMedia | undefined = undefined;
    let poll: Poll | undefined = undefined;

    if (activeMode === 'visual') {
      media = {
        type: 'abstract',
        gradient: visualGradient,
        title: visualTitle || 'Visual Exhibition',
        subtitle: visualSubtitle || 'Digital Studio Artifact',
      };
    } else if (activeMode === 'quote') {
      media = {
        type: 'quote',
        gradient: 'from-purple-950 via-indigo-950 to-neutral-950',
        title: 'Selected Quote',
        subtitle: 'Community Note',
        quoteAuthor: quoteAuthor || currentUser.name,
      };
    } else if (activeMode === 'code') {
      media = {
        type: 'code',
        title: 'Source Snippet',
        subtitle: `${codeLanguage.toUpperCase()} implementation`,
        codeSnippet: {
          language: codeLanguage,
          code: codeContent || '// Zero runtime overhead layout snippet\nconst formatMetric = (val: number) => val.toFixed(2);',
        },
      };
    } else if (activeMode === 'poll') {
      const validOptions = pollOptions.filter((opt) => opt.trim().length > 0);
      if (validOptions.length >= 2) {
        poll = {
          question: pollQuestion || content,
          options: validOptions.map((opt, i) => ({
            id: `opt_${Date.now()}_${i}`,
            text: opt,
            votes: 0,
          })),
          totalVotes: 0,
        };
      }
    }

    sound.playSuccess();
    onAddPost({
      author: currentUser,
      content: content.trim(),
      tags: tags.length ? tags : ['General'],
      channel: selectedChannel,
      media,
      poll,
      intent: enableIntentCircle && liveIntent.isIntentCircleActive ? liveIntent : undefined,
    });

    // Reset form
    setContent('');
    setActiveMode('text');
    setPollOptions(['', '']);
    setPollQuestion('');
    setCodeContent('');
    setVisualTitle('');
    setVisualSubtitle('');
    if (onClose) onClose();
  };

  return (
    <div
      className={`rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 backdrop-blur-md ${
        isModal ? 'shadow-2xl' : 'shadow-sm'
      }`}
    >
      {/* Header if modal */}
      {isModal && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/60">
          <h3 className="font-display text-sm font-bold text-white">Create New Pulse</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info & Channel Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${currentUser.avatarGradient} text-xs font-bold text-white shadow-sm`}
            >
              {currentUser.avatarInitials}
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-200">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-neutral-500">
                Posting to{' '}
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="bg-transparent text-indigo-400 font-medium hover:underline focus:outline-none cursor-pointer"
                >
                  <option value="Design Craft" className="bg-neutral-900 text-neutral-100">Design Craft</option>
                  <option value="Tech & Engineering" className="bg-neutral-900 text-neutral-100">Tech & Engineering</option>
                  <option value="Interface Lab" className="bg-neutral-900 text-neutral-100">Interface Lab</option>
                  <option value="Creative Lab" className="bg-neutral-900 text-neutral-100">Creative Lab</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1 rounded-xl bg-neutral-950/70 p-1 border border-neutral-800/60">
            <button
              type="button"
              onClick={() => setActiveMode(activeMode === 'visual' ? 'text' : 'visual')}
              title="Add Visual Card"
              className={`p-1.5 rounded-lg transition-colors ${
                activeMode === 'visual' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Image className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveMode(activeMode === 'poll' ? 'text' : 'poll')}
              title="Add Poll"
              className={`p-1.5 rounded-lg transition-colors ${
                activeMode === 'poll' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveMode(activeMode === 'code' ? 'text' : 'code')}
              title="Add Code Snippet"
              className={`p-1.5 rounded-lg transition-colors ${
                activeMode === 'code' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Code className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveMode(activeMode === 'quote' ? 'text' : 'quote')}
              title="Add Quote"
              className={`p-1.5 rounded-lg transition-colors ${
                activeMode === 'quote' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Quote className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Intent Test Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] uppercase font-semibold text-neutral-500 whitespace-nowrap shrink-0">
            Try Intent Prompts:
          </span>
          {presetPrompts.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 transition-colors"
            >
              💡 {preset.label}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an insight, architectural study, performance finding, or project update..."
          rows={3}
          className="w-full resize-none rounded-xl border border-neutral-800 bg-neutral-950/50 p-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500/80 focus:outline-none focus:ring-1 focus:ring-indigo-500/80"
        />

        {/* Real-time Social Intent Engine Inspector */}
        {content.trim().length >= 12 && liveIntent.isIntentCircleActive && (
          <div className="rounded-xl border border-indigo-500/40 bg-neutral-950/90 p-3.5 space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
                  <Zap className="h-3 w-3" />
                </div>
                <span className="text-xs font-bold text-white tracking-wide">
                  Social Intent Engine: Detected Intent
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tabular-nums text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                  {liveIntent.confidence}% confidence
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                  liveIntent.urgency === 'High' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                }`}>
                  {liveIntent.urgency} Urgency
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-neutral-900/60 p-2.5 text-xs text-neutral-300 border border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">
                  {liveIntent.category}
                </span>
                <label className="flex items-center gap-1.5 text-[11px] text-neutral-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableIntentCircle}
                    onChange={(e) => setEnableIntentCircle(e.target.checked)}
                    className="rounded border-neutral-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Create Intent Circle</span>
                </label>
              </div>
              <p className="text-[11px] text-neutral-400 italic">
                "{liveIntent.summary}"
              </p>

              {/* Identified Needs */}
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1">
                  User Needs:
                </span>
                <div className="space-y-1">
                  {liveIntent.userNeeds.map((need, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-neutral-300">
                      <span className="text-indigo-400">·</span>
                      <span>{need}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Helpers Preview */}
              {liveIntent.matchedHelpers.length > 0 && (
                <div className="pt-2 border-t border-neutral-800/60">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500 block mb-1.5">
                    People who may be able to help you (matched by demonstrated activity):
                  </span>
                  <div className="space-y-1.5">
                    {liveIntent.matchedHelpers.map((h) => (
                      <div key={h.user.id} className="flex items-center justify-between text-[11px] bg-neutral-950/50 p-1.5 rounded-lg border border-neutral-800/60">
                        <div className="flex items-center gap-2 truncate">
                          <div className={`h-5 w-5 rounded-md bg-gradient-to-tr ${h.user.avatarGradient} flex items-center justify-center text-[9px] font-bold text-white shrink-0`}>
                            {h.user.avatarInitials}
                          </div>
                          <span className="font-medium text-neutral-200 truncate">{h.user.name}</span>
                          <span className="text-neutral-500 truncate">({h.user.role})</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0">
                          {h.matchScore}% match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode Specific Inputs */}
        {activeMode === 'poll' && (
          <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
            <div className="text-xs font-semibold text-neutral-300">Poll Configuration</div>
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Poll question (optional, defaults to post text)"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
            />
            {pollOptions.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
                />
                {pollOptions.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                    className="p-1.5 text-neutral-500 hover:text-rose-400"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ''])}
                className="text-xs text-indigo-400 hover:text-indigo-300"
              >
                + Add Option
              </button>
            )}
          </div>
        )}

        {activeMode === 'code' && (
          <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">Code Snippet</span>
              <select
                value={codeLanguage}
                onChange={(e) => setCodeLanguage(e.target.value)}
                className="rounded border border-neutral-800 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-200 focus:outline-none"
              >
                <option value="typescript">TypeScript</option>
                <option value="css">CSS</option>
                <option value="javascript">JavaScript</option>
                <option value="rust">Rust</option>
              </select>
            </div>
            <textarea
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              placeholder="Paste or write code snippet here..."
              rows={3}
              className="w-full font-mono text-xs rounded-lg border border-neutral-800 bg-neutral-900/90 p-2 text-neutral-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {activeMode === 'quote' && (
          <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
            <div className="text-xs font-semibold text-neutral-300">Quote Citation</div>
            <input
              type="text"
              value={quoteAuthor}
              onChange={(e) => setQuoteAuthor(e.target.value)}
              placeholder="Attribution / Author name"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        {activeMode === 'visual' && (
          <div className="space-y-2 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
            <div className="text-xs font-semibold text-neutral-300">Visual Atmosphere Card</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={visualTitle}
                onChange={(e) => setVisualTitle(e.target.value)}
                placeholder="Card Headline"
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
              />
              <input
                type="text"
                value={visualSubtitle}
                onChange={(e) => setVisualSubtitle(e.target.value)}
                placeholder="Subtext / Details"
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              {gradients.map((g) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setVisualGradient(g.val)}
                  className={`h-6 flex-1 rounded-md bg-gradient-to-r ${g.val} border transition-all ${
                    visualGradient === g.val ? 'border-white ring-1 ring-white/50 scale-105' : 'border-neutral-700 opacity-60'
                  }`}
                  title={g.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tags Row */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs text-neutral-400 bg-neutral-800/60 rounded-md px-2 py-0.5"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-neutral-500 hover:text-neutral-300"
              >
                ×
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="+ tag (press enter)"
            className="w-28 bg-transparent text-xs text-neutral-400 placeholder:text-neutral-600 focus:outline-none"
          />
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
          <span className="text-[11px] text-neutral-500">
            {content.length}/500 chars
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!content.trim()}
              onClick={() => {
                sound.playClick();
                setIsAiRefinerOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 hover:bg-indigo-900/50 px-3 py-1.5 text-xs font-medium text-indigo-300 disabled:opacity-30 transition-colors"
              title="Refine and elevate pulse with AI"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Refine</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onClose();
                }}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() && activeMode === 'text'}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 transition-all hover:bg-indigo-500 disabled:opacity-40 active:scale-[0.98]"
            >
              <Send className="h-3 w-3" />
              <span>Publish</span>
            </button>
          </div>
        </div>
      </form>

      {/* AI Pulse Refiner Modal */}
      {isAiRefinerOpen && (
        <AiRefinerModal
          initialContent={content}
          onApply={(refined) => setContent(refined)}
          onClose={() => setIsAiRefinerOpen(false)}
        />
      )}
    </div>
  );
};
