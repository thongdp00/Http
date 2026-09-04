import { Channel, DRMConfig } from '../types';

export interface NativeStreamPayload {
  channelId: string;
  channelName: string;
  url: string;
  type: 'hls' | 'mpd' | 'mp4';
  userAgent?: string;
  drm?: DRMConfig;
  headers?: Record<string, string>;
  isBackup?: boolean;
}

export type NativePlaybackState = 'idle' | 'buffering' | 'ready' | 'ended';

type ErrorListener = (error: string) => void;
type StateListener = (state: NativePlaybackState) => void;

class NativeBridge {
  private errorListeners: Set<ErrorListener> = new Set();
  private stateListeners: Set<StateListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Expose global callback receivers for Android WebView evaluateJavascript
      (window as any).__onNativePlayerError = (errorMessage: string) => {
        console.warn('[NativeBridge] Received error from Android Media3:', errorMessage);
        this.errorListeners.forEach((cb) => cb(errorMessage));
      };

      (window as any).__onNativePlaybackState = (state: NativePlaybackState) => {
        console.log('[NativeBridge] Received state from Android Media3:', state);
        this.stateListeners.forEach((cb) => cb(state));
      };
    }
  }

  /**
   * Check if running inside Android Native WebView containing Media3 JavascriptInterface
   */
  public isNative(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    return !!(w.AndroidBridge || w.AndroidMedia3 || w.AndroidExoPlayer);
  }

  private getInterface(): any {
    if (typeof window === 'undefined') return null;
    const w = window as any;
    return w.AndroidBridge || w.AndroidMedia3 || w.AndroidExoPlayer || null;
  }

  /**
   * Send playback request to Android Native Media3 ExoPlayer
   */
  public play(payload: NativeStreamPayload): boolean {
    const bridge = this.getInterface();
    if (!bridge) return false;

    try {
      const jsonString = JSON.stringify(payload);
      if (typeof bridge.playStream === 'function') {
        bridge.playStream(jsonString);
        return true;
      } else if (typeof bridge.play === 'function') {
        bridge.play(jsonString);
        return true;
      }
    } catch (e) {
      console.error('[NativeBridge] Failed to dispatch play to Native:', e);
    }
    return false;
  }

  /**
   * Send stop request to Android Native Media3
   */
  public stop(): void {
    const bridge = this.getInterface();
    if (bridge && typeof bridge.stop === 'function') {
      try {
        bridge.stop();
      } catch (e) {
        console.error('[NativeBridge] Error calling stop():', e);
      }
    }
  }

  /**
   * Send pause request to Android Native Media3
   */
  public pause(): void {
    const bridge = this.getInterface();
    if (bridge && typeof bridge.pause === 'function') {
      try {
        bridge.pause();
      } catch (e) {
        console.error('[NativeBridge] Error calling pause():', e);
      }
    }
  }

  /**
   * Send resume request to Android Native Media3
   */
  public resume(): void {
    const bridge = this.getInterface();
    if (bridge && typeof bridge.resume === 'function') {
      try {
        bridge.resume();
      } catch (e) {
        console.error('[NativeBridge] Error calling resume():', e);
      }
    }
  }

  /**
   * Send volume change (0.0 -> 1.0)
   */
  public setVolume(volume: number): void {
    const bridge = this.getInterface();
    if (bridge && typeof bridge.setVolume === 'function') {
      try {
        bridge.setVolume(volume);
      } catch (e) {
        console.error('[NativeBridge] Error calling setVolume():', e);
      }
    }
  }

  /**
   * Lock screen to landscape orientation in Android Native Activity
   */
  public lockLandscape(): boolean {
    const bridge = this.getInterface();
    if (!bridge) return false;
    try {
      if (typeof bridge.lockLandscape === 'function') {
        bridge.lockLandscape();
        return true;
      } else if (typeof bridge.setOrientation === 'function') {
        bridge.setOrientation('landscape');
        return true;
      } else if (typeof bridge.setRequestedOrientation === 'function') {
        bridge.setRequestedOrientation(0); // ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE
        return true;
      }
    } catch (e) {
      console.warn('[NativeBridge] Error calling lockLandscape():', e);
    }
    return false;
  }

  /**
   * Unlock or restore screen orientation in Android Native Activity
   */
  public unlockOrientation(): boolean {
    const bridge = this.getInterface();
    if (!bridge) return false;
    try {
      if (typeof bridge.unlockOrientation === 'function') {
        bridge.unlockOrientation();
        return true;
      } else if (typeof bridge.setRequestedOrientation === 'function') {
        bridge.setRequestedOrientation(-1); // ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
        return true;
      }
    } catch (e) {
      console.warn('[NativeBridge] Error calling unlockOrientation():', e);
    }
    return false;
  }

  /**
   * Reset hardware/software video decoders and flush codec buffers in Android Media3 ExoPlayer
   */
  public resetMedia3Decoder(channelId?: string): boolean {
    const bridge = this.getInterface();
    if (!bridge) return false;
    try {
      console.log('[NativeBridge] Resetting Media3 video decoder for channel:', channelId);
      if (typeof bridge.resetDecoder === 'function') {
        bridge.resetDecoder(channelId || '');
        return true;
      } else if (typeof bridge.resetMediaCodec === 'function') {
        bridge.resetMediaCodec();
        return true;
      } else if (typeof bridge.flushDecoder === 'function') {
        bridge.flushDecoder();
        return true;
      } else if (typeof bridge.reset === 'function') {
        bridge.reset();
        return true;
      }
    } catch (e) {
      console.warn('[NativeBridge] Error calling resetDecoder:', e);
    }
    return false;
  }

  /**
   * Clear Media3 ExoPlayer SimpleCache / segment memory buffer
   */
  public clearMedia3Cache(channelId?: string): boolean {
    const bridge = this.getInterface();
    if (!bridge) return false;
    try {
      console.log('[NativeBridge] Purging Media3 ExoPlayer cache');
      if (typeof bridge.clearCache === 'function') {
        bridge.clearCache(channelId || '');
        return true;
      } else if (typeof bridge.clearMediaCache === 'function') {
        bridge.clearMediaCache();
        return true;
      }
    } catch (e) {
      console.warn('[NativeBridge] Error calling clearCache:', e);
    }
    return false;
  }

  /**
   * Re-synchronize Android Media3 ExoPlayer engine pipeline
   */
  public resyncMedia3(payload?: NativeStreamPayload): boolean {
    const bridge = this.getInterface();
    if (!bridge) return false;
    try {
      console.log('[NativeBridge] Re-synchronizing Media3 engine pipeline');
      if (typeof bridge.resync === 'function') {
        bridge.resync(payload ? JSON.stringify(payload) : '');
        return true;
      } else if (typeof bridge.rebindPlayer === 'function') {
        bridge.rebindPlayer();
        return true;
      } else if (payload) {
        return this.play(payload);
      }
    } catch (e) {
      console.warn('[NativeBridge] Error calling resyncMedia3:', e);
    }
    return false;
  }

  /**
   * Subscribe to playback errors from Native player
   */
  public onError(callback: ErrorListener): () => void {
    this.errorListeners.add(callback);
    return () => {
      this.errorListeners.delete(callback);
    };
  }

  /**
   * Subscribe to playback state changes from Native player
   */
  public onStateChange(callback: StateListener): () => void {
    this.stateListeners.add(callback);
    return () => {
      this.stateListeners.delete(callback);
    };
  }
}

export const nativeBridge = new NativeBridge();
