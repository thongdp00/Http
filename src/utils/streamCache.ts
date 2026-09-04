/**
 * Stream & Channel Cache Manager
 * Caches working stream sources (primary vs backup), ClearKey DRM license payloads,
 * and channel playback states to enable instant, smooth switching without re-load delays.
 */

import { Channel, StreamSource } from '../types';
import { checkStreamTokenExpiry } from './tokenValidator';

export interface SourceHealthEntry {
  url: string;
  successCount: number;
  consecutiveSuccessCount: number;
  failCount: number;
  lastSuccessTimestamp: number;
  lastFailTimestamp: number;
  averageStartupTimeMs?: number;
  score: number;
}

export interface ChannelStreamCacheEntry {
  channelId: string;
  preferredSource: 'primary' | 'backup';
  workingUrl: string;
  streamType: 'hls' | 'mpd' | 'mp4' | 'ts';
  lastSuccessTimestamp: number;
  successCount?: number;
  clearKeys?: Record<string, string>;
  userAgent?: string;
  sourceIndex?: number;
}

export interface FaultySourceEntry {
  url: string;
  failCount: number;
  lastFailTimestamp: number;
}

const CACHE_STORAGE_KEY = 'ht_tv_stream_cache_v2';
const CLEARKEY_CACHE_KEY = 'ht_tv_clearkey_cache_v2';
const FAULTY_SOURCES_KEY = 'ht_tv_faulty_sources_v2';
const SOURCE_HEALTH_KEY = 'ht_tv_source_health_v2';
const CACHE_EXPIRY_MS = 1000 * 60 * 60 * 24 * 7; // 7 days memory for stable sources
const FAULTY_COOLDOWN_MS = 1000 * 60 * 15; // 15 minutes cooldown before re-trying broken sources

class StreamCacheManager {
  // In-memory cache for ultra-fast, synchronous access (0ms boot)
  private memoryCache: Map<string, ChannelStreamCacheEntry> = new Map();
  private clearKeyLicenseCache: Map<string, { keys: Record<string, string>; timestamp: number }> = new Map();
  private faultySourcesMap: Map<string, FaultySourceEntry> = new Map();
  private sourceHealthMap: Map<string, SourceHealthEntry> = new Map();
  private recentlyLoadedChannels: Set<string> = new Set();

  constructor() {
    this.hydrateFromStorage();
  }

  private hydrateFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      // 1. Channel Preferred Working Sources Cache
      const storedCache = sessionStorage.getItem(CACHE_STORAGE_KEY) || localStorage.getItem(CACHE_STORAGE_KEY);
      if (storedCache) {
        const parsed = JSON.parse(storedCache);
        const now = Date.now();
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && item.channelId && now - item.lastSuccessTimestamp < CACHE_EXPIRY_MS) {
              // Discard stale obsolete DRM keys for SCTV15 / SCTV17
              if (item.drmKeys && item.drmKeys['9121ebe293bc46cd89e5d83a78c1a53c']) {
                continue;
              }
              this.memoryCache.set(item.channelId, item);
            }
          }
        }
      }

      // 2. ClearKey DRM Licenses Cache
      const storedKeyCache = sessionStorage.getItem(CLEARKEY_CACHE_KEY) || localStorage.getItem(CLEARKEY_CACHE_KEY);
      if (storedKeyCache) {
        const parsedKeys = JSON.parse(storedKeyCache);
        const now = Date.now();
        if (parsedKeys && typeof parsedKeys === 'object') {
          for (const [url, entry] of Object.entries(parsedKeys)) {
            const e = entry as { keys: Record<string, string>; timestamp: number };
            if (e && e.keys && now - e.timestamp < CACHE_EXPIRY_MS) {
              this.clearKeyLicenseCache.set(url, e);
            }
          }
        }
      }

      // 3. Faulty Sources Cooldown Map
      const storedFaulty = sessionStorage.getItem(FAULTY_SOURCES_KEY) || localStorage.getItem(FAULTY_SOURCES_KEY);
      if (storedFaulty) {
        const parsedFaulty = JSON.parse(storedFaulty);
        const now = Date.now();
        if (Array.isArray(parsedFaulty)) {
          for (const item of parsedFaulty) {
            if (item && item.url && now - item.lastFailTimestamp < FAULTY_COOLDOWN_MS) {
              this.faultySourcesMap.set(item.url, item);
            }
          }
        }
      }

      // 4. Source Health & Stability History Map
      const storedHealth = sessionStorage.getItem(SOURCE_HEALTH_KEY) || localStorage.getItem(SOURCE_HEALTH_KEY);
      if (storedHealth) {
        const parsedHealth = JSON.parse(storedHealth);
        if (Array.isArray(parsedHealth)) {
          for (const item of parsedHealth) {
            if (item && item.url) {
              this.sourceHealthMap.set(item.url, item);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[StreamCache] Error restoring cache from storage:', err);
    }
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const arrayData = Array.from(this.memoryCache.values());
      const serialized = JSON.stringify(arrayData);
      sessionStorage.setItem(CACHE_STORAGE_KEY, serialized);
      try {
        localStorage.setItem(CACHE_STORAGE_KEY, serialized);
      } catch {}

      const keyObject: Record<string, { keys: Record<string, string>; timestamp: number }> = {};
      for (const [url, entry] of this.clearKeyLicenseCache.entries()) {
        keyObject[url] = entry;
      }
      const serializedKeys = JSON.stringify(keyObject);
      sessionStorage.setItem(CLEARKEY_CACHE_KEY, serializedKeys);
      try {
        localStorage.setItem(CLEARKEY_CACHE_KEY, serializedKeys);
      } catch {}

      const faultyArray = Array.from(this.faultySourcesMap.values());
      const serializedFaulty = JSON.stringify(faultyArray);
      sessionStorage.setItem(FAULTY_SOURCES_KEY, serializedFaulty);
      try {
        localStorage.setItem(FAULTY_SOURCES_KEY, serializedFaulty);
      } catch {}

      const healthArray = Array.from(this.sourceHealthMap.values());
      const serializedHealth = JSON.stringify(healthArray);
      sessionStorage.setItem(SOURCE_HEALTH_KEY, serializedHealth);
      try {
        localStorage.setItem(SOURCE_HEALTH_KEY, serializedHealth);
      } catch {}
    } catch (err) {
      console.warn('[StreamCache] Error persisting cache to storage:', err);
    }
  }

  /**
   * Computes the stability score of a stream source URL based on historical performance.
   * Higher score = more reliable, faster startup, less buffering.
   */
  public getSourceStabilityScore(url: string): number {
    if (!url) return -1000;
    if (this.isSourceFaulty(url)) return -500;

    const health = this.sourceHealthMap.get(url);
    if (!health) {
      // Default initial score for untried source
      return 50;
    }

    let score = 50;
    // Success multiplier
    score += Math.min(300, health.successCount * 30);
    // Consecutive uninterrupted playback bonus
    score += Math.min(300, health.consecutiveSuccessCount * 50);
    // Failure penalty
    score -= health.failCount * 70;

    // Recent success bonus (within past 24 hours)
    const timeSinceSuccess = Date.now() - health.lastSuccessTimestamp;
    if (timeSinceSuccess < 1000 * 60 * 60 * 24) {
      score += 50;
    }

    // Startup speed bonus if recorded
    if (health.averageStartupTimeMs && health.averageStartupTimeMs < 1500) {
      score += 40;
    }

    return score;
  }

  /**
   * Records a source failure (timeout, HTTP error 401/403/404/410, DRM decrypt error, fatal HLS error).
   * Decrements stability score and marks source as faulty if repeatedly failing.
   */
  public recordSourceFailure(url: string, channelId?: string, isFatalOrHttp4xx = false): void {
    if (!url) return;
    const now = Date.now();
    const existingFaulty = this.faultySourcesMap.get(url);
    const failCount = isFatalOrHttp4xx ? 5 : ((existingFaulty ? existingFaulty.failCount : 0) + 1);

    this.faultySourcesMap.set(url, {
      url,
      failCount,
      lastFailTimestamp: now
    });

    // Update Source Health Entry
    const health = this.sourceHealthMap.get(url) || {
      url,
      successCount: 0,
      consecutiveSuccessCount: 0,
      failCount: 0,
      lastSuccessTimestamp: 0,
      lastFailTimestamp: 0,
      score: 0
    };
    health.failCount += isFatalOrHttp4xx ? 3 : 1;
    health.consecutiveSuccessCount = 0; // Reset consecutive streak
    health.lastFailTimestamp = now;
    health.score = this.getSourceStabilityScore(url);
    this.sourceHealthMap.set(url, health);

    // If channel currently has this failing URL cached as preferred, invalidate it
    if (channelId) {
      const cached = this.memoryCache.get(channelId);
      if (cached && cached.workingUrl === url) {
        this.memoryCache.delete(channelId);
      }
    }

    this.persistToStorage();
    console.warn(`[StreamCache] Recorded stream failure for URL: ${url} (Fail count: ${failCount}, Stability: ${health.score}, Fatal: ${isFatalOrHttp4xx})`);
  }

  /**
   * Checks if a source URL is currently marked as faulty/broken or expired.
   */
  public isSourceFaulty(url?: string): boolean {
    if (!url) return true;

    // Check token expiration first
    const tokenCheck = checkStreamTokenExpiry(url);
    if (tokenCheck.isExpired) {
      return true;
    }

    const entry = this.faultySourcesMap.get(url);
    if (!entry) return false;

    // Check if cooldown has passed
    if (Date.now() - entry.lastFailTimestamp > FAULTY_COOLDOWN_MS) {
      this.faultySourcesMap.delete(url);
      return false;
    }

    return entry.failCount >= 2;
  }

  /**
   * Records successful playback for a stream source, increasing its stability score
   * and clearing any failure flags.
   */
  public recordSourceSuccess(url: string, startupTimeMs?: number): void {
    if (!url) return;
    const now = Date.now();

    // Clear from faulty map if present
    if (this.faultySourcesMap.has(url)) {
      this.faultySourcesMap.delete(url);
    }

    // Update Source Health
    const health = this.sourceHealthMap.get(url) || {
      url,
      successCount: 0,
      consecutiveSuccessCount: 0,
      failCount: 0,
      lastSuccessTimestamp: 0,
      lastFailTimestamp: 0,
      score: 50
    };

    health.successCount += 1;
    health.consecutiveSuccessCount += 1;
    health.lastSuccessTimestamp = now;

    if (startupTimeMs && startupTimeMs > 0 && startupTimeMs < 15000) {
      if (health.averageStartupTimeMs) {
        health.averageStartupTimeMs = Math.round((health.averageStartupTimeMs * 0.7) + (startupTimeMs * 0.3));
      } else {
        health.averageStartupTimeMs = startupTimeMs;
      }
    }

    health.score = this.getSourceStabilityScore(url);
    this.sourceHealthMap.set(url, health);
    this.persistToStorage();
  }

  /**
   * Records a successful channel playback event to cache its working source configuration.
   * Remembers the stable source and reinforces it for instant future tuning.
   */
  public recordSuccess(
    channelId: string,
    isBackup: boolean,
    workingUrl: string,
    streamType: 'hls' | 'mpd' | 'mp4' | 'ts',
    clearKeys?: Record<string, string>,
    userAgent?: string,
    sourceIndex?: number,
    startupTimeMs?: number
  ): void {
    if (!channelId || !workingUrl) return;

    this.recordSourceSuccess(workingUrl, startupTimeMs);

    const existing = this.memoryCache.get(channelId);
    const successCount = (existing?.workingUrl === workingUrl ? (existing.successCount || 0) : 0) + 1;

    const entry: ChannelStreamCacheEntry = {
      channelId,
      preferredSource: isBackup ? 'backup' : 'primary',
      workingUrl,
      streamType,
      lastSuccessTimestamp: Date.now(),
      successCount,
      clearKeys: clearKeys || undefined,
      userAgent: userAgent || undefined,
      sourceIndex: sourceIndex !== undefined ? sourceIndex : (isBackup ? 1 : 0),
    };

    this.memoryCache.set(channelId, entry);
    this.recentlyLoadedChannels.add(channelId);
    this.persistToStorage();
    console.log(`[StreamCache] 🌟 Ghi nhớ nguồn ổn định cho kênh '${channelId}' (URL: ${workingUrl}, Lượt phát thành công: ${successCount})`);
  }

  /**
   * Permanently promotes a working backup source to become the primary stream source for a channel,
   * replacing or purging faulty primary links.
   */
  public promoteSourceToPrimary(
    channel: Channel,
    workingSource: StreamSource,
    brokenSourceUrl?: string
  ): Channel {
    if (!channel || !workingSource || !workingSource.url) return channel;

    // Record the broken source as faulty
    if (brokenSourceUrl) {
      this.recordSourceFailure(brokenSourceUrl, channel.id);
    } else if (channel.url && channel.url !== workingSource.url) {
      this.recordSourceFailure(channel.url, channel.id);
    }

    // Mark working source as healthy and stable
    this.recordSourceSuccess(workingSource.url);

    // Build updated sources array: put working source first, exclude broken source
    const existingSources = channel.sources ? [...channel.sources] : [];
    const remainingSources = existingSources.filter(
      (s) => s.url !== workingSource.url && s.url !== brokenSourceUrl
    );

    const newSourcesList: StreamSource[] = [
      {
        ...workingSource,
        label: 'Nguồn chính (Tối ưu & Ổn định)'
      },
      ...remainingSources
    ];

    const updatedChannel: Channel = {
      ...channel,
      url: workingSource.url,
      type: workingSource.type || 'hls',
      userAgent: workingSource.userAgent || channel.userAgent,
      drm: workingSource.drm || channel.drm,
      backupUrl: newSourcesList.length > 1 ? newSourcesList[1].url : undefined,
      backupType: newSourcesList.length > 1 ? newSourcesList[1].type : undefined,
      backupUserAgent: newSourcesList.length > 1 ? newSourcesList[1].userAgent : undefined,
      backupDrm: newSourcesList.length > 1 ? newSourcesList[1].drm : undefined,
      sources: newSourcesList
    };

    // Cache updated channel profile
    this.recordSuccess(
      updatedChannel.id,
      false, // Now primary
      workingSource.url,
      workingSource.type || 'hls',
      workingSource.drm?.keys,
      workingSource.userAgent || channel.userAgent,
      0 // Source index 0
    );

    console.log(`[StreamCache] 🚀 Đã nâng nguồn dự phòng (${workingSource.url}) lên làm nguồn chính cho kênh: ${channel.name}`);
    return updatedChannel;
  }

  /**
   * Retrieves cached stream configuration for a channel if available.
   */
  public getCachedEntry(channelId: string): ChannelStreamCacheEntry | null {
    if (!channelId) return null;
    const entry = this.memoryCache.get(channelId);
    if (!entry) return null;

    // Check expiry or if the workingUrl is now marked faulty
    if (Date.now() - entry.lastSuccessTimestamp > CACHE_EXPIRY_MS || this.isSourceFaulty(entry.workingUrl)) {
      this.memoryCache.delete(channelId);
      return null;
    }

    return entry;
  }

  /**
   * Checks if a channel has a verified, stable working source remembered
   */
  public getVerifiedStableSourceUrl(channelId: string): string | null {
    const entry = this.getCachedEntry(channelId);
    return entry ? entry.workingUrl : null;
  }

  /**
   * Checks if channel is present in cache and was previously loaded successfully
   */
  public hasCachedSuccess(channelId: string): boolean {
    return !!this.getCachedEntry(channelId);
  }

  /**
   * Cached ClearKey license response lookup
   */
  public getCachedClearKeys(licenseUrl: string): Record<string, string> | null {
    if (!licenseUrl) return null;
    const entry = this.clearKeyLicenseCache.get(licenseUrl);
    if (entry && Date.now() - entry.timestamp < CACHE_EXPIRY_MS) {
      return entry.keys;
    }
    return null;
  }

  /**
   * Stores fetched ClearKey license mapping
   */
  public cacheClearKeys(licenseUrl: string, keys: Record<string, string>): void {
    if (!licenseUrl || !keys || Object.keys(keys).length === 0) return;
    this.clearKeyLicenseCache.set(licenseUrl, {
      keys,
      timestamp: Date.now(),
    });
    this.persistToStorage();
  }

  /**
   * Clear cache for a specific channel if it fails permanently
   */
  public invalidateChannel(channelId: string): void {
    this.memoryCache.delete(channelId);
    this.recentlyLoadedChannels.delete(channelId);
    this.persistToStorage();
    console.log(`[StreamCache] Invalidated cache for channel '${channelId}'`);
  }

  /**
   * Purges all corrupted stream cache, broken DRM license keys, and temporary tokens for a channel
   */
  public clearCorruptedStreamCache(channelId?: string, licenseUrl?: string): void {
    if (channelId) {
      this.memoryCache.delete(channelId);
      this.recentlyLoadedChannels.delete(channelId);
    }
    if (licenseUrl) {
      this.clearKeyLicenseCache.delete(licenseUrl);
    }
    this.persistToStorage();
    console.log(`[StreamCache] Cleared corrupted stream cache for channel='${channelId || 'all'}', licenseUrl='${licenseUrl || 'none'}'`);
  }

  /**
   * Complete flush of all cached playback sources and DRM licenses
   */
  public clearAll(): void {
    this.memoryCache.clear();
    this.clearKeyLicenseCache.clear();
    this.recentlyLoadedChannels.clear();
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(CACHE_STORAGE_KEY);
        sessionStorage.removeItem(CLEARKEY_CACHE_KEY);
        localStorage.removeItem(CACHE_STORAGE_KEY);
        localStorage.removeItem(CLEARKEY_CACHE_KEY);
      } catch {}
    }
    console.log('[StreamCache] Flushed all stream and DRM cache');
  }
}

export const streamCache = new StreamCacheManager();
