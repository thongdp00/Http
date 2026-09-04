import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CornerDownLeft, X, Tv, ArrowLeft, Activity } from 'lucide-react';

interface RemoteOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOkPress: () => void;
  onBackPress: () => void;
  onUpPress: () => void;
  onDownPress: () => void;
  onLeftPress: () => void;
  onRightPress: () => void;
}

export const RemoteOverlay: React.FC<RemoteOverlayProps> = ({
  isOpen,
  onClose,
  onOkPress,
  onBackPress,
  onUpPress,
  onDownPress,
  onLeftPress,
  onRightPress,
}) => {
  if (!isOpen) return null;

  const handleInfoPress = () => {
    onClose();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd', code: 'KeyD', keyCode: 68 }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm pointer-events-auto">
      <div className="relative w-72 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-white flex flex-col items-center select-none">
        {/* Remote Header */}
        <div className="w-full flex items-center justify-between pb-4 mb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Tv className="w-5 h-5 text-red-500" />
            <span className="font-black tracking-wider text-sm">REMOTE HT TV</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Remote D-Pad Cluster */}
        <div className="relative w-48 h-48 my-4 flex items-center justify-center bg-slate-950 rounded-full border border-slate-800 shadow-inner">
          {/* UP Button */}
          <button
            onClick={onUpPress}
            className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-10 rounded-t-2xl bg-slate-800 hover:bg-red-600 active:scale-95 text-slate-200 hover:text-white flex items-center justify-center shadow transition"
            title="Kênh trước (Up)"
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          {/* DOWN Button */}
          <button
            onClick={onDownPress}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-12 h-10 rounded-b-2xl bg-slate-800 hover:bg-red-600 active:scale-95 text-slate-200 hover:text-white flex items-center justify-center shadow transition"
            title="Kênh sau (Down)"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* LEFT Button */}
          <button
            onClick={onLeftPress}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-12 rounded-l-2xl bg-slate-800 hover:bg-red-600 active:scale-95 text-slate-200 hover:text-white flex items-center justify-center shadow transition"
            title="Danh mục trước (Left)"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* RIGHT Button */}
          <button
            onClick={onRightPress}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-12 rounded-r-2xl bg-slate-800 hover:bg-red-600 active:scale-95 text-slate-200 hover:text-white flex items-center justify-center shadow transition"
            title="Danh mục tiếp theo (Right)"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* CENTER OK Button */}
          <button
            onClick={onOkPress}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 active:scale-90 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-red-900/50 transition border border-rose-400/40"
            title="Bấm OK - Hiện/Ẩn Danh sách Kênh"
          >
            OK
          </button>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 mb-2.5">
          <button
            onClick={onBackPress}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-300 flex items-center justify-center space-x-1.5 transition border border-slate-700/50"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>BACK</span>
          </button>

          <button
            onClick={onOkPress}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs font-bold text-slate-300 flex items-center justify-center space-x-1.5 transition border border-slate-700/50"
          >
            <CornerDownLeft className="w-4 h-4 text-red-400" />
            <span>DANH SÁCH</span>
          </button>
        </div>

        {/* INFO / CHẨN ĐOÁN KỸ THUẬT BUTTON */}
        <button
          onClick={handleInfoPress}
          className="w-full py-2 px-3 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 active:scale-95 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-1.5 transition border border-cyan-700/40"
          title="Bật bảng chẩn đoán kỹ thuật thời gian thực (Phím D / I)"
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>CHẨN ĐOÁN KỸ THUẬT (INFO)</span>
        </button>

        <p className="text-[10px] text-slate-500 text-center mt-3">
          Tương thích D-Pad TV Box Viettel 360 & Remote Android TV
        </p>
      </div>
    </div>
  );
};
