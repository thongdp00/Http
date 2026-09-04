/**
 * Đồng bộ ngầm thích ứng mạng yếu (Stale-While-Revalidate Sync Manager)
 * 1. Tải trước tức thì từ bộ nhớ đệm đa tầng (Memory L1 + IndexedDB L2) với thời gian 0ms.
 * 2. Cập nhật nền với mức ưu tiên thấp và cơ chế ngắt thời gian chờ nghiêm ngặt (Timeout 5s).
 * 3. Tránh cạnh tranh băng thông và CPU với luồng phát video trực tiếp.
 */

import { Channel } from '../types';
import { ALL_CHANNELS } from '../data/channels';
import { indexedDBCache } from './indexedDBCache';
import { fastParseM3U, FastParseResult } from './m3uFastParser';
import { tv360TokenService } from './tv360TokenService';

export const DEFAULT_M3U_URL = 'https://raw.githubusercontent.com/thongdp00/m3u/refs/heads/main/ht-tv.m3u';
const SYNC_TIMEOUT_MS = 5000; // Strict 5-second timeout as required
const SYNC_COOLDOWN_MS = 1000 * 60 * 15; // 15 minutes cooldown between network refreshes

export interface SyncStatus {
  state: 'idle' | 'cached' | 'syncing' | 'synced' | 'timeout' | 'error';
  lastSyncTime: number;
  channelCount: number;
  sourceType: 'indexeddb' | 'memory' | 'network' | 'bundle';
  parseTimeMs: number;
  errorMessage?: string;
}

type SyncCallback = (channels: Channel[], status: SyncStatus) => void;

class StaleWhileRevalidateSyncManager {
  private status: SyncStatus = {
    state: 'idle',
    lastSyncTime: 0,
    channelCount: ALL_CHANNELS.length,
    sourceType: 'bundle',
    parseTimeMs: 0
  };

  private listeners: Set<SyncCallback> = new Set();
  private isSyncing = false;
  private currentChannels: Channel[] = ALL_CHANNELS;

  /**
   * Subscribe to channel list and sync status updates
   */
  public subscribe(cb: SyncCallback): () => void {
    this.listeners.add(cb);
    // Send current state immediately
    cb(this.currentChannels, this.status);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(channels: Channel[], status: Partial<SyncStatus>): void {
    this.currentChannels = channels;
    this.status = { ...this.status, ...status, channelCount: channels.length };
    for (const listener of this.listeners) {
      try {
        listener(channels, this.status);
      } catch (err) {
        console.warn('[SyncManager] Listener error:', err);
      }
    }
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public getCurrentChannels(): Channel[] {
    return this.currentChannels;
  }

  /**
   * Promotes a backup stream source to primary in live memory and persists to IndexedDB L2
   */
  public async promoteChannelSource(updatedChannel: Channel): Promise<void> {
    if (!updatedChannel || !updatedChannel.id) return;

    const currentList = [...this.currentChannels];
    const idx = currentList.findIndex((c) => c.id === updatedChannel.id);
    if (idx !== -1) {
      currentList[idx] = updatedChannel;
      this.currentChannels = currentList;
      this.notify(currentList, { sourceType: 'memory' });

      // Persist updated catalog with working primary source to IndexedDB L2
      try {
        await indexedDBCache.saveChannels(currentList);
        console.log(`[SyncManager] Đã lưu kênh cập nhật nguồn chính (${updatedChannel.name}) vào IndexedDB`);
      } catch (err) {
        console.warn('[SyncManager] Lỗi lưu kênh cập nhật vào IndexedDB:', err);
      }
    }
  }

  /**
   * Xóa một kênh khỏi danh sách kênh hiện tại và lưu vào IndexedDB
   */
  public async deleteChannel(channelId: string): Promise<Channel[]> {
    if (!channelId) return this.currentChannels;

    const filtered = this.currentChannels
      .filter((c) => c.id !== channelId)
      .map((c, idx) => ({ ...c, number: idx + 1 }));

    this.currentChannels = filtered;
    this.notify(filtered, { sourceType: 'memory' });

    try {
      await indexedDBCache.deleteChannel(channelId);
      await indexedDBCache.saveChannels(filtered);
      console.log(`[SyncManager] Đã xóa kênh (ID: ${channelId}) khỏi danh sách`);
    } catch (err) {
      console.warn('[SyncManager] Lỗi cập nhật sau khi xóa kênh:', err);
    }

    return filtered;
  }

  /**
   * Đặt lại danh sách kênh về mặc định hoặc dọn sạch danh sách kênh
   */
  public async resetChannelList(): Promise<Channel[]> {
    this.currentChannels = ALL_CHANNELS;
    this.notify(ALL_CHANNELS, { state: 'cached', sourceType: 'bundle' });

    try {
      await indexedDBCache.clearAll();
      await indexedDBCache.saveChannels(ALL_CHANNELS);
      console.log('[SyncManager] Đã đặt lại danh sách kênh về gốc');
    } catch (err) {
      console.warn('[SyncManager] Lỗi reset danh sách kênh:', err);
    }

    return ALL_CHANNELS;
  }

  /**
   * Khởi động nhanh (0ms boot) từ IndexedDB L2 / Memory L1,
   * sau đó lập lịch đồng bộ ngầm thích ứng mức ưu tiên thấp.
   */
  public async initStaleWhileRevalidate(customUrl?: string): Promise<Channel[]> {
    const t0 = performance.now();

    // 1. STALE: Instant Hydration from IndexedDB L2
    try {
      const cached = await indexedDBCache.getChannels();
      if (cached && cached.length > 0) {
        const initTime = Math.round(performance.now() - t0);
        const tokenizedChannels = tv360TokenService.applyTokensToChannelList(cached);
        this.notify(tokenizedChannels, {
          state: 'cached',
          sourceType: 'indexeddb',
          parseTimeMs: initTime
        });
        console.log(`[SyncManager] ⚡ 0ms Boot: Đã nạp tức thì ${tokenizedChannels.length} kênh từ IndexedDB (${initTime}ms)`);
      } else {
        // Fallback to static bundled channels
        const tokenizedChannels = tv360TokenService.applyTokensToChannelList(ALL_CHANNELS);
        this.notify(tokenizedChannels, {
          state: 'cached',
          sourceType: 'bundle',
          parseTimeMs: 0
        });
      }
    } catch {
      const tokenizedChannels = tv360TokenService.applyTokensToChannelList(ALL_CHANNELS);
      this.notify(tokenizedChannels, {
        state: 'cached',
        sourceType: 'bundle',
        parseTimeMs: 0
      });
    }

    // Initialize automated token auto-sync from https://tv.vietanhtv.top/sex/
    tv360TokenService.initAutoSync((updatedWithTokens) => {
      this.notify(updatedWithTokens, { sourceType: 'memory' });
    }, () => this.currentChannels);

    // Preload logo status cache to prevent initial broken image requests
    indexedDBCache.preloadLogoCache().catch(() => {});

    // 2. REVALIDATE: Low-priority background sync with 5s timeout
    this.scheduleLowPrioritySync(customUrl || DEFAULT_M3U_URL);

    return this.currentChannels;
  }

  /**
   * Schedule low priority revalidation using requestIdleCallback or setTimeout
   * to avoid stuttering video playback initiation
   */
  private scheduleLowPrioritySync(url: string, delayMs = 1200): void {
    if (typeof window === 'undefined') return;

    const runSync = () => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          this.revalidateFromNetwork(url, false);
        }, { timeout: 3000 });
      } else {
        setTimeout(() => {
          this.revalidateFromNetwork(url, false);
        }, 100);
      }
    };

    setTimeout(runSync, delayMs);
  }

  /**
   * Network Revalidation with 5s AbortController timeout
   */
  public async revalidateFromNetwork(url: string = DEFAULT_M3U_URL, force = false): Promise<boolean> {
    if (this.isSyncing) return false;

    // Check cooldown unless forced or if sports channels are empty
    const now = Date.now();
    const hasSports = this.currentChannels.some((c) => c.category === 'thethaoquocte');
    if (!force && hasSports && this.status.lastSyncTime > 0 && now - this.status.lastSyncTime < SYNC_COOLDOWN_MS) {
      console.log('[SyncManager] Danh sách kênh còn mới, bỏ qua đồng bộ mạng');
      return true;
    }

    this.isSyncing = true;
    this.notify(this.currentChannels, { state: 'syncing' });

    // Strict 5s timeout AbortController
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, SYNC_TIMEOUT_MS);

    try {
      console.log(`[SyncManager] 🔄 Bắt đầu đồng bộ ngầm (Timeout ${SYNC_TIMEOUT_MS / 1000}s) từ: ${url}`);
      
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Accept': 'text/plain, application/x-mpegurl, */*'
        }
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      if (!text || !text.includes('#EXTINF:')) {
        throw new Error('Nội dung M3U không hợp lệ');
      }

      // Single-pass fast parse & merge
      const result = fastParseM3U(text, ALL_CHANNELS);

      if (result.channels.length > 0) {
        // Save to IndexedDB L2 in background
        await indexedDBCache.saveChannels(result.channels);
        
        // Also save playlist entry
        await indexedDBCache.savePlaylist({
          id: 'ht-tv-default',
          name: 'HT-TV Danh sách mặc định',
          url,
          channelCount: result.channels.length,
          lastUpdated: Date.now(),
          parseTimeMs: result.parseTimeMs
        });

        this.notify(result.channels, {
          state: 'synced',
          lastSyncTime: Date.now(),
          sourceType: 'network',
          parseTimeMs: result.parseTimeMs,
          errorMessage: undefined
        });

        console.log(`[SyncManager] ✅ Đồng bộ thành công: ${result.channels.length} kênh, phân tích trong ${result.parseTimeMs}ms`);
        return true;
      }
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        console.warn(`[SyncManager] ⏱️ Đồng bộ mạng quá thời gian ${SYNC_TIMEOUT_MS / 1000}s, bảo toàn luồng phát video trực tiếp.`);
        this.notify(this.currentChannels, {
          state: 'timeout',
          errorMessage: `Ngắt kết nối mạng sau ${SYNC_TIMEOUT_MS / 1000}s để bảo vệ băng thông xem TV`
        });
      } else {
        console.warn('[SyncManager] Lỗi đồng bộ ngầm:', err.message);
        this.notify(this.currentChannels, {
          state: 'error',
          errorMessage: err.message || 'Lỗi kết nối'
        });
      }
    } finally {
      this.isSyncing = false;
    }

    return false;
  }

  /**
   * Import custom M3U text directly (from file upload or pasted URL)
   */
  public async importCustomM3U(name: string, m3uText: string, url?: string): Promise<FastParseResult> {
    const result = fastParseM3U(m3uText, ALL_CHANNELS);
    
    if (result.channels.length > 0) {
      await indexedDBCache.saveChannels(result.channels);
      await indexedDBCache.savePlaylist({
        id: 'playlist-' + Date.now(),
        name,
        url,
        rawText: m3uText,
        channelCount: result.channels.length,
        lastUpdated: Date.now(),
        parseTimeMs: result.parseTimeMs
      });

      this.notify(result.channels, {
        state: 'synced',
        lastSyncTime: Date.now(),
        sourceType: 'network',
        parseTimeMs: result.parseTimeMs,
        errorMessage: undefined
      });
    }

    return result;
  }
}

export const syncManager = new StaleWhileRevalidateSyncManager();
