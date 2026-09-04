import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Channel } from '../types';
import { ChannelLogo } from './ChannelLogo';

interface VirtualizedChannelListProps {
  channels: Channel[];
  currentChannel: Channel | null;
  focusedIndex: number;
  onSelectChannel: (channel: Channel, index: number) => void;
  itemHeight?: number;
  overscan?: number;
  className?: string;
  onDomStatsChange?: (renderedCount: number, totalCount: number) => void;
}

// Single Clean Channel Row Component
interface VirtualRowProps {
  channel: Channel;
  index: number;
  isSelected: boolean;
  isFocused: boolean;
  style: React.CSSProperties;
  onSelect: (channel: Channel, index: number) => void;
  activeRef?: React.Ref<HTMLDivElement>;
  focusedRef?: React.Ref<HTMLDivElement>;
}

const VirtualRow: React.FC<VirtualRowProps> = memo(({
  channel,
  index,
  isSelected,
  isFocused,
  style,
  onSelect,
  activeRef,
  focusedRef,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(channel, index);
  };

  // Combine activeRef and focusedRef if needed
  const setCombinedRef = useCallback((el: HTMLDivElement | null) => {
    if (activeRef && 'current' in activeRef) {
      (activeRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
    if (focusedRef && 'current' in focusedRef) {
      (focusedRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    }
  }, [activeRef, focusedRef]);

  return (
    <div
      ref={setCombinedRef}
      style={style}
      id={`virtual-channel-item-${channel.id}`}
      onClick={handleClick}
      tabIndex={isFocused ? 0 : -1}
      className={`group absolute left-0 right-0 flex items-center space-x-3 px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-75 border overflow-hidden select-none touch-pan-y ${
        isFocused
          ? 'bg-[#18294e] border-red-500 ring-2 ring-red-500/80 text-white shadow-xl shadow-red-950/40 scale-[1.01] z-10'
          : isSelected
          ? 'bg-[#121c33] border-red-600/70 text-white shadow-lg'
          : 'bg-[#0d1628]/90 border-slate-800/70 text-slate-300 hover:bg-[#121c33] hover:text-white hover:border-slate-700'
      }`}
    >
      {/* Red Active Indicator on Left */}
      {(isSelected || isFocused) && (
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-r-sm ${isFocused ? 'bg-red-500' : 'bg-red-600'}`} />
      )}

      {/* Channel Number */}
      <span className={`w-8 text-center text-xs font-mono font-bold shrink-0 ${isFocused ? 'text-red-400 font-extrabold' : 'text-slate-400'}`}>
        {channel.number}
      </span>

      {/* Channel Logo with Cache & Instant Badge Fallback */}
      <ChannelLogo logo={channel.logo} name={channel.name} className="w-11 h-9 shrink-0" />

      {/* Channel Title (Clean single-line name without subtitle/DRM/backup tags) */}
      <div className="flex-1 min-w-0 pr-2">
        <h3 className={`text-xs sm:text-sm font-bold truncate leading-normal transition ${isFocused ? 'text-white' : 'text-slate-100 group-hover:text-white'}`}>
          {channel.name}
        </h3>
      </div>
    </div>
  );
});

VirtualRow.displayName = 'VirtualRow';

export const VirtualizedChannelList: React.FC<VirtualizedChannelListProps> = memo(({
  channels,
  currentChannel,
  focusedIndex,
  onSelectChannel,
  itemHeight = 52, // Clean row height
  overscan = 6, // 6 items buffered above and below viewport
  className = "flex-1 h-full overflow-y-auto px-2.5 sm:px-3.5 py-2",
  onDomStatsChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeChannelRef = useRef<HTMLDivElement>(null);
  const focusedChannelRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(600);

  // Measure container height with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateHeight = () => {
      if (el) {
        setContainerHeight(el.clientHeight || 600);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle scroll event
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Calculate virtual window slice
  const totalCount = channels.length;
  const totalHeight = totalCount * itemHeight;

  // Auto-scroll when currentChannel or active channel changes using scrollIntoView with { behavior: 'smooth', block: 'center' }
  useEffect(() => {
    if (!currentChannel) return;

    const activeIndex = channels.findIndex((c) => c.id === currentChannel.id);
    if (activeIndex === -1) return;

    // First ensure the container is positioned so the active index is within the virtual render slice
    if (containerRef.current) {
      const targetScrollTop = Math.max(0, activeIndex * itemHeight - containerHeight / 2 + itemHeight / 2);
      const currentScroll = containerRef.current.scrollTop;
      const isFar = Math.abs(currentScroll - targetScrollTop) > containerHeight * 1.5;

      if (isFar) {
        containerRef.current.scrollTop = targetScrollTop;
      }
    }

    // Smoothly scroll the active element into view centered
    const rafId = requestAnimationFrame(() => {
      if (activeChannelRef.current) {
        activeChannelRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [currentChannel?.id, channels, itemHeight, containerHeight]);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleItemCount = Math.ceil(containerHeight / itemHeight);
  const endIndex = Math.min(totalCount - 1, Math.floor(scrollTop / itemHeight) + visibleItemCount + overscan);

  // Notify parent of active DOM element count if needed
  useEffect(() => {
    if (onDomStatsChange) {
      const renderedCount = Math.max(0, endIndex - startIndex + 1);
      onDomStatsChange(renderedCount, totalCount);
    }
  }, [startIndex, endIndex, totalCount, onDomStatsChange]);

  // Keep focused item scrolled into view smoothly for TV remote / keyboard navigation (ArrowUp, ArrowDown)
  useEffect(() => {
    if (focusedIndex >= 0 && focusedIndex < totalCount && containerRef.current) {
      const itemTop = focusedIndex * itemHeight;
      const itemBottom = itemTop + itemHeight;
      const currentScrollTop = containerRef.current.scrollTop;
      const currentScrollBottom = currentScrollTop + containerHeight;

      if (itemTop < currentScrollTop) {
        containerRef.current.scrollTop = itemTop;
      } else if (itemBottom > currentScrollBottom) {
        containerRef.current.scrollTop = itemBottom - containerHeight;
      }
    }

    // Smoothly scroll the focused element into view using block 'nearest'
    const rafId = requestAnimationFrame(() => {
      if (focusedChannelRef.current) {
        focusedChannelRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [focusedIndex, itemHeight, containerHeight, totalCount]);

  const visibleItems: React.ReactNode[] = [];

  for (let i = startIndex; i <= endIndex; i++) {
    const channel = channels[i];
    if (!channel) continue;

    const isSelected = currentChannel?.id === channel.id;
    const isFocused = focusedIndex === i;
    const topPosition = i * itemHeight;

    visibleItems.push(
      <VirtualRow
        key={channel.id}
        channel={channel}
        index={i}
        isSelected={isSelected}
        isFocused={isFocused}
        activeRef={isSelected ? activeChannelRef : undefined}
        focusedRef={isFocused ? focusedChannelRef : undefined}
        style={{
          top: `${topPosition}px`,
          height: `${itemHeight - 4}px`,
        }}
        onSelect={onSelectChannel}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={`${className} relative overscroll-contain touch-pan-y focus:outline-none`}
      style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch', height: '100%' }}
      tabIndex={-1}
    >
      {totalCount === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          Không có kênh nào trong danh mục này.
        </div>
      ) : (
        <div
          style={{
            height: `${totalHeight}px`,
            position: 'relative',
            width: '100%',
          }}
        >
          {visibleItems}
        </div>
      )}
    </div>
  );
});

VirtualizedChannelList.displayName = 'VirtualizedChannelList';
