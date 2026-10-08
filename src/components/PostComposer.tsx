import React, { useState, useMemo } from 'react';
import { 
  Image as ImageIcon, 
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
  Users,
  Video,
  MapPin,
  Eye,
  Upload,
  Layers
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
  editingPost?: Post;
  onUpdatePost?: (updatedPost: Post) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  currentUser,
  allUsers = [],
  onAddPost,
  onClose,
  isModal = false,
  editingPost,
  onUpdatePost,
}) => {
  const [content, setContent] = useState(editingPost?.content || '');
  const [selectedChannel, setSelectedChannel] = useState(editingPost?.channel || 'Design Craft');
  const [location, setLocation] = useState(editingPost?.location || '');
  const [activeMode, setActiveMode] = useState<'text' | 'image' | 'video' | 'poll' | 'code' | 'quote' | 'visual'>(
    editingPost?.media?.type === 'image'
      ? 'image'
      : editingPost?.media?.type === 'video'
      ? 'video'
      : editingPost?.poll
      ? 'poll'
      : 'text'
  );
  const [tags, setTags] = useState<string[]>(editingPost?.tags || ['DesignCraft']);
  const [tagInput, setTagInput] = useState('');
  const [enableIntentCircle, setEnableIntentCircle] = useState(true);
  const [isAiRefinerOpen, setIsAiRefinerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Photo & Video Media
  const [mediaUrl, setMediaUrl] = useState(editingPost?.media?.url || '');
  const [mediaTitle, setMediaTitle] = useState(editingPost?.media?.title || '');
  const [mediaSubtitle, setMediaSubtitle] = useState(editingPost?.media?.subtitle || '');

  // Poll state
  const [pollQuestion, setPollQuestion] = useState(editingPost?.poll?.question || '');
  const [pollOptions, setPollOptions] = useState(
    editingPost?.poll?.options.map((o) => o.text) || ['', '']
  );

  // Code state
  const [codeLanguage, setCodeLanguage] = useState(editingPost?.media?.codeSnippet?.language || 'typescript');
  const [codeContent, setCodeContent] = useState(editingPost?.media?.codeSnippet?.code || '');

  // Quote state
  const [quoteAuthor, setQuoteAuthor] = useState(editingPost?.media?.quoteAuthor || '');

  // Visual card state
  const [visualTitle, setVisualTitle] = useState(editingPost?.media?.title || '');
  const [visualSubtitle, setVisualSubtitle] = useState(editingPost?.media?.subtitle || '');
  const [visualGradient, setVisualGradient] = useState(editingPost?.media?.gradient || 'from-indigo-950 via-purple-950 to-neutral-950');

  // Compute live intent analysis dynamically
  const liveIntent: IntentAnalysis = useMemo(() => {
    return analyzePostIntent(content, allUsers, currentUser.id);
  }, [content, allUsers, currentUser.id]);

  const presetPhotos = [
    { label: 'Architecture', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Workstation', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Tokyo Night', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Ceramics', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=80' },
  ];

  const presetVideos = [
    { label: 'Typing / Code', url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-41124-large.mp4' },
    { label: 'Ocean Tide', url: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-aerial-view-of-waves-crashing-on-the-beach-41484-large.mp4' },
    { label: 'Forest Wind', url: 'https://assets.mixkit.co/videos/preview/mixkit-tree-branches-in-the-breeze-1188-large.mp4' },
  ];

  const quickLocations = ['San Francisco, CA', 'Tokyo, Japan', 'Berlin, Germany', 'London, UK', 'New York, NY'];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setMediaUrl(reader.result);
          sound.playSuccess();
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (!content.trim() && !mediaUrl) return;

    let media: PostMedia | undefined = undefined;
    let poll: Poll | undefined = undefined;

    if (activeMode === 'image' && mediaUrl) {
      media = {
        type: 'image',
        url: mediaUrl,
        title: mediaTitle || undefined,
        subtitle: mediaSubtitle || undefined,
        aspectRatio: 'landscape',
      };
    } else if (activeMode === 'video' && mediaUrl) {
      media = {
        type: 'video',
        url: mediaUrl,
        title: mediaTitle || undefined,
        subtitle: mediaSubtitle || undefined,
        aspectRatio: 'landscape',
      };
    } else if (activeMode === 'visual') {
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
        title: visualTitle || 'Selected Quote',
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

    if (editingPost && onUpdatePost) {
      onUpdatePost({
        ...editingPost,
        content: content.trim(),
        tags: tags.length ? tags : ['General'],
        channel: selectedChannel,
        location: location.trim() || undefined,
        media,
        poll: poll || editingPost.poll,
      });
    } else {
      onAddPost({
        author: currentUser,
        content: content.trim(),
        tags: tags.length ? tags : ['General'],
        channel: selectedChannel,
        location: location.trim() || undefined,
        media,
        poll,
        intent: enableIntentCircle && liveIntent.isIntentCircleActive ? liveIntent : undefined,
      });
    }

    // Reset
    setContent('');
    setActiveMode('text');
    setMediaUrl('');
    setMediaTitle('');
    setMediaSubtitle('');
    setLocation('');
    setPollOptions(['', '']);
    setPollQuestion('');
    setCodeContent('');
    if (onClose) onClose();
  };

  return (
    <div
      className={`rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 sm:p-5 backdrop-blur-md ${
        isModal ? 'shadow-2xl' : 'shadow-sm'
      }`}
    >
      {/* Header if modal */}
      {isModal && (
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800/60">
          <h3 className="font-display text-sm font-bold text-white">
            {editingPost ? 'Edit Pulse' : 'Create New Pulse'}
          </h3>
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
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="h-9 w-9 rounded-xl object-cover ring-1 ring-neutral-800"
              />
            ) : (
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr ${currentUser.avatarGradient} text-xs font-bold text-white shadow-sm`}
              >
                {currentUser.avatarInitials}
              </div>
            )}
            <div>
              <div className="text-xs font-semibold text-neutral-200">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-neutral-500">
                {currentUser.handle} · {currentUser.role}
              </div>
            </div>
          </div>

          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="Design Craft">#DesignCraft</option>
            <option value="Tech & Engineering">#Engineering</option>
            <option value="Interface Lab">#InterfaceLab</option>
            <option value="Creative Lab">#CreativeLab</option>
          </select>
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What are you building, photographing, or exploring today?"
            className="w-full resize-none rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-3.5 text-xs text-neutral-100 placeholder-neutral-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <span className="text-[10px] text-neutral-500 tabular-nums">
              {content.length} chars
            </span>
            <button
              type="button"
              onClick={() => setIsAiRefinerOpen(true)}
              className="flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2 py-1 text-[11px] text-indigo-300 hover:bg-indigo-900/40 transition-colors"
            >
              <Sparkles className="h-3 w-3 text-indigo-400" />
              <span>AI Refine</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar p-1 bg-neutral-950/50 rounded-xl border border-neutral-800/60">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveMode('text');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'text' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Text
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveMode('image');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'image' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveMode('video');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'video' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Video className="h-3.5 w-3.5" />
            <span>Video</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveMode('poll');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'poll' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Poll</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveMode('code');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'code' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            <span>Code</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveMode('quote');
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeMode === 'quote' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Quote className="h-3.5 w-3.5" />
            <span>Quote</span>
          </button>
        </div>

        {/* Image Attachment Panel */}
        {activeMode === 'image' && (
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">Photo Attachment</span>
              {mediaUrl && (
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove photo
                </button>
              )}
            </div>

            <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 bg-neutral-900/60 p-3 text-xs text-neutral-300 hover:border-indigo-500 hover:text-white cursor-pointer transition-colors">
              <Upload className="h-4 w-4 text-indigo-400" />
              <span>Upload photo from your computer</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <div className="space-y-1">
              <span className="text-[11px] text-neutral-500">Or choose curated aesthetic photo:</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {presetPhotos.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setMediaUrl(preset.url)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border shrink-0 transition-colors ${
                      mediaUrl === preset.url
                        ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {mediaUrl && (
              <div className="relative rounded-xl overflow-hidden max-h-48 border border-neutral-800">
                <img src={mediaUrl} alt="Preview" className="w-full object-cover max-h-48" />
              </div>
            )}
          </div>
        )}

        {/* Video Attachment Panel */}
        {activeMode === 'video' && (
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300">Video Attachment</span>
              {mediaUrl && (
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Remove video
                </button>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-neutral-500">Choose sample HTML5 video stream:</span>
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {presetVideos.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setMediaUrl(preset.url)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border shrink-0 transition-colors ${
                      mediaUrl === preset.url
                        ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {mediaUrl && (
              <div className="relative rounded-xl overflow-hidden max-h-48 bg-black border border-neutral-800">
                <video src={mediaUrl} controls className="w-full max-h-48 object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Poll Builder Panel */}
        {activeMode === 'poll' && (
          <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-950/60 p-3.5">
            <input
              type="text"
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              placeholder="Poll question (e.g. Best state management pattern?)"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
            {pollOptions.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-500 w-4">#{idx + 1}</span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const copy = [...pollOptions];
                    copy[idx] = e.target.value;
                    setPollOptions(copy);
                  }}
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            ))}
            {pollOptions.length < 4 && (
              <button
                type="button"
                onClick={() => setPollOptions([...pollOptions, ''])}
                className="text-xs text-indigo-400 hover:underline"
              >
                + Add another option
              </button>
            )}
          </div>
        )}

        {/* Location Tagging */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-500" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location (e.g. San Francisco, CA)"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Location Quick Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] text-neutral-500 shrink-0">Quick tag:</span>
          {quickLocations.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              className="rounded-lg border border-neutral-800 bg-neutral-950/40 px-2 py-0.5 text-[10px] text-neutral-400 hover:text-white shrink-0"
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Hashtags Row */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-950/40 px-2 py-0.5 text-[11px] font-medium text-indigo-300"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Add #tag + Enter"
              className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-2 py-0.5 text-[11px] text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Live Intent Circle toggle */}
        <div className="flex items-center justify-between rounded-xl border border-neutral-800/80 bg-neutral-950/40 p-3 text-xs">
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${liveIntent.isIntentCircleActive ? 'text-indigo-400 animate-pulse' : 'text-neutral-500'}`} />
            <div>
              <span className="font-semibold text-neutral-200">Intent Circle Matchmaking</span>
              <p className="text-[11px] text-neutral-500">
                {liveIntent.isIntentCircleActive
                  ? `Detected: ${liveIntent.category} (${liveIntent.confidence}% confidence)`
                  : 'Analyzes pulse topic to match verified domain specialists'}
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={enableIntentCircle}
            onChange={(e) => setEnableIntentCircle(e.target.checked)}
            className="h-4 w-4 rounded accent-indigo-600"
          />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>{showPreview ? 'Hide Preview' : 'Preview'}</span>
          </button>

          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={!content.trim() && !mediaUrl}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors disabled:opacity-40"
            >
              <span>{editingPost ? 'Save Edits' : 'Publish Pulse'}</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Live Preview Box */}
        {showPreview && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 space-y-3 animate-in fade-in duration-150">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
              Live Preview
            </span>
            <div className="text-xs text-neutral-200 whitespace-pre-line">
              {content || 'Your pulse content will appear here...'}
            </div>
            {location && (
              <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                <MapPin className="h-3 w-3 text-neutral-500" />
                <span>{location}</span>
              </div>
            )}
            {mediaUrl && (
              <div className="rounded-xl overflow-hidden max-h-48">
                {activeMode === 'video' ? (
                  <video src={mediaUrl} controls className="w-full max-h-48 object-cover" />
                ) : (
                  <img src={mediaUrl} alt="Preview" className="w-full max-h-48 object-cover" />
                )}
              </div>
            )}
          </div>
        )}
      </form>

      {/* AI Refiner Modal */}
      {isAiRefinerOpen && (
        <AiRefinerModal
          initialContent={content}
          onApply={(refined: string) => {
            setContent(refined);
            sound.playSuccess();
            setIsAiRefinerOpen(false);
          }}
          onClose={() => setIsAiRefinerOpen(false)}
        />
      )}
    </div>
  );
};
