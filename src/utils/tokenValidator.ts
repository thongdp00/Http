/**
 * Token & Temporary Stream URL Validator
 * Checks Unix timestamps, MD5/SHA token parameters, and expiration signatures
 * to eliminate stale or expired streams prior to playback attempts.
 */

export interface TokenValidationResult {
  isExpired: boolean;
  expiryTimestamp?: number;
  reason?: string;
  tokenKey?: string;
}

// Common parameter keys representing expiration time or timestamp
const EXPIRY_PARAM_NAMES = [
  'exp',
  'expires',
  'expire',
  'expired',
  'validuntil',
  'valid_until',
  'endtime',
  'end_time',
  'deadline',
  'ts',
  'timestamp',
  'st',
  'start_time',
  'e',
  'wsTime',
  'wstime',
  'hds',
  'hdnts',
  'auth_key',
  'token'
];

/**
 * Checks if a stream URL contains an expired timestamp token
 * @param url Stream URL to check
 * @returns TokenValidationResult
 */
export function checkStreamTokenExpiry(url?: string): TokenValidationResult {
  if (!url || typeof url !== 'string') {
    return { isExpired: false };
  }

  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return { isExpired: false };
  }

  const nowSec = Math.floor(Date.now() / 1000);

  try {
    const parsedUrl = new URL(trimmed);
    const searchParams = parsedUrl.searchParams;

    // 1. Direct query parameters
    for (const key of EXPIRY_PARAM_NAMES) {
      const val = searchParams.get(key);
      if (val) {
        const result = evaluateTimestampString(val, key, nowSec);
        if (result.isEvaluated) {
          if (result.isExpired) {
            return {
              isExpired: true,
              expiryTimestamp: result.timestamp,
              reason: `Mã thông báo (Token) '${key}=${val}' đã hết hạn lúc ${new Date(result.timestamp * 1000).toLocaleTimeString()}`,
              tokenKey: key
            };
          }
        }
      }
    }

    // 2. Auth_key format (e.g. auth_key=1690000000-0-0-md5hash or token=timestamp-random-md5)
    for (const [paramName, paramVal] of searchParams.entries()) {
      if (paramName.includes('token') || paramName.includes('auth') || paramName.includes('sign') || paramName.includes('key')) {
        // Match patterns like "1690000000-0-0-abcdef..." or "1690000000_md5..."
        const match = paramVal.match(/^(\d{10,13})[-_]/);
        if (match) {
          const rawNum = parseInt(match[1], 10);
          const tsSec = rawNum > 1000000000000 ? Math.floor(rawNum / 1000) : rawNum;
          if (tsSec > 1500000000 && tsSec < 2200000000) {
            // If timestamp is in the past by more than 30 seconds
            if (tsSec < nowSec - 30) {
              return {
                isExpired: true,
                expiryTimestamp: tsSec,
                reason: `Chữ ký xác thực (${paramName}) đã hết hạn`,
                tokenKey: paramName
              };
            }
          }
        }
      }
    }

    // 3. Path-based token timestamps (e.g. /hls/live/exp=1690000000/chunk.m3u8 or /token/1690000000/playlist.m3u8)
    const pathname = parsedUrl.pathname;
    for (const key of ['exp', 'expires', 'expire', 'token']) {
      const regex = new RegExp(`(?:/|[?&]|,)${key}[=_](\\d{10,13}|[a-fA-F0-9]{8})`, 'i');
      const match = pathname.match(regex);
      if (match) {
        const result = evaluateTimestampString(match[1], key, nowSec);
        if (result.isEvaluated && result.isExpired) {
          return {
            isExpired: true,
            expiryTimestamp: result.timestamp,
            reason: `Đường dẫn URL chứa token '${key}' đã hết hạn`,
            tokenKey: key
          };
        }
      }
    }
  } catch {
    // If URL parsing fails, fallback to regex scanning on raw string
    const match = trimmed.match(/[?&](?:exp|expires|expire|validuntil)=(\d{10,13})/i);
    if (match) {
      const rawNum = parseInt(match[1], 10);
      const tsSec = rawNum > 1000000000000 ? Math.floor(rawNum / 1000) : rawNum;
      if (tsSec > 1500000000 && tsSec < nowSec - 30) {
        return {
          isExpired: true,
          expiryTimestamp: tsSec,
          reason: 'Token URL đã hết hạn',
          tokenKey: 'exp'
        };
      }
    }
  }

  return { isExpired: false };
}

/**
 * Evaluates a timestamp string (decimal Unix or hex)
 */
function evaluateTimestampString(
  val: string,
  key: string,
  nowSec: number
): { isEvaluated: boolean; isExpired: boolean; timestamp: number } {
  // Hexadecimal timestamp (e.g. wsTime=66cbb412 -> 1724625938)
  if (/^[a-fA-F0-9]{8}$/.test(val) && (key.toLowerCase().includes('time') || key.toLowerCase().includes('wstime'))) {
    try {
      const hexDec = parseInt(val, 16);
      if (hexDec > 1500000000 && hexDec < 2200000000) {
        return {
          isEvaluated: true,
          isExpired: hexDec < nowSec - 30,
          timestamp: hexDec
        };
      }
    } catch {}
  }

  // Decimal Unix timestamp (10 digits = seconds, 13 digits = milliseconds)
  if (/^\d{10,13}$/.test(val)) {
    const num = parseInt(val, 10);
    const tsSec = num > 1000000000000 ? Math.floor(num / 1000) : num;
    // Sanity check: valid Unix timestamp between 2017 and 2040
    if (tsSec > 1500000000 && tsSec < 2200000000) {
      return {
        isEvaluated: true,
        // Allow 30s clock drift buffer
        isExpired: tsSec < nowSec - 30,
        timestamp: tsSec
      };
    }
  }

  return { isEvaluated: false, isExpired: false, timestamp: 0 };
}
