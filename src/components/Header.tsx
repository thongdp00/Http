import React, { useState, useEffect } from 'react';
import { Menu, Clock } from 'lucide-react';
import { PlayerEngine, Channel, CategoryId } from '../types';

interface HeaderProps {
  currentChannel: Channel | null;
  onToggleDrawer: () => void;
  playerEngine: PlayerEngine;
  onChangeEngine: (engine: PlayerEngine) => void;
  onToggleRemote: () => void;
  visible: boolean;
  activeCategory: CategoryId;
  onChangeCategory: (category: CategoryId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentChannel,
  onToggleDrawer,
  visible,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-4 py-2 bg-[#080e1e]/95 text-white backdrop-blur-md border-b border-slate-800/80 transition-all duration-300 pointer-events-auto gap-2">
      {/* Left: Menu Toggle + Channel Name */}
      <div className="flex items-center space-x-2.5 shrink-0">
        <button
          onClick={onToggleDrawer}
          className="p-2 sm:p-2.5 rounded-xl bg-red-600/90 hover:bg-red-500 text-white font-medium flex items-center shadow-lg shadow-red-900/40 transition active:scale-95 border border-red-400/30 cursor-pointer"
          title="Xem danh sách kênh"
        >
          <Menu className="w-5 h-5" />
          <span className="text-xs font-bold ml-1.5 hidden sm:inline">Danh sách kênh</span>
        </button>

        {currentChannel && (
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            {currentChannel.name}
          </span>
        )}
      </div>

      {/* Right Controls: Clock */}
      <div className="flex items-center space-x-2 shrink-0">
        <div className="flex items-center space-x-1.5 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-red-400" />
          <span>{time}</span>
        </div>
      </div>
    </header>
  );
};
