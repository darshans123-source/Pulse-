import React, { useState, useEffect } from 'react';
import { BarChart3, List, Check, Trophy, Sparkles } from 'lucide-react';
import { Poll, PollOption } from '../types';

interface PollViewProps {
  postId: string;
  poll: Poll;
  onVote: (postId: string, optionId: string) => void;
}

export const PollView: React.FC<PollViewProps> = ({
  postId,
  poll,
  onVote,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'chart'>('list');
  const [justVotedOptionId, setJustVotedOptionId] = useState<string | null>(null);

  const hasVoted = Boolean(poll.userVotedOptionId);
  const totalVotes = Math.max(1, poll.totalVotes);

  // Find leading option
  const maxVotes = Math.max(...poll.options.map((o) => o.votes));
  const leadingOptionId = maxVotes > 0 ? poll.options.find((o) => o.votes === maxVotes)?.id : null;

  const handleSelectOption = (optionId: string) => {
    if (hasVoted) return;
    setJustVotedOptionId(optionId);
    onVote(postId, optionId);
    // Automatically switch or emphasize chart after voting
    setTimeout(() => {
      setJustVotedOptionId(null);
    }, 1800);
  };

  const chartPalette = [
    { bg: 'from-indigo-500 to-indigo-600', ring: 'ring-indigo-500/40', text: 'text-indigo-400' },
    { bg: 'from-violet-500 to-purple-600', ring: 'ring-purple-500/40', text: 'text-purple-400' },
    { bg: 'from-cyan-500 to-teal-600', ring: 'ring-cyan-500/40', text: 'text-cyan-400' },
    { bg: 'from-amber-500 to-orange-600', ring: 'ring-amber-500/40', text: 'text-amber-400' },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950/70 p-4 space-y-3.5 shadow-sm">
      {/* Poll Header & View Switcher */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <span>Community Poll</span>
            {hasVoted && (
              <span className="text-emerald-400 font-medium">· Vote submitted</span>
            )}
          </span>
          <h4 className="text-sm font-semibold text-neutral-200 mt-0.5 leading-snug">
            {poll.question}
          </h4>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-neutral-900/90 p-1 border border-neutral-800/80 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            title="List voting view"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <List className="h-3 w-3" />
            <span className="hidden sm:inline">Options</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            title="Distribution bar chart view"
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              viewMode === 'chart'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="h-3 w-3" />
            <span className="hidden sm:inline">Chart</span>
          </button>
        </div>
      </div>

      {/* Just voted flash indicator */}
      {justVotedOptionId && (
        <div className="flex items-center gap-2 rounded-xl bg-indigo-950/60 border border-indigo-500/40 px-3 py-1.5 text-xs text-indigo-300 animate-in fade-in zoom-in-95 duration-200">
          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
          <span>Real-time feedback: Vote recorded! Calculating live distribution...</span>
        </div>
      )}

      {/* View Mode 1: List Options with Animated Horizontal Progress */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {poll.options.map((opt, idx) => {
            const isSelected = poll.userVotedOptionId === opt.id;
            const percentage = Math.round((opt.votes / totalVotes) * 100);
            const isLeading = opt.id === leadingOptionId && poll.totalVotes > 0;
            const color = chartPalette[idx % chartPalette.length];

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt.id)}
                disabled={hasVoted}
                className={`group relative w-full overflow-hidden rounded-xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-950/30 ring-1 ring-indigo-500/50'
                    : hasVoted
                    ? 'border-neutral-800/80 bg-neutral-900/30'
                    : 'border-neutral-800/80 hover:border-neutral-700 bg-neutral-900/40 hover:bg-neutral-850 active:scale-[0.99]'
                }`}
              >
                {/* Real-time Animated Bar Progress */}
                {hasVoted && (
                  <div
                    className={`absolute inset-0 transition-all duration-700 ease-out ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-600/25 to-indigo-500/20'
                        : isLeading
                        ? 'bg-neutral-800/60'
                        : 'bg-neutral-800/30'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                )}

                {/* Content Overlay */}
                <div className="relative z-10 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelected && (
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </div>
                    )}
                    <span
                      className={`font-medium truncate ${
                        isSelected
                          ? 'text-indigo-200 font-semibold'
                          : isLeading && hasVoted
                          ? 'text-white'
                          : 'text-neutral-300'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {hasVoted && isLeading && (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                        <Trophy className="h-3 w-3" />
                        <span>Leading</span>
                      </span>
                    )}

                    {hasVoted ? (
                      <div className="flex items-center gap-1.5 font-mono tabular-nums">
                        <span className="text-[11px] text-neutral-400">
                          {opt.votes}
                        </span>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-400' : 'text-neutral-200'}`}>
                          {percentage}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-neutral-500 group-hover:text-indigo-400 transition-colors">
                        Vote
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* View Mode 2: Animated Vertical Bar Chart Visualization */}
      {viewMode === 'chart' && (
        <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-4 space-y-4">
          {/* Chart Visual Surface */}
          <div className="h-48 w-full flex items-end justify-around gap-2 sm:gap-4 pt-6 pb-2 border-b border-neutral-800/80 relative">
            {/* Grid baseline lines */}
            <div className="absolute inset-x-0 top-0 border-b border-neutral-800/30 text-[9px] text-neutral-600 tabular-nums">
              100%
            </div>
            <div className="absolute inset-x-0 top-1/2 border-b border-neutral-800/30 text-[9px] text-neutral-600 tabular-nums">
              50%
            </div>

            {poll.options.map((opt, idx) => {
              const isSelected = poll.userVotedOptionId === opt.id;
              const percentage = Math.round((opt.votes / totalVotes) * 100);
              const isLeading = opt.id === leadingOptionId && poll.totalVotes > 0;
              const color = chartPalette[idx % chartPalette.length];

              // Height calculated with a minimum visible 6% floor for clarity
              const barHeightPercent = Math.max(8, percentage);

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex-1 flex flex-col items-center justify-end h-full group cursor-pointer ${
                    !hasVoted ? 'hover:opacity-90' : ''
                  }`}
                  title={`${opt.text}: ${opt.votes} votes (${percentage}%)`}
                >
                  {/* Percentage & Vote counter floating above bar */}
                  <div className="mb-1 text-center flex flex-col items-center">
                    {isLeading && (
                      <Trophy className="h-3 w-3 text-amber-400 mb-0.5 animate-bounce" />
                    )}
                    <span className="font-mono text-[11px] font-bold tabular-nums text-neutral-200">
                      {percentage}%
                    </span>
                    <span className="text-[9px] text-neutral-500 tabular-nums">
                      {opt.votes}v
                    </span>
                  </div>

                  {/* Animated Column Bar */}
                  <div className="w-full max-w-[56px] relative flex flex-col justify-end h-full">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ease-out relative ${
                        isSelected
                          ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-600/30'
                          : isLeading
                          ? 'bg-gradient-to-t from-neutral-700 to-neutral-500'
                          : 'bg-neutral-800 hover:bg-neutral-700'
                      }`}
                      style={{ height: `${barHeightPercent}%` }}
                    >
                      {/* Highlight shimmer on user selection */}
                      {isSelected && (
                        <div className="absolute top-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-white shadow" />
                      )}
                    </div>
                  </div>

                  {/* Option Tag index */}
                  <div className="mt-2 text-center">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                        isSelected
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                          : 'text-neutral-400 bg-neutral-900 border border-neutral-800'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bar Chart Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
            {poll.options.map((opt, idx) => {
              const isSelected = poll.userVotedOptionId === opt.id;
              const isLeading = opt.id === leadingOptionId && poll.totalVotes > 0;
              const percentage = Math.round((opt.votes / totalVotes) * 100);

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500/60 bg-indigo-950/30 text-indigo-200'
                      : 'border-neutral-800/60 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-[10px] font-bold text-neutral-500">
                      #{idx + 1}
                    </span>
                    <span className="truncate text-xs font-medium">{opt.text}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono tabular-nums text-xs font-semibold shrink-0">
                    {isSelected && <Check className="h-3 w-3 text-indigo-400" />}
                    <span>{percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info: Total Votes & Dynamic Switch helper */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1 border-t border-neutral-800/40">
        <div className="flex items-center gap-1.5">
          <span className="tabular-nums font-semibold text-neutral-300">{poll.totalVotes}</span>
          <span>total votes</span>
          {hasVoted && <span>· Updated real-time</span>}
        </div>

        <button
          type="button"
          onClick={() => setViewMode(viewMode === 'list' ? 'chart' : 'list')}
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          {viewMode === 'list' ? 'Switch to Bar Chart View →' : 'Switch to Option Cards →'}
        </button>
      </div>
    </div>
  );
};
