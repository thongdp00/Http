import { Channel, DRMConfig, StreamSource } from '../types';
import { parseDrmConfig } from './m3uService';

export interface TokenChannelData {
  id?: string;
  name?: string;
  tv360Id?: string;
  url: string;
  expires?: number;
  token?: string;
  licenseKey?: string;
  manifestType?: string;
  userAgent?: string;
  group?: string;
}

export interface Tv360TokensResponse {
  success: boolean;
  timestamp: number;
  total: number;
  tokens: {
    byTv360Id: Record<string, TokenChannelData>;
    byChannelId: Record<string, TokenChannelData>;
    byName: Record<string, TokenChannelData>;
    allTv360: TokenChannelData[];
  };
}

const SEX_SOURCE_URL = 'https://tv.vietanhtv.top/sex/';
const CACHE_STORAGE_KEY = 'ht_tv360_tokens_cache_v1';
const SYNC_TIMESTAMP_KEY = 'ht_tv360_tokens_last_sync_v1';
const SYNC_INTERVAL_MS = 1000 * 60 * 5; // 5 minutes

class Tv360TokenService {
  private cache: {
    byTv360Id: Record<string, TokenChannelData>;
    byChannelId: Record<string, TokenChannelData>;
    byName: Record<string, TokenChannelData>;
    allTv360: TokenChannelData[];
    lastUpdated: number;
  } = {
    byTv360Id: {},
    byChannelId: {},
    byName: {},
    allTv360: [],
    lastUpdated: 0
  };

  private isSyncing = false;
  private listeners: Set<(tokens: Tv360TokensResponse) => void> = new Set();

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(CACHE_STORAGE_KEY) || sessionStorage.getItem(CACHE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.byTv360Id) {
          this.cache = parsed;
        }
      }
    } catch {}
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const json = JSON.stringify(this.cache);
      localStorage.setItem(CACHE_STORAGE_KEY, json);
      sessionStorage.setItem(CACHE_STORAGE_KEY, json);
      localStorage.setItem(SYNC_TIMESTAMP_KEY, Date.now().toString());
    } catch {}
  }

  public subscribe(cb: (tokens: Tv360TokensResponse) => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  /**
   * Fetches latest tokens from backend server or directly from https://tv.vietanhtv.top/sex/
   */
  public async syncTokens(force = false): Promise<Tv360TokensResponse | null> {
    if (typeof window === 'undefined') return null;
    if (this.isSyncing && !force) return this.getTokensResponse();

    const now = Date.now();
    if (!force && now - this.cache.lastUpdated < SYNC_INTERVAL_MS && this.cache.allTv360.length > 0) {
      return this.getTokensResponse();
    }

    this.isSyncing = true;
    try {
      // 1. Try fetching from server endpoint /api/tv360-tokens
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      try {
        const res = await fetch('/api/tv360-tokens', {
          signal: controller.signal,
          cache: 'no-cache'
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data: Tv360TokensResponse = await res.json();
          if (data && data.success && data.tokens) {
            this.cache = {
              byTv360Id: data.tokens.byTv360Id || {},
              byChannelId: data.tokens.byChannelId || {},
              byName: data.tokens.byName || {},
              allTv360: data.tokens.allTv360 || [],
              lastUpdated: Date.now()
            };
            this.saveToStorage();
            console.log(`[Tv360TokenService] Đã cập nhật ${this.cache.allTv360.length} token & DRM từ máy chủ`);
            this.notifyListeners(data);
            return data;
          }
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        console.warn('[Tv360TokenService] Lỗi fetch /api/tv360-tokens, thử nạp trực tiếp:', err?.message || err);
      }

      // 2. Fallback: Parse directly via /api/stream-proxy?url=... or direct fetch
      const directData = await this.fetchDirectSexPlaylist();
      if (directData) {
        return directData;
      }
    } finally {
      this.isSyncing = false;
    }

    return this.getTokensResponse();
  }

  /**
   * Fallback direct fetch of https://tv.vietanhtv.top/sex/
   */
  private async fetchDirectSexPlaylist(): Promise<Tv360TokensResponse | null> {
    try {
      const proxyUrl = `/api/stream-proxy?url=${encodeURIComponent(SEX_SOURCE_URL)}&ua=${encodeURIComponent('Mozilla/5.0')}`;
      const res = await fetch(proxyUrl, { cache: 'no-cache' });
      if (!res.ok) return null;

      const text = await res.text();
      if (!text || !text.includes('#EXTINF:')) return null;

      const lines = text.split(/\r?\n/);
      const byTv360Id: Record<string, TokenChannelData> = {};
      const byChannelId: Record<string, TokenChannelData> = {};
      const byName: Record<string, TokenChannelData> = {};
      const allTv360: TokenChannelData[] = [];

      let cur: Partial<TokenChannelData> = {};

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('#EXTINF:')) {
          cur = {};
          const idMatch = line.match(/tvg-id="([^"]+)"/i);
          const nameMatch = line.match(/,\s*([^,]+)$/);
          const groupMatch = line.match(/group-title="([^"]+)"/i);
          if (idMatch) cur.id = idMatch[1].trim();
          if (nameMatch) cur.name = nameMatch[1].trim();
          if (groupMatch) cur.group = groupMatch[1].trim();
        } else if (line.startsWith('#KODIPROP:inputstream.adaptive.license_key=')) {
          cur.licenseKey = line.split('license_key=')[1].trim();
        } else if (line.startsWith('#KODIPROP:inputstream.adaptive.manifest_type=')) {
          cur.manifestType = line.split('manifest_type=')[1].trim();
        } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
          cur.userAgent = line.split('http-user-agent=')[1].trim();
        } else if (line.startsWith('http://') || line.startsWith('https://')) {
          cur.url = line;

          if (cur.url.includes('tv360.php') || cur.url.includes('cleankey.php') || cur.licenseKey?.includes('cleankey.php') || cur.id?.toLowerCase().includes('tv360')) {
            const matchId = cur.url.match(/[?&]id=(\d+)/);
            if (matchId) {
              cur.tv360Id = matchId[1];
            }
            const matchExpires = cur.url.match(/[?&]expires=(\d+)/);
            if (matchExpires) {
              cur.expires = parseInt(matchExpires[1], 10);
            }
            const matchToken = cur.url.match(/[?&]token=([a-fA-F0-9]+)/);
            if (matchToken) {
              cur.token = matchToken[1];
            }

            const item = cur as TokenChannelData;
            allTv360.push(item);
            if (item.tv360Id) byTv360Id[item.tv360Id] = item;
            if (item.id) byChannelId[item.id.toLowerCase()] = item;
            if (item.name) {
              const norm = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
              byName[norm] = item;
            }
          }
          cur = {};
        }
      }

      this.cache = {
        byTv360Id,
        byChannelId,
        byName,
        allTv360,
        lastUpdated: Date.now()
      };
      this.saveToStorage();

      const response: Tv360TokensResponse = {
        success: true,
        timestamp: this.cache.lastUpdated,
        total: allTv360.length,
        tokens: {
          byTv360Id,
          byChannelId,
          byName,
          allTv360
        }
      };

      this.notifyListeners(response);
      return response;
    } catch (e) {
      console.warn('[Tv360TokenService] Fallback direct fetch failed:', e);
      return null;
    }
  }

  private notifyListeners(data: Tv360TokensResponse): void {
    for (const listener of this.listeners) {
      try {
        listener(data);
      } catch {}
    }
  }

  public getTokensResponse(): Tv360TokensResponse {
    return {
      success: true,
      timestamp: this.cache.lastUpdated,
      total: this.cache.allTv360.length,
      tokens: {
        byTv360Id: this.cache.byTv360Id,
        byChannelId: this.cache.byChannelId,
        byName: this.cache.byName,
        allTv360: this.cache.allTv360
      }
    };
  }

  /**
   * Finds the latest active token & DRM data for a given channel or stream URL
   */
  public findFreshTokenData(channel: Partial<Channel> | string): TokenChannelData | null {
    if (typeof channel === 'string') {
      const target = channel.trim();
      const matchId = target.match(/[?&]id=(\d+)/);
      if (matchId && this.cache.byTv360Id[matchId[1]]) {
        return this.cache.byTv360Id[matchId[1]];
      }
      const norm = target.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (this.cache.byChannelId[norm]) return this.cache.byChannelId[norm];
      if (this.cache.byChannelId[norm.replace(/hd$/, '')]) return this.cache.byChannelId[norm.replace(/hd$/, '')];
      if (this.cache.byName[norm]) return this.cache.byName[norm];
      if (this.cache.byName[norm.replace(/hd$/, '')]) return this.cache.byName[norm.replace(/hd$/, '')];
      return null;
    }

    // 1. Match by TV360 ID from current URL
    if (channel.url) {
      const matchId = channel.url.match(/[?&]id=(\d+)/);
      if (matchId && this.cache.byTv360Id[matchId[1]]) {
        return this.cache.byTv360Id[matchId[1]];
      }
    }

    // 2. Match by channel ID (with and without HD suffix)
    if (channel.id) {
      const idKey = channel.id.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (this.cache.byChannelId[idKey]) return this.cache.byChannelId[idKey];
      if (this.cache.byChannelId[channel.id.toLowerCase()]) return this.cache.byChannelId[channel.id.toLowerCase()];
      const strippedHd = idKey.replace(/hd$/, '');
      if (this.cache.byChannelId[strippedHd]) return this.cache.byChannelId[strippedHd];
      const withHd = idKey + 'hd';
      if (this.cache.byChannelId[withHd]) return this.cache.byChannelId[withHd];
    }

    // 3. Match by normalized name
    if (channel.name) {
      const normName = channel.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (this.cache.byName[normName]) return this.cache.byName[normName];
      const strippedName = normName.replace(/hd$/, '');
      if (this.cache.byName[strippedName]) return this.cache.byName[strippedName];
      for (const [key, val] of Object.entries(this.cache.byName)) {
        if (normName.includes(key) || key.includes(normName) || strippedName.includes(key) || key.includes(strippedName)) {
          return val;
        }
      }
    }

    return null;
  }

  /**
   * Applies the freshest tokens & DRM configurations to a channel object
   */
  public updateChannelWithLatestTokens(channel: Channel): Channel {
    const fresh = this.findFreshTokenData(channel);
    if (!fresh) return channel;

    const updated = { ...channel };

    // Update primary URL if fresh token available
    if (fresh.url && (channel.url?.includes('tv360.php') || fresh.url.includes('tv360.php') || channel.url?.includes('vietanhtv'))) {
      updated.url = fresh.url;
    }

    // Update DRM config
    if (fresh.licenseKey) {
      const parsedDrm = parseDrmConfig(fresh.licenseKey, fresh.manifestType);
      if (parsedDrm) {
        updated.drm = parsedDrm;
      }
    }

    // Update sources
    if (Array.isArray(updated.sources)) {
      updated.sources = updated.sources.map((s) => {
        if (s.url && s.url.includes('tv360.php')) {
          const matchId = s.url.match(/[?&]id=(\d+)/);
          if (matchId && this.cache.byTv360Id[matchId[1]]) {
            const freshSource = this.cache.byTv360Id[matchId[1]];
            return {
              ...s,
              url: freshSource.url,
              drm: freshSource.licenseKey ? parseDrmConfig(freshSource.licenseKey, freshSource.manifestType) : s.drm
            };
          }
        }
        return s;
      });
    }

    return updated;
  }

  /**
   * Updates an entire channel list with fresh TV360 tokens & DRM keys
   */
  public applyTokensToChannelList(channels: Channel[]): Channel[] {
    if (!channels || channels.length === 0) return channels;
    return channels.map((ch) => this.updateChannelWithLatestTokens(ch));
  }

  /**
   * Starts background recurring sync every 5 minutes
   */
  public initAutoSync(onUpdate?: (channels: Channel[]) => void, getChannels?: () => Channel[]): void {
    if (typeof window === 'undefined') return;

    // Initial sync
    setTimeout(async () => {
      await this.syncTokens(true);
      if (onUpdate && getChannels) {
        const freshChannels = this.applyTokensToChannelList(getChannels());
        onUpdate(freshChannels);
      }
    }, 500);

    // Periodic sync
    setInterval(async () => {
      const res = await this.syncTokens(true);
      if (res && onUpdate && getChannels) {
        const freshChannels = this.applyTokensToChannelList(getChannels());
        onUpdate(freshChannels);
      }
    }, SYNC_INTERVAL_MS);
  }
}

export const tv360TokenService = new Tv360TokenService();
