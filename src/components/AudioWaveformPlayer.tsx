import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sound } from '../utils/soundEngine';

interface AudioWaveformPlayerProps {
  title: string;
  subtitle: string;
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  title,
  subtitle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(24);
  const [isMuted, setIsMuted] = useState(false);
  const duration = 142; // 2:22 total

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => (prev >= duration ? 0 : prev + 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const togglePlay = () => {
    sound.playClick();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Fixed pseudo-random waveform bar heights
  const bars = [
    30, 45, 75, 90, 60, 40, 85, 95, 100, 70, 50, 65, 80, 90, 45, 35, 60, 85,
    95, 75, 55, 65, 80, 100, 85, 65, 45, 30, 55, 75, 90, 65, 50, 40, 70, 85,
    95, 60, 45, 30,
  ];

  const progressPercent = (currentTime / duration) * 100;

  return (
    <div className="rounded-xl border border-indigo-500/30 bg-neutral-950/80 p-4 space-y-3 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all shadow-md active:scale-95 ${
              isPlaying
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-indigo-600/30'
                : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'
            }`}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current ml-0.5" />
            )}
          </button>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <span>{title}</span>
              {isPlaying && (
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </div>
            <div className="text-[11px] text-neutral-400">{subtitle}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs tabular-nums text-neutral-400">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Waveform Visualization Bars */}
      <div className="flex items-center gap-1 h-12 w-full px-1">
        {bars.map((barHeight, idx) => {
          const barPercent = (idx / bars.length) * 100;
          const isPassed = barPercent <= progressPercent;

          return (
            <div
              key={idx}
              className="flex-1 flex items-center justify-center h-full cursor-pointer group"
              onClick={() => {
                setCurrentTime(Math.round((idx / bars.length) * duration));
                sound.playClick();
              }}
            >
              <div
                className={`w-full rounded-full transition-all duration-150 ${
                  isPassed
                    ? 'bg-indigo-500 group-hover:bg-indigo-400'
                    : 'bg-neutral-800 group-hover:bg-neutral-700'
                } ${isPlaying && isPassed ? 'animate-pulse' : ''}`}
                style={{
                  height: `${isPlaying ? Math.min(100, barHeight + (idx % 3) * 10) : barHeight}%`,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
