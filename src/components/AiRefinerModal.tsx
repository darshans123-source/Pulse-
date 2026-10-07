import React, { useState } from 'react';
import { Sparkles, X, Check, ArrowRight, RefreshCw, Cpu } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface AiRefinerModalProps {
  initialContent: string;
  onApply: (refinedText: string) => void;
  onClose: () => void;
}

export const AiRefinerModal: React.FC<AiRefinerModalProps> = ({
  initialContent,
  onApply,
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<'clarity' | 'technical' | 'concise' | 'framing'>('technical');
  const [refinedText, setRefinedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const modes = [
    {
      id: 'technical',
      label: 'Technical Precision',
      desc: 'Injects domain terminology, architecture nuance & systemic trade-offs',
    },
    {
      id: 'framing',
      label: 'Expert Engagement Framing',
      desc: 'Reframes questions so staff/principal engineers are drawn to answer',
    },
    {
      id: 'clarity',
      label: 'Executive Clarity',
      desc: 'Eliminates filler words and refines measure & typographic cadence',
    },
    {
      id: 'concise',
      label: 'Distill Core Thesis',
      desc: 'Condenses thoughts into a punchy, memorable 2-sentence thesis',
    },
  ];

  const handleGenerate = async (mode = selectedMode) => {
    setIsLoading(true);
    sound.playAiPing();

    try {
      const res = await fetch('/api/enhance-pulse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: initialContent, mode }),
      });

      if (res.ok) {
        const data = await res.json();
        setRefinedText(data.enhancedText || initialContent);
      } else {
        // Fallback local transformation
        applyLocalFallback(mode);
      }
    } catch {
      applyLocalFallback(mode);
    } finally {
      setIsLoading(false);
      setHasGenerated(true);
    }
  };

  const applyLocalFallback = (mode: string) => {
    let result = initialContent.trim();
    if (mode === 'technical') {
      result = `${result}\n\nKey constraint: Evaluating latency throughput and concurrent locking under 10k ops/sec.`;
    } else if (mode === 'framing') {
      result = `Architectural question for systems engineers: ${result}\n\nWhat are the primary operational failure modes to anticipate?`;
    } else if (mode === 'concise') {
      result = result.split('.')[0] + '.';
    } else {
      result = result.replace(/I think that |Basically, |Just wondering if /gi, '');
    }
    setRefinedText(result);
  };

  // Run on initial open
  React.useEffect(() => {
    if (initialContent) {
      handleGenerate('technical');
    }
  }, []);

  const handleApply = () => {
    sound.playSuccess();
    onApply(refinedText || initialContent);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-indigo-500/40 bg-neutral-900 shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
                <span>AI Craft Refiner</span>
                <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800/60">
                  gemini-3.8-flash
                </span>
              </h3>
              <p className="text-xs text-neutral-400">
                Sharpen technical depth and engagement framing before publishing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Refinement Lens Selectors */}
        <div className="grid grid-cols-2 gap-2">
          {modes.map((m) => {
            const isSelected = selectedMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedMode(m.id as any);
                  handleGenerate(m.id as any);
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/40 text-white ring-1 ring-indigo-500/50'
                    : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700'
                }`}
              >
                <div className="text-xs font-semibold">{m.label}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
                  {m.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Live Diff Preview */}
        <div className="space-y-3">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
              <span>Original Draft</span>
              <span>{initialContent.length} chars</span>
            </div>
            <p className="text-xs text-neutral-400 line-clamp-2 italic">
              "{initialContent}"
            </p>
          </div>

          <div className="rounded-xl border border-indigo-500/30 bg-neutral-950 p-4 space-y-2 relative">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-indigo-400 flex items-center gap-1.5">
                <Cpu className="h-3.5 w-3.5" />
                <span>AI Refined Output</span>
              </span>
              {isLoading && (
                <span className="text-[10px] text-indigo-300 animate-pulse flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>Synthesizing...</span>
                </span>
              )}
            </div>

            <textarea
              value={refinedText}
              onChange={(e) => setRefinedText(e.target.value)}
              rows={4}
              placeholder="Refining pulse..."
              className="w-full resize-none bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
          <button
            type="button"
            onClick={() => handleGenerate()}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Regenerate lens</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              disabled={isLoading || !refinedText.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-40 transition-all active:scale-[0.98]"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Apply to Composer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
