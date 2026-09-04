import React, { useState, useEffect, memo, useCallback } from 'react';
import { Tv } from 'lucide-react';
import { indexedDBCache } from '../utils/indexedDBCache';

interface ChannelLogoProps {
  logo?: string;
  name: string;
  className?: string;
  imgClassName?: string;
}

// In-memory instant lookup set for broken/failed URLs to avoid re-triggering requests
const memoryBrokenLogos = new Set<string>();

/**
 * Generate a consistent harmonic color gradient based on channel name hash
 */
function getChannelBadgeColors(name: string): { bg: string; text: string; border: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }

  const palettes = [
    { bg: 'from-blue-900/60 to-indigo-950/80', text: 'text-sky-300', border: 'border-blue-700/50' },
    { bg: 'from-emerald-900/60 to-teal-950/80', text: 'text-emerald-300', border: 'border-emerald-700/50' },
    { bg: 'from-amber-900/60 to-orange-950/80', text: 'text-amber-300', border: 'border-amber-700/50' },
    { bg: 'from-purple-900/60 to-slate-950/80', text: 'text-purple-300', border: 'border-purple-700/50' },
    { bg: 'from-rose-900/60 to-pink-950/80', text: 'text-rose-300', border: 'border-rose-700/50' },
    { bg: 'from-cyan-900/60 to-blue-950/80', text: 'text-cyan-300', border: 'border-cyan-700/50' },
  ];

  const idx = Math.abs(hash) % palettes.length;
  return palettes[idx];
}

/**
 * Clean short acronym for fallback badge (e.g. "VTV1 HD" -> "VTV1", "VTV5 HD - Tây Nam Bộ" -> "VTV5 TNB")
 */
function getBadgeText(channelName: string): string {
  const clean = channelName
    .replace(/HD|SD|360|TH|ONLINE|LIVE/gi, '')
    .replace(/[-_]/g, ' ')
    .trim();

  if (clean.length > 7) {
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      const first = parts[0];
      const rest = parts.slice(1).map(p => p[0]).join('');
      return (first + ' ' + rest).toUpperCase().slice(0, 7);
    }
  }
  return clean.slice(0, 7).toUpperCase();
}

export const ChannelLogo: React.FC<ChannelLogoProps> = memo(({
  logo,
  name,
  className = "w-12 h-10",
  imgClassName = "max-w-full max-h-full object-contain"
}) => {
  const [isBroken, setIsBroken] = useState<boolean>(() => {
    if (!logo || logo.trim().length === 0) return true;
    if (memoryBrokenLogos.has(logo)) return true;
    const dbStatus = indexedDBCache.getLogoStatusSync(logo);
    return dbStatus === 'broken';
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!logo || logo.trim().length === 0) {
      setIsBroken(true);
      return;
    }

    if (memoryBrokenLogos.has(logo)) {
      setIsBroken(true);
      return;
    }

    const dbStatus = indexedDBCache.getLogoStatusSync(logo);
    if (dbStatus === 'broken') {
      setIsBroken(true);
    } else {
      setIsBroken(false);
    }
  }, [logo]);

  const handleImgError = useCallback(() => {
    if (logo) {
      memoryBrokenLogos.add(logo);
      indexedDBCache.setLogoStatus(logo, 'broken');
    }
    setIsBroken(true);
  }, [logo]);

  const handleImgLoad = useCallback(() => {
    setIsLoaded(true);
    if (logo) {
      indexedDBCache.setLogoStatus(logo, 'valid');
    }
  }, [logo]);

  const colors = getChannelBadgeColors(name);
  const badgeText = getBadgeText(name);

  // Fallback badge
  if (!logo || isBroken) {
    return (
      <div
        className={`${className} rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} flex flex-col items-center justify-center p-0.5 shadow-sm shrink-0 select-none overflow-hidden`}
        title={name}
      >
        <Tv className={`w-3.5 h-3.5 ${colors.text} opacity-80 shrink-0 mb-0.5`} />
        <span className={`text-[9px] font-black tracking-tight leading-none text-center truncate max-w-full px-0.5 ${colors.text}`}>
          {badgeText}
        </span>
      </div>
    );
  }

  return (
    <div className={`${className} relative rounded-xl bg-[#080e1e] border border-slate-800/60 p-1 flex items-center justify-center overflow-hidden shrink-0`}>
      {/* Placeholder skeleton while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-900/60 animate-pulse flex items-center justify-center">
          <span className="text-[8px] font-bold text-slate-500">{badgeText}</span>
        </div>
      )}
      <img
        src={logo}
        alt={name}
        className={`${imgClassName} transition-opacity duration-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={handleImgLoad}
        onError={handleImgError}
      />
    </div>
  );
});

ChannelLogo.displayName = 'ChannelLogo';
