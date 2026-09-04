import express from 'express';
import path from 'path';
import { Readable } from 'stream';
import { createServer as createViteServer } from 'vite';

function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).toString();
  } catch {
    return relative;
  }
}

function buildProxyUrl(targetUrl: string, ua?: string, channelId?: string): string {
  let url = `/api/stream-proxy?url=${encodeURIComponent(targetUrl)}`;
  if (ua) url += `&ua=${encodeURIComponent(ua)}`;
  if (channelId) url += `&channelId=${encodeURIComponent(channelId)}`;
  return url;
}

function rewriteMpd(content: string, baseUrl: string, ua?: string): string {
  let cleanContent = content;

  // Strip non-XML preamble/JWT tokens if present
  const xmlIndex = cleanContent.indexOf('<?xml');
  const mpdIndex = cleanContent.indexOf('<MPD');
  if (xmlIndex !== -1) {
    cleanContent = cleanContent.slice(xmlIndex);
  } else if (mpdIndex !== -1) {
    cleanContent = cleanContent.slice(mpdIndex);
  }

  // Rewrite existing <BaseURL> tags to absolute URLs
  if (/<BaseURL>([^<]+)<\/BaseURL>/i.test(cleanContent)) {
    cleanContent = cleanContent.replace(/<BaseURL>([^<]+)<\/BaseURL>/gi, (_match, inner) => {
      const trimmed = inner.trim();
      const abs = resolveUrl(trimmed, baseUrl);
      return `<BaseURL>${abs}</BaseURL>`;
    });
  } else {
    // If no <BaseURL> tag exists, resolve base directory from baseUrl and inject it
    try {
      const urlObj = new URL(baseUrl);
      const pathname = urlObj.pathname;
      const baseDir = urlObj.origin + pathname.substring(0, pathname.lastIndexOf('/') + 1);
      cleanContent = cleanContent.replace(/<Period([^>]*)>/i, `<Period$1>\n    <BaseURL>${baseDir}</BaseURL>`);
    } catch {}
  }

  // Rewrite <Location> tags to absolute URLs if present
  cleanContent = cleanContent.replace(/<Location>([^<]+)<\/Location>/gi, (_match, inner) => {
    const trimmed = inner.trim();
    const abs = resolveUrl(trimmed, baseUrl);
    return `<Location>${abs}</Location>`;
  });

  return cleanContent;
}

function rewriteM3u8(content: string, baseUrl: string, ua?: string, channelId?: string): string {
  const lines = content.split('\n');
  const result: string[] = [];
  const effectiveUa = ua || 'Dalvik/2.1.0';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push(line);
      continue;
    }

    // Rewrite tags containing URIs (EXT-X-MEDIA, EXT-X-KEY, EXT-X-MAP, EXT-X-I-FRAME-STREAM-INF)
    if (
      trimmed.startsWith('#EXT-X-MEDIA:') ||
      trimmed.startsWith('#EXT-X-KEY:') ||
      trimmed.startsWith('#EXT-X-MAP:') ||
      trimmed.startsWith('#EXT-X-I-FRAME-STREAM-INF:')
    ) {
      const rewrittenTag = trimmed.replace(/URI="([^"]+)"/g, (_match, uri) => {
        const abs = resolveUrl(uri, baseUrl);
        return `URI="${buildProxyUrl(abs, effectiveUa, channelId)}"`;
      });
      result.push(rewrittenTag);
    } else if (trimmed.startsWith('#')) {
      result.push(line);
    } else {
      // Non-comment lines are stream variant URLs or segment URLs (.ts, .m4s, etc.)
      const abs = resolveUrl(trimmed, baseUrl);
      result.push(buildProxyUrl(abs, effectiveUa, channelId));
    }
  }

  return result.join('\n');
}

const SEX_PLAYLIST_URL = 'https://tv.vietanhtv.top/sex/';

interface ServerTokenData {
  id?: string;
  name?: string;
  tv360Id?: string;
  url: string;
  expires?: number;
  token?: string;
  licenseKey?: string;
  manifestType?: string;
  userAgent?: string;
  group?: string;
}

const serverTokenCache = {
  lastUpdated: 0,
  isFetching: false,
  byTv360Id: {} as Record<string, ServerTokenData>,
  byChannelId: {} as Record<string, ServerTokenData>,
  byName: {} as Record<string, ServerTokenData>,
  allTv360: [] as ServerTokenData[],
};

async function syncTv360TokensFromSex(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - serverTokenCache.lastUpdated < 1000 * 60 * 5 && serverTokenCache.allTv360.length > 0) {
    return true;
  }
  if (serverTokenCache.isFetching) return false;

  serverTokenCache.isFetching = true;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(SEX_PLAYLIST_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/plain, application/x-mpegurl, */*'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const text = await res.text();
      if (text && text.includes('#EXTINF:')) {
        const lines = text.split(/\r?\n/);
        const byTv360Id: Record<string, ServerTokenData> = {};
        const byChannelId: Record<string, ServerTokenData> = {};
        const byName: Record<string, ServerTokenData> = {};
        const allTv360: ServerTokenData[] = [];
        let cur: Partial<ServerTokenData> = {};

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          if (line.startsWith('#EXTINF:')) {
            cur = {};
            const idMatch = line.match(/tvg-id="([^"]+)"/i);
            const nameMatch = line.match(/,\s*([^,]+)$/);
            const groupMatch = line.match(/group-title="([^"]+)"/i);
            if (idMatch) cur.id = idMatch[1].trim();
            if (nameMatch) cur.name = nameMatch[1].trim();
            if (groupMatch) cur.group = groupMatch[1].trim();
          } else if (line.startsWith('#KODIPROP:inputstream.adaptive.license_key=')) {
            cur.licenseKey = line.split('license_key=')[1].trim();
          } else if (line.startsWith('#KODIPROP:inputstream.adaptive.manifest_type=')) {
            cur.manifestType = line.split('manifest_type=')[1].trim();
          } else if (line.startsWith('#EXTVLCOPT:http-user-agent=')) {
            cur.userAgent = line.split('http-user-agent=')[1].trim();
          } else if (line.startsWith('http://') || line.startsWith('https://')) {
            cur.url = line;
            if (
              cur.url.includes('tv360.php') ||
              cur.url.includes('cleankey.php') ||
              cur.licenseKey?.includes('cleankey.php') ||
              cur.id?.toLowerCase().includes('tv360') ||
              cur.licenseKey?.includes('tv360') ||
              cur.id?.toLowerCase().includes('sctv')
            ) {
              const matchId = cur.url.match(/[?&]id=(\d+)/);
              if (matchId) {
                cur.tv360Id = matchId[1];
              }
              const matchExpires = cur.url.match(/[?&]expires=(\d+)/);
              if (matchExpires) {
                cur.expires = parseInt(matchExpires[1], 10);
              }
              const matchToken = cur.url.match(/[?&]token=([a-fA-F0-9]+)/);
              if (matchToken) {
                cur.token = matchToken[1];
              }

              const item = cur as ServerTokenData;
              allTv360.push(item);
              if (item.tv360Id) byTv360Id[item.tv360Id] = item;
              if (item.id) {
                const cleanId = item.id.toLowerCase().replace(/[^a-z0-9]/g, '');
                byChannelId[cleanId] = item;
                byChannelId[item.id.toLowerCase()] = item;
                byChannelId[cleanId.replace(/hd$/, '')] = item;
                byChannelId[cleanId + 'hd'] = item;
              }
              if (item.name) {
                const cleanName = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                byName[cleanName] = item;
                byName[cleanName.replace(/hd$/, '')] = item;
              }
            }
            cur = {};
          }
        }

        serverTokenCache.byTv360Id = byTv360Id;
        serverTokenCache.byChannelId = byChannelId;
        serverTokenCache.byName = byName;
        serverTokenCache.allTv360 = allTv360;
        serverTokenCache.lastUpdated = Date.now();
        console.log(`[TV360-Sync] Tự động cập nhật thành công ${allTv360.length} kênh TV360 và DRM từ ${SEX_PLAYLIST_URL}`);
        return true;
      }
    }
  } catch (err: any) {
    console.warn('[TV360-Sync] Lỗi khi đồng bộ từ sex playlist:', err?.message || err);
  } finally {
    serverTokenCache.isFetching = false;
  }
  return false;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initial sync & recurring background sync every 5 minutes
  syncTv360TokensFromSex(true).catch(() => {});
  setInterval(() => {
    syncTv360TokensFromSex(true).catch(() => {});
  }, 1000 * 60 * 5);

  // Global CORS Middleware - Ensures Access-Control-Allow-Origin: * on ALL requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, HEAD, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Expose-Headers', '*');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // TV360 & DRM Live Tokens Sync Endpoint
  app.get('/api/tv360-tokens', async (req, res) => {
    const force = req.query.force === 'true';
    if (force || Date.now() - serverTokenCache.lastUpdated > 1000 * 60 * 5) {
      await syncTv360TokensFromSex(force);
    }
    return res.json({
      success: true,
      timestamp: serverTokenCache.lastUpdated,
      total: serverTokenCache.allTv360.length,
      tokens: {
        byTv360Id: serverTokenCache.byTv360Id,
        byChannelId: serverTokenCache.byChannelId,
        byName: serverTokenCache.byName,
        allTv360: serverTokenCache.allTv360,
      }
    });
  });

  app.get('/api/tv360-sync', async (_req, res) => {
    const success = await syncTv360TokensFromSex(true);
    return res.json({
      success,
      timestamp: serverTokenCache.lastUpdated,
      total: serverTokenCache.allTv360.length,
    });
  });

  // Dedicated CORS proxy for ClearKey DRM license endpoints with auto-token renewal
  app.get('/api/clearkey-proxy', async (req, res) => {
    let targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url query parameter' });
    }

    try {
      targetUrl = decodeURIComponent(targetUrl);
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid URL' });
      }

      // Auto-update token if it is a cleankey.php URL
      if (targetUrl.includes('cleankey.php')) {
        const idMatch = targetUrl.match(/[?&]id=([^&]+)/);
        if (idMatch) {
          const keyId = idMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '');
          const cached = serverTokenCache.byChannelId[keyId] || 
                         serverTokenCache.byChannelId[idMatch[1].toLowerCase()] ||
                         serverTokenCache.byChannelId[keyId.replace(/hd$/, '')] ||
                         serverTokenCache.byChannelId[keyId + 'hd'];
          if (cached && cached.licenseKey && cached.licenseKey.startsWith('http')) {
            targetUrl = cached.licenseKey;
          }
        }
      }

      const isVietAnhTv = targetUrl.includes('vietanhtv.top') || targetUrl.includes('tv360');
      const fetchHeaders: Record<string, string> = {
        'User-Agent': (req.query.ua as string) || (isVietAnhTv ? 'Dalvik/2.1.0' : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'),
        'Accept': 'application/json, text/plain, */*',
      };

      if (isVietAnhTv) {
        fetchHeaders['Referer'] = 'https://tv.vietanhtv.top/';
        fetchHeaders['Origin'] = 'https://tv.vietanhtv.top';
      }

      let response = await fetch(targetUrl, {
        headers: fetchHeaders,
        redirect: 'follow',
      });

      // If token expired (401/403/404), trigger sync and retry with freshest token
      if (!response.ok && (response.status === 401 || response.status === 403 || response.status === 404) && targetUrl.includes('cleankey.php')) {
        await syncTv360TokensFromSex(true);
        const idMatch = targetUrl.match(/[?&]id=([^&]+)/);
        if (idMatch) {
          const keyId = idMatch[1].toLowerCase().replace(/[^a-z0-9]/g, '');
          const refreshed = serverTokenCache.byChannelId[keyId] || serverTokenCache.byChannelId[idMatch[1].toLowerCase()];
          if (refreshed && refreshed.licenseKey && refreshed.licenseKey.startsWith('http') && refreshed.licenseKey !== targetUrl) {
            targetUrl = refreshed.licenseKey;
            response = await fetch(targetUrl, {
              headers: fetchHeaders,
              redirect: 'follow',
            });
          }
        }
      }

      const data = await response.text();
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Content-Type', response.headers.get('content-type') || 'application/json; charset=utf-8');
      res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.status(response.status).send(data);
    } catch (err: any) {
      console.error('[clearkey-proxy error]', err?.message || err);
      return res.status(502).json({ error: 'Failed to fetch ClearKeys from remote license server' });
    }
  });

  // High-performance CORS Stream Proxy for HLS / M3U8, DASH & Media Segments
  app.get('/api/stream-proxy', async (req, res) => {
    let targetUrl = req.query.url as string;
    const channelId = (req.query.channelId as string) || '';

    if (!targetUrl) {
      return res.status(400).json({ error: 'Missing url query parameter' });
    }

    // Prevent recursive / nested proxy URL wrapping
    while (targetUrl.includes('/api/stream-proxy?url=')) {
      const match = targetUrl.match(/\/api\/stream-proxy\?url=([^&]+)/);
      if (match && match[1]) {
        try {
          targetUrl = decodeURIComponent(match[1]);
        } catch {
          break;
        }
      } else {
        break;
      }
    }

    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      return res.status(400).json({ error: 'Invalid URL format', url: targetUrl });
    }

    let controller: AbortController | null = null;
    try {
      // Auto-update TV360 stream tokens if cached version is newer or incoming URL is expired
      if (targetUrl.includes('tv360.php')) {
        const idMatch = targetUrl.match(/[?&]id=(\d+)/);
        if (idMatch) {
          const cached = serverTokenCache.byTv360Id[idMatch[1]];
          if (cached && cached.url && cached.url.startsWith('http')) {
            const expMatch = targetUrl.match(/[?&]expires=(\d+)/);
            const nowSec = Math.floor(Date.now() / 1000);
            if (!expMatch || parseInt(expMatch[1], 10) < nowSec || (cached.expires && expMatch && cached.expires > parseInt(expMatch[1], 10))) {
              targetUrl = cached.url;
            }
          }
        }
      }

      const isTtqt =
        (channelId && channelId.startsWith('ttqt-')) ||
        targetUrl.endsWith('.ts') ||
        targetUrl.includes('.ts?') ||
        targetUrl.includes('extension=ts') ||
        targetUrl.includes('ifiesta.net') ||
        targetUrl.includes('watchtivo') ||
        targetUrl.includes('ciao-ott') ||
        targetUrl.includes('zazaint.com') ||
        targetUrl.includes('line.');

      const isVietAnhTvOrTv360 =
        targetUrl.includes('vietanhtv.top') ||
        targetUrl.includes('tv360.vn') ||
        targetUrl.includes('tv360') ||
        targetUrl.includes('27.67.80') ||
        (req.query.ua as string || '').includes('Dalvik');

      const isTsStream =
        isTtqt ||
        targetUrl.includes('.ts') ||
        targetUrl.includes('extension=ts') ||
        targetUrl.includes('ifiesta.net') ||
        targetUrl.includes('watchtivo') ||
        targetUrl.includes('zazaint');

      let customUserAgent = (req.query.ua as string) || '';
      if (!customUserAgent) {
        if (isTtqt) {
          customUserAgent = 'VLC/3.0.9 LibVLC/3.0.9';
        } else if (isVietAnhTvOrTv360) {
          customUserAgent = 'Dalvik/2.1.0';
        } else {
          customUserAgent = 'Dalvik/2.1.0';
        }
      }

      let targetOrigin = '';
      try {
        targetOrigin = new URL(targetUrl).origin;
      } catch {}

      const fetchHeaders: Record<string, string> = {
        'User-Agent': customUserAgent,
        Accept: '*/*',
        Connection: 'keep-alive',
      };

      if (targetUrl.includes('seenow.vn')) {
        fetchHeaders['Referer'] = 'https://seenow.vn/';
        fetchHeaders['Origin'] = 'https://seenow.vn';
      } else if (targetUrl.includes('vtvprime.vn')) {
        fetchHeaders['Referer'] = 'https://vtvprime.vn/';
        fetchHeaders['Origin'] = 'https://vtvprime.vn';
      } else if (isVietAnhTvOrTv360) {
        fetchHeaders['Referer'] = 'https://tv.vietanhtv.top/';
        fetchHeaders['Origin'] = 'https://tv.vietanhtv.top/';
      } else if (targetOrigin) {
        fetchHeaders['Referer'] = targetUrl;
        fetchHeaders['Origin'] = targetOrigin;
      }

      if (req.headers.range) {
        fetchHeaders['Range'] = req.headers.range as string;
      }

      controller = new AbortController();
      const timeoutMs = isTsStream ? 15000 : 12000;
      const timeoutId = setTimeout(() => {
        try {
          controller?.abort();
        } catch {}
      }, timeoutMs);

      // Cleanly abort upstream request if client closes connection (e.g. channel switch)
      req.on('close', () => {
        try {
          controller?.abort();
        } catch {}
      });

      let response: Response;
      try {
        response = await fetch(targetUrl, {
          headers: fetchHeaders,
          redirect: 'follow',
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      // If token expired or unauthorized (401/403), refresh tokens and retry
      if (!response.ok && (response.status === 401 || response.status === 403 || response.status === 404)) {
        if (targetUrl.includes('tv360.php') || targetUrl.includes('vietanhtv') || (channelId && (channelId.includes('tv360') || channelId.includes('hitv') || channelId.includes('sctv')))) {
          console.log(`[Stream-Proxy] Gặp lỗi ${response.status} với ${targetUrl}, đang tự động làm mới token...`);
          await syncTv360TokensFromSex(true);

          let freshTargetUrl = '';
          const idMatch = targetUrl.match(/[?&]id=(\d+)/);
          if (idMatch && serverTokenCache.byTv360Id[idMatch[1]]) {
            freshTargetUrl = serverTokenCache.byTv360Id[idMatch[1]].url;
          } else if (channelId) {
            const cleanId = channelId.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cached = serverTokenCache.byChannelId[cleanId] || serverTokenCache.byChannelId[channelId.toLowerCase()];
            if (cached && cached.url) {
              freshTargetUrl = cached.url;
            }
          }

          if (freshTargetUrl && freshTargetUrl !== targetUrl && freshTargetUrl.startsWith('http')) {
            targetUrl = freshTargetUrl;
            const retryCtrl = new AbortController();
            const retryTimeout = setTimeout(() => retryCtrl.abort(), 12000);
            try {
              response = await fetch(targetUrl, {
                headers: fetchHeaders,
                redirect: 'follow',
                signal: retryCtrl.signal,
              });
            } catch (retryErr) {
              console.warn('[Stream-Proxy] Lỗi thử lại với token mới:', retryErr);
            } finally {
              clearTimeout(retryTimeout);
            }
          }
        }
      }

      const finalUrl = response.url || targetUrl;
      const contentType = response.headers.get('content-type') || '';

      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      res.header('Access-Control-Allow-Headers', '*');
      res.header('Access-Control-Expose-Headers', '*');

      if (!response.ok && response.status >= 400 && !response.body) {
        return res.status(response.status).send('Máy chủ nguồn từ chối kết nối.');
      }

      const isLikelyMedia =
        contentType.includes('video/') ||
        contentType.includes('audio/') ||
        targetUrl.endsWith('.ts') ||
        targetUrl.includes('.ts?') ||
        targetUrl.includes('extension=ts') ||
        targetUrl.includes('.m4s') ||
        targetUrl.includes('.dash') ||
        targetUrl.includes('.mp4') ||
        targetUrl.includes('.aac') ||
        finalUrl.endsWith('.ts') ||
        finalUrl.includes('.ts?') ||
        finalUrl.includes('.m4s') ||
        finalUrl.includes('.dash');

      const isLikelyManifest =
        !isLikelyMedia &&
        (contentType.includes('dash+xml') ||
          contentType.includes('mpegurl') ||
          contentType.includes('m3u8') ||
          contentType.includes('text') ||
          contentType.includes('xml') ||
          contentType.includes('json') ||
          targetUrl.includes('.mpd') ||
          targetUrl.includes('.m3u8') ||
          targetUrl.includes('.php') ||
          finalUrl.includes('.mpd') ||
          finalUrl.includes('.m3u8') ||
          finalUrl.includes('.php'));

      if (isLikelyManifest) {
        const text = await response.text();
        if (text.includes('<MPD') || contentType.includes('dash+xml') || targetUrl.includes('.mpd') || finalUrl.includes('.mpd')) {
          const rewritten = rewriteMpd(text, finalUrl, customUserAgent);
          res.header('Content-Type', 'application/dash+xml; charset=utf-8');
          res.header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          return res.status(response.status).send(rewritten);
        } else if (text.includes('#EXTM3U') || text.includes('#EXTINF') || contentType.includes('mpegurl') || contentType.includes('m3u8') || targetUrl.includes('.m3u8') || finalUrl.includes('.m3u8')) {
          const rewritten = rewriteM3u8(text, finalUrl, customUserAgent, channelId);
          res.header('Content-Type', 'application/vnd.apple.mpegurl; charset=utf-8');
          res.header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          return res.status(response.status).send(rewritten);
        } else {
          res.header('Content-Type', contentType || 'text/plain; charset=utf-8');
          res.header('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
          return res.status(response.status).send(text);
        }
      }

      // Media chunks / TS streams / segments / keys / init files -> stream piping for continuous live playback
      res.header('Content-Type', contentType || (isTtqt ? 'video/MP2T' : 'application/octet-stream'));
      if (response.headers.get('content-length')) {
        res.header('Content-Length', response.headers.get('content-length')!);
      }
      if (response.headers.get('accept-ranges')) {
        res.header('Accept-Ranges', response.headers.get('accept-ranges')!);
      }
      if (response.headers.get('content-range')) {
        res.header('Content-Range', response.headers.get('content-range')!);
      }

      // Caching header for video segments (.ts, .m4s, .dash, etc.)
      if (
        (targetUrl.includes('.ts') ||
          targetUrl.includes('.m4s') ||
          targetUrl.includes('.dash') ||
          targetUrl.includes('.mp4') ||
          targetUrl.includes('.aac') ||
          contentType.includes('video/') ||
          contentType.includes('audio/')) &&
        !isTtqt
      ) {
        res.header('Cache-Control', 'public, max-age=86400, immutable');
      } else {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
      }

      res.status(response.status);

      // Continuous Pipe Stream for live high bitrate & TS playback
      if (response.body) {
        if (typeof (response.body as any).pipe === 'function') {
          const bodyStream = response.body as any;
          bodyStream.on('error', (pipeErr: any) => {
            if (!res.writableEnded) {
              try { res.end(); } catch {}
            }
          });
          bodyStream.pipe(res);
        } else if (typeof Readable.fromWeb === 'function') {
          const nodeStream = Readable.fromWeb(response.body as any);
          nodeStream.on('error', (pipeErr: any) => {
            if (!res.writableEnded) {
              try { res.end(); } catch {}
            }
          });
          nodeStream.pipe(res);
        } else {
          const reader = response.body.getReader();
          const pump = async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  if (!res.writableEnded) res.end();
                  break;
                }
                if (!res.write(Buffer.from(value))) {
                  await new Promise((resolve) => res.once('drain', resolve));
                }
              }
            } catch (pumpErr) {
              if (!res.writableEnded) {
                try { res.end(); } catch {}
              }
            }
          };
          pump().catch(() => {
            if (!res.writableEnded) {
              try { res.end(); } catch {}
            }
          });
        }
        return;
      }

      return res.end();
    } catch (err: any) {
      const isAbort = err?.name === 'AbortError' || req.destroyed || controller?.signal?.aborted;
      if (!isAbort) {
        console.warn(`[stream-proxy] Error proxying stream ${targetUrl}:`, err?.message || err);
      }
      if (!res.headersSent && !res.writableEnded) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.header('Content-Type', 'text/plain; charset=utf-8');
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        return res.status(502).send('Bad Gateway: Source stream unreachable or offline');
      }
      if (!res.writableEnded) {
        try { res.end(); } catch {}
      }
      return;
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HT-TV Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

