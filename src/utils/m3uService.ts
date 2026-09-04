import { Channel, CategoryId, StreamSource, DRMConfig } from '../types';
import { streamCache } from './streamCache';
import { checkStreamTokenExpiry } from './tokenValidator';

export const BACKUP_M3U_URL = 'https://raw.githubusercontent.com/thongdp00/m3u/refs/heads/main/ht-tv.m3u';
const M3U_STORAGE_KEY = 'ht_tv_m3u_backup_data_v4';
const M3U_SYNC_TIMESTAMP_KEY = 'ht_tv_m3u_last_sync_v4';
const SYNC_INTERVAL_MS = 1000 * 60 * 30; // 30 minutes

export interface ParsedM3UEntry {
  id: string;
  name: string;
  group?: string;
  logo?: string;
  url: string;
  userAgent?: string;
  manifestType?: string;
  licenseKey?: string;
}

const BLOCKED_URL_PATTERNS = [
  'livevlisctcdnw.seenow.vn/livesnv2/ONSPORT1/manifest.mpd',
  'ONSPORT1/manifest.mpd',
  'key.php?id=a7c942778e874d43be92b8d0a0cd11b4:6d54358306571658ffdb952c6560688b',
  'ch-66',
  'localhost',
  '127.0.0.1'
];

/**
 * Validates whether a stream source URL or DRM configuration is faulty, dead, expired, or blocked.
 */
export function isBlockedSource(url?: string, licenseKey?: string, skipFaultyCheck = false): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return true;

  for (const pattern of BLOCKED_URL_PATTERNS) {
    if (trimmed.includes(pattern)) return true;
  }

  if (licenseKey) {
    if (licenseKey.includes('a7c942778e874d43be92b8d0a0cd11b4:6d54358306571658ffdb952c6560688b')) {
      return true;
    }
  }

  // Check if temporary security token in URL has expired
  const tokenCheck = checkStreamTokenExpiry(trimmed);
  if (tokenCheck.isExpired) {
    return true;
  }

  if (!skipFaultyCheck && streamCache.isSourceFaulty(trimmed)) {
    return true;
  }

  return false;
}

/**
 * Normalizes a channel name string for fuzzy matching (strips accents, spaces, special chars)
 */
export function normalizeChannelName(name: string): string {
  return (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Parses raw ClearKey or Widevine license string from M3U #KODIPROP
 */
export function parseDrmConfig(licenseKey?: string, manifestType?: string): DRMConfig | undefined {
  if (!licenseKey) {
    if (manifestType === 'mpd') {
      return undefined;
    }
    return undefined;
  }

  const trimmed = licenseKey.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'clearkey',
      licenseUrl: trimmed
    };
  }

  if (trimmed.includes(':')) {
    const parts = trimmed.split(':');
    if (parts.length >= 2) {
      const kid = parts[0].trim();
      const k = parts[1].trim();
      return {
        type: 'clearkey',
        keys: { [kid]: k }
      };
    }
  }

  return undefined;
}

/**
 * Maps M3U group-title to app CategoryId
 */
export function mapGroupToCategory(group?: string): { category: CategoryId; categoryName: string } {
  const g = (group || '').trim().toLowerCase();

  if (
    g.includes('thể thao quốc tế') ||
    g.includes('the thao quoc te') ||
    g.includes('thể thao') ||
    g.includes('the thao') ||
    g.includes('sport') ||
    g.includes('esportes') ||
    g.includes('epl') ||
    g.includes('bein') ||
    g.includes('eleven')
  ) {
    return { category: 'thethaoquocte', categoryName: 'Thể thao quốc tế' };
  }
  if (
    g.includes('sự kiện') ||
    g.includes('su kien') ||
    g.includes('sukien') ||
    g.includes('event') ||
    g.includes('tv360+') ||
    g.includes('tv360 +') ||
    g.includes('trực tiếp') ||
    g.includes('truc tiep')
  ) {
    return { category: 'sukien', categoryName: 'Sự Kiện' };
  }
  if (g.includes('vtv') && !g.includes('cab')) {
    return { category: 'vtv', categoryName: 'VTV' };
  }
  if (g.includes('vtvcab') || g.includes('vtv cab') || g.includes('on ')) {
    return { category: 'vtvcab', categoryName: 'VTVcab' };
  }
  if (g.includes('htv')) {
    return { category: 'htv', categoryName: 'HTV' };
  }
  if (g.includes('sctv')) {
    return { category: 'sctv', categoryName: 'SCTV' };
  }
  if (g.includes('địa phương') || g.includes('dia phuong') || g.includes('tỉnh')) {
    return { category: 'diaphuong', categoryName: 'Địa Phương' };
  }
  if (
    g.includes('quốc tế') ||
    g.includes('quoc te') ||
    g.includes('international') ||
    g.includes('foreign') ||
    g.includes('hoạt hình') ||
    g.includes('thiếu nhi') ||
    g.includes('kids') ||
    g.includes('cartoon') ||
    g.includes('anime')
  ) {
    return { category: 'quocte', categoryName: 'Quốc Tế' };
  }
  if (g.includes('phim') || g.includes('cinema') || g.includes('movie')) {
    return { category: 'phim', categoryName: 'Phim truyện' };
  }
  if (g.includes('nhạc') || g.includes('music') || g.includes('audio')) {
    return { category: 'nghenhac', categoryName: 'Nghe nhạc' };
  }

  return { category: 'diaphuong', categoryName: 'Địa Phương' };
}

/**
 * Parses raw text from M3U playlist format
 */
export function parseM3U(m3uText: string): ParsedM3UEntry[] {
  const lines = m3uText.split(/\r?\n/);
  const channels: ParsedM3UEntry[] = [];
  let cur: Partial<ParsedM3UEntry> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      cur = {};
      const idMatch = line.match(/tvg-id="([^"]+)"/i);
      const nameMatch = line.match(/,\s*([^,]+)$/);
      const groupMatch = line.match(/group-title="([^"]+)"/i);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/i);

      if (idMatch) cur.id = idMatch[1].trim();
      if (nameMatch) cur.name = nameMatch[1].trim();
      if (groupMatch) cur.group = groupMatch[1].trim();
      if (logoMatch) cur.logo = logoMatch[1].trim();
    } else if (line.startsWith('#KODIPROP:inputstream.adaptive.license_key=')) {
      cur.licenseKey = line.split('license_key=')[1].trim();
    } else if (line.startsWith('#KODIPROP:inputstream.adaptive.manifest_type=')) {
      cur.manifestType = line.split('manifest_type=')[1].trim();
    } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
      cur.userAgent = line.split('http-user-agent=')[1].trim();
    } else if (line.startsWith('http://') || line.startsWith('https://')) {
      cur.url = line;
      if (isBlockedSource(cur.url, cur.licenseKey, true)) {
        cur = {};
        continue;
      }
      if (!cur.id) {
        cur.id = (cur.name || 'ch-' + (channels.length + 1)).toLowerCase().replace(/[^a-z0-9]/g, '-');
      }
      if (!cur.name) {
        cur.name = cur.id;
      }

      // Đổi tên Kênh 178 thành Sky Sport EPL
      if (
        channels.length + 1 === 178 ||
        cur.name.toLowerCase().includes('kênh 178') ||
        cur.name.toLowerCase().includes('kenh 178') ||
        cur.name.toLowerCase().trim() === 'sky sports main event' ||
        cur.url.endsWith('/17286')
      ) {
        cur.name = 'Sky Sport EPL';
      }

      channels.push(cur as ParsedM3UEntry);
      cur = {};
    }
  }

  return channels;
}

/**
 * Calculates comprehensive reliability & stability score for a stream source.
 * Factors in verified channel playback history, historical stability score, fast CDN endpoints, and low latency.
 */
function getSourceReliabilityScore(
  url: string,
  type?: string,
  drm?: DRMConfig,
  channelId?: string
): number {
  if (!url) return -5000;

  // 1. Highest Priority: Is this the verified stable source previously remembered for this channel?
  let score = 50;
  if (channelId) {
    const verifiedUrl = streamCache.getVerifiedStableSourceUrl(channelId);
    if (verifiedUrl && verifiedUrl === url) {
      score += 2000; // Massive priority for the remembered stable source
    }
  }

  // 2. Historical Stability Score across all sessions (successes, consecutive streak, fail count, latency)
  const stabilityScore = streamCache.getSourceStabilityScore(url);
  score += stabilityScore * 2; // Weight historical stability

  // 3. Direct fast CDN & low-latency endpoints
  if (url.includes('fptplay.net') || url.includes('fptplay53.net') || url.includes('livecdn')) score += 40;
  if (url.includes('vtvprime.vn')) score += 30;
  if (url.includes('chunklist') || url.includes('.m3u8')) score += 20;

  // 4. ClearKey MPD with pre-computed static keys
  if (type === 'mpd' && drm?.type === 'clearkey' && drm.keys && Object.keys(drm.keys).length > 0) score += 25;

  // 5. Demote known slow or proxy redirect scripts
  if (url.includes('.php?') || url.includes('token=')) score -= 20;
  if (url.includes('seenow.vn')) score -= 15;

  // 6. Demote broken or cooling down sources
  if (streamCache.isSourceFaulty(url)) {
    score -= 3000;
  }

  return score;
}

/**
 * Builds candidate stream sources list for a channel, automatically prioritizing
 * the best, most stable remembered source at position 0 when opening the channel.
 */
export function buildCandidateSources(channel: Channel): StreamSource[] {
  const rawSources: StreamSource[] = [];

  // Primary source
  if (channel.url && !isBlockedSource(channel.url, undefined, true)) {
    rawSources.push({
      url: channel.url,
      type: channel.type || (channel.url.includes('.mpd') ? 'mpd' : 'hls'),
      userAgent: channel.userAgent,
      drm: channel.drm,
      label: 'Nguồn chính'
    });
  }

  // Backup source
  if (channel.backupUrl && channel.backupUrl !== channel.url && !isBlockedSource(channel.backupUrl, undefined, true)) {
    rawSources.push({
      url: channel.backupUrl,
      type: channel.backupType || (channel.backupUrl.includes('.mpd') ? 'mpd' : 'hls'),
      userAgent: channel.backupUserAgent || channel.userAgent,
      drm: channel.backupDrm || channel.drm,
      label: 'Nguồn dự phòng 1'
    });
  }

  // Any additional candidate sources defined in channel.sources
  if (Array.isArray(channel.sources)) {
    for (const src of channel.sources) {
      if (src.url && !isBlockedSource(src.url, undefined, true) && !rawSources.some(s => s.url === src.url)) {
        rawSources.push(src);
      }
    }
  }

  // Any additional URLs defined in channel.urls
  if (Array.isArray(channel.urls)) {
    for (const u of channel.urls) {
      if (u && !isBlockedSource(u, undefined, true) && !rawSources.some(s => s.url === u)) {
        rawSources.push({
          url: u,
          type: u.includes('.mpd') ? 'mpd' : 'hls',
          userAgent: channel.userAgent,
          drm: channel.drm,
          label: 'Nguồn dự phòng'
        });
      }
    }
  }

  if (rawSources.length === 0) return [];

  // Sort all candidate sources strictly by stability score (highest score first)
  rawSources.sort((a, b) => {
    const scoreA = getSourceReliabilityScore(a.url, a.type, a.drm, channel.id);
    const scoreB = getSourceReliabilityScore(b.url, b.type, b.drm, channel.id);
    return scoreB - scoreA;
  });

  // Re-label nicely for the player engine
  return rawSources.map((s, idx) => ({
    ...s,
    label: idx === 0 ? 'Nguồn chính (Tối ưu & Ổn định)' : `Nguồn dự phòng ${idx} (${s.type === 'mpd' ? 'DASH' : 'HLS'})`
  }));
}

/**
 * Merges parsed M3U playlist entries into base channels list.
 * Enhances existing channels with backup URLs, ClearKey DRM and multi-sources,
 * and adds any missing channels.
 */
export function mergeM3UWithChannels(baseChannels: Channel[], m3uEntries: ParsedM3UEntry[]): Channel[] {
  const mergedMap = new Map<string, Channel>();
  const nameIndexMap = new Map<string, Channel>();

  // Populate maps from base channels
  for (const ch of baseChannels) {
    mergedMap.set(ch.id, { ...ch });
    nameIndexMap.set(normalizeChannelName(ch.name), ch);
  }

  for (const m3u of m3uEntries) {
    if (isBlockedSource(m3u.url, m3u.licenseKey)) {
      continue;
    }
    const normName = normalizeChannelName(m3u.name);
    let matchedChannel = mergedMap.get(m3u.id) || nameIndexMap.get(normName);

    // Also check for partial matches (e.g. "vtv1" in "vtv1hd")
    if (!matchedChannel) {
      for (const [key, ch] of nameIndexMap.entries()) {
        if (key === normName || (normName.length > 3 && (key.includes(normName) || normName.includes(key)))) {
          matchedChannel = ch;
          break;
        }
      }
    }

    const drmConfig = parseDrmConfig(m3u.licenseKey, m3u.manifestType);
    const streamType: 'hls' | 'mpd' | 'mp4' = (m3u.manifestType === 'mpd' || m3u.url.includes('.mpd') || drmConfig !== undefined)
      ? 'mpd'
      : 'hls';

    if (matchedChannel) {
      // Channel exists: Enhance with backupUrl & sources
      const existing = mergedMap.get(matchedChannel.id)!;

      // If existing channel does not have backupUrl, or has a different URL in M3U
      if (!existing.backupUrl && m3u.url !== existing.url) {
        existing.backupUrl = m3u.url;
        existing.backupType = streamType;
        existing.backupUserAgent = m3u.userAgent || existing.userAgent;
        if (drmConfig) {
          existing.backupDrm = drmConfig;
        }
      }

      // If existing channel has missing or licenseUrl DRM, but M3U provides direct ClearKey keys
      if (drmConfig && drmConfig.keys && (!existing.drm?.keys || Object.keys(existing.drm.keys).length === 0)) {
        existing.drm = {
          type: 'clearkey',
          keys: drmConfig.keys,
          licenseUrl: existing.drm?.licenseUrl
        };
      }

      // Merge into candidate sources
      const newSource: StreamSource = {
        url: m3u.url,
        type: streamType,
        userAgent: m3u.userAgent,
        drm: drmConfig,
        label: 'Nguồn HT-TV M3U'
      };

      const sources = existing.sources || buildCandidateSources(existing);
      if (!sources.some(s => s.url === newSource.url)) {
        sources.push(newSource);
      }
      existing.sources = sources;
      mergedMap.set(existing.id, existing);
    } else {
      // New channel from M3U not in base catalog
      const catInfo = mapGroupToCategory(m3u.group);
      const newChannel: Channel = {
        id: m3u.id || normName,
        number: 0, // will be indexed
        name: m3u.name,
        category: catInfo.category,
        categoryName: catInfo.categoryName,
        logo: m3u.logo || 'https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/default.png',
        url: m3u.url,
        type: streamType,
        userAgent: m3u.userAgent,
        drm: drmConfig,
        sources: [
          {
            url: m3u.url,
            type: streamType,
            userAgent: m3u.userAgent,
            drm: drmConfig,
            label: 'Nguồn HT-TV'
          }
        ]
      };
      mergedMap.set(newChannel.id, newChannel);
      nameIndexMap.set(normName, newChannel);
    }
  }

  // Filter out unwanted channels and sort Thể thao quốc tế alphabetically A-Z
  const rawList = Array.from(mergedMap.values()).filter((ch) => ch.id !== 'ch-66');

  const categoryOrder: CategoryId[] = [
    'vtv',
    'vtvcab',
    'htv',
    'sctv',
    'thethaoquocte',
    'sukien',
    'diaphuong',
    'phim',
    'quocte',
    'nghenhac'
  ];

  const sportsChannels = rawList
    .filter(c => c.category === 'thethaoquocte')
    .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base', numeric: true }));

  const orderedList: Channel[] = [];
  for (const cat of categoryOrder) {
    if (cat === 'thethaoquocte') {
      orderedList.push(...sportsChannels);
    } else {
      orderedList.push(...rawList.filter(c => c.category === cat));
    }
  }
  const knownCats = new Set(categoryOrder);
  orderedList.push(...rawList.filter(c => !knownCats.has(c.category)));

  const result = orderedList.map((ch, idx) => ({
    ...ch,
    number: idx + 1,
    sources: ch.sources || buildCandidateSources(ch)
  }));

  return result;
}

/**
 * Service to manage downloading, parsing, and caching backup M3U
 */
class M3UService {
  private inMemoryM3U: ParsedM3UEntry[] | null = null;
  private isSyncing = false;

  /**
   * Hydrates cached M3U text from storage
   */
  public getCachedM3U(): ParsedM3UEntry[] | null {
    if (this.inMemoryM3U) return this.inMemoryM3U;
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(M3U_STORAGE_KEY) || sessionStorage.getItem(M3U_STORAGE_KEY);
      if (cached) {
        this.inMemoryM3U = parseM3U(cached);
        return this.inMemoryM3U;
      }
    } catch (e) {
      console.warn('[M3UService] Error reading cached M3U:', e);
    }
    return null;
  }

  /**
   * Fetches latest M3U playlist from https://raw.githubusercontent.com/thongdp00/m3u/refs/heads/main/ht-tv.m3u
   * with fast timeout and caching.
   */
  public async fetchBackupM3U(force = false): Promise<ParsedM3UEntry[] | null> {
    if (typeof window === 'undefined') return null;
    if (this.isSyncing) return this.inMemoryM3U;

    // Check last sync time
    try {
      const lastSync = Number(localStorage.getItem(M3U_SYNC_TIMESTAMP_KEY) || 0);
      if (!force && Date.now() - lastSync < SYNC_INTERVAL_MS && this.inMemoryM3U) {
        return this.inMemoryM3U;
      }
    } catch {}

    this.isSyncing = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      console.log('[M3UService] Đồng bộ danh sách nguồn dự phòng từ:', BACKUP_M3U_URL);
      const res = await fetch(BACKUP_M3U_URL, {
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Accept': 'text/plain, application/x-mpegurl, */*'
        }
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const text = await res.text();
        if (text && text.includes('#EXTINF:')) {
          const parsed = parseM3U(text);
          this.inMemoryM3U = parsed;
          try {
            localStorage.setItem(M3U_STORAGE_KEY, text);
            localStorage.setItem(M3U_SYNC_TIMESTAMP_KEY, Date.now().toString());
            sessionStorage.setItem(M3U_STORAGE_KEY, text);
          } catch {}
          console.log(`[M3UService] Đã tải và nạp thành công ${parsed.length} kênh từ nguồn dự phòng HT-TV`);
          return parsed;
        }
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.warn('[M3UService] Fetch backup M3U timed out after 4s, using cached/static data');
      } else {
        console.warn('[M3UService] Failed to fetch backup M3U:', e);
      }
    } finally {
      clearTimeout(timeoutId);
      this.isSyncing = false;
    }

    return this.getCachedM3U();
  }

  /**
   * Pre-fetches and synchronizes channels in the background
   */
  public initBackgroundSync(onUpdate?: (updatedChannels: Channel[]) => void, baseChannels?: Channel[]): void {
    if (typeof window === 'undefined') return;

    // Run async sync shortly after app boot
    setTimeout(async () => {
      const parsed = await this.fetchBackupM3U();
      if (parsed && parsed.length > 0 && onUpdate && baseChannels) {
        const merged = mergeM3UWithChannels(baseChannels, parsed);
        onUpdate(merged);
      }
    }, 800);
  }
}

export const m3uService = new M3UService();
