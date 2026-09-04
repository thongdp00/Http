import { nativeBridge } from './nativeBridge';

/**
 * Checks if a channel is TTQT (Thể thao quốc tế) or TS stream
 */
export function isTtqtOrTsStream(url: string, channelId?: string, category?: string, categoryName?: string): boolean {
  const idLower = (channelId || '').toLowerCase();
  const catLower = (category || '').toLowerCase();
  const catNameLower = (categoryName || '').toLowerCase();
  const urlLower = (url || '').toLowerCase();

  return (
    idLower.startsWith('ttqt-') ||
    catLower === 'thethaoquocte' ||
    catNameLower.includes('thể thao quốc tế') ||
    catNameLower.includes('the thao quoc te') ||
    urlLower.endsWith('.ts') ||
    urlLower.includes('.ts?') ||
    urlLower.includes('extension=ts') ||
    urlLower.includes('ifiesta.net') ||
    urlLower.includes('watchtivo') ||
    urlLower.includes('ciao-ott') ||
    urlLower.includes('zazaint.com') ||
    urlLower.includes('line.')
  );
}

/**
 * Checks if a channel is HiTV or TV360 in the 'Sự Kiện' (sukien) category
 */
export function isSpecialTargetChannel(channelId?: string, category?: string, categoryName?: string): boolean {
  if (!channelId) return false;
  const idLower = channelId.toLowerCase();
  const catLower = (category || '').toLowerCase();
  const catNameLower = (categoryName || '').toLowerCase();

  const isHiTv = idLower === 'hitv';
  const isTv360Event = idLower.includes('tv360') && (catLower === 'sukien' || catNameLower.includes('sự kiện') || catNameLower.includes('su kien'));

  return isHiTv || isTv360Event;
}

/**
 * Checks if a URL requires server-side CORS proxying when running in a web browser.
 */
export function requiresCorsProxy(url: string, channelId?: string, category?: string, categoryName?: string): boolean {
  if (!url) return false;
  if (url.startsWith('/api/stream-proxy') || url.startsWith('http://localhost:3000/api/stream-proxy')) {
    return false;
  }

  // Native Android Media3 does not enforce browser CORS policy
  if (nativeBridge.isNative()) {
    return false;
  }

  // Special target channels: hitv OR (tv360 in Sự Kiện)
  if (isSpecialTargetChannel(channelId, category, categoryName)) {
    return true;
  }

  // TTQT or TS stream channels require CORS proxy & VLC user-agent headers
  if (isTtqtOrTsStream(url, channelId, category, categoryName)) {
    return true;
  }

  // Explicit Channel IDs that are known to lack Access-Control-Allow-Origin
  if (channelId && ['dnrtv3'].includes(channelId.toLowerCase())) {
    return true;
  }

  const lower = url.toLowerCase();

  // Domains or endpoints without Access-Control-Allow-Origin headers or requiring custom headers
  if (
    lower.includes('tv.vietanhtv.top') ||
    lower.includes('vietanhtv.top') ||
    lower.includes('vietanhtv.id.vn') ||
    lower.includes('dong-nai-3') ||
    lower.includes('/tv360.php') ||
    lower.includes('/vieon.php') ||
    lower.includes('tv360.php?id=32') ||
    lower.includes('tv360.php?id=31') ||
    lower.includes('ifiesta.net') ||
    lower.includes('watchtivo') ||
    lower.includes('ciao-ott') ||
    lower.includes('zazaint.com') ||
    lower.includes('freem3u.xyz')
  ) {
    return true;
  }

  return false;
}

/**
 * Transforms a stream URL to use the server-side CORS proxy if required.
 */
export function getProxiedStreamUrl(url: string, userAgent?: string, channelId?: string, category?: string, categoryName?: string): string {
  if (!url) return '';
  if (url.startsWith('/api/stream-proxy')) return url;

  if (requiresCorsProxy(url, channelId, category, categoryName)) {
    const isTtqt = isTtqtOrTsStream(url, channelId, category, categoryName);
    const isSpecial = isSpecialTargetChannel(channelId, category, categoryName);
    
    let ua = userAgent;
    if (isTtqt) {
      ua = 'VLC/3.0.9 LibVLC/3.0.9';
    } else if (isSpecial) {
      ua = 'Dalvik/2.1.0';
    } else if (!ua) {
      ua = 'Dalvik/2.1.0';
    }

    let proxyUrl = `/api/stream-proxy?url=${encodeURIComponent(url)}&ua=${encodeURIComponent(ua)}`;
    if (channelId) {
      proxyUrl += `&channelId=${encodeURIComponent(channelId)}`;
    }
    return proxyUrl;
  }

  return url;
}


