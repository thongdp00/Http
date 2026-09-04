import React, { useEffect, useState } from 'react';
import { Music2, Disc3, Radio, Sparkles } from 'lucide-react';
import { Channel } from '../types';

interface AudioVisualizerProps {
  channel: Channel;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ channel }) => {
  const [bars, setBars] = useState<number[]>(Array(32).fill(20));

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(Array.from({ length: 32 }, () => Math.floor(Math.random() * 85) + 15));
    }, 120);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-purple-950/70 to-slate-950 p-6 overflow-hidden select-none">
      {/* Background ambient glowing spheres */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl animate-pulse" />

      {/* Main Container */}
      <div className="relative z-20 flex flex-col items-center max-w-xl text-center space-y-6">
        {/* Animated Vinyl Disc with Logo */}
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-1000 animate-spin-slow" />
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-slate-900 border-4 border-slate-800/80 shadow-2xl flex items-center justify-center p-3 animate-spin-slow">
            {/* Vinyl record grooves effect */}
            <div className="absolute inset-2 rounded-full border border-slate-700/30" />
            <div className="absolute inset-6 rounded-full border border-slate-700/20" />
            <div className="absolute inset-10 rounded-full border border-slate-700/20" />
            
            {/* Channel Logo Center */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-amber-400/40 shadow-inner bg-slate-950 flex items-center justify-center">
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <Radio className="w-10 h-10 text-purple-400" />
            </div>

            {/* Vinyl spindle hole */}
            <div className="absolute w-4 h-4 bg-slate-950 rounded-full border border-slate-700 shadow-inner" />
          </div>
        </div>

        {/* Title & Info */}
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wider uppercase">
            <Radio className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
            <span>Phát Radio Live • ZingRadio</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-wide drop-shadow-md">
            {channel.name}
          </h2>
        </div>

        {/* Audio Equalizer Frequency Bars */}
        <div className="flex items-end justify-center space-x-1.5 sm:space-x-2 h-24 w-full max-w-md pt-4">
          {bars.map((height, i) => (
            <div
              key={i}
              style={{ height: `${height}%` }}
              className="w-2 sm:w-2.5 bg-gradient-to-t from-purple-600 via-pink-500 to-amber-300 rounded-t-sm transition-all duration-150 ease-out shadow-sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
