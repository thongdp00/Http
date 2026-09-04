import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { CategoryId, Channel } from '../types';
import { CATEGORIES, ALL_CHANNELS } from '../data/channels';
import { VirtualizedChannelList } from './VirtualizedChannelList';
import { SyncStatus } from '../utils/syncManager';

interface ChannelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  activeCategory: CategoryId;
  onChangeCategory: (cat: CategoryId) => void;
  channelsList?: Channel[];
  syncStatus?: SyncStatus;
}

export const ChannelDrawer: React.FC<ChannelDrawerProps> = ({
  isOpen,
  onClose,
  currentChannel,
  onSelectChannel,
  activeCategory,
  onChangeCategory,
  channelsList,
}) => {
  const allChs = channelsList || ALL_CHANNELS;

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    let resizeTimer: NodeJS.Timeout | null = null;
    const checkMobile = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setIsMobile(window.innerWidth < 768);
      }, 100);
    };
    window.addEventListener('resize', checkMobile);
    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Filtered Channels by active category on TV/Desktop (md+), or show All Channels in 1 vertical column on mobile (<768px)
  const channels = useMemo(() => {
    if (isMobile) {
      return allChs;
    }
    return allChs.filter((c) => c.category === activeCategory);
  }, [allChs, isMobile, activeCategory]);

  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const categoryTabRef = useRef<HTMLDivElement>(null);

  // Focus on current playing channel when drawer opens
  useEffect(() => {
    if (isOpen && currentChannel) {
      const idx = channels.findIndex((c) => c.id === currentChannel.id);
      if (idx !== -1) {
        setFocusedIndex(idx);
      }
    }
  }, [isOpen, currentChannel?.id, channels]);

  // Keep active category tab in view
  useEffect(() => {
    if (categoryTabRef.current) {
      const activeBtn = categoryTabRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
      if (activeBtn) {
        activeBtn.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [activeCategory]);

  // Keep fresh references for keyboard navigation
  const channelsRef = useRef(channels);
  channelsRef.current = channels;

  const focusedIndexRef = useRef(focusedIndex);
  focusedIndexRef.current = focusedIndex;

  const activeCategoryRef = useRef(activeCategory);
  activeCategoryRef.current = activeCategory;

  // D-Pad remote navigation when drawer is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const code = e.keyCode || e.which;
      const key = e.key;

      const isUp =
        key === 'ArrowUp' ||
        key === 'Up' ||
        key === 'DPadUp' ||
        code === 38 ||
        code === 19;

      const isDown =
        key === 'ArrowDown' ||
        key === 'Down' ||
        key === 'DPadDown' ||
        code === 40 ||
        code === 20;

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
        code === 13 ||
        code === 66 ||
        code === 23;

      const isBack =
        key === 'BackSpace' ||
        key === 'Escape' ||
        key === 'BrowserBack' ||
        key === 'GoBack' ||
        key === 'Back' ||
        code === 8 ||
        code === 27 ||
        code === 4 ||
        code === 461 ||
        code === 10009;

      const isPageDown =
        key === 'PageDown' ||
        key === 'ChannelDown' ||
        code === 34 ||
        code === 167;

      const isPageUp =
        key === 'PageUp' ||
        key === 'ChannelUp' ||
        code === 33 ||
        code === 166;

      const curIdx = focusedIndexRef.current;
      const currentChs = channelsRef.current;

      if (isDown) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (currentChs.length > 0) {
          const nextIdx = curIdx < currentChs.length - 1 ? curIdx + 1 : 0;
          setFocusedIndex(nextIdx);
        }
      } else if (isUp) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (currentChs.length > 0) {
          const prevIdx = curIdx > 0 ? curIdx - 1 : currentChs.length - 1;
          setFocusedIndex(prevIdx);
        }
      } else if (isPageDown) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (currentChs.length > 0) {
          setFocusedIndex(Math.min(currentChs.length - 1, curIdx + 8));
        }
      } else if (isPageUp) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (currentChs.length > 0) {
          setFocusedIndex(Math.max(0, curIdx - 8));
        }
      } else if (isRight) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        const currentCat = activeCategoryRef.current;
        const currentCatIdx = CATEGORIES.findIndex((c) => c.id === currentCat);
        const nextCatIdx = currentCatIdx < CATEGORIES.length - 1 ? currentCatIdx + 1 : 0;
        onChangeCategory(CATEGORIES[nextCatIdx].id);
        setFocusedIndex(0);
      } else if (isLeft) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        const currentCat = activeCategoryRef.current;
        const currentCatIdx = CATEGORIES.findIndex((c) => c.id === currentCat);
        const prevCatIdx = currentCatIdx > 0 ? currentCatIdx - 1 : CATEGORIES.length - 1;
        onChangeCategory(CATEGORIES[prevCatIdx].id);
        setFocusedIndex(0);
      } else if (isOk) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (currentChs[curIdx]) {
          onSelectChannel(currentChs[curIdx]);
          onClose();
        }
      } else if (isBack) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [isOpen, onChangeCategory, onSelectChannel, onClose]);

  const handleSelectChannel = useCallback((channel: Channel, index: number) => {
    setFocusedIndex(index);
    onSelectChannel(channel);
    onClose();
  }, [onSelectChannel, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex select-none pointer-events-auto">
      {/* Dark Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity duration-300"
      />

      {/* Drawer Container */}
      <div className="relative z-50 w-full sm:w-[460px] md:w-[500px] max-w-[100vw] sm:max-w-[85vw] h-full bg-[#080e1e] text-white border-r border-slate-800/80 shadow-2xl flex flex-col transform transition-transform duration-300 ease-out left-0 top-0 bottom-0 overscroll-contain">
        
        {/* Category Tabs Bar - Hidden on Mobile (<768px), Visible on md+ (Android TV / Box / Desktop) */}
        <div
          ref={categoryTabRef}
          className="hidden md:flex px-3 py-2.5 bg-[#080e1e] border-b border-slate-800/80 space-x-2 overflow-x-auto no-scrollbar shrink-0 overscroll-contain touch-pan-x"
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat.id === activeCategory;
            return (
              <button
                key={cat.id}
                data-active={isActive ? "true" : "false"}
                onClick={() => onChangeCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 shrink-0 flex items-center shadow-sm cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md shadow-red-900/40 scale-[1.02]'
                    : 'bg-[#10192d] text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* High-Performance Virtualized Channel List Container */}
        <div className="flex-1 min-h-0 relative h-full flex flex-col overflow-hidden">
          <VirtualizedChannelList
            channels={channels}
            currentChannel={currentChannel}
            focusedIndex={focusedIndex}
            onSelectChannel={handleSelectChannel}
            itemHeight={52}
            overscan={6}
            className="flex-1 h-full overflow-y-auto px-2.5 sm:px-3.5 py-2"
          />
        </div>
      </div>
    </div>
  );
};
