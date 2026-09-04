import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Wifi,
  ShieldCheck,
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
  X,
  Tv,
  Info,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Server,
  BarChart3,
  Radio,
  FileJson,
} from 'lucide-react';
import { ChannelLogo } from './ChannelLogo';

export interface DiagnosticData {
  engineName: 'Shaka Player' | 'HLS.js' | 'mpegts.js' | 'HTML5 Native' | 'Android Media3';
  engineVersion: string;
  playbackState: 'playing' | 'buffering' | 'paused' | 'error' | 'idle';
  playbackStateLabel: string;
  resolution: {
    width: number;
    height: number;
    label: string;
  };
  playbackRate: number;
  drmInfo: {
    type: 'clearkey' | 'widevine' | 'none';
    status: string;
    keysCount?: number;
  };
  bufferAhead: number; // seconds
  bufferBehind: number; // seconds
  bufferHealth: 'good' | 'medium' | 'critical'; // good >= 5s, medium 2-5s, critical < 2s
  droppedFrames: number;
  totalFrames: number;
  droppedPercentage: number;
  stallsCount: number;
  bandwidthMbps: number;
  activeUrl: string;
  rawUrl: string;
  connectionType: 'Built-in Stream Proxy (TV360 UA)' | 'Web Proxy (CORS)' | 'Kết nối trực tiếp';
  candidateIndex: number;
  candidateTotal: number;
  retryCount: number;
  uptimeSeconds: number;
  channelName: string;
  channelCategory: string;
  channelLogo?: string;
  hardwareAcceleration: string;
}

interface DiagnosticOverlayProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  data: DiagnosticData;
  onReloadStream: () => void;
  showHudButton?: boolean;
}

export const DiagnosticOverlay: React.FC<DiagnosticOverlayProps> = ({
  isOpen,
  onToggle,
  onClose,
  data,
  onReloadStream,
  showHudButton = false,
}) => {
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!data.activeUrl) return;
    navigator.clipboard?.writeText(data.activeUrl).then(() => {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }).catch(() => {
      // Fallback
      const input = document.createElement('input');
      input.value = data.activeUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    });
  };

  const handleCopyJson = (e: React.MouseEvent) => {
    e.stopPropagation();
    const logPayload = {
      timestamp: new Date().toISOString(),
      reportType: 'HT-TV IPTV Technical Diagnostic Log',
      channel: {
        name: data.channelName,
        category: data.channelCategory,
      },
      playerEngine: {
        engine: data.engineName,
        version: data.engineVersion,
        state: data.playbackStateLabel,
        playbackRate: `${data.playbackRate}x`,
        hardwareDecoder: data.hardwareAcceleration,
      },
      videoStream: {
        resolution: `${data.resolution.width}x${data.resolution.height}`,
        resolutionLabel: data.resolution.label,
        aspectRatio: '16:9 Standard Broadcast',
        drm: data.drmInfo,
      },
      bufferMetrics: {
        bufferAheadSeconds: Number(data.bufferAhead.toFixed(2)),
        bufferBehindSeconds: Number(data.bufferBehind.toFixed(2)),
        healthEvaluation: data.bufferHealth === 'good' ? 'Tốt (>=5s)' : data.bufferHealth === 'medium' ? 'Trung bình (2-5s)' : 'Nguy cơ đứng hình (<2s)',
        gaugePercent: Math.min(100, Math.round((data.bufferAhead / 12) * 100)),
      },
      performance: {
        droppedFrames: data.droppedFrames,
        totalFrames: data.totalFrames,
        dropRatePercent: Number(data.droppedPercentage.toFixed(2)),
        stallsCount: data.stallsCount,
        estimatedBandwidthMbps: Number(data.bandwidthMbps.toFixed(2)),
        sessionUptimeSeconds: data.uptimeSeconds,
      },
      routingPipeline: {
        connectionMechanism: data.connectionType,
        sourceCandidate: `[${data.candidateIndex + 1}/${data.candidateTotal}]`,
        reconnectRetries: data.retryCount,
        activeUrl: data.activeUrl,
        rawSourceUrl: data.rawUrl,
      },
    };

    const jsonStr = JSON.stringify(logPayload, null, 2);
    navigator.clipboard?.writeText(jsonStr).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    }).catch(() => {
      const input = document.createElement('textarea');
      input.value = jsonStr;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    });
  };

  // Buffer gauge calculation: scale from 0 to 12s
  const bufferAheadClamped = Math.min(12, Math.max(0, data.bufferAhead));
  const gaugePercent = Math.min(100, (bufferAheadClamped / 12) * 100);

  // Health color styling
  const healthBadgeConfig = {
    good: {
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      dot: 'bg-emerald-400',
      text: 'Xanh: Tốt (Ổn định)',
      barColor: 'from-emerald-500 to-teal-400',
    },
    medium: {
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400',
      text: 'Vàng: Trung bình',
      barColor: 'from-amber-500 to-yellow-400',
    },
    critical: {
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      dot: 'bg-rose-500 animate-pulse',
      text: 'Đỏ: Nguy cơ đứng hình',
      barColor: 'from-rose-600 to-red-500',
    },
  }[data.bufferHealth];

  // Engine badge color
  const getEngineColor = () => {
    switch (data.engineName) {
      case 'Shaka Player':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'HLS.js':
        return 'bg-blue-950/80 text-blue-300 border-blue-500/40';
      case 'mpegts.js':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <>
      {/* 1. TOP-RIGHT COLLAPSED HUD BUTTON (Quick Summary Pill - Hidden by default) */}
      {showHudButton && (
        <div
          id="hud-diagnostic-trigger"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="absolute top-3 right-3 z-40 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-slate-700/80 hover:border-cyan-500/60 backdrop-blur-md shadow-lg cursor-pointer transition-all duration-200 group active:scale-95 select-none"
          title="Bật/Tắt Bảng Chẩn Đoán Kỹ Thuật (Phím D, I hoặc nút Info / nút Xanh remote)"
        >
          {/* Pulsing indicator dot */}
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                data.playbackState === 'playing' ? healthBadgeConfig.dot : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                data.playbackState === 'playing' ? healthBadgeConfig.dot : 'bg-amber-400'
              }`}
            />
          </span>

          {/* Engine name tag */}
          <span className="text-[11px] font-bold tracking-wider uppercase text-slate-300">
            {data.engineName.replace(' Player', '')}
          </span>

          {/* Real-time buffer ahead badge */}
          <span
            className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded border ${healthBadgeConfig.color}`}
          >
            {data.bufferAhead.toFixed(1)}s đệm
          </span>

          {/* Resolution tag */}
          {data.resolution.label && (
            <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {data.resolution.label.split(' ')[0]}
            </span>
          )}

          <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition" />
        </div>
      )}

      {/* 2. FULL TECHNICAL DIAGNOSTIC OVERLAY (IPTV Smarters Pro Simulation OSD) */}
      {isOpen && (
        <div
          id="diagnostic-full-overlay"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md pointer-events-auto select-none overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl max-h-[92vh] bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-black/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/40 text-slate-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            {/* IPTV Smarters Pro Brand Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-cyan-500/20 bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-600/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-widest text-cyan-400 uppercase">
                      IPTV SMARTERS PRO • OSD DIAGNOSTICS
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      Thời gian thực
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {data.channelLogo && (
                      <ChannelLogo logo={data.channelLogo} name={data.channelName} className="w-4 h-4" />
                    )}
                    <h2 className="text-base font-bold text-white tracking-wide">
                      {data.channelName || 'Luồng Phát Trực Tiếp'}
                    </h2>
                    <span className="text-xs text-slate-400">• {data.channelCategory}</span>
                  </div>
                </div>
              </div>

              {/* Close Button & Quick Remote Badges */}
              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
                  <span>Phím tắt:</span>
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] border border-slate-700">D</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] border border-slate-700">I</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-[10px] border border-slate-700">INFO</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-mono text-[10px] border border-emerald-700">F2 / XANH</kbd>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-900/60 text-slate-400 hover:text-white border border-slate-700 transition"
                  title="Đóng bảng chẩn đoán (ESC / D / I)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Diagnostic Content Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* TOP ROW: 2 Primary Diagnostic Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* PANEL 1: TRẠNG THÁI TRÌNH PHÁT (Player Engine & State) */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <Cpu className="w-4 h-4" />
                      <span>TRẠNG THÁI TRÌNH PHÁT (ENGINE)</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${getEngineColor()}`}
                    >
                      {data.engineName} v{data.engineVersion}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Playback State */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Trạng thái phát</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            data.playbackState === 'playing'
                              ? 'bg-emerald-400 animate-pulse'
                              : data.playbackState === 'buffering'
                              ? 'bg-amber-400 animate-spin'
                              : data.playbackState === 'error'
                              ? 'bg-rose-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="font-semibold text-white">
                          {data.playbackStateLabel}
                        </span>
                      </div>
                    </div>

                    {/* Resolution */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Độ phân giải thực</span>
                      <div className="flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="font-semibold text-white">
                          {data.resolution.width > 0
                            ? `${data.resolution.width}x${data.resolution.height} (${data.resolution.label})`
                            : 'Đang nhận diện...'}
                        </span>
                      </div>
                    </div>

                    {/* Playback Rate & Hardware Decoder */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Tốc độ & Giải mã</span>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-slate-200">{data.playbackRate}x Normal</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                          {data.hardwareAcceleration}
                        </span>
                      </div>
                    </div>

                    {/* DRM / ClearKey */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[11px] text-slate-400 block mb-1">Mã hóa DRM / ClearKey</span>
                      <div className="flex items-center gap-1.5">
                        {data.drmInfo.type === 'none' ? (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        )}
                        <span className="font-mono text-slate-200 truncate">
                          {data.drmInfo.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PANEL 2: TÌNH TRẠNG BỘ ĐỆM (Buffer Health & Gauge) */}
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Activity className="w-4 h-4" />
                      <span>TÌNH TRẠNG BỘ ĐỆM (BUFFER HEALTH)</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${healthBadgeConfig.color}`}
                    >
                      {healthBadgeConfig.text}
                    </span>
                  </div>

                  {/* Real-time Numeric Values */}
                  <div className="flex items-baseline justify-between mb-1.5">
                    <div>
                      <span className="text-2xl font-black font-mono text-white">
                        {data.bufferAhead.toFixed(1)}s
                      </span>
                      <span className="text-[11px] text-slate-400 ml-1.5">đệm sẵn sàng (Ahead)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-slate-300">
                        {data.bufferBehind.toFixed(1)}s
                      </span>
                      <span className="text-[11px] text-slate-500 ml-1">đã qua (Behind)</span>
                    </div>
                  </div>

                  {/* VISUAL GRAPHIC GAUGE BAR (0s - 12s+) WITH SAFETY THRESHOLD MARKERS */}
                  <div className="relative w-full mb-3">
                    <div className="w-full h-4 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative p-0.5">
                      {/* 2s Critical line marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10"
                        style={{ left: `${(2 / 12) * 100}%` }}
                        title="Ngưỡng tối thiểu 2s (Dưới 2s có nguy cơ đứng hình)"
                      />
                      {/* 5s Stable line marker */}
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
                        style={{ left: `${(5 / 12) * 100}%` }}
                        title="Ngưỡng ổn định 5s (Trên 5s phát mượt mà)"
                      />

                      {/* Active Gauge Fill */}
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${healthBadgeConfig.barColor} transition-all duration-300`}
                        style={{ width: `${gaugePercent}%` }}
                      />
                    </div>

                    {/* Threshold Labels Below Gauge */}
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1 px-1">
                      <span>0s</span>
                      <span className="text-rose-400">| 2s (Tối thiểu)</span>
                      <span className="text-amber-400">| 5s (Ổn định)</span>
                      <span className="text-emerald-400">12s+ (Tối đa)</span>
                    </div>
                  </div>

                  {/* Buffer & Performance Sub-metrics */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Khung hình rớt</span>
                      <span className="font-mono font-bold text-white text-xs">
                        {data.droppedFrames}
                        <span className="text-slate-400 font-normal ml-0.5">
                          ({data.droppedPercentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Lần dừng hình</span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          data.stallsCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {data.stallsCount} lần
                      </span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Băng thông ước tính</span>
                      <span className="font-mono font-bold text-cyan-300 text-xs flex items-center justify-center gap-1">
                        <Wifi className="w-3 h-3" />
                        {data.bandwidthMbps > 0 ? `${data.bandwidthMbps.toFixed(2)} Mbps` : 'Adaptive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PANEL 3: URL LUỒNG & KIỂM TRA ĐỊNH TUYẾN (Active Stream Pipeline) */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Radio className="w-4 h-4" />
                    <span>URL LUỒNG & KIỂM TRA ĐỊNH TUYẾN (STREAM PIPELINE)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Nguồn dự phòng: {data.candidateIndex + 1}/{data.candidateTotal}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Lần thử lại: {data.retryCount}
                    </span>
                  </div>
                </div>

                {/* Routing Mechanism Analysis */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-slate-400 text-[11px]">Cơ chế kết nối:</span>
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-700/50 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5" />
                    {data.connectionType}
                  </span>
                  <span className="text-slate-500 text-[10px] ml-auto">
                    Thời gian phát liên tục: {Math.floor(data.uptimeSeconds / 60)}p {data.uptimeSeconds % 60}s
                  </span>
                </div>

                {/* Stream URL with Fast Copy button */}
                <div className="relative flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                  <span className="flex-1 truncate">{data.activeUrl}</span>
                  <button
                    onClick={handleCopyUrl}
                    className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-md bg-cyan-700/60 hover:bg-cyan-600 text-white font-sans text-xs font-semibold shadow transition active:scale-95"
                    title="Sao chép toàn bộ URL luồng"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Đã sao chép!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ACTION TOOLBAR & FOOTER */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Hỗ trợ thiết bị RAM thấp (Android TV Box 2GB) • Tự động phục hồi khi đứng hình</span>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Copy All Diagnostics JSON */}
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-95"
                  title="Xuất toàn bộ log kỹ thuật dạng JSON để chia sẻ và gỡ lỗi"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Đã sao chép JSON!</span>
                    </>
                  ) : (
                    <>
                      <FileJson className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Sao chép toàn bộ chẩn đoán (JSON)</span>
                    </>
                  )}
                </button>

                {/* Instant Stream Reload Button */}
                <button
                  onClick={() => {
                    onReloadStream();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md transition active:scale-95"
                  title="Nạp lại luồng tức thì (Purge cache & reset decoder)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nạp lại luồng tức thì</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
