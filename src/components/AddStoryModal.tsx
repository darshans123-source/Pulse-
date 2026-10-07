import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { User, StoryItem } from '../types';

interface AddStoryModalProps {
  currentUser: User;
  onClose: () => void;
  onAddStoryItem: (item: StoryItem) => void;
}

export const AddStoryModal: React.FC<AddStoryModalProps> = ({
  currentUser,
  onClose,
  onAddStoryItem,
}) => {
  const [headline, setHeadline] = useState('');
  const [subtext, setSubtext] = useState('');
  const [gradient, setGradient] = useState('from-indigo-600 via-purple-700 to-pink-600');

  const gradients = [
    { label: 'Sunset Horizon', val: 'from-amber-600 via-rose-700 to-indigo-800' },
    { label: 'Electric Indigo', val: 'from-indigo-600 via-purple-700 to-pink-600' },
    { label: 'Cyan Aurora', val: 'from-cyan-600 via-teal-700 to-emerald-800' },
    { label: 'Monolith Dark', val: 'from-stone-800 via-neutral-900 to-zinc-950' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) return;

    onAddStoryItem({
      id: `story_item_${Date.now()}`,
      gradient,
      headline: headline.trim(),
      subtext: subtext.trim() || 'Shared live moment',
      timestamp: 'Just now',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white">Create Story</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Live Preview */}
        <div
          className={`h-48 w-full rounded-2xl bg-gradient-to-br ${gradient} p-5 flex flex-col justify-end text-white shadow-inner relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />
          <div className="relative z-10 space-y-1">
            <h4 className="font-display text-base font-bold line-clamp-2">
              {headline || 'Your Headline Here'}
            </h4>
            <p className="text-xs text-neutral-200 line-clamp-2">
              {subtext || 'Brief note or observational insight'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-neutral-400">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Dawn walk across the bridge"
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400">Caption / Observation</label>
            <input
              type="text"
              value={subtext}
              onChange={(e) => setSubtext(e.target.value)}
              placeholder="e.g. Fog lifting over the bay"
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400">Palette</label>
            <div className="flex gap-2 mt-1">
              {gradients.map((g) => (
                <button
                  key={g.label}
                  type="button"
                  onClick={() => setGradient(g.val)}
                  className={`h-7 flex-1 rounded-lg bg-gradient-to-r ${g.val} border transition-transform ${
                    gradient === g.val ? 'border-white ring-2 ring-indigo-500 scale-105' : 'border-neutral-700 opacity-70'
                  }`}
                  title={g.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!headline.trim()}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
            >
              Post to Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
