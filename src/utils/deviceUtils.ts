/**
 * Device & Orientation Utilities
 * Detects Mobile / Tablet environments, manages Fullscreen, and forces Landscape Orientation
 * (Bypassing device orientation lock via Screen Orientation API & CSS transformation fallback)
 */

import { nativeBridge } from './nativeBridge';

/**
 * Check if current user is on a mobile device or tablet (phone, iPad, Android tablet, WebView, etc.)
 */
export const isMobileOrTablet = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet|Silk/i.test(ua);
  const isIPadOS = /Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1;
  const hasTouch = 'ontouchstart' in window || (navigator.maxTouchPoints || 0) > 0;
  
  // Dimensions check for tablet or mobile screen
  const screenMin = Math.min(window.screen?.width || 9999, window.screen?.height || 9999);
  const innerMin = Math.min(window.innerWidth || 9999, window.innerHeight || 9999);
  const isSmallOrTabletDimension = hasTouch && (screenMin <= 1024 || innerMin <= 1024);

  return isMobileUA || isIPadOS || isSmallOrTabletDimension;
};

/**
 * Check if device viewport is currently in portrait orientation
 */
export const isPortraitOrientation = (): boolean => {
  if (typeof window === 'undefined') return false;

  if (window.screen?.orientation?.type) {
    return window.screen.orientation.type.startsWith('portrait');
  }

  if (typeof (window as any).orientation !== 'undefined') {
    return (window as any).orientation === 0 || (window as any).orientation === 180;
  }

  return window.innerHeight > window.innerWidth;
};

/**
 * Enter device/browser fullscreen mode
 */
export const enterFullscreen = async (
  targetElement?: Element | null,
  videoElement?: HTMLVideoElement | null
): Promise<boolean> => {
  if (typeof document === 'undefined') return false;

  const isAlreadyFullscreen = !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );

  if (isAlreadyFullscreen) return true;

  const el: any = targetElement || document.documentElement;

  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
      return true;
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
      return true;
    } else if (el.mozRequestFullScreen) {
      await el.mozRequestFullScreen();
      return true;
    } else if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
      return true;
    }
  } catch (err) {
    console.warn('[DeviceUtils] Standard requestFullscreen error:', err);
  }

  // iOS Safari fallback: video.webkitEnterFullscreen
  if (videoElement && typeof (videoElement as any).webkitEnterFullscreen === 'function') {
    try {
      (videoElement as any).webkitEnterFullscreen();
      return true;
    } catch (err) {
      console.warn('[DeviceUtils] Video webkitEnterFullscreen error:', err);
    }
  }

  return false;
};

/**
 * Lock screen orientation to landscape, bypassing system orientation lock
 */
export const lockScreenLandscape = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  // 1. Android Native Bridge lock (if inside Android app)
  nativeBridge.lockLandscape();

  let locked = false;
  const scr = window.screen as any;

  // 2. Modern Screen Orientation API (Supported in Chrome Android - overrides device system lock in fullscreen)
  if (scr?.orientation && typeof scr.orientation.lock === 'function') {
    try {
      await scr.orientation.lock('landscape');
      locked = true;
    } catch {
      try {
        await scr.orientation.lock('landscape-primary');
        locked = true;
      } catch (e) {
        // May fail if not in fullscreen or permission denied
      }
    }
  }

  // 3. Vendor prefixed orientation lock
  if (!locked) {
    try {
      if (typeof scr.lockOrientation === 'function') {
        locked = scr.lockOrientation('landscape') || scr.lockOrientation('landscape-primary');
      } else if (typeof scr.mozLockOrientation === 'function') {
        locked = scr.mozLockOrientation('landscape');
      } else if (typeof scr.msLockOrientation === 'function') {
        locked = scr.msLockOrientation('landscape');
      }
    } catch (e) {}
  }

  return locked;
};

/**
 * Perform comprehensive Fullscreen + Landscape rotation for Mobile & Tablet
 */
export const autoFullscreenAndLandscape = async (
  targetElement?: Element | null,
  videoElement?: HTMLVideoElement | null
): Promise<void> => {
  if (!isMobileOrTablet()) return;

  try {
    // Step 1: Request Fullscreen
    await enterFullscreen(targetElement, videoElement);

    // Step 2: Lock orientation to landscape (overrides system lock)
    await lockScreenLandscape();
  } catch (err) {
    console.warn('[DeviceUtils] autoFullscreenAndLandscape error:', err);
  }
};
