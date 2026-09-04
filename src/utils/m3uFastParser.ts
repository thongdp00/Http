/**
 * Thuật toán Phân tích cú pháp M3U & Ghép kênh Luồng đơn (Single-Pass Fast Parser)
 * Kết hợp Bảng Chỉ mục Băm (Hash Index Map) xử lý danh sách hàng nghìn kênh <5ms,
 * triệt tiêu hiện tượng đóng băng Main Thread.
 */

import { Channel, CategoryId, StreamSource, DRMConfig } from '../types';
import { isBlockedSource, normalizeChannelName, mapGroupToCategory, parseDrmConfig } from './m3uService';

export interface FastParseResult {
  channels: Channel[];
  parseTimeMs: number;
  totalParsed: number;
  totalSources: number;
  categoryStats: Record<string, number>;
}

/**
 * Fast sub-string attribute extractor without regular expression backtracking overhead.
 * Extracts values like tvg-id="...", tvg-logo="...", group-title="..." in O(k) time.
 */
function extractAttribute(line: string, attrName: string): string | undefined {
  const target = attrName + '="';
  const startIdx = line.indexOf(target);
  if (startIdx === -1) return undefined;

  const valStart = startIdx + target.length;
  const valEnd = line.indexOf('"', valStart);
  if (valEnd === -1) return undefined;

  return line.substring(valStart, valEnd).trim();
}

/**
 * Extract channel name after the last comma in an #EXTINF line
 */
function extractExtinfName(line: string): string | undefined {
  const lastCommaIdx = line.lastIndexOf(',');
  if (lastCommaIdx === -1) return undefined;
  const name = line.substring(lastCommaIdx + 1).trim();
  return name.length > 0 ? name : undefined;
}

/**
 * Single-Pass High Speed M3U Parser & Hash Index Multiplexer
 * @param m3uText Raw M3U string content
 * @param baseChannels Optional catalog of base channels to multiplex and enhance with backup links
 */
export function fastParseM3U(m3uText: string, baseChannels?: Channel[]): FastParseResult {
  const startTime = performance.now();

  // Hash Index Maps for O(1) channel deduplication & multi-source multiplexing
  const idHashMap = new Map<string, Channel>();
  const normalizedNameHashMap = new Map<string, Channel>();

  // Pre-seed Hash Index Map with base channels if provided
  if (baseChannels && baseChannels.length > 0) {
    for (let i = 0; i < baseChannels.length; i++) {
      const ch = baseChannels[i];
      const cloned: Channel = {
        ...ch,
        sources: ch.sources ? [...ch.sources] : []
      };
      idHashMap.set(cloned.id, cloned);
      normalizedNameHashMap.set(normalizeChannelName(cloned.name), cloned);
    }
  }

  // Linear single-pass line iteration
  const len = m3uText.length;
  let lineStart = 0;
  let curTvgId: string | undefined;
  let curTvgName: string | undefined;
  let curTvgLogo: string | undefined;
  let curGroup: string | undefined;
  let curDisplayName: string | undefined;
  let curLicenseKey: string | undefined;
  let curManifestType: string | undefined;
  let curUserAgent: string | undefined;

  let totalParsedCount = 0;
  let totalSourcesCount = 0;

  for (let i = 0; i <= len; i++) {
    // Detect line boundary (\n or \r\n or EOF)
    if (i === len || m3uText.charCodeAt(i) === 10 || m3uText.charCodeAt(i) === 13) {
      if (i > lineStart) {
        const line = m3uText.substring(lineStart, i).trim();
        if (line.length > 0) {
          // Check line header
          if (line.startsWith('#EXTINF:')) {
            curTvgId = extractAttribute(line, 'tvg-id') || extractAttribute(line, 'id');
            curTvgName = extractAttribute(line, 'tvg-name');
            curTvgLogo = extractAttribute(line, 'tvg-logo') || extractAttribute(line, 'logo');
            curGroup = extractAttribute(line, 'group-title') || extractAttribute(line, 'group');
            curDisplayName = extractExtinfName(line) || curTvgName;
          } else if (line.startsWith('#KODIPROP:inputstream.adaptive.license_key=')) {
            curLicenseKey = line.substring(43).trim();
          } else if (line.startsWith('#KODIPROP:inputstream.adaptive.manifest_type=')) {
            curManifestType = line.substring(45).trim();
          } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
            curUserAgent = line.substring(27).trim();
          } else if (line.charCodeAt(0) !== 35 && (line.startsWith('http://') || line.startsWith('https://'))) {
            // Found stream URL line
            const streamUrl = line;

            if (!isBlockedSource(streamUrl, curLicenseKey, true)) {
              totalParsedCount++;
              let channelName = curDisplayName || curTvgName || curTvgId || `Kênh ${totalParsedCount}`;
              
              // Đổi tên Kênh 178 thành Sky Sport EPL theo yêu cầu
              if (
                totalParsedCount === 178 ||
                channelName.toLowerCase().includes('kênh 178') ||
                channelName.toLowerCase().includes('kenh 178') ||
                channelName.toLowerCase().trim() === 'sky sports main event' ||
                streamUrl.endsWith('/17286')
              ) {
                channelName = 'Sky Sport EPL';
              }

              const normName = normalizeChannelName(channelName);
              const channelId = curTvgId || normName || `ch-${totalParsedCount}`;

              const drmConfig = parseDrmConfig(curLicenseKey, curManifestType);
              const streamType: 'hls' | 'mpd' | 'mp4' = (
                curManifestType === 'mpd' || 
                streamUrl.includes('.mpd') || 
                drmConfig !== undefined
              ) ? 'mpd' : 'hls';

              const newSource: StreamSource = {
                url: streamUrl,
                type: streamType,
                userAgent: curUserAgent,
                drm: drmConfig,
                label: streamType === 'mpd' ? 'Nguồn DASH (DRM)' : 'Nguồn HLS'
              };

              // Fast O(1) Hash Map lookup
              let existingChannel = idHashMap.get(channelId) || normalizedNameHashMap.get(normName);

              if (existingChannel) {
                // Ensure TV360+ channel category is updated to 'sukien'
                if (channelId.startsWith('tv360plus') || normName.startsWith('tv360') || channelName.toLowerCase().includes('tv360+')) {
                  existingChannel.category = 'sukien';
                  existingChannel.categoryName = 'Sự Kiện';
                }

                // Channel exists -> Multiplex stream source into candidates
                if (!existingChannel.sources) {
                  existingChannel.sources = [];
                }
                const isDuplicate = existingChannel.sources.some(s => s.url === newSource.url);
                if (!isDuplicate) {
                  existingChannel.sources.push(newSource);
                  totalSourcesCount++;
                }

                // If existing channel lacked backupUrl
                if (!existingChannel.backupUrl && existingChannel.url !== streamUrl) {
                  existingChannel.backupUrl = streamUrl;
                  existingChannel.backupType = streamType;
                  existingChannel.backupUserAgent = curUserAgent;
                  existingChannel.backupDrm = drmConfig;
                }

                // Enhance ClearKey DRM if keys present
                if (drmConfig?.keys && (!existingChannel.drm?.keys || Object.keys(existingChannel.drm.keys).length === 0)) {
                  existingChannel.drm = drmConfig;
                }
              } else {
                // New Channel -> Create and insert into Hash Maps
                let catInfo = mapGroupToCategory(curGroup);
                if (channelId.startsWith('tv360plus') || normName.startsWith('tv360') || channelName.toLowerCase().includes('tv360+')) {
                  catInfo = { category: 'sukien', categoryName: 'Sự Kiện' };
                }
                const newChannel: Channel = {
                  id: channelId,
                  number: idHashMap.size + 1,
                  name: channelName,
                  category: catInfo.category,
                  categoryName: catInfo.categoryName,
                  logo: curTvgLogo || 'https://raw.githubusercontent.com/hieu-TQS/LOGO-IPTV/main/default.png',
                  url: streamUrl,
                  type: streamType,
                  userAgent: curUserAgent,
                  drm: drmConfig,
                  sources: [newSource]
                };

                idHashMap.set(channelId, newChannel);
                normalizedNameHashMap.set(normName, newChannel);
                totalSourcesCount++;
              }
            }

            // Reset current parsing block
            curTvgId = undefined;
            curTvgName = undefined;
            curTvgLogo = undefined;
            curGroup = undefined;
            curDisplayName = undefined;
            curLicenseKey = undefined;
            curManifestType = undefined;
            curUserAgent = undefined;
          }
        }
      }
      lineStart = i + 1;
    }
  }

  // Convert Hash Map to final Array, sort Thể thao quốc tế alphabetically A-Z, and calculate stats
  const rawList = Array.from(idHashMap.values()).filter(
    (ch) => ch.id !== 'ch-66'
  );

  const categoryOrder: CategoryId[] = [
    'vtv',
    'vtvcab',
    'htv',
    'sctv',
    'thethaoquocte',
    'sukien',
    'diaphuong',
    'phim',
    'quocte',
    'nghenhac'
  ];

  // Sắp xếp kênh Thể thao quốc tế theo thứ tự bảng chữ cái A, B, C (A-Z)
  const sportsChannels = rawList
    .filter(c => c.category === 'thethaoquocte')
    .sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base', numeric: true }));

  const finalChannels: Channel[] = [];
  for (const cat of categoryOrder) {
    if (cat === 'thethaoquocte') {
      finalChannels.push(...sportsChannels);
    } else {
      finalChannels.push(...rawList.filter(c => c.category === cat));
    }
  }

  const knownCats = new Set(categoryOrder);
  finalChannels.push(...rawList.filter(c => !knownCats.has(c.category)));

  const categoryStats: Record<string, number> = {};

  for (let i = 0; i < finalChannels.length; i++) {
    finalChannels[i].number = i + 1;
    const cat = finalChannels[i].category;
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  }

  const parseTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  console.log(
    `[FastM3UParser] Đã phân tích đơn luồng ${finalChannels.length} kênh (${totalSourcesCount} luồng phát) trong ${parseTimeMs}ms`
  );

  return {
    channels: finalChannels,
    parseTimeMs,
    totalParsed: finalChannels.length,
    totalSources: totalSourcesCount,
    categoryStats
  };
}

/**
 * Benchmark runner to measure parser performance against M3U datasets
 */
export function benchmarkM3UParser(m3uText: string, iterations = 5): {
  avgTimeMs: number;
  minTimeMs: number;
  maxTimeMs: number;
  channelCount: number;
} {
  const times: number[] = [];
  let channelCount = 0;

  for (let i = 0; i < iterations; i++) {
    const res = fastParseM3U(m3uText);
    times.push(res.parseTimeMs);
    channelCount = res.totalParsed;
  }

  const minTimeMs = Math.min(...times);
  const maxTimeMs = Math.max(...times);
  const avgTimeMs = Math.round((times.reduce((a, b) => a + b, 0) / times.length) * 100) / 100;

  return {
    avgTimeMs,
    minTimeMs,
    maxTimeMs,
    channelCount
  };
}
