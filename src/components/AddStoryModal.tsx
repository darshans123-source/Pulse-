import React, { useState } from 'react';
import { X, Sparkles, Image as ImageIcon, MapPin, Upload } from 'lucide-react';
import { User, StoryItem } from '../types';
import { sound } from '../utils/soundEngine';

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
  const [location, setLocation] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [gradient, setGradient] = useState('from-indigo-600 via-purple-700 to-pink-600');

  const gradients = [
    { label: 'Sunset', val: 'from-amber-600 via-rose-700 to-indigo-800' },
    { label: 'Indigo', val: 'from-indigo-600 via-purple-700 to-pink-600' },
    { label: 'Aurora', val: 'from-cyan-600 via-teal-700 to-emerald-800' },
    { label: 'Monolith', val: 'from-stone-800 via-neutral-900 to-zinc-950' },
  ];

  const photoPresets = [
    { label: 'Workspace', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Architecture', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Tokyo Night', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
    { label: 'Ceramics', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80' },
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim() && !mediaUrl) return;

    sound.playSuccess();
    onAddStoryItem({
      id: `story_item_${Date.now()}`,
      mediaType: mediaUrl ? 'image' : 'gradient',
      mediaUrl: mediaUrl || undefined,
      gradient,
      headline: headline.trim() || 'Live Story',
      subtext: subtext.trim() || 'Shared live moment',
      location: location.trim() || undefined,
      timestamp: 'Just now',
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold text-white">Add to Story</h3>
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
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt="Story preview"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
          <div className="relative z-10 space-y-1">
            {location && (
              <div className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                <MapPin className="h-2.5 w-2.5 text-indigo-400" />
                <span>{location}</span>
              </div>
            )}
            <h4 className="font-display text-base font-bold line-clamp-2 drop-shadow">
              {headline || 'Your Headline Here'}
            </h4>
            <p className="text-xs text-neutral-200 line-clamp-2 drop-shadow">
              {subtext || 'Brief note or observational insight'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Photo upload / presets */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-neutral-400 mb-1">
              <span>Photo (Optional)</span>
              {mediaUrl && (
                <button
                  type="button"
                  onClick={() => setMediaUrl('')}
                  className="text-rose-400 hover:underline text-[10px]"
                >
                  Clear photo
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-neutral-700 bg-neutral-950 p-2 text-xs text-neutral-300 hover:border-indigo-500 hover:text-white cursor-pointer transition-colors">
                <Upload className="h-3.5 w-3.5 text-indigo-400" />
                <span>Upload from device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Presets */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
              {photoPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setMediaUrl(preset.url)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium border transition-colors shrink-0 ${
                    mediaUrl === preset.url
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-400">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Dawn walk across the bridge"
              className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-neutral-400">Caption</label>
              <input
                type="text"
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                placeholder="Brief note"
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-neutral-400">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco"
                className="mt-1 w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {!mediaUrl && (
            <div>
              <label className="text-xs font-medium text-neutral-400">Gradient Palette</label>
              <div className="mt-1.5 flex gap-2">
                {gradients.map((g) => (
                  <button
                    key={g.label}
                    type="button"
                    onClick={() => setGradient(g.val)}
                    className={`h-7 flex-1 rounded-xl bg-gradient-to-tr ${g.val} transition-transform ${
                      gradient === g.val ? 'ring-2 ring-white scale-105' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={g.label}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
            >
              Share to Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
