import { Channel } from '../types';
import { ALL_CHANNELS } from '../data/channels';
import { removeVietnameseAccents } from './voiceMatcher';

/**
 * Robustly resolves a channel from any identifier string, number, slug, or URI.
 * Examples handled:
 * - "vtv1", "vtv1-hd", "vtv 1", "VTV1 HD", "vtv1hd"
 * - "1", 1, "kenh 1", "kênh 1", "kenh-1"
 * - "vtv2", "vtv3", "vtv4", "vtv5", "vtv6", "vtv7", "vtv8", "vtv9"
 * - "htv7", "htv9", "thvl1", "sctv18", "zingradio 1", etc.
 */
export function resolveChannelFromQuery(
  rawQuery: string | number | null | undefined,
  channels: Channel[] = ALL_CHANNELS
): Channel | null {
  if (rawQuery === null || rawQuery === undefined) return null;

  const rawStr = String(rawQuery).trim();
  if (!rawStr) return null;

  const norm = removeVietnameseAccents(rawStr).toLowerCase();

  // 1. Direct channel number check (e.g., 1, "1", "01", "kenh 1", "kênh 2", "channel 3")
  const numMatch = norm.match(/\b(\d+)\b/);
  if (numMatch) {
    const parsedNum = parseInt(numMatch[1], 10);
    // If the input is purely a number or starts with "kenh / channel / k" followed by number
    const isPureNumber = /^\d+$/.test(norm);
    const isKenhNumber = /^(kenh|channel|k|c|so|tap|kênh)\s*[-_]?\s*\d+$/i.test(norm);

    if (isPureNumber || isKenhNumber) {
      const matchByNumber = channels.find((c) => c.number === parsedNum);
      if (matchByNumber) return matchByNumber;
    }
  }

  // 2. Exact match by channel id (case-insensitive)
  const exactIdMatch = channels.find(
    (c) => c.id.toLowerCase() === norm || c.id.toLowerCase() === norm.replace(/\s+/g, '-')
  );
  if (exactIdMatch) return exactIdMatch;

  // 3. Compact string match (e.g., "vtv1hd" -> "vtv1-hd", "vtv1" -> "vtv1-hd")
  const cleanAlphaNum = norm.replace(/[^a-z0-9]/g, '');

  const compactIdMatch = channels.find((c) => {
    const cCleanId = c.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cCleanName = removeVietnameseAccents(c.name).replace(/[^a-z0-9]/g, '');
    return cCleanId === cleanAlphaNum || cCleanName === cleanAlphaNum;
  });
  if (compactIdMatch) return compactIdMatch;

  // 4. Handle common standard prefixes like "vtv1" -> "vtv1-hd", "vtv2" -> "vtv2-hd", "vtv3" -> "vtv3-hd"
  const prefixMatch = channels.find((c) => {
    const cCleanId = c.id.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cCleanName = removeVietnameseAccents(c.name).replace(/[^a-z0-9]/g, '');
    return (
      cCleanId.startsWith(cleanAlphaNum) ||
      cleanAlphaNum.startsWith(cCleanId) ||
      cCleanName.startsWith(cleanAlphaNum)
    );
  });
  if (prefixMatch) return prefixMatch;

  // 5. Check alias map for common TV home screen names
  const aliasMap: Record<string, string> = {
    vtv1: 'vtv1-hd',
    vtv2: 'vtv2-hd',
    vtv3: 'vtv3-hd',
    vtv4: 'vtv4-hd',
    vtv5: 'vtv5-hd',
    vtv6: 'vtv6-hd',
    vtv7: 'vtv7-hd',
    vtv8: 'vtv8-hd',
    vtv9: 'vtv9-hd',
    htv1: 'htv1',
    htv2: 'htv2',
    htv3: 'htv3',
    htvkey: 'htvkey',
    htvkeyhd: 'htvkey',
    hitv: 'hitv',
    youtv: 'youtv',
    anhhung: 'phim-anh-hung',
    quynhaptrang2: 'phim-quy-nhap-trang-2',
    htv7: 'htv7-hd',
    htv9: 'htv9-hd',
    thvl1: 'thvl1',
    thvl2: 'thvl2',
    thvl3: 'thvl3',
    thvl4: 'thvl4',
    sctv2: 'sctv2',
    sctv2hd: 'sctv2',
    todaytv: 'sctv2',
    sctv2todaytv: 'sctv2',
    sctv7: 'sctv7',
    sctv7hd: 'sctv7',
    sctv11: 'sctv11',
    sctv11hd: 'sctv11',
    sctv15: 'sctv15hd',
    sctv15hd: 'sctv15hd',
    sctv16: 'sctv16',
    sctv16hd: 'sctv16',
    sctv17: 'sctv17hd',
    sctv17hd: 'sctv17hd',
    sctv19: 'sctv19',
    sctv19hd: 'sctv19',
  };

  for (const [aliasKey, targetId] of Object.entries(aliasMap)) {
    if (cleanAlphaNum === aliasKey || norm.includes(aliasKey)) {
      const match = channels.find((c) => c.id === targetId);
      if (match) return match;
    }
  }

  // 6. Fuzzy substring match on channel name or id
  const fuzzyMatch = channels.find((c) => {
    const cNormName = removeVietnameseAccents(c.name).toLowerCase();
    const cNormId = c.id.toLowerCase();
    return cNormName.includes(norm) || norm.includes(cNormName) || cNormId.includes(norm);
  });
  if (fuzzyMatch) return fuzzyMatch;

  return null;
}

/**
 * Detects channel parameter from current browser/Android TV environment URL, hash, or params.
 */
export function detectChannelFromLocation(channels: Channel[] = ALL_CHANNELS): Channel | null {
  if (typeof window === 'undefined') return null;

  try {
    const url = new URL(window.location.href);

    // List of query parameter keys commonly sent by Android TV Leanback Launchers, WebViews, or deep links
    const queryKeys = [
      'channel',
      'channelId',
      'channel_id',
      'id',
      'c',
      'ch',
      'k',
      'kenh',
      'kênh',
      'num',
      'number',
      'tvg_id',
      'tvg-id',
      'tvgId',
      'name',
      'title',
      'play',
      'open',
      'select',
      'stream',
      'q',
      'programId',
      'program_id',
    ];

    for (const key of queryKeys) {
      const val = url.searchParams.get(key);
      if (val) {
        const found = resolveChannelFromQuery(val, channels);
        if (found) return found;
      }
    }

    // Check standalone boolean query params (e.g. ?vtv1, ?vtv2, ?vtv3, ?1)
    for (const paramKey of url.searchParams.keys()) {
      if (paramKey && !url.searchParams.get(paramKey)) {
        const found = resolveChannelFromQuery(paramKey, channels);
        if (found) return found;
      }
    }

    // Check URL hash (e.g. #vtv1, #/vtv1, #1, #channel=vtv1, #/channel/vtv1)
    const hash = window.location.hash.replace(/^#\/?/, '').trim();
    if (hash) {
      if (hash.includes('=')) {
        const hashParams = new URLSearchParams(hash);
        for (const key of queryKeys) {
          const val = hashParams.get(key);
          if (val) {
            const found = resolveChannelFromQuery(val, channels);
            if (found) return found;
          }
        }
      } else {
        const cleanHash = hash.replace(/^channel\//, '').replace(/^kenh\//, '');
        const found = resolveChannelFromQuery(cleanHash, channels);
        if (found) return found;
      }
    }

    // Check URL pathname (e.g. /vtv1, /vtv2, /1, /channel/vtv1, /kenh/vtv1)
    const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').trim();
    if (pathname && pathname !== 'index.html') {
      const cleanPath = pathname.replace(/^channel\//, '').replace(/^kenh\//, '');
      const found = resolveChannelFromQuery(cleanPath, channels);
      if (found) return found;
    }
  } catch (err) {
    console.warn('Error detecting channel from URL location:', err);
  }

  // Check global / localStorage launcher variables
  try {
    const launchStorage =
      sessionStorage.getItem('ht_tv_launch_channel') ||
      localStorage.getItem('ht_tv_launch_channel');
    if (launchStorage) {
      sessionStorage.removeItem('ht_tv_launch_channel');
      const found = resolveChannelFromQuery(launchStorage, channels);
      if (found) return found;
    }

    const win = window as any;
    if (win.initialChannel || win.initialChannelId || win.AndroidChannel) {
      const initVal = win.initialChannel || win.initialChannelId || win.AndroidChannel;
      const found = resolveChannelFromQuery(initVal, channels);
      if (found) return found;
    }
  } catch {
    // Ignore storage errors
  }

  return null;
}
