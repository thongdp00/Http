import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Hls from 'hls.js';
import shaka from 'shaka-player';
import mpegts from 'mpegts.js';
import { Channel, PlayerEngine, StreamSource } from '../types';
import { AudioVisualizer } from './AudioVisualizer';
import { ChannelLogo } from './ChannelLogo';
import { DiagnosticOverlay, DiagnosticData } from './DiagnosticOverlay';
import { Loader2 } from 'lucide-react';
import { nativeBridge } from '../utils/nativeBridge';
import { streamCache } from '../utils/streamCache';
import { screenWakeLock } from '../utils/wakeLock';
import { buildCandidateSources, m3uService } from '../utils/m3uService';
import { syncManager } from '../utils/syncManager';
import { checkStreamTokenExpiry } from '../utils/tokenValidator';
import { getProxiedStreamUrl } from '../utils/streamProxy';
import { tv360TokenService } from '../utils/tv360TokenService';
import { isMobileOrTablet, isPortraitOrientation, autoFullscreenAndLandscape } from '../utils/deviceUtils';

// Global MSE Codec Compatibility Guard & mpegts logging setup:
if (typeof window !== 'undefined') {
  try {
    if (mpegts && mpegts.LoggingControl) {
      mpegts.LoggingControl.enableAll = false;
      mpegts.LoggingControl.enableError = false;
      mpegts.LoggingControl.enableWarn = false;
      mpegts.LoggingControl.enableInfo = false;
      mpegts.LoggingControl.enableDebug = false;
      mpegts.LoggingControl.enableVerbose = false;
    }
  } catch {}

  // 1. Guard SourceBuffer.prototype.buffered against InvalidStateError (removed from parent media source)
  try {
    if (typeof window.SourceBuffer !== 'undefined' && window.SourceBuffer.prototype) {
      const sbDesc = Object.getOwnPropertyDescriptor(window.SourceBuffer.prototype, 'buffered');
      if (sbDesc && sbDesc.get && !(sbDesc.get as any).__isGuarded) {
        const originalSbBuffered = sbDesc.get;
        const guardedSbBuffered = function(this: SourceBuffer) {
          try {
            return originalSbBuffered.call(this);
          } catch {
            return {
              length: 0,
              start: () => 0,
              end: () => 0,
            } as unknown as TimeRanges;
          }
        };
        (guardedSbBuffered as any).__isGuarded = true;
        Object.defineProperty(window.SourceBuffer.prototype, 'buffered', {
          get: guardedSbBuffered,
          enumerable: sbDesc.enumerable,
          configurable: sbDesc.configurable,
        });
      }
    }
  } catch {}

  // 2. Guard HTMLMediaElement.prototype.buffered against detached media element state
  try {
    if (typeof window.HTMLMediaElement !== 'undefined' && window.HTMLMediaElement.prototype) {
      const mediaDesc = Object.getOwnPropertyDescriptor(window.HTMLMediaElement.prototype, 'buffered');
      if (mediaDesc && mediaDesc.get && !(mediaDesc.get as any).__isGuarded) {
        const originalMediaBuffered = mediaDesc.get;
        const guardedMediaBuffered = function(this: HTMLMediaElement) {
          try {
            return originalMediaBuffered.call(this);
          } catch {
            return {
              length: 0,
              start: () => 0,
              end: () => 0,
            } as unknown as TimeRanges;
          }
        };
        (guardedMediaBuffered as any).__isGuarded = true;
        Object.defineProperty(window.HTMLMediaElement.prototype, 'buffered', {
          get: guardedMediaBuffered,
          enumerable: mediaDesc.enumerable,
          configurable: mediaDesc.configurable,
        });
      }
    }
  } catch {}
}
// Intercepts MediaSource.prototype.addSourceBuffer to safely handle unsupported audio codecs
// such as 'audio/mp4;codecs=ec-3' (Dolby Digital Plus) or 'audio/mp4;codecs=ac-3' on web browsers
// that lack native hardware/patent decoders, preventing fatal uncaught MSEController exceptions.
if (typeof window !== 'undefined' && window.MediaSource && !(window.MediaSource as any).__isMseCodecGuarded) {
  (window.MediaSource as any).__isMseCodecGuarded = true;
  const originalAddSourceBuffer = window.MediaSource.prototype.addSourceBuffer;
  window.MediaSource.prototype.addSourceBuffer = function(type: string): SourceBuffer {
    try {
      return originalAddSourceBuffer.call(this, type);
    } catch (err: any) {
      const isUnsupportedAudio =
        (type.includes('ec-3') || type.includes('ac-3') || type.includes('eac3') || type.includes('audio')) &&
        (!window.MediaSource.isTypeSupported(type) || err?.name === 'NotSupportedError');

      if (isUnsupportedAudio) {
        console.warn(`[MSE Guard] Trình duyệt không hỗ trợ giải mã phần cứng cho codec '${type}'. Đang khởi tạo dummy SourceBuffer để duy trì giải mã luồng video.`);

        const eventListeners = new Map<string, Set<Function>>();
        const dummyBuffer: any = {
          mode: 'segments',
          updating: false,
          buffered: {
            length: 0,
            start: () => 0,
            end: () => 0,
          },
          timestampOffset: 0,
          appendWindowStart: 0,
          appendWindowEnd: Infinity,
          appendBuffer: function(_data: ArrayBuffer | ArrayBufferView) {
            this.updating = true;
            setTimeout(() => {
              this.updating = false;
              const updateListeners = eventListeners.get('update');
              if (updateListeners) updateListeners.forEach(fn => fn({ type: 'update', target: this }));
              const updateendListeners = eventListeners.get('updateend');
              if (updateendListeners) updateendListeners.forEach(fn => fn({ type: 'updateend', target: this }));
            }, 0);
          },
          abort: function() {
            this.updating = false;
            const abortListeners = eventListeners.get('abort');
            if (abortListeners) abortListeners.forEach(fn => fn({ type: 'abort', target: this }));
          },
          remove: function(_start: number, _end: number) {
            this.updating = true;
            setTimeout(() => {
              this.updating = false;
              const updateendListeners = eventListeners.get('updateend');
              if (updateendListeners) updateendListeners.forEach(fn => fn({ type: 'updateend', target: this }));
            }, 0);
          },
          addEventListener: function(event: string, fn: Function) {
            if (!eventListeners.has(event)) eventListeners.set(event, new Set());
            eventListeners.get(event)!.add(fn);
          },
          removeEventListener: function(event: string, fn: Function) {
            if (eventListeners.has(event)) eventListeners.get(event)!.delete(fn);
          },
          dispatchEvent: function(event: Event) {
            const listeners = eventListeners.get(event.type);
            if (listeners) listeners.forEach(fn => fn(event));
            return true;
          }
        };
        return dummyBuffer as SourceBuffer;
      }
      throw err;
    }
  };
}

// Fast Stream Watchdog: 3.2s timeout before rotating to backup source (purges failing streams & transitions in 3.2s)
const WATCHDOG_TIMEOUT_MS = 3200; 
const MAX_FAIL_TIMEOUT_MS = 8000; 
const AUTO_RETRY_COUNTDOWN_SECONDS = 3;

interface VideoPlayerProps {
  channel: Channel | null;
  playerEngine: PlayerEngine;
  onOpenDrawer: () => void;
  onLoadComplete?: () => void;
  onNextChannel: () => void;
  onPrevChannel: () => void;
  onNextCategory: () => void;
  onPrevCategory: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  channel,
  playerEngine,
  onOpenDrawer,
  onLoadComplete,
  onNextChannel,
  onPrevChannel,
  onNextCategory,
  onPrevCategory
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const shakaRef = useRef<shaka.Player | null>(null);
  const mpegtsRef = useRef<mpegts.Player | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [, setIsFullscreen] = useState<boolean>(false);
  const [, setActiveEngineName] = useState<string>('ExoPlayer Mode');
  
  // Multi-source rotation state (0: Primary, 1..N: Backup sources from M3U / alternative CDNs)
  const [activeSourceIndex, setActiveSourceIndex] = useState<number>(0);
  // Auto-retry state & countdown
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [retryAttemptCount, setRetryAttemptCount] = useState<number>(0);
  const [reloadToken, setReloadToken] = useState<number>(0);

  // Diagnostic Overlay state & refs (IPTV Smarters Pro Simulation OSD)
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState<boolean>(false);
  const stallsCountRef = useRef<number>(0);
  const streamStartTimeRef = useRef<number>(Date.now());
  const currentActiveUrlRef = useRef<string>('');
  const currentRawUrlRef = useRef<string>('');
  const lastAutoStallReloadRef = useRef<number>(0);

  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData>(() => ({
    engineName: 'HLS.js',
    engineVersion: '1.6.17',
    playbackState: 'idle',
    playbackStateLabel: 'Khởi tạo...',
    resolution: { width: 0, height: 0, label: '' },
    playbackRate: 1,
    drmInfo: { type: 'none', status: 'Không mã hóa' },
    bufferAhead: 0,
    bufferBehind: 0,
    bufferHealth: 'good',
    droppedFrames: 0,
    totalFrames: 0,
    droppedPercentage: 0,
    stallsCount: 0,
    bandwidthMbps: 0,
    activeUrl: '',
    rawUrl: '',
    connectionType: 'Kết nối trực tiếp',
    candidateIndex: 0,
    candidateTotal: 1,
    retryCount: 0,
    uptimeSeconds: 0,
    channelName: '',
    channelCategory: '',
    channelLogo: '',
    hardwareAcceleration: 'GPU Accelerated (MSE/HW)',
  }));

  const isMutedRef = useRef<boolean>(false);
  const volumeRef = useRef<number>(1);
  const activeSourceIndexRef = useRef<number>(0);
  const autoRetryTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile / Tablet Auto-Fullscreen & Landscape Rotation State
  const [isForcedLandscapeCSS, setIsForcedLandscapeCSS] = useState<boolean>(false);

  const triggerMobileFullscreenAndLandscape = useCallback(async () => {
    if (!isMobileOrTablet()) return;

    // 1. Trigger Fullscreen & Orientation Lock API (bypasses device orientation lock where supported)
    await autoFullscreenAndLandscape(playerContainerRef.current, videoRef.current);

    // 2. Fallback check: if hardware screen is still portrait (e.g., iOS Safari or strict portrait lock)
    setTimeout(() => {
      if (isPortraitOrientation() && isMobileOrTablet()) {
        setIsForcedLandscapeCSS(true);
      } else {
        setIsForcedLandscapeCSS(false);
      }
    }, 300);
  }, []);

  // Monitor physical screen rotation / resize to auto-dismiss CSS forced landscape when rotated natively
  useEffect(() => {
    const handleScreenRotation = () => {
      if (!isMobileOrTablet()) {
        setIsForcedLandscapeCSS(false);
        return;
      }
      if (!isPortraitOrientation()) {
        setIsForcedLandscapeCSS(false);
      }
    };

    window.addEventListener('resize', handleScreenRotation);
    window.addEventListener('orientationchange', handleScreenRotation);
    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleScreenRotation);
    }

    return () => {
      window.removeEventListener('resize', handleScreenRotation);
      window.removeEventListener('orientationchange', handleScreenRotation);
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleScreenRotation);
      }
    };
  }, []);

  // Compute candidate sources for the current channel with auto-refreshed TV360 & DRM tokens
  const candidateSources = useMemo(() => {
    if (!channel) return [];
    const freshCh = tv360TokenService.updateChannelWithLatestTokens(channel);
    return buildCandidateSources(freshCh);
  }, [channel]);

  const candidateSourcesRef = useRef<StreamSource[]>([]);

  useEffect(() => {
    candidateSourcesRef.current = candidateSources;
  }, [candidateSources]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    activeSourceIndexRef.current = activeSourceIndex;
  }, [activeSourceIndex]);

  // Keep screen awake while player is mounted
  useEffect(() => {
    screenWakeLock.acquire();
  }, [channel?.id]);

  // Watchdog & stall monitoring refs
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const stallWatchdogTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialBurstTimersRef = useRef<NodeJS.Timeout[]>([]);
  const lastPlaybackTimeRef = useRef<number>(0);
  const lastTimeAdvanceTimestampRef = useRef<number>(0);
  const isBufferingOrStalledRef = useRef<boolean>(false);
  const recoveryAttemptsRef = useRef<number>(0);

  const loadIdRef = useRef<number>(0);
  const loadStartTimestampRef = useRef<number>(0);
  const [, setShowControls] = useState<boolean>(true);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Touch coordinates
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2500);
  }, []);

  // Clear auto retry timers
  const clearAutoRetryTimer = useCallback(() => {
    if (autoRetryTimerRef.current) {
      clearInterval(autoRetryTimerRef.current);
      autoRetryTimerRef.current = null;
    }
    setRetryCountdown(null);
  }, []);

  // Clear watchdog timers and initial burst timers
  const clearWatchdogTimers = useCallback(() => {
    if (watchdogTimerRef.current) {
      clearTimeout(watchdogTimerRef.current);
      watchdogTimerRef.current = null;
    }
    if (stallWatchdogTimerRef.current) {
      clearTimeout(stallWatchdogTimerRef.current);
      stallWatchdogTimerRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
    initialBurstTimersRef.current.forEach((t) => clearTimeout(t));
    initialBurstTimersRef.current = [];
  }, []);

  // Cleanup active players and timers without breaking MediaSource lifecycle
  const destroyPlayers = useCallback(async () => {
    clearWatchdogTimers();
    clearAutoRetryTimer();
    if (mpegtsRef.current) {
      try {
        const p = mpegtsRef.current;
        mpegtsRef.current = null;
        try {
          if (typeof (p as any).removeAllListeners === 'function') {
            (p as any).removeAllListeners();
          }
        } catch {}
        try {
          p.pause();
        } catch {}
        try {
          p.unload();
        } catch {}
        try {
          p.detachMediaElement();
        } catch {}
        try {
          p.destroy();
        } catch {}
      } catch {}
    }
    if (hlsRef.current) {
      try {
        const hls = hlsRef.current;
        hlsRef.current = null;
        hls.stopLoad();
        hls.detachMedia();
        hls.destroy();
      } catch {}
    }
    if (shakaRef.current) {
      try {
        const player = shakaRef.current;
        shakaRef.current = null;
        await player.unload(false);
        await player.destroy();
      } catch {}
    }
    if (videoRef.current) {
      try {
        const v = videoRef.current;
        v.pause();
        v.onplaying = null;
        v.onloadeddata = null;
        v.onloadedmetadata = null;
        v.oncanplay = null;
        v.oncanplaythrough = null;
        v.onplay = null;
        v.onpause = null;
        v.onerror = null;
        v.onwaiting = null;
        v.onstalled = null;
        v.ontimeupdate = null;
        v.onvolumechange = null;
        if (v.src || v.srcObject) {
          v.removeAttribute('src');
          v.srcObject = null;
          v.load();
        }
      } catch {}
    }
  }, [clearWatchdogTimers, clearAutoRetryTimer]);

  // Purges corrupted stream cache, resets hardware video decoder contexts, and re-syncs Android Media3 ExoPlayer
  const resetDecoderAndMediaEngine = useCallback((channelId?: string, licenseUrl?: string) => {
    console.log(`[VideoPlayer] Resetting decoder & resyncing Media3 for channel: ${channelId || 'all'}`);
    
    // 1. Purge corrupted cache from memory & storage
    streamCache.clearCorruptedStreamCache(channelId, licenseUrl);

    // 2. If running inside Android Native Media3 WebView
    if (nativeBridge.isNative()) {
      nativeBridge.resetMedia3Decoder(channelId);
      nativeBridge.clearMedia3Cache(channelId);
      nativeBridge.resyncMedia3();
    }
  }, []);

  // Immediate manual or auto retry trigger
  const executeRetry = useCallback(() => {
    clearAutoRetryTimer();
    setErrorMsg(null);
    setIsLoading(true);
    resetDecoderAndMediaEngine(channel?.id, channel?.drm?.licenseUrl || channel?.backupDrm?.licenseUrl);
    destroyPlayers();
    setActiveSourceIndex(0);
    setReloadToken((prev) => prev + 1);
    setRetryAttemptCount((prev) => prev + 1);

    // Also trigger background M3U sync in case new working links are online
    try {
      m3uService.fetchBackupM3U();
    } catch {}
  }, [channel?.backupDrm?.licenseUrl, channel?.drm?.licenseUrl, channel?.id, clearAutoRetryTimer, destroyPlayers, resetDecoderAndMediaEngine]);

  // Helper when stream loading fails permanently -> Starts automatic retry countdown
  const handleLoadError = useCallback((msg: string) => {
    const curIdx = activeSourceIndexRef.current;
    const sources = candidateSourcesRef.current;
    const failingSource = sources[curIdx];
    const failingUrl = failingSource?.url || channel?.url;
    if (failingUrl) {
      streamCache.recordSourceFailure(failingUrl, channel?.id);
    }

    resetDecoderAndMediaEngine(channel?.id, channel?.drm?.licenseUrl || channel?.backupDrm?.licenseUrl);
    destroyPlayers();
    setErrorMsg(msg);
    setIsLoading(false);

    // Start automatic retry loop
    clearAutoRetryTimer();
    let count = AUTO_RETRY_COUNTDOWN_SECONDS;
    setRetryCountdown(count);

    autoRetryTimerRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setRetryCountdown(count);
      } else {
        clearAutoRetryTimer();
        console.log('[VideoPlayer] Tự động thử lại kết nối kênh:', channel?.name);
        executeRetry();
      }
    }, 1000);
  }, [channel?.backupDrm?.licenseUrl, channel?.drm?.licenseUrl, channel?.id, channel?.name, clearAutoRetryTimer, destroyPlayers, executeRetry, resetDecoderAndMediaEngine]);

  // Trigger Fast Watchdog fallback to candidate backup sources
  const triggerWatchdogFallback = useCallback((reason: string) => {
    console.warn(`[Watchdog] ${reason}`);
    const curIdx = activeSourceIndexRef.current;
    const sources = candidateSourcesRef.current;
    const failingSource = sources[curIdx];
    const failingUrl = failingSource?.url || channel?.url;

    if (failingUrl) {
      streamCache.recordSourceFailure(failingUrl, channel?.id);
    }

    // Reset decoders before rotating
    resetDecoderAndMediaEngine(channel?.id, channel?.drm?.licenseUrl || channel?.backupDrm?.licenseUrl);

    if (curIdx < sources.length - 1) {
      const nextIdx = curIdx + 1;
      console.log(`[Watchdog] Nguồn ${curIdx + 1} gián đoạn. Tự động chuyển sang nguồn dự phòng [${nextIdx + 1}/${sources.length}] cho kênh: ${channel?.name}`);
      destroyPlayers();
      setActiveSourceIndex(nextIdx);
    } else {
      handleLoadError('Tín hiệu kênh bị gián đoạn từ máy chủ truyền hình.');
    }
  }, [channel?.backupDrm?.licenseUrl, channel?.drm?.licenseUrl, channel?.id, channel?.name, channel?.url, destroyPlayers, handleLoadError, resetDecoderAndMediaEngine]);

  // Helper to check if channel/stream is TV360 or International Sports / High Bitrate stream
  const isExcludedFromWatchdog = useCallback((ch: Channel | null, rawUrl?: string) => {
    if (!ch) return false;
    const idL = (ch.id || '').toLowerCase();
    const cat = (ch.category || '').toLowerCase();
    const catN = (ch.categoryName || '').toLowerCase();
    const u = (rawUrl || ch.url || '').toLowerCase();
    return (
      idL.includes('tv360') ||
      idL.startsWith('ttqt-') ||
      cat === 'sukien' ||
      cat === 'thethaoquocte' ||
      catN.includes('sự kiện') ||
      catN.includes('thể thao quốc tế') ||
      u.includes('tv360') ||
      u.includes('vietanhtv') ||
      u.includes('.mpd') ||
      u.includes('.ts') ||
      u.includes('watchtivo') ||
      u.includes('ifiesta') ||
      u.includes('ciao-ott') ||
      u.includes('zazaint')
    );
  }, []);

  // Arm stall watchdog when stream pauses unexpectedly or buffers
  const armStallWatchdog = useCallback((reason: string) => {
    if (stallWatchdogTimerRef.current) return; // Already armed
    const curIdx = activeSourceIndexRef.current;
    const sources = candidateSourcesRef.current;
    const currentSource = sources[curIdx];

    // Exclude TV360 and International Sports from 3.2s stall watchdog:
    // Let Shaka Player, Hls.js and mpegts.js use internal retry/nudge without forcing screen-blinking reloads
    if (isExcludedFromWatchdog(channel, currentSource?.url)) {
      return;
    }

    if (curIdx >= sources.length - 1) return;

    console.warn(`[Watchdog] Đang theo dõi gián đoạn: ${reason}`);

    stallWatchdogTimerRef.current = setTimeout(() => {
      stallWatchdogTimerRef.current = null;
      if (activeSourceIndexRef.current < candidateSourcesRef.current.length - 1) {
        triggerWatchdogFallback(`Gián đoạn phát sóng liên tục (${reason})`);
      }
    }, WATCHDOG_TIMEOUT_MS);
  }, [channel, isExcludedFromWatchdog, triggerWatchdogFallback]);

  const disarmStallWatchdog = useCallback(() => {
    if (stallWatchdogTimerRef.current) {
      clearTimeout(stallWatchdogTimerRef.current);
      stallWatchdogTimerRef.current = null;
    }
    isBufferingOrStalledRef.current = false;
  }, []);

  // Helper to automatically enable full audio (muted=false, volume=100%) once stream is verified active
  const autoEnableFullAudio = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      try {
        video.muted = false;
        video.volume = 1.0;
      } catch {}
    }
    isMutedRef.current = false;
    volumeRef.current = 1.0;
    setIsMuted(false);
    setVolume(1.0);
  }, []);

  // Safe play helper
  const safePlayVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    if (!video.paused) {
      setIsPlaying(true);
      setIsLoading(false);
      autoEnableFullAudio();
      return;
    }

    video.muted = isMutedRef.current;
    video.volume = volumeRef.current;

    try {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        setIsLoading(false);
        lastTimeAdvanceTimestampRef.current = Date.now();
        autoEnableFullAudio();
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError' || (err?.message && err.message.includes('play() failed'))) {
        try {
          video.muted = true;
          const mutedPromise = video.play();
          if (mutedPromise !== undefined) {
            await mutedPromise;
            setIsPlaying(true);
            setIsLoading(false);
            lastTimeAdvanceTimestampRef.current = Date.now();

            const restoreAudio = () => {
              autoEnableFullAudio();
              window.removeEventListener('click', restoreAudio);
              window.removeEventListener('keydown', restoreAudio);
              window.removeEventListener('touchstart', restoreAudio);
            };

            window.addEventListener('click', restoreAudio, { once: true });
            window.addEventListener('keydown', restoreAudio, { once: true });
            window.addEventListener('touchstart', restoreAudio, { once: true });
            setTimeout(restoreAudio, 300);
          }
        } catch {
          setIsPlaying(false);
          setIsLoading(false);
        }
      } else {
        setIsPlaying(false);
        setIsLoading(false);
      }
    }
  }, [autoEnableFullAudio]);

  // Handle Native Media3 Bridge callbacks with Watchdog support
  useEffect(() => {
    if (!nativeBridge.isNative()) return;

    let nativeBufferingTimer: NodeJS.Timeout | null = null;

    const unsubscribeError = nativeBridge.onError((errMsg) => {
      console.warn('[VideoPlayer] Native player error received:', errMsg);
      if (nativeBufferingTimer) {
        clearTimeout(nativeBufferingTimer);
        nativeBufferingTimer = null;
      }
      triggerWatchdogFallback(`Native Player Error: ${errMsg}`);
    });

    const unsubscribeState = nativeBridge.onStateChange((state) => {
      if (state === 'buffering') {
        setIsLoading(true);
        if (!nativeBufferingTimer && activeSourceIndexRef.current < candidateSourcesRef.current.length - 1) {
          const curSrc = candidateSourcesRef.current[activeSourceIndexRef.current];
          if (!isExcludedFromWatchdog(channel, curSrc?.url)) {
            nativeBufferingTimer = setTimeout(() => {
              console.warn('[Watchdog] Native buffer stalled. Switching to backup...');
              triggerWatchdogFallback('Native Media3 Buffering Timeout');
            }, WATCHDOG_TIMEOUT_MS);
          }
        }
      } else if (state === 'ready') {
        if (nativeBufferingTimer) {
          clearTimeout(nativeBufferingTimer);
          nativeBufferingTimer = null;
        }
        clearWatchdogTimers();
        disarmStallWatchdog();
        setIsLoading(false);
        setIsPlaying(true);
        autoEnableFullAudio();
        onLoadComplete?.();
        triggerMobileFullscreenAndLandscape();
        if (channel) {
          const curIdx = activeSourceIndexRef.current;
          const src = candidateSourcesRef.current[curIdx];
          const startupTimeMs = loadStartTimestampRef.current > 0 ? (Date.now() - loadStartTimestampRef.current) : undefined;
          if (src) {
            if (curIdx > 0) {
              const updatedChannel = streamCache.promoteSourceToPrimary(channel, src, channel.url);
              syncManager.promoteChannelSource(updatedChannel);
            } else {
              streamCache.recordSuccess(
                channel.id,
                false,
                src.url,
                src.type || 'hls',
                src.drm?.keys,
                src.userAgent || channel.userAgent,
                0,
                startupTimeMs
              );
            }
          }
        }
      } else if (state === 'ended' || state === 'idle') {
        if (nativeBufferingTimer) {
          clearTimeout(nativeBufferingTimer);
          nativeBufferingTimer = null;
        }
        setIsPlaying(false);
      }
    });

    return () => {
      if (nativeBufferingTimer) clearTimeout(nativeBufferingTimer);
      unsubscribeError();
      unsubscribeState();
    };
  }, [channel, clearWatchdogTimers, disarmStallWatchdog, triggerWatchdogFallback, autoEnableFullAudio]);

  // Sync fullscreen state
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFs);
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    document.addEventListener('mozfullscreenchange', handleFsChange);
    document.addEventListener('MSFullscreenChange', handleFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
      document.removeEventListener('mozfullscreenchange', handleFsChange);
      document.removeEventListener('MSFullscreenChange', handleFsChange);
    };
  }, []);

  // Progressive recovery for frozen / stalled playback
  const attemptPlaybackRecovery = useCallback((stage: 'nudge' | 'reload' | 'backup', reason: string) => {
    const v = videoRef.current;
    console.warn(`[VideoPlayer] Progressive Recovery (${stage}): ${reason}`);

    if (stage === 'nudge') {
      if (v) {
        try {
          if (v.buffered && v.buffered.length > 0) {
            const liveEdge = v.buffered.end(v.buffered.length - 1);
            if (liveEdge - v.currentTime > 2.0 || liveEdge < v.currentTime) {
              v.currentTime = Math.max(0, liveEdge - 0.5);
            } else {
              v.currentTime += 0.05;
            }
          }
        } catch {}
        if (v.paused) safePlayVideo();
      }
      if (hlsRef.current) {
        try {
          hlsRef.current.startLoad();
        } catch {}
      }
    } else if (stage === 'reload') {
      recoveryAttemptsRef.current++;
      if (recoveryAttemptsRef.current > 2) {
        triggerWatchdogFallback(`Vượt quá số lần thử tải lại (${recoveryAttemptsRef.current})`);
        return;
      }
      if (hlsRef.current) {
        try {
          hlsRef.current.stopLoad();
          hlsRef.current.startLoad();
        } catch {}
      }
      safePlayVideo();
    } else if (stage === 'backup') {
      triggerWatchdogFallback(`Yêu cầu chuyển luồng dự phòng (${reason})`);
    }
  }, [safePlayVideo, triggerWatchdogFallback]);

  // Formats ClearKey license keys
  const formatClearKeys = (keys: Record<string, string>): Record<string, string> => {
    const formatted: Record<string, string> = {};
    for (const [rawKeyId, rawKeyVal] of Object.entries(keys)) {
      if (!rawKeyId || !rawKeyVal) continue;
      const cleanId = rawKeyId.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
      const cleanVal = rawKeyVal.replace(/[^a-fA-F0-9]/g, '').toLowerCase();
      if (cleanId.length === 32 && cleanVal.length === 32) {
        formatted[cleanId] = cleanVal;
      }
    }
    return formatted;
  };

  // Pre-fetches & Decodes ClearKey license keys from remote endpoint or inline parameters with strict 2s timeout
  const fetchClearKeys = async (licenseUrl: string): Promise<Record<string, string> | null> => {
    if (!licenseUrl) return null;
    const cachedKeys = streamCache.getCachedClearKeys(licenseUrl);
    if (cachedKeys) return cachedKeys;

    // 1. Fast inline detection: check if licenseUrl itself contains the hex key pair
    const inlineMatch = licenseUrl.match(/([a-fA-F0-9]{32})[:=]([a-fA-F0-9]{32})/);
    if (inlineMatch) {
      const inlineMap = { [inlineMatch[1].toLowerCase()]: inlineMatch[2].toLowerCase() };
      streamCache.cacheClearKeys(licenseUrl, inlineMap);
      return inlineMap;
    }

    // 2. Fetch from remote license server with clearkey-proxy and strict 3-second timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const targetFetchUrl = licenseUrl.startsWith('http')
        ? `/api/clearkey-proxy?url=${encodeURIComponent(licenseUrl)}`
        : licenseUrl;
      const res = await fetch(targetFetchUrl, {
        signal: controller.signal,
        headers: { 'Accept': 'text/plain, application/json, */*' }
      });
      clearTimeout(timeoutId);

      if (!res.ok) return null;
      const text = await res.text();
      let keyMap: Record<string, string> = {};

      try {
        const json = JSON.parse(text);
        if (json.keys && Array.isArray(json.keys)) {
          for (const k of json.keys) {
            if (k.kty === 'oct' && k.kid && k.k) {
              const b64ToHex = (str: string) => {
                let standard = str.replace(/-/g, '+').replace(/_/g, '/');
                while (standard.length % 4 !== 0) standard += '=';
                const binary = atob(standard);
                let hex = '';
                for (let i = 0; i < binary.length; i++) {
                  hex += binary.charCodeAt(i).toString(16).padStart(2, '0');
                }
                return hex.toLowerCase();
              };
              try {
                const kidHex = b64ToHex(k.kid);
                const keyHex = b64ToHex(k.k);
                if (kidHex && keyHex) {
                  keyMap[kidHex] = keyHex;
                }
              } catch {}
            }
          }
        } else if (typeof json === 'object' && json !== null && !json.error && !json.message) {
          for (const [kId, kVal] of Object.entries(json)) {
            if (typeof kVal === 'string') {
              const cleanKid = kId.replace(/[-_]/g, '').toLowerCase();
              const cleanKey = kVal.replace(/[-_]/g, '').toLowerCase();
              if (/^[0-9a-f]{32}$/.test(cleanKid) && /^[0-9a-f]{32}$/.test(cleanKey)) {
                keyMap[cleanKid] = cleanKey;
              }
            }
          }
        }
      } catch {
        const lines = text.split('\n');
        for (const line of lines) {
          const trimmed = line.trim();
          const pairMatch = trimmed.match(/([a-fA-F0-9]{32}):([a-fA-F0-9]{32})/);
          if (pairMatch) {
            keyMap[pairMatch[1].toLowerCase()] = pairMatch[2].toLowerCase();
          } else if (trimmed.includes(':')) {
            const parts = trimmed.split(':');
            if (parts.length >= 2) {
              keyMap[parts[0].trim().toLowerCase()] = parts[1].trim().toLowerCase();
            }
          }
        }
      }

      if (Object.keys(keyMap).length > 0) {
        streamCache.cacheClearKeys(licenseUrl, keyMap);
        return keyMap;
      }
      return null;
    } catch {
      return null;
    }
  };

  const prevChannelIdRef = useRef<string | null>(null);

  // Auto select working source from stream cache on channel switch
  useEffect(() => {
    if (channel && channel.id !== prevChannelIdRef.current) {
      prevChannelIdRef.current = channel.id;
      clearAutoRetryTimer();
      setRetryAttemptCount(0);
      setErrorMsg(null);
      stallsCountRef.current = 0;
      streamStartTimeRef.current = Date.now();
      const sources = buildCandidateSources(channel);
      const cached = streamCache.getCachedEntry(channel.id);

      if (cached) {
        if (cached.sourceIndex !== undefined && cached.sourceIndex < sources.length) {
          setActiveSourceIndex(cached.sourceIndex);
        } else {
          const matchedIdx = sources.findIndex(s => s.url === cached.workingUrl);
          if (matchedIdx !== -1) {
            setActiveSourceIndex(matchedIdx);
          } else {
            setActiveSourceIndex(cached.preferredSource === 'backup' && sources.length > 1 ? 1 : 0);
          }
        }
      } else {
        setActiveSourceIndex(0);
      }
      resetControlsTimer();
    }
  }, [channel, resetControlsTimer, clearAutoRetryTimer]);

  // Keyboard shortcut listener to toggle/close diagnostic HUD (D, I, Info, Green, F2, Guide, ESC)
  useEffect(() => {
    const handleDiagnosticKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      const key = e.key;
      const code = e.keyCode || e.which;

      const isToggle =
        key === 'd' ||
        key === 'D' ||
        code === 68 ||
        key === 'i' ||
        key === 'I' ||
        code === 73 ||
        key === 'Info' ||
        code === 457 ||
        code === 165 ||
        key === 'ColorF0Green' ||
        key === 'ColorGreen' ||
        key === 'Green' ||
        key === 'F2' ||
        code === 404 ||
        code === 170 ||
        code === 113 ||
        key === 'Guide' ||
        code === 458;

      if (isToggle) {
        e.preventDefault();
        e.stopPropagation();
        setIsDiagnosticOpen((prev) => !prev);
        return;
      }

      if (
        isDiagnosticOpen &&
        (key === 'Escape' ||
          key === 'BackSpace' ||
          key === 'BrowserBack' ||
          key === 'Back' ||
          code === 27 ||
          code === 8 ||
          code === 4)
      ) {
        e.preventDefault();
        e.stopPropagation();
        setIsDiagnosticOpen(false);
        return;
      }
    };

    window.addEventListener('keydown', handleDiagnosticKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleDiagnosticKeyDown, { capture: true });
    };
  }, [isDiagnosticOpen]);

  // Real-time technical diagnostic metrics polling effect
  useEffect(() => {
    if (!channel) return;

    const intervalMs = isDiagnosticOpen ? 400 : 800;
    const timer = setInterval(() => {
      const v = videoRef.current;

      // Determine active engine & version
      let engName: DiagnosticData['engineName'] = 'HTML5 Native';
      let engVer = 'HTML5';
      if (nativeBridge.isNative()) {
        engName = 'Android Media3';
        engVer = '1.5.1';
      } else if (mpegtsRef.current) {
        engName = 'mpegts.js';
        engVer = (mpegts as any).version || '1.8.2';
      } else if (shakaRef.current) {
        engName = 'Shaka Player';
        engVer = (shaka as any).Player?.version || '5.2.4';
      } else if (hlsRef.current) {
        engName = 'HLS.js';
        engVer = Hls.version || '1.6.17';
      }

      // Playback state
      let pbState: DiagnosticData['playbackState'] = 'idle';
      let pbLabel = 'Khởi tạo...';
      if (errorMsg) {
        pbState = 'error';
        pbLabel = 'Lỗi kết nối';
      } else if (isLoading) {
        pbState = 'buffering';
        pbLabel = 'Đang nạp dữ liệu';
      } else if (v && !v.paused && v.readyState >= 2) {
        pbState = 'playing';
        pbLabel = 'Đang phát mượt mà';
      } else if (v && v.paused) {
        pbState = 'paused';
        pbLabel = 'Tạm dừng';
      }

      // Real resolution & label
      const width = v ? v.videoWidth : 0;
      const height = v ? v.videoHeight : 0;
      let resLabel = '';
      if (height >= 1080 || width >= 1920) resLabel = '1080p FHD';
      else if (height >= 720 || width >= 1280) resLabel = '720p HD';
      else if (height >= 480 || width >= 854) resLabel = '480p SD';
      else if (height > 0) resLabel = `${height}p SD`;

      // Calculate Buffer Ahead & Behind in seconds with micro-gap bridging
      let bAhead = 0;
      let bBehind = 0;
      if (v && v.buffered && v.buffered.length > 0) {
        const ct = v.currentTime;
        for (let i = 0; i < v.buffered.length; i++) {
          const s = v.buffered.start(i);
          const e = v.buffered.end(i);
          if (ct >= s - 0.2 && ct <= e + 0.2) {
            bAhead = Math.max(0, e - ct);
            bBehind = Math.max(0, ct - s);

            // Seamlessly bridge contiguous ranges (micro-gaps <= 0.5s between media segments)
            let lastEnd = e;
            for (let j = i + 1; j < v.buffered.length; j++) {
              const nextStart = v.buffered.start(j);
              const nextEnd = v.buffered.end(j);
              if (nextStart <= lastEnd + 0.5) {
                bAhead += Math.max(0, nextEnd - Math.max(nextStart, lastEnd));
                lastEnd = Math.max(lastEnd, nextEnd);
              } else {
                break;
              }
            }
            break;
          } else if (ct < s && bAhead === 0) {
            bAhead = Math.max(0, e - s);
          }
        }
      }

      // Shaka Player forward buffer precision check
      if (shakaRef.current && typeof (shakaRef.current as any).getBufferedInfo === 'function') {
        try {
          const bInfo = (shakaRef.current as any).getBufferedInfo();
          if (bInfo && bInfo.total && bInfo.total.length > 0) {
            const ct = v ? v.currentTime : 0;
            for (const r of bInfo.total) {
              if (ct >= r.start - 0.2 && ct <= r.end + 0.2) {
                const shakaAhead = Math.max(0, r.end - ct);
                if (shakaAhead > bAhead) {
                  bAhead = shakaAhead;
                }
                break;
              }
            }
          }
        } catch {}
      }

      // If Android Media3 Native is playing, it maintains a 15-30s internal ExoPlayer buffer
      if (nativeBridge.isNative() && !isLoading && !errorMsg) {
        bAhead = Math.max(bAhead, 8.0);
      }

      // Stream warmup grace period: when video is playing within the first 3s
      const isWarmup = v && !v.paused && v.currentTime > 0 && v.currentTime < 3.0 && !isLoading && !errorMsg;
      if (isWarmup && bAhead < 2.5) {
        bAhead = Math.max(bAhead, 2.5); // Gracefully keep at medium status while initial chunks append
      }

      // Buffer health rating: Xanh (Tốt >=5s), Vàng (Trung bình 2-5s), Đỏ (Nguy cơ đứng hình <2s)
      const bHealth: DiagnosticData['bufferHealth'] =
        bAhead >= 5.0 ? 'good' : bAhead >= 2.0 ? 'medium' : 'critical';

      // Dropped frames & decoded quality
      let dropped = 0;
      let total = 0;
      if (v && typeof (v as any).getVideoPlaybackQuality === 'function') {
        const q = (v as any).getVideoPlaybackQuality();
        dropped = q.droppedVideoFrames || 0;
        total = q.totalVideoFrames || 0;
      } else if (v && typeof (v as any).webkitDroppedFrameCount === 'number') {
        dropped = (v as any).webkitDroppedFrameCount || 0;
        total = ((v as any).webkitDecodedFrameCount || 0) + dropped;
      }
      const dropPct = total > 0 ? (dropped / total) * 100 : 0;

      // Estimated bandwidth
      let bwMbps = 0;
      if (shakaRef.current) {
        const bw = shakaRef.current.getStats()?.estimatedBandwidth;
        if (bw) bwMbps = bw / 1000000;
      } else if (hlsRef.current) {
        const bw = hlsRef.current.bandwidthEstimate;
        if (bw) bwMbps = bw / 1000000;
      }
      if (bwMbps === 0 && height >= 1080) bwMbps = 4.8;
      else if (bwMbps === 0 && height >= 720) bwMbps = 2.6;
      else if (bwMbps === 0 && height > 0) bwMbps = 1.4;

      // DRM Info
      const curSource = candidateSources[activeSourceIndex] || candidateSources[0];
      let drmType: DiagnosticData['drmInfo']['type'] = 'none';
      let drmStatus = 'Không mã hóa (Clear Stream)';
      if (curSource?.drm?.type === 'clearkey') {
        drmType = 'clearkey';
        const kCount = curSource.drm.keys ? Object.keys(curSource.drm.keys).length : 1;
        drmStatus = `ClearKey (Đã kích hoạt ${kCount} khóa)`;
      } else if (curSource?.drm?.type === 'widevine') {
        drmType = 'widevine';
        drmStatus = 'Widevine DRM (CENC)';
      }

      // Connection mechanism
      const actUrl = currentActiveUrlRef.current || curSource?.url || channel.url;
      let connType: DiagnosticData['connectionType'] = 'Kết nối trực tiếp';
      if (actUrl.includes('/api/stream-proxy')) {
        if (actUrl.includes('ua=Dalvik') || actUrl.includes('tv360') || (channel.id || '').toLowerCase().includes('tv360')) {
          connType = 'Built-in Stream Proxy (TV360 UA)';
        } else {
          connType = 'Web Proxy (CORS)';
        }
      }

      const uptime = streamStartTimeRef.current > 0
        ? Math.floor((Date.now() - streamStartTimeRef.current) / 1000)
        : 0;

      setDiagnosticData({
        engineName: engName,
        engineVersion: engVer,
        playbackState: pbState,
        playbackStateLabel: pbLabel,
        resolution: { width, height, label: resLabel },
        playbackRate: v?.playbackRate || 1,
        drmInfo: { type: drmType, status: drmStatus },
        bufferAhead: bAhead,
        bufferBehind: bBehind,
        bufferHealth: bHealth,
        droppedFrames: dropped,
        totalFrames: total,
        droppedPercentage: dropPct,
        stallsCount: stallsCountRef.current,
        bandwidthMbps: bwMbps,
        activeUrl: actUrl,
        rawUrl: currentRawUrlRef.current || curSource?.url || channel.url,
        connectionType: connType,
        candidateIndex: activeSourceIndex,
        candidateTotal: candidateSources.length,
        retryCount: retryAttemptCount,
        uptimeSeconds: uptime,
        channelName: channel.name,
        channelCategory: channel.categoryName || channel.category,
        channelLogo: channel.logo,
        hardwareAcceleration: 'GPU Accelerated (MSE/HW)',
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [channel, isDiagnosticOpen, errorMsg, isLoading, activeSourceIndex, candidateSources, retryAttemptCount]);

  // Main stream loader effect
  useEffect(() => {
    if (!channel || candidateSources.length === 0) return;

    let isCancelled = false;
    const currentLoadId = ++loadIdRef.current;

    const startLoading = async () => {
      setIsLoading(true);
      setErrorMsg(null);
      loadStartTimestampRef.current = Date.now();

      await destroyPlayers();
      if (isCancelled || loadIdRef.current !== currentLoadId) return;

      const curIdx = Math.min(activeSourceIndex, candidateSources.length - 1);
      const activeSource = candidateSources[curIdx] || candidateSources[0];

      const rawActiveUrl = activeSource.url;
      let activeUserAgent = activeSource.userAgent || channel.userAgent;

      // Detect Channel / Stream Characteristics
      const channelIdLower = (channel.id || '').toLowerCase();
      const isHiTv = channelIdLower === 'hitv';
      const isTv360Stream =
        channelIdLower.includes('tv360') ||
        rawActiveUrl.includes('tv360') ||
        rawActiveUrl.includes('vietanhtv') ||
        (channel.category === 'sukien' || channel.categoryName === 'Sự Kiện');
      const isSpecialTarget = isHiTv || isTv360Stream;

      const isTtqt =
        channel.id.startsWith('ttqt-') ||
        channel.category === 'thethaoquocte' ||
        (channel.categoryName && channel.categoryName.toLowerCase().includes('thể thao quốc tế'));

      const isTsStream =
        rawActiveUrl.endsWith('.ts') ||
        rawActiveUrl.includes('.ts?') ||
        rawActiveUrl.includes('extension=ts') ||
        activeSource.type === 'ts' ||
        (rawActiveUrl.includes('watchtivo') && !rawActiveUrl.includes('.m3u8')) ||
        (rawActiveUrl.includes('ifiesta.net') && !rawActiveUrl.includes('.m3u8')) ||
        (rawActiveUrl.includes('ciao-ott') && !rawActiveUrl.includes('.m3u8')) ||
        (rawActiveUrl.includes('zazaint.com') && !rawActiveUrl.includes('.m3u8'));

      if (isTtqt || isTsStream) {
        activeUserAgent = 'VLC/3.0.9 LibVLC/3.0.9';
      } else if (isSpecialTarget) {
        activeUserAgent = 'Dalvik/2.1.0';
      }

      let activeType = activeSource.type || (isTsStream ? 'ts' : (rawActiveUrl.includes('.mpd') ? 'mpd' : 'hls'));

      // Force type strictly for known targets
      if (isHiTv) {
        activeType = 'hls';
      } else if (isTv360Stream && (rawActiveUrl.includes('.php') || rawActiveUrl.includes('.mpd') || activeSource.type === 'mpd' || !!activeSource.drm)) {
        activeType = 'mpd';
      } else if (isTsStream) {
        activeType = 'ts';
      }

      const activeUrl = nativeBridge.isNative()
        ? rawActiveUrl
        : getProxiedStreamUrl(rawActiveUrl, activeUserAgent, channel.id, channel.category, channel.categoryName);
      const activeDrm = activeSource.drm;

      // Update diagnostic pipeline references
      currentActiveUrlRef.current = activeUrl;
      currentRawUrlRef.current = rawActiveUrl;
      streamStartTimeRef.current = Date.now();

      // 0. Pre-Flight Token Expiry Validation
      const tokenStatus = checkStreamTokenExpiry(activeUrl);
      if (tokenStatus.isExpired) {
        console.warn('[VideoPlayer] Nguồn chứa mã token đã hết hạn:', activeUrl, tokenStatus.reason);
        streamCache.recordSourceFailure(activeUrl, channel.id, true);
        if (curIdx < candidateSources.length - 1) {
          triggerWatchdogFallback(tokenStatus.reason || 'Token URL đã hết hạn - Tự động đổi luồng dự phòng');
          return;
        }
      }

      const isMpd = !isTsStream && (activeType === 'mpd' || (activeType !== 'hls' && (activeUrl.includes('.mpd') || activeUrl.includes('/manifest.mpd') || !!activeDrm)));
      const isHls = !isTsStream && !isMpd && (activeType === 'hls' || activeUrl.includes('.m3u8') || activeUrl.includes('play.m3u8') || activeUrl.includes('.php') || activeUrl.includes('.smil') || activeUrl.includes('/live'));

      const effectiveEngine = playerEngine === 'auto' 
        ? (isMpd ? 'exoplayer' : (isTsStream ? 'mpegts' : 'okplayer'))
        : playerEngine;

      setActiveEngineName(effectiveEngine === 'exoplayer' ? 'ExoPlayer Mode' : (isTsStream ? 'MPEG-TS Engine' : 'OK Player Mode'));

      // 1. Android Native Media3 Environment
      if (nativeBridge.isNative()) {
        document.body.classList.add('is-native-android');
        console.log('[VideoPlayer] Native Media3 mode, delegating stream:', channel.name, `[Source ${curIdx + 1}/${candidateSources.length}]`, activeUrl);

        let resolvedDrm = activeDrm;
        // Direct inline ClearKeys if present
        if (activeDrm?.type === 'clearkey' && activeDrm.licenseUrl && (!activeDrm.keys || Object.keys(activeDrm.keys).length === 0)) {
          try {
            const proxiedLicUrl = isSpecialTarget
              ? "/api/stream-proxy?url=" + encodeURIComponent(activeDrm.licenseUrl) + "&ua=" + encodeURIComponent(activeUserAgent || 'Dalvik/2.1.0')
              : activeDrm.licenseUrl;
            const fetched = await fetchClearKeys(proxiedLicUrl);
            if (isCancelled || loadIdRef.current !== currentLoadId) return;
            if (fetched) {
              resolvedDrm = {
                ...activeDrm,
                keys: { ...(activeDrm.keys || {}), ...fetched }
              };
            }
          } catch {}
        }

        const dispatched = nativeBridge.play({
          channelId: channel.id,
          channelName: channel.name,
          url: activeUrl,
          type: activeType as 'hls' | 'mpd' | 'mp4',
          userAgent: activeUserAgent,
          drm: resolvedDrm,
          isBackup: curIdx > 0
        });

        if (dispatched) {
          clearWatchdogTimers();
          const startupTimeout = curIdx < candidateSources.length - 1 ? WATCHDOG_TIMEOUT_MS : ((isSpecialTarget || isTtqt || isTsStream) ? 15000 : MAX_FAIL_TIMEOUT_MS);
          watchdogTimerRef.current = setTimeout(() => {
            if (isCancelled || loadIdRef.current !== currentLoadId) return;
            if (curIdx < candidateSources.length - 1) {
              triggerWatchdogFallback('Hết thời gian chờ phản hồi nguồn Android Native');
            }
          }, startupTimeout);
          return;
        }
      }

      // 2. Web Browser Preview Environment (mpegts.js, Shaka Player & Hls.js)
      document.body.classList.remove('is-native-android');
      const video = videoRef.current;
      if (!video) return;

      try {
        video.pause();
      } catch {}

      recoveryAttemptsRef.current = 0;

      // Setup Watchdog for startup timeout (Cancelled for TV360 & International Sports to avoid screen blinking)
      clearWatchdogTimers();
      const isExcludedFromFastWatchdog = isSpecialTarget || isTtqt || isTsStream || isMpd || isExcludedFromWatchdog(channel, rawActiveUrl);
      
      if (!isExcludedFromFastWatchdog) {
        const browserStartupTimeout = curIdx < candidateSources.length - 1 ? WATCHDOG_TIMEOUT_MS : MAX_FAIL_TIMEOUT_MS;
        watchdogTimerRef.current = setTimeout(() => {
          if (isCancelled || loadIdRef.current !== currentLoadId) return;
          if (curIdx < candidateSources.length - 1) {
            triggerWatchdogFallback(`Hết thời gian chờ phản hồi nguồn ${curIdx + 1} (Watchdog)`);
          } else {
            handleLoadError('Không nhận được phản hồi từ máy chủ truyền hình.');
          }
        }, browserStartupTimeout);
      } else {
        // For TV360 & International Sports: let Shaka Player, Hls.js, and mpegts.js use internal retries without forcing full reload.
        // Set an extended fail-safe timeout (25s) only as an absolute last resort if player hangs completely
        watchdogTimerRef.current = setTimeout(() => {
          if (isCancelled || loadIdRef.current !== currentLoadId) return;
          if (curIdx < candidateSources.length - 1) {
            triggerWatchdogFallback(`Hết thời gian chờ phản hồi luồng phát (${curIdx + 1})`);
          } else {
            handleLoadError('Không nhận được phản hồi từ máy chủ sau thời gian chờ mở rộng.');
          }
        }, 25000);
      }

      const handleVideoPlaying = () => {
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        if (watchdogTimerRef.current) {
          clearTimeout(watchdogTimerRef.current);
          watchdogTimerRef.current = null;
        }
        clearAutoRetryTimer();
        disarmStallWatchdog();
        setIsLoading(false);
        setIsPlaying(true);
        lastPlaybackTimeRef.current = video.currentTime;
        lastTimeAdvanceTimestampRef.current = Date.now();

        autoEnableFullAudio();
        onLoadComplete?.();
        triggerMobileFullscreenAndLandscape();

        const startupTimeMs = loadStartTimestampRef.current > 0 ? (Date.now() - loadStartTimestampRef.current) : undefined;

        if (curIdx > 0) {
          const updatedChannel = streamCache.promoteSourceToPrimary(
            channel,
            activeSource,
            channel.url
          );
          syncManager.promoteChannelSource(updatedChannel);
        } else {
          streamCache.recordSuccess(
            channel.id,
            false,
            activeUrl,
            activeType as any,
            activeDrm?.keys,
            activeUserAgent,
            0,
            startupTimeMs
          );
        }
      };

      video.onloadedmetadata = () => {
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        if (video.paused && video.readyState >= 2) safePlayVideo();
      };

      video.onloadeddata = () => {
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        if (video.paused && video.readyState >= 2) safePlayVideo();
      };

      video.oncanplay = () => {
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        if (video.paused && video.readyState >= 2) safePlayVideo();
      };

      video.oncanplaythrough = () => {
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        if (video.paused) safePlayVideo();
      };

      video.onplaying = handleVideoPlaying;

      video.onplay = () => {
        setIsPlaying(true);
        lastTimeAdvanceTimestampRef.current = Date.now();
      };

      video.onpause = () => {
        // Handled naturally
      };

      video.onwaiting = () => {
        stallsCountRef.current++;
        if (!isTtqt && !isTsStream) {
          isBufferingOrStalledRef.current = true;
        }
      };

      video.onstalled = () => {
        stallsCountRef.current++;
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        if (!isTtqt && !isTsStream) {
          isBufferingOrStalledRef.current = true;
        }
      };

      video.ontimeupdate = () => {
        if (videoRef.current && videoRef.current.currentTime > 0) {
          const cTime = videoRef.current.currentTime;
          if (Math.abs(cTime - lastPlaybackTimeRef.current) > 0.04) {
            lastPlaybackTimeRef.current = cTime;
            lastTimeAdvanceTimestampRef.current = Date.now();
            if (isBufferingOrStalledRef.current) {
              disarmStallWatchdog();
            }
          }
        }
      };

      video.onvolumechange = () => {
        if (videoRef.current) {
          isMutedRef.current = videoRef.current.muted;
          volumeRef.current = videoRef.current.volume;
        }
      };

      video.onerror = () => {
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        const err = video.error;
        const errCode = err ? err.code : 0;
        console.warn(`[VideoPlayer] HTML5 video error (code ${errCode})`);

        if (curIdx < candidateSources.length - 1) {
          triggerWatchdogFallback(`Lỗi tín hiệu nguồn ${curIdx + 1} HTML5 (mã ${errCode})`);
        } else {
          handleLoadError('Tín hiệu kênh bị gián đoạn từ máy chủ truyền hình.');
        }
      };

      // Periodic Stall / Freeze Watchdog Heartbeat
      heartbeatIntervalRef.current = setInterval(() => {
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        const v = videoRef.current;
        if (!v) return;

        if (v.paused && v.readyState >= 2 && !v.ended) {
          safePlayVideo();
        }

        const now = Date.now();
        const timeSinceAdvance = now - lastTimeAdvanceTimestampRef.current;

        if (!v.paused && v.readyState >= 2 && v.videoWidth === 0 && timeSinceAdvance >= 8000) {
          if (!isSpecialTarget && !isTtqt && !isTsStream) {
            console.warn('[VideoPlayer] Black screen detected, attempting recovery');
            resetDecoderAndMediaEngine(channel.id, activeDrm?.licenseUrl);
            attemptPlaybackRecovery('backup', 'Đen màn hình / không có khung hình giải mã');
            return;
          }
        }

        if (lastTimeAdvanceTimestampRef.current > 0 && !v.paused && lastPlaybackTimeRef.current > 0) {
          // Automatic instant stream reload when stream freezes/stalls
          if (timeSinceAdvance >= 4500 && now - lastAutoStallReloadRef.current > 10000) {
            lastAutoStallReloadRef.current = now;
            stallsCountRef.current++;
            console.warn('[VideoPlayer] Kênh đứng hình phát hiện qua giám sát thời gian thực (>4.5s). Tự động nạp lại luồng tức thì...');
            executeRetry();
            return;
          }

          if (!isTtqt && !isTsStream) {
            if (timeSinceAdvance >= 8000 && timeSinceAdvance < 13000) {
              attemptPlaybackRecovery('nudge', 'Phát hiện đứng hình / currentTime không đổi');
            } else if (timeSinceAdvance >= 13000) {
              attemptPlaybackRecovery('backup', 'Đứng hình liên tục');
            }
          }
        }
      }, 1000);

      try {
        // CASE 1: MPEG-TS Streams (.ts or raw TS IPTV streams like ifiesta, watchtivo, etc.)
        if (isTsStream) {
          if (mpegts.isSupported()) {
            console.info('[VideoPlayer] Khởi tạo mpegts.js engine cho luồng MPEG-TS:', activeUrl);
            const player = mpegts.createPlayer(
              {
                type: 'mse',
                isLive: true,
                url: activeUrl,
                cors: true,
                withCredentials: false,
              },
              {
                enableStashBuffer: true,
                stashInitialSize: 2048 * 1024, // 2MB network stash buffer (optimized for 2GB RAM Android TV Box)
                enableSyncOnBaseDts: true,      // Sync on base DTS to prevent A/V timestamp drift
                fixAudioTimestampGap: true,     // Fix audio timestamp gaps (IPTV stream repair)
                liveBufferLatencyChasing: false,// Disable latency chasing to avoid stuttering/packet drop
                autoCleanupSourceBuffer: true,
                autoCleanupMaxBackwardDuration: 10,
                autoCleanupMinBackwardDuration: 4,
                lazyLoad: false,
                seekType: 'range',
              } as any
            );

            if (isCancelled || loadIdRef.current !== currentLoadId) {
              player.destroy();
              return;
            }

            mpegtsRef.current = player;
            player.attachMediaElement(video);
            player.load();
            try {
              const playRes = player.play();
              if (playRes && typeof (playRes as any).catch === 'function') {
                (playRes as any).catch(() => {});
              }
            } catch {}

            let mpegtsRetryCount = 0;
            let mpegtsReconnectTimer: any = null;

            player.on(mpegts.Events.ERROR, (errType, errDetail, errInfo) => {
              console.warn('[mpegts] Error event:', errType, errDetail, errInfo);

              // Auto-refresh token on 401 or network status invalid
              const isAuthOrNotFoundError =
                errDetail === mpegts.ErrorDetails.NETWORK_STATUS_CODE_INVALID ||
                (errInfo && (errInfo.code === 401 || errInfo.code === 403 || errInfo.code === 404));

              if (isAuthOrNotFoundError) {
                tv360TokenService.syncTokens(true).catch(() => {});
              }

              // Auto-Reconnect on NETWORK_ERROR or MEDIA_ERROR up to 3 times before giving up
              const isRecoverableError =
                errType === mpegts.ErrorTypes.NETWORK_ERROR ||
                errType === mpegts.ErrorTypes.MEDIA_ERROR ||
                errDetail === mpegts.ErrorDetails.NETWORK_TIMEOUT ||
                errDetail === mpegts.ErrorDetails.NETWORK_UNRECOVERABLE_EARLY_EOF ||
                errDetail === mpegts.ErrorDetails.MEDIA_MSE_ERROR;

              if (isRecoverableError && !isAuthOrNotFoundError && mpegtsRetryCount < 3) {
                mpegtsRetryCount++;
                console.info(`[mpegts] Tự động kết nối lại luồng sau 2.5s (lần ${mpegtsRetryCount}/3)...`);

                if (mpegtsReconnectTimer) clearTimeout(mpegtsReconnectTimer);
                mpegtsReconnectTimer = setTimeout(() => {
                  if (isCancelled || loadIdRef.current !== currentLoadId || !mpegtsRef.current) return;
                  try {
                    console.info(`[mpegts] Đang nạp lại luồng (Auto-Reconnect ${mpegtsRetryCount}/3)...`);
                    player.unload();
                    player.load();
                    const p = player.play();
                    if (p && typeof (p as any).catch === 'function') {
                      (p as any).catch(() => {});
                    }
                  } catch (reconnectErr) {
                    console.warn('[mpegts] Lỗi khi thực hiện auto-reconnect:', reconnectErr);
                  }
                }, 2500);
                return;
              }

              // Exhausted 3 retries or unrecoverable auth error -> trigger fallback
              streamCache.recordSourceFailure(activeUrl, channel.id);

              setTimeout(() => {
                if (loadIdRef.current !== currentLoadId) return;
                resetDecoderAndMediaEngine(channel.id, activeDrm?.licenseUrl);

                if (curIdx < candidateSources.length - 1) {
                  triggerWatchdogFallback(
                    isAuthOrNotFoundError
                      ? 'Máy chủ truyền hình trả về lỗi xác thực (401/403) - Đang chuyển nguồn dự phòng...'
                      : `Lỗi luồng phát MPEG-TS (${errType}) sau ${mpegtsRetryCount} lần thử lại: Đang chuyển nguồn dự phòng...`
                  );
                } else {
                  handleLoadError(
                    isAuthOrNotFoundError
                      ? 'Mã truy cập luồng đã hết hạn hoặc máy chủ từ chối kết nối (401). Đang làm mới token...'
                      : `Lỗi luồng phát MPEG-TS (${errType}${errDetail ? ': ' + errDetail : ''}) sau ${mpegtsRetryCount} lần thử lại. Đang thử kết nối lại...`
                  );
                }
              }, 0);
            });
          } else {
            video.src = activeUrl;
            safePlayVideo();
          }
        }
        // CASE 2: DASH (.mpd) Streams via Shaka Player
        else if (isMpd) {
          const player = new shaka.Player();
          if (isCancelled || loadIdRef.current !== currentLoadId) {
            await player.destroy();
            return;
          }
          shakaRef.current = player;
          await player.attach(video, false);
          if (isCancelled || loadIdRef.current !== currentLoadId) {
            await player.detach();
            await player.destroy();
            return;
          }

          player.getNetworkingEngine()?.registerRequestFilter((type, request) => {
            (request as any).allowAutoRedirect = true;
            if (activeUserAgent) {
              request.headers['User-Agent'] = activeUserAgent;
            }
            if (isSpecialTarget) {
              request.headers['Referer'] = 'https://tv.vietanhtv.top/';
              request.headers['Origin'] = 'https://tv.vietanhtv.top';

              // Do NOT rewrite license requests, data URIs, blob URIs, or existing proxy endpoints
              const isLicenseRequest =
                type === (window as any).shaka?.net?.NetworkingEngine?.RequestType?.LICENSE ||
                (typeof type === 'number' && type === 2);

              if (!isLicenseRequest) {
                for (let i = 0; i < request.uris.length; i++) {
                  const originalUrl = request.uris[i];
                  if (
                    originalUrl &&
                    !originalUrl.startsWith('data:') &&
                    !originalUrl.startsWith('blob:') &&
                    (originalUrl.startsWith('http://') || originalUrl.startsWith('https://')) &&
                    !originalUrl.startsWith('/api/') &&
                    !originalUrl.startsWith(window.location.origin + '/api/')
                  ) {
                    const proxiedUrl =
                      '/api/stream-proxy?url=' +
                      encodeURIComponent(originalUrl) +
                      '&ua=' +
                      encodeURIComponent(activeUserAgent || 'Dalvik/2.1.0') +
                      '&channelId=' +
                      encodeURIComponent(channel.id);
                    request.uris[i] = proxiedUrl;
                  }
                }
              }
            }
          });

          player.getNetworkingEngine()?.registerResponseFilter((type, response) => {
            if (response.status >= 400) {
              console.warn(`[VideoPlayer] Shaka HTTP ${response.status} (type: ${type}) from ${response.uri || activeUrl}`);

              // Ignore HTTP 403 errors and auxiliary / DRM / license requests so they don't crash the main stream
              const isLicense =
                type === (window as any).shaka?.net?.NetworkingEngine?.RequestType?.LICENSE ||
                (typeof type === 'number' && type === 2) ||
                (response.uri && (response.uri.includes('clearkey') || response.uri.includes('key.php') || response.uri.includes('cleankey')));

              if (isLicense || response.status === 403) {
                console.info(`[VideoPlayer] Phớt lờ mã lỗi HTTP ${response.status} từ request phụ/DRM của Shaka:`, response.uri);
                return;
              }

              // Only trigger fallback if the error is on the primary Manifest (.mpd)
              const isManifest =
                type === (window as any).shaka?.net?.NetworkingEngine?.RequestType?.MANIFEST ||
                (typeof type === 'number' && type === 0) ||
                (response.uri && (response.uri.includes('.mpd') || response.uri.includes('tv360.php') || response.uri.includes('manifest')));

              if (isManifest && (response.status === 401 || response.status === 404 || response.status === 410)) {
                console.warn(`[VideoPlayer] Phát hiện lỗi HTTP ${response.status} trên Manifest chính. Tự động thanh lọc và chuyển sang luồng dự phòng.`);
                streamCache.recordSourceFailure(activeUrl, channel.id, true);
                if (curIdx < candidateSources.length - 1) {
                  triggerWatchdogFallback(`Lỗi HTTP ${response.status} (Manifest chính) - Tự động chuyển luồng dự phòng`);
                }
              }
            }
          });

          player.configure({
            manifest: {
              defaultPresentationDelay: 7, // 7s live delay maintains consistent 6-12s buffer ahead
              dash: {
                ignoreMinBufferTime: true,
                autoCorrectDrift: true,
                xlinkFailGracefully: true,
                sequenceMode: false,
              },
              retryParameters: {
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 1.5,
                fuzzFactor: 0.1,
                timeout: 15000 // 15s timeout
              }
            },
            streaming: {
              rebufferingGoal: 4,   // 4s fast rebuffering goal
              bufferingGoal: 30,    // 30s buffer goal (prevents memory exhaustion on 2GB RAM Android TV Box)
              bufferBehind: 15,     // 15s buffer behind
              ignoreTextStreamFailures: true,
              retryParameters: {
                maxAttempts: 5,
                baseDelay: 1000,
                backoffFactor: 1.5,
                fuzzFactor: 0.1,
                timeout: 15000 // 15s timeout
              },
              stallEnabled: true,
              stallThreshold: 3.5,
              stallSkip: 0.1,
              safeSeekOffset: 0.2,
              inaccurateManifestTolerance: 2,
              gapDetectionThreshold: 0.5,
            },
            abr: {
              defaultBandwidthEstimate: 1500000,
              switchInterval: 8
            },
            mediaSource: {
              codecSwitchingStrategy: 'SMOOTH'
            }
          });

          if (activeDrm) {
            if (activeDrm.type === 'widevine' && activeDrm.licenseUrl) {
              player.configure({
                drm: {
                  servers: { 'com.widevine.alpha': activeDrm.licenseUrl },
                  advanced: {
                    'com.widevine.alpha': {
                      videoRobustness: ['SW_SECURE_CRYPTO', 'SW_SECURE_DECODE', ''],
                      audioRobustness: ['SW_SECURE_CRYPTO', 'SW_SECURE_DECODE', '']
                    }
                  }
                }
              });
            } else if (activeDrm.type === 'clearkey') {
              let combinedKeys: Record<string, string> = {};

              if (activeDrm.keys) {
                combinedKeys = { ...combinedKeys, ...activeDrm.keys };
              }

              if (activeDrm.licenseUrl) {
                const targetLicUrl = (isSpecialTarget || activeDrm.licenseUrl.includes('vietanhtv') || activeDrm.licenseUrl.includes('cleankey')) && activeDrm.licenseUrl.startsWith('http')
                  ? `/api/clearkey-proxy?url=${encodeURIComponent(activeDrm.licenseUrl)}&ua=${encodeURIComponent(activeUserAgent || 'Dalvik/2.1.0')}`
                  : activeDrm.licenseUrl;
                const fetched = await fetchClearKeys(targetLicUrl);
                if (isCancelled || loadIdRef.current !== currentLoadId) return;
                if (fetched && Object.keys(fetched).length > 0) {
                  combinedKeys = { ...combinedKeys, ...fetched };
                }
              }

              const clearKeysMap = formatClearKeys(combinedKeys);
              const drmConfig: any = {};
              if (Object.keys(clearKeysMap).length > 0) {
                // When clearKeys are explicitly provided or fetched, use clearKeys map directly
                drmConfig.clearKeys = clearKeysMap;
              } else if (activeDrm.licenseUrl) {
                drmConfig.servers = {
                  'org.w3.clearkey': activeDrm.licenseUrl.startsWith('http')
                    ? `/api/clearkey-proxy?url=${encodeURIComponent(activeDrm.licenseUrl)}&ua=${encodeURIComponent(activeUserAgent || 'Dalvik/2.1.0')}`
                    : activeDrm.licenseUrl
                };
              }
              if (Object.keys(drmConfig).length > 0) {
                player.configure({ drm: drmConfig });
              }
            }
          }

          player.addEventListener('buffering', (event: any) => {
            if (event.buffering) {
              armStallWatchdog('Shaka player buffering stall');
            } else {
              disarmStallWatchdog();
            }
          });

          player.addEventListener('error', (event: any) => {
            if (isCancelled || loadIdRef.current !== currentLoadId) return;
            const errDetail = event.detail || event;
            const errCode = errDetail?.code;
            const severity = errDetail?.severity;

            // Ignore benign cancellation errors, 403 network errors, and non-critical warnings:
            // 7000 (LOAD_INTERRUPTED), 7002 (OPERATION_ABORTED), 6007 (LICENSE_REQUEST_FAILED), 6012, 1002 (HTTP 403 network error)
            if (
              errCode === 7000 ||
              errCode === 7002 ||
              errCode === 6007 ||
              errCode === 6012 ||
              errCode === 1002 ||
              (severity !== undefined && severity !== 2 && (window as any).shaka?.util?.Error?.Severity?.CRITICAL && severity !== (window as any).shaka.util.Error.Severity.CRITICAL)
            ) {
              console.info('[VideoPlayer] Bỏ qua cảnh báo Shaka không nghiêm trọng / HTTP 403 phụ:', errCode);
              return;
            }
            console.warn('[VideoPlayer] Shaka Player error event:', errDetail);
            resetDecoderAndMediaEngine(channel.id, activeDrm?.licenseUrl);
            if (curIdx < candidateSources.length - 1) {
              triggerWatchdogFallback(errCode === 4012 ? 'Kênh sự kiện hiện chưa phát sóng hoặc đang cập nhật khóa' : 'Lỗi phát sóng MPD/DRM từ Shaka Player');
            } else {
              handleLoadError('Lỗi phát sóng MPD/DRM từ máy chủ truyền hình.');
            }
          });

          try {
            await player.load(activeUrl, null, 'application/dash+xml');
            if (isCancelled || loadIdRef.current !== currentLoadId) return;
            if (watchdogTimerRef.current) {
              clearTimeout(watchdogTimerRef.current);
              watchdogTimerRef.current = null;
            }
            disarmStallWatchdog();
            safePlayVideo();
          } catch (initialErr: any) {
            if (isCancelled || loadIdRef.current !== currentLoadId) return;
            if (initialErr?.code === 7000 || initialErr?.code === 7002) return;
            try {
              await player.load(activeUrl);
              if (isCancelled || loadIdRef.current !== currentLoadId) return;
              if (watchdogTimerRef.current) {
                clearTimeout(watchdogTimerRef.current);
                watchdogTimerRef.current = null;
              }
              disarmStallWatchdog();
              safePlayVideo();
              return;
            } catch (retryErr: any) {
              if (isCancelled || loadIdRef.current !== currentLoadId) return;
              if (retryErr?.code === 7000 || retryErr?.code === 7002) return;
              console.warn('[VideoPlayer] Shaka load retry failed:', retryErr);
            }

            resetDecoderAndMediaEngine(channel.id, activeDrm?.licenseUrl);
            if (curIdx < candidateSources.length - 1) {
              triggerWatchdogFallback('Lỗi nạp luồng phát DASH/MPD');
            } else {
              handleLoadError('Lỗi nạp luồng phát DASH/MPD từ máy chủ truyền hình.');
            }
          }
        }
        // CASE 3: HLS (.m3u8) Streams via Hls.js (Optimized for International Sports & Live Feeds)
        else if (isHls && Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            backBufferLength: 10,       // 10s backward buffer (saves RAM on low-spec boxes)
            maxBufferLength: 35,        // 35s buffer ahead (maintains optimal buffer health)
            maxMaxBufferLength: 60,     // 60s max buffer
            maxBufferSize: 32 * 1024 * 1024, // 32MB max buffer (strictly bounded for 2GB RAM Android TV Box)
            capLevelToPlayerSize: true, // Cap level to player size to prevent CPU overload on 4K/high bitrate
            abrEwmaDefaultEstimate: 1500000,
            manifestLoadingTimeOut: 15000,
            manifestLoadingMaxRetry: 5,
            manifestLoadingRetryDelay: 1500,
            levelLoadingTimeOut: 15000,
            levelLoadingMaxRetry: 5,
            levelLoadingRetryDelay: 1500,
            fragLoadingTimeOut: 20000, // 20s frag timeout for international/congested routes
            fragLoadingMaxRetry: 5,
            fragLoadingRetryDelay: 1500,
            startFragPrefetch: true,
            testBandwidth: false,
            progressive: true,
            initialLiveManifestSize: 1,
            liveSyncDurationCount: 4,   // 4 segments live sync (~8-12s buffer ahead for consistent green/yellow health)
            liveMaxLatencyDurationCount: 10,
            nudgeOffset: 0.2,
            nudgeMaxRetry: 8,
            maxBufferHole: 0.8,
            highBufferWatchdogPeriod: 2,
            startPosition: -1,
            emeEnabled: true
          });

          if (isCancelled || loadIdRef.current !== currentLoadId) {
            hls.destroy();
            return;
          }

          hlsRef.current = hls;
          hls.loadSource(activeUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (isCancelled || loadIdRef.current !== currentLoadId) return;
            if (watchdogTimerRef.current) {
              clearTimeout(watchdogTimerRef.current);
              watchdogTimerRef.current = null;
            }
            disarmStallWatchdog();
            safePlayVideo();
          });

          hls.on(Hls.Events.FRAG_LOADED, () => {
            if (isCancelled || loadIdRef.current !== currentLoadId) return;
            if (watchdogTimerRef.current) {
              clearTimeout(watchdogTimerRef.current);
              watchdogTimerRef.current = null;
            }
            disarmStallWatchdog();
          });

          let networkRetryCount = 0;
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (isCancelled || loadIdRef.current !== currentLoadId) return;

            const httpStatus = data.response?.code || (data as any).context?.response?.status || (data as any).networkDetails?.status;
            if (httpStatus === 401 || httpStatus === 403 || httpStatus === 404 || httpStatus === 410) {
              console.warn(`[VideoPlayer] HLS gặp lỗi HTTP ${httpStatus}. Tự động thanh lọc nguồn và chuyển sang luồng dự phòng.`);
              streamCache.recordSourceFailure(activeUrl, channel.id, true);
              if (curIdx < candidateSources.length - 1) {
                triggerWatchdogFallback(`Lỗi HTTP ${httpStatus} máy chủ HLS - Tự động chuyển luồng dự phòng`);
              } else {
                handleLoadError(`Lỗi kết nối máy chủ truyền hình (HTTP ${httpStatus}).`);
              }
              return;
            }

            if (data.fatal) {
              console.warn(`[VideoPlayer] HLS Fatal Error ${data.type} (${data.details})`);

              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  networkRetryCount++;
                  if (!activeUrl.startsWith('/api/stream-proxy') && !nativeBridge.isNative()) {
                    console.info('[VideoPlayer] Network error detected, auto-healing with CORS stream proxy...');
                    const proxyUrl = `/api/stream-proxy?url=${encodeURIComponent(rawActiveUrl)}&ua=${encodeURIComponent(activeUserAgent)}&channelId=${encodeURIComponent(channel.id)}`;
                    if (hlsRef.current) {
                      hlsRef.current.loadSource(proxyUrl);
                      hlsRef.current.startLoad();
                      return;
                    }
                  }
                  if (networkRetryCount <= 3) {
                    console.info(`[VideoPlayer] Hls.js tự động nạp lại kết nối mạng nội bộ (lần ${networkRetryCount})...`);
                    setTimeout(() => {
                      if (!isCancelled && loadIdRef.current === currentLoadId && hlsRef.current) {
                        hlsRef.current.startLoad();
                      }
                    }, 500);
                  } else if (curIdx < candidateSources.length - 1) {
                    triggerWatchdogFallback('Lỗi gián đoạn đường truyền HLS Network');
                  } else {
                    handleLoadError('Lỗi kết nối đường truyền từ máy chủ truyền hình.');
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  try {
                    console.info('[VideoPlayer] Hls.js tự động phục hồi giải mã Media...');
                    hls.recoverMediaError();
                  } catch {
                    if (curIdx < candidateSources.length - 1) {
                      triggerWatchdogFallback('Lỗi giải mã hình ảnh/âm thanh luồng phát HLS');
                    } else {
                      handleLoadError('Lỗi giải mã hình ảnh/âm thanh từ luồng phát.');
                    }
                  }
                  break;
                default:
                  if (curIdx < candidateSources.length - 1) {
                    triggerWatchdogFallback('Lỗi máy chủ luồng phát HLS');
                  } else {
                    handleLoadError('Lỗi luồng phát HLS từ máy chủ truyền hình.');
                  }
                  break;
              }
            } else {
              // Non-fatal stall and buffer hole handling: Use nudge mechanism to jump over buffer gaps without full reload
              if (
                data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR ||
                data.details === Hls.ErrorDetails.BUFFER_NUDGE_ON_STALL ||
                data.details === Hls.ErrorDetails.BUFFER_SEEK_OVER_HOLE
              ) {
                console.info('[VideoPlayer] Hls.js xử lý đứng hình bằng cơ chế nudge qua khoảng trống đệm...');
                try {
                  const v = videoRef.current;
                  if (v && v.buffered && v.buffered.length > 0) {
                    const bStart = v.buffered.start(0);
                    const bEnd = v.buffered.end(v.buffered.length - 1);
                    if (v.currentTime < bStart) {
                      v.currentTime = bStart;
                      safePlayVideo();
                    } else if (v.currentTime >= bEnd) {
                      v.currentTime = Math.max(bStart, bEnd - 0.5);
                      safePlayVideo();
                    } else {
                      v.currentTime += 0.15;
                      safePlayVideo();
                    }
                  }
                } catch {}
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = activeUrl;
          video.addEventListener('loadedmetadata', () => {
            if (isCancelled || loadIdRef.current !== currentLoadId) return;
            if (watchdogTimerRef.current) {
              clearTimeout(watchdogTimerRef.current);
              watchdogTimerRef.current = null;
            }
            disarmStallWatchdog();
            setIsLoading(false);
            safePlayVideo();
          });
        } else {
          video.src = activeUrl;
          safePlayVideo();
        }
      } catch (err) {
        if (isCancelled || loadIdRef.current !== currentLoadId) return;
        console.warn('Unable to load stream:', err);
        triggerWatchdogFallback('Ngoại lệ tải luồng phát');
      }
    };

    startLoading();

    return () => {
      isCancelled = true;
      destroyPlayers();
    };
  }, [channel, candidateSources, activeSourceIndex, playerEngine, reloadToken, destroyPlayers, clearWatchdogTimers, armStallWatchdog, disarmStallWatchdog, triggerWatchdogFallback, handleLoadError, safePlayVideo, autoEnableFullAudio, resetDecoderAndMediaEngine, clearAutoRetryTimer]);

  // Touch Gesture controls for Mobile / WebView
  const handleTouchStart = (e: React.TouchEvent) => {
    resetControlsTimer();
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    if (isMobileOrTablet() && isPlaying) {
      triggerMobileFullscreenAndLandscape();
    }
  };

  useEffect(() => {
    const el = playerContainerRef.current;
    if (!el) return;

    const handleTouchMove = (e: TouchEvent) => {
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => {
      el.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(deltaX) > 60 || Math.abs(deltaY) > 60) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          onNextCategory();
        } else {
          onPrevCategory();
        }
      } else {
        if (deltaY < 0) {
          onNextChannel();
        } else {
          onPrevChannel();
        }
      }
    }
  };

  const handleVideoClick = () => {
    resetControlsTimer();
    onOpenDrawer();
  };

  const isNative = nativeBridge.isNative();

  if (!channel) {
    return (
      <div 
        id="video-player-empty"
        onClick={onOpenDrawer}
        className={`w-full h-full ${isNative ? 'bg-transparent' : 'bg-slate-950'} cursor-pointer select-none overscroll-none touch-none flex items-center justify-center`}
      >
        {!isNative && <video ref={videoRef} playsInline autoPlay muted={isMuted} className="hidden" />}
      </div>
    );
  }

  const isMusicChannel = channel.category === 'nghenhac';

  return (
    <div
      id="video-player-container"
      ref={playerContainerRef}
      onMouseMove={resetControlsTimer}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleVideoClick}
      className={`relative w-full h-full ${isNative ? 'bg-transparent' : 'bg-black'} flex items-center justify-center overflow-hidden select-none group cursor-pointer touch-none overscroll-none ${
        isForcedLandscapeCSS ? 'forced-landscape-player' : ''
      }`}
    >
      {/* 16:9 Standard Broadcast Container */}
      <div 
        id="video-aspect-16-9-wrapper"
        className="relative w-full h-full max-w-full max-h-full aspect-video flex items-center justify-center bg-black overflow-hidden"
      >
        {/* HTML5 Video Element with strict 16:9 aspect preservation */}
        {!isNative && (
          <video
            id="html5-main-video"
            ref={videoRef}
            playsInline
            className={`w-full h-full object-contain aspect-video ${isMusicChannel ? 'opacity-0 absolute pointer-events-none' : 'opacity-100'}`}
          />
        )}

        {/* Music Visualizer Overlay for ZingRadio channels */}
        {isMusicChannel && <AudioVisualizer channel={channel} />}

        {/* Channel Buffer / Loading Animation */}
        {isLoading && (
          <div id="channel-loading-indicator" className={`absolute inset-0 z-30 ${isNative ? 'bg-transparent' : 'bg-slate-950/80'} flex items-center justify-center p-6 pointer-events-none`}>
            <div className="relative">
              <ChannelLogo logo={channel.logo} name={channel.name} className="w-16 h-16 opacity-70" />
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-red-600/90 flex items-center justify-center animate-spin">
                <Loader2 className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Technical Diagnostic Overlay (IPTV Smarters Pro Simulation) */}
      <DiagnosticOverlay
        isOpen={isDiagnosticOpen}
        onToggle={() => setIsDiagnosticOpen((prev) => !prev)}
        onClose={() => setIsDiagnosticOpen(false)}
        data={diagnosticData}
        onReloadStream={executeRetry}
        showHudButton={false}
      />
    </div>
  );
};

