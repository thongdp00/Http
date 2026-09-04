import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CategoryId, Channel, PlayerEngine } from './types';
import { CATEGORIES, CHANNELS_BY_CATEGORY, ALL_CHANNELS } from './data/channels';
import { VideoPlayer } from './components/VideoPlayer';
import { ChannelDrawer } from './components/ChannelDrawer';
import { ExitToast } from './components/ExitToast';
import { RemoteOverlay } from './components/RemoteOverlay';
import { detectChannelFromLocation, resolveChannelFromQuery } from './utils/channelResolver';
import { screenWakeLock } from './utils/wakeLock';
import { syncManager, SyncStatus } from './utils/syncManager';
import { isMobileOrTablet, lockScreenLandscape } from './utils/deviceUtils';

export default function App() {
  const [channelsList, setChannelsList] = useState<Channel[]>(ALL_CHANNELS);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(() => syncManager.getStatus());

  // Initialize Screen WakeLock to prevent TV box from sleeping or hanging surface
  useEffect(() => {
    const cleanupWakeLock = screenWakeLock.initAutoReacquire();
    return () => {
      cleanupWakeLock();
    };
  }, []);

  // 0ms Boot & Stale-While-Revalidate Sync Engine (Memory L1 + IndexedDB L2 + Low-priority Network SWR with 5s timeout)
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((updatedChannels, status) => {
      if (updatedChannels && updatedChannels.length > 0) {
        setChannelsList(updatedChannels);
      }
      setSyncStatus(status);
    });

    // Start 0ms boot and schedule background sync
    syncManager.initStaleWhileRevalidate();

    return () => {
      unsubscribe();
    };
  }, []);
  
  // Resolve initial channel if launched directly from Android TV Home screen / deep-link
  const [currentChannel, setCurrentChannel] = useState<Channel | null>(() => {
    return detectChannelFromLocation(ALL_CHANNELS);
  });
  const [activeCategory, setActiveCategory] = useState<CategoryId>(() => {
    const initCh = detectChannelFromLocation(ALL_CHANNELS);
    return initCh ? initCh.category : 'vtv';
  });
  // Auto open channel list drawer when app starts without a specific channel; close drawer if launched with a channel
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(() => {
    const initCh = detectChannelFromLocation(ALL_CHANNELS);
    return initCh ? false : true;
  });
  const [playerEngine] = useState<PlayerEngine>('auto');
  const [showRemote, setShowRemote] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const lastDrawerCloseTimeRef = useRef<number>(0);

  // Helper to reliably close drawer and record timestamp to prevent remote key bounce
  const closeDrawer = useCallback(() => {
    lastDrawerCloseTimeRef.current = Date.now();
    setIsDrawerOpen(false);
  }, []);

  // Helper to trigger device/browser fullscreen
  const enterFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    try {
      if (document.fullscreenElement) return; // Already fullscreen
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => {});
      } else if ((el as any).webkitRequestFullscreen) {
        (el as any).webkitRequestFullscreen();
      } else if ((el as any).mozRequestFullScreen) {
        (el as any).mozRequestFullScreen();
      } else if ((el as any).msRequestFullscreen) {
        (el as any).msRequestFullscreen();
      }
    } catch {
      // Fullscreen not allowed or user denied
    }
  }, []);

  // Channel load success handler: close drawer and auto-fullscreen + lock landscape on Mobile/Tablet
  const handleLoadComplete = useCallback(() => {
    closeDrawer();
    if (isMobileOrTablet()) {
      enterFullscreen();
      lockScreenLandscape();
    }
  }, [closeDrawer, enterFullscreen]);

  // Double back press logic state
  const [showExitToast, setShowExitToast] = useState<boolean>(false);
  const lastBackPressTime = useRef<number>(0);
  const exitToastTimer = useRef<NodeJS.Timeout | null>(null);

  // Handle Double Back Press (Remote BACK key, Escape, Backspace)
  const handleBackPress = useCallback(() => {
    if (isDrawerOpen) {
      closeDrawer();
      return;
    }

    if (showRemote) {
      setShowRemote(false);
      return;
    }

    const now = Date.now();
    if (now - lastBackPressTime.current < 2000) {
      // Second back press within 2s -> Hide drawer and show exit notification
      closeDrawer();
      setShowExitToast(false);
    } else {
      // First back press -> Show Toast for 2 seconds
      lastBackPressTime.current = now;
      setShowExitToast(true);
      if (exitToastTimer.current) clearTimeout(exitToastTimer.current);
      exitToastTimer.current = setTimeout(() => {
        setShowExitToast(false);
      }, 2000);
    }
  }, [isDrawerOpen, showRemote, closeDrawer]);

  // Next / Prev channel across all categories seamlessly
  const handleNextChannel = useCallback(() => {
    if (!currentChannel || channelsList.length === 0) {
      if (channelsList.length > 0) setCurrentChannel(channelsList[0]);
      return;
    }
    const globalIdx = channelsList.findIndex((c) => c.id === currentChannel.id);
    if (globalIdx !== -1 && globalIdx < channelsList.length - 1) {
      const nextCh = channelsList[globalIdx + 1];
      setCurrentChannel(nextCh);
      if (nextCh.category !== activeCategory) {
        setActiveCategory(nextCh.category as CategoryId);
      }
    } else if (channelsList.length > 0) {
      const firstCh = channelsList[0];
      setCurrentChannel(firstCh);
      if (firstCh.category !== activeCategory) {
        setActiveCategory(firstCh.category as CategoryId);
      }
    }
  }, [activeCategory, currentChannel, channelsList]);

  const handlePrevChannel = useCallback(() => {
    if (!currentChannel || channelsList.length === 0) {
      if (channelsList.length > 0) setCurrentChannel(channelsList[0]);
      return;
    }
    const globalIdx = channelsList.findIndex((c) => c.id === currentChannel.id);
    if (globalIdx > 0) {
      const prevCh = channelsList[globalIdx - 1];
      setCurrentChannel(prevCh);
      if (prevCh.category !== activeCategory) {
        setActiveCategory(prevCh.category as CategoryId);
      }
    } else if (channelsList.length > 0) {
      const lastCh = channelsList[channelsList.length - 1];
      setCurrentChannel(lastCh);
      if (lastCh.category !== activeCategory) {
        setActiveCategory(lastCh.category as CategoryId);
      }
    }
  }, [activeCategory, currentChannel, channelsList]);

  // Next / Prev category tabs
  const handleNextCategory = useCallback(() => {
    const catIdx = CATEGORIES.findIndex((c) => c.id === activeCategory);
    if (catIdx < CATEGORIES.length - 1) {
      setActiveCategory(CATEGORIES[catIdx + 1].id);
    } else {
      setActiveCategory(CATEGORIES[0].id);
    }
  }, [activeCategory]);

  const handlePrevCategory = useCallback(() => {
    const catIdx = CATEGORIES.findIndex((c) => c.id === activeCategory);
    if (catIdx > 0) {
      setActiveCategory(CATEGORIES[catIdx - 1].id);
    } else {
      setActiveCategory(CATEGORIES[CATEGORIES.length - 1].id);
    }
  }, [activeCategory]);

  // Global Keyboard listener for TV Box Remote D-Pad / OK / Back / Up / Down keys
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or if drawer/modals are open
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (isDrawerOpen) return;

      const code = e.keyCode || e.which;
      const key = e.key;

      const isUp =
        key === 'ArrowUp' ||
        key === 'Up' ||
        key === 'DPadUp' ||
        key === 'PageUp' ||
        key === 'ChannelUp' ||
        code === 38 ||
        code === 19 ||
        code === 33 ||
        code === 166;

      const isDown =
        key === 'ArrowDown' ||
        key === 'Down' ||
        key === 'DPadDown' ||
        key === 'PageDown' ||
        key === 'ChannelDown' ||
        code === 40 ||
        code === 20 ||
        code === 34 ||
        code === 167;

      const isLeft =
        key === 'ArrowLeft' ||
        key === 'Left' ||
        key === 'DPadLeft' ||
        code === 37 ||
        code === 21;

      const isRight =
        key === 'ArrowRight' ||
        key === 'Right' ||
        key === 'DPadRight' ||
        code === 39 ||
        code === 22;

      const isOk =
        key === 'Enter' ||
        key === 'Select' ||
        key === ' ' ||
        key === 'Ok' ||
        key === 'Accept' ||
        code === 13 ||
        code === 66 ||
        code === 23 ||
        code === 160;

      const isBack =
        key === 'BackSpace' ||
        key === 'Escape' ||
        key === 'BrowserBack' ||
        key === 'GoBack' ||
        key === 'Back' ||
        key === 'XF86Back' ||
        code === 8 ||
        code === 27 ||
        code === 4 ||
        code === 461 ||
        code === 10009;

      if (isUp) {
        e.preventDefault();
        handlePrevChannel();
      } else if (isDown) {
        e.preventDefault();
        handleNextChannel();
      } else if (isLeft) {
        e.preventDefault();
        handlePrevCategory();
      } else if (isRight) {
        e.preventDefault();
        handleNextCategory();
      } else if (isOk) {
        e.preventDefault();
        // Prevent key bounce if drawer just closed within 500ms
        if (Date.now() - lastDrawerCloseTimeRef.current < 500) {
          return;
        }
        setIsDrawerOpen(true);
      } else if (isBack) {
        e.preventDefault();
        handleBackPress();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, { capture: false });
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, { capture: false });
  }, [isDrawerOpen, handleBackPress, handleNextChannel, handlePrevChannel, handleNextCategory, handlePrevCategory]);

  // Global pull-to-refresh & system gesture conflict prevention
  useEffect(() => {
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;

      let target = e.target as HTMLElement | null;
      let isScrollable = false;

      while (target && target !== document.body && target !== document.documentElement) {
        const overflowY = window.getComputedStyle(target).overflowY;
        const canScrollY = (overflowY === 'auto' || overflowY === 'scroll') && target.scrollHeight > target.clientHeight;

        if (canScrollY) {
          if (target.scrollTop <= 0 && deltaY > 0) {
            if (e.cancelable) e.preventDefault();
          }
          isScrollable = true;
          break;
        }
        target = target.parentElement;
      }

      if (!isScrollable) {
        if (e.cancelable) e.preventDefault();
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Listen for dynamic external channel triggers
  useEffect(() => {
    const handleCheckChannelFromLocation = () => {
      const channel = detectChannelFromLocation(channelsList);
      if (channel) {
        setCurrentChannel(channel);
        setActiveCategory(channel.category);
        closeDrawer();
      }
    };

    const handleCustomChannelEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const query =
        customEvent.detail?.channel ||
        customEvent.detail?.id ||
        customEvent.detail?.channelId ||
        customEvent.detail;
      if (query) {
        const channel = resolveChannelFromQuery(query, channelsList);
        if (channel) {
          setCurrentChannel(channel);
          setActiveCategory(channel.category);
          closeDrawer();
        }
      }
    };

    const handleMessageEvent = (e: MessageEvent) => {
      try {
        let data = e.data;
        if (typeof data === 'string' && (data.startsWith('{') || data.startsWith('['))) {
          data = JSON.parse(data);
        }
        const query =
          typeof data === 'string'
            ? data
            : data?.channel || data?.channelId || data?.id || data?.playChannel || data?.target;
        if (query) {
          const channel = resolveChannelFromQuery(query, channelsList);
          if (channel) {
            setCurrentChannel(channel);
            setActiveCategory(channel.category);
            closeDrawer();
          }
        }
      } catch {
        // Ignore parsing errors
      }
    };

    (window as any).playChannel = (query: string | number) => {
      const ch = resolveChannelFromQuery(query, channelsList);
      if (ch) {
        setCurrentChannel(ch);
        setActiveCategory(ch.category);
        closeDrawer();
        return true;
      }
      return false;
    };

    (window as any).selectChannel = (window as any).playChannel;
    (window as any).openChannel = (window as any).playChannel;

    window.addEventListener('popstate', handleCheckChannelFromLocation);
    window.addEventListener('hashchange', handleCheckChannelFromLocation);
    window.addEventListener('playChannel', handleCustomChannelEvent);
    window.addEventListener('openChannel', handleCustomChannelEvent);
    window.addEventListener('selectChannel', handleCustomChannelEvent);
    window.addEventListener('message', handleMessageEvent);

    return () => {
      window.removeEventListener('popstate', handleCheckChannelFromLocation);
      window.removeEventListener('hashchange', handleCheckChannelFromLocation);
      window.removeEventListener('playChannel', handleCustomChannelEvent);
      window.removeEventListener('openChannel', handleCustomChannelEvent);
      window.removeEventListener('selectChannel', handleCustomChannelEvent);
      window.removeEventListener('message', handleMessageEvent);
      delete (window as any).playChannel;
      delete (window as any).selectChannel;
      delete (window as any).openChannel;
    };
  }, [channelsList, closeDrawer]);

  // Channel Selection handler
  const handleSelectChannel = (channel: Channel) => {
    closeDrawer();
    if (currentChannel?.id === channel.id) {
      return;
    }
    setCurrentChannel(channel);
    setActiveCategory(channel.category);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('channel', channel.id);
      window.history.replaceState(null, '', url.toString());
    } catch {}
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen bg-slate-950 text-white overflow-hidden select-none font-sans overscroll-none touch-manipulation"
    >
      {/* Main Video Player Container */}
      <main className="w-full h-full relative">
        <VideoPlayer
          channel={currentChannel}
          playerEngine={playerEngine}
          onOpenDrawer={() => setIsDrawerOpen(true)}
          onLoadComplete={handleLoadComplete}
          onNextChannel={handleNextChannel}
          onPrevChannel={handlePrevChannel}
          onNextCategory={handleNextCategory}
          onPrevCategory={handlePrevCategory}
        />
      </main>

      {/* Channel List Drawer with Virtualized List & Search */}
      <ChannelDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        currentChannel={currentChannel}
        onSelectChannel={handleSelectChannel}
        activeCategory={activeCategory}
        onChangeCategory={setActiveCategory}
        channelsList={channelsList}
        syncStatus={syncStatus}
      />

      {/* Interactive Remote Overlay */}
      <RemoteOverlay
        isOpen={showRemote}
        onClose={() => setShowRemote(false)}
        onOkPress={() => setIsDrawerOpen((prev) => !prev)}
        onBackPress={handleBackPress}
        onUpPress={handlePrevChannel}
        onDownPress={handleNextChannel}
        onLeftPress={handlePrevCategory}
        onRightPress={handleNextCategory}
      />

      {/* Exit Toast Dialog on double back press */}
      <ExitToast show={showExitToast} />
    </div>
  );
}
