/**
 * Screen WakeLock Utility for HT TV
 * Keeps Smart TV / TV Box / Mobile screen awake while watching TV
 */

class ScreenWakeLockManager {
  private sentinel: any = null;
  private isRequested = false;

  public async acquire(): Promise<boolean> {
    this.isRequested = true;
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) {
      return false;
    }

    try {
      if (!this.sentinel || this.sentinel.released) {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          this.sentinel = null;
          // If still intended to be awake, re-acquire when visibility becomes visible
        });
        console.log('[WakeLock] Screen WakeLock acquired successfully');
        return true;
      }
      return true;
    } catch (err) {
      console.warn('[WakeLock] Could not acquire WakeLock:', err);
      return false;
    }
  }

  public release(): void {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        this.sentinel.release();
      } catch {}
      this.sentinel = null;
      console.log('[WakeLock] Screen WakeLock released');
    }
  }

  public initAutoReacquire(): () => void {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && this.isRequested) {
        this.acquire();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // Initial acquire
    this.acquire();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      this.release();
    };
  }
}

export const screenWakeLock = new ScreenWakeLockManager();
