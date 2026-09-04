/**
 * Multi-tier Persistent Storage Manager (IndexedDB + Memory Cache L1/L2)
 * Bypasses localStorage 5MB limit, eliminates main-thread synchronous blocking,
 * and provides instant 0ms app boot and offline channel access.
 */

import { Channel, StreamSource } from '../types';

const DB_NAME = 'HT_TV_DATABASE_V16';
const DB_VERSION = 1;

export interface StoredPlaylist {
  id: string;
  name: string;
  url?: string;
  rawText?: string;
  channelCount: number;
  lastUpdated: number;
  parseTimeMs?: number;
}

export interface StoredLogoState {
  url: string;
  status: 'valid' | 'broken';
  timestamp: number;
}

class IndexedDBCache {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryChannelCache: Channel[] | null = null;
  private memoryLogoCache: Map<string, 'valid' | 'broken'> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      this.initDB();
    }
  }

  private async initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Object store for parsed channels catalog
          if (!db.objectStoreNames.contains('channels')) {
            const channelStore = db.createObjectStore('channels', { keyPath: 'id' });
            channelStore.createIndex('category', 'category', { unique: false });
            channelStore.createIndex('number', 'number', { unique: false });
          }

          // Object store for M3U playlists metadata and raw text
          if (!db.objectStoreNames.contains('playlists')) {
            db.createObjectStore('playlists', { keyPath: 'id' });
          }

          // Object store for stream health and source caches
          if (!db.objectStoreNames.contains('streamSources')) {
            db.createObjectStore('streamSources', { keyPath: 'url' });
          }

          // Object store for logo validity states
          if (!db.objectStoreNames.contains('logos')) {
            db.createObjectStore('logos', { keyPath: 'url' });
          }

          // Object store for user favorites and settings
          if (!db.objectStoreNames.contains('favorites')) {
            db.createObjectStore('favorites', { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = () => {
          console.warn('[IndexedDB] Failed to open database:', request.error);
          reject(request.error);
        };
      } catch (err) {
        console.warn('[IndexedDB] Exception opening database:', err);
        reject(err);
      }
    });

    return this.dbPromise;
  }

  /**
   * Saves full channel catalog to IndexedDB in a single transaction
   */
  public async saveChannels(channels: Channel[]): Promise<void> {
    this.memoryChannelCache = channels;
    try {
      const db = await this.initDB();
      const tx = db.transaction('channels', 'readwrite');
      const store = tx.objectStore('channels');

      // Clear old channels and insert new ones
      await new Promise<void>((resolve, reject) => {
        const clearReq = store.clear();
        clearReq.onsuccess = () => {
          for (const ch of channels) {
            store.put(ch);
          }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      console.log(`[IndexedDB] Đã lưu ${channels.length} kênh vào bộ nhớ đệm đa tầng`);
    } catch (err) {
      console.warn('[IndexedDB] Lỗi lưu danh sách kênh:', err);
    }
  }

  /**
   * Retrieves channels from L1 (Memory) or L2 (IndexedDB) with 0ms boot speed
   */
  public async getChannels(): Promise<Channel[] | null> {
    if (this.memoryChannelCache && this.memoryChannelCache.length > 0) {
      return this.memoryChannelCache;
    }

    try {
      const db = await this.initDB();
      const tx = db.transaction('channels', 'readonly');
      const store = tx.objectStore('channels');

      const channels = await new Promise<Channel[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });

      if (channels && channels.length > 0) {
        // Sort by channel number
        channels.sort((a, b) => a.number - b.number);
        this.memoryChannelCache = channels;
        return channels;
      }
    } catch (err) {
      console.warn('[IndexedDB] Lỗi đọc kênh từ IndexedDB:', err);
    }

    return null;
  }

  /**
   * Saves a custom playlist to IndexedDB
   */
  public async savePlaylist(playlist: StoredPlaylist): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('playlists', 'readwrite');
      const store = tx.objectStore('playlists');
      await new Promise<void>((resolve, reject) => {
        const req = store.put(playlist);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Lỗi lưu playlist:', err);
    }
  }

  /**
   * Retrieves stored playlists
   */
  public async getAllPlaylists(): Promise<StoredPlaylist[]> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('playlists', 'readonly');
      const store = tx.objectStore('playlists');
      return await new Promise<StoredPlaylist[]>((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return [];
    }
  }

  /**
   * Logo Status Caching (Prevents repeated network spam for 404/broken images)
   */
  public async setLogoStatus(url: string, status: 'valid' | 'broken'): Promise<void> {
    if (!url) return;
    this.memoryLogoCache.set(url, status);

    try {
      const db = await this.initDB();
      const tx = db.transaction('logos', 'readwrite');
      const store = tx.objectStore('logos');
      store.put({ url, status, timestamp: Date.now() });
    } catch {}
  }

  public getLogoStatusSync(url: string): 'valid' | 'broken' | null {
    if (!url) return null;
    return this.memoryLogoCache.get(url) || null;
  }

  public async preloadLogoCache(): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('logos', 'readonly');
      const store = tx.objectStore('logos');
      const items = await new Promise<StoredLogoState[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      for (const item of items) {
        if (item.url && item.status) {
          this.memoryLogoCache.set(item.url, item.status);
        }
      }
    } catch {}
  }

  /**
   * User Favorites management
   */
  public async getFavorites(): Promise<string[]> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('favorites', 'readonly');
      const store = tx.objectStore('favorites');
      const items = await new Promise<{ id: string }[]>((resolve) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
      return items.map((i) => i.id);
    } catch {
      return [];
    }
  }

  public async toggleFavorite(channelId: string, isFav: boolean): Promise<void> {
    try {
      const db = await this.initDB();
      const tx = db.transaction('favorites', 'readwrite');
      const store = tx.objectStore('favorites');
      if (isFav) {
        store.put({ id: channelId, timestamp: Date.now() });
      } else {
        store.delete(channelId);
      }
    } catch {}
  }

  /**
   * Deletes a channel by ID from IndexedDB and memory
   */
  public async deleteChannel(channelId: string): Promise<void> {
    if (!channelId) return;
    if (this.memoryChannelCache) {
      this.memoryChannelCache = this.memoryChannelCache.filter((c) => c.id !== channelId);
    }
    try {
      const db = await this.initDB();
      const tx = db.transaction('channels', 'readwrite');
      const store = tx.objectStore('channels');
      store.delete(channelId);
    } catch (err) {
      console.warn('[IndexedDB] Lỗi xóa kênh khỏi database:', err);
    }
  }

  /**
   * Clear all indexedDB caches
   */
  public async clearAll(): Promise<void> {
    this.memoryChannelCache = null;
    this.memoryLogoCache.clear();
    try {
      const db = await this.initDB();
      const storeNames = ['channels', 'playlists', 'streamSources', 'logos', 'favorites'];
      const tx = db.transaction(storeNames, 'readwrite');
      for (const name of storeNames) {
        tx.objectStore(name).clear();
      }
      console.log('[IndexedDB] Đã dọn sạch toàn bộ bộ nhớ đệm đa tầng');
    } catch {}
  }
}

export const indexedDBCache = new IndexedDBCache();
