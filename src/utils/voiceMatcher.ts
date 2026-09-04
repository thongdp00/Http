import { Channel } from '../types';

/**
 * Remove Vietnamese accents for flexible text matching
 */
export function removeVietnameseAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Parse Vietnamese numbers spoken as text or digits
 * e.g., "ba mươi bảy" -> 37, "bốn" -> 4, "kênh 37" -> 37
 */
export function parseVietnameseNumber(text: string): number | null {
  const normalized = removeVietnameseAccents(text);

  // 1. Try extracting direct digits first (e.g. "37", "kenh 37", "kenh 04")
  const digitMatch = normalized.match(/\b(\d+)\b/);
  if (digitMatch) {
    const num = parseInt(digitMatch[1], 10);
    if (!isNaN(num) && num > 0) return num;
  }

  // 2. Parse Vietnamese spoken number words
  const wordMap: Record<string, number> = {
    'khong': 0,
    'mot': 1, 'mot.': 1, 'moti': 1, 'nhut': 1,
    'hai': 2,
    'ba': 3,
    'bon': 4, 'tu': 4,
    'nam': 5, 'lam': 5,
    'sau': 6,
    'bay': 7,
    'tam': 8,
    'chin': 9,
    'muoi': 10
  };

  // Common spoken numbers 1-99 regex lookup
  if (normalized.includes('ba muoi bay') || normalized.includes('ba7')) return 37;
  if (normalized.includes('muoi lam') || normalized.includes('muoi lăm')) return 15;
  if (normalized.includes('hai muoi')) return 20;
  if (normalized.includes('ba muoi')) return 30;
  if (normalized.includes('bon muoi')) return 40;
  if (normalized.includes('nam muoi')) return 50;

  // Single word lookup
  const words = normalized.split(/\s+/);
  for (const w of words) {
    if (wordMap[w] !== undefined && wordMap[w] > 0) {
      // Avoid matching "ba" in "vinh long ba" if it's channel THVL3 (handled by channel logic)
      return wordMap[w];
    }
  }

  return null;
}

/**
 * Find best matching channel from speech input string
 */
export function matchChannelFromSpeech(
  speech: string,
  channels: Channel[]
): Channel | null {
  if (!speech || !speech.trim() || !channels || channels.length === 0) {
    return null;
  }

  const raw = speech.trim();
  const norm = removeVietnameseAccents(raw);

  // Clean common trigger prefixes: "kênh", "mở kênh", "xem kênh", "bật kênh", "chuyển kênh"
  let cleanNorm = norm
    .replace(/\b(chuyen sang kenh|chuyen kenh|mo kenh|xem kenh|bat kenh|kenh|mo|xem|bat|dai)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanNorm) {
    cleanNorm = norm;
  }

  // A. Check if the query refers directly to a channel number (e.g. "Kênh 37", "Kênh 4")
  const spokenNumber = parseVietnameseNumber(raw);
  if (spokenNumber !== null) {
    // Priority: Exact channel number match
    const numChannel = channels.find((c) => c.number === spokenNumber);
    if (numChannel) {
      return numChannel;
    }
  }

  // B. Specific Alias Mappings for common channels mentioned by users
  // e.g. "vĩnh long 1" -> THVL1, "on bibi" -> On BiBi, "quảng ngãi" -> QuangNgaiTV1
  const aliasMap: Record<string, string[]> = {
    'thvl1': ['vinh long 1', 'thvl 1', 'thvl1', 'vinh long1', 'kenh vinh long 1', 'truyen hinh vinh long 1'],
    'thvl2': ['vinh long 2', 'thvl 2', 'thvl2', 'vinh long2'],
    'thvl3': ['vinh long 3', 'thvl 3', 'thvl3', 'vinh long3'],
    'thvl4': ['vinh long 4', 'thvl 4', 'thvl4', 'vinh long4'],
    'vtvcab-bibi': ['on bibi', 'bibi', 'vtvcab bibi', 'kenh bibi', 'kenh on bibi', 'bi bi'],
    'htv7-hd': ['htv7', 'htv 7', 'kenh htv7', 'htv7 hd'],
    'vtv7-hd': ['vtv7', 'vtv 7', 'kenh vtv7', 'vtv7 hd'],
    'quangngaitv1': ['quang ngai', 'quang ngai 1', 'quangngaitv1', 'th quang ngai', 'truyen hinh quang ngai'],
    'quangngaitv2': ['quang ngai 2', 'quangngaitv2', 'qngtv2'],
    'vtv1-hd': ['vtv1', 'vtv 1', 'kenh vtv1'],
    'vtv2-hd': ['vtv2', 'vtv 2', 'kenh vtv2'],
    'vtv3-hd': ['vtv3', 'vtv 3', 'kenh vtv3'],
    'vtv4-hd': ['vtv4', 'vtv 4', 'kenh vtv4'],
    'vtv5-hd': ['vtv5', 'vtv 5', 'kenh vtv5'],
    'vtv6-hd': ['vtv6', 'vtv 6', 'kenh vtv6', 'vtv can tho', 'can tho'],
    'vtv8-hd': ['vtv8', 'vtv 8', 'kenh vtv8'],
    'vtv9-hd': ['vtv9', 'vtv 9', 'kenh vtv9'],
    'htv1': ['htv1', 'htv 1'],
    'htv2': ['htv2', 'htv 2'],
    'htv3': ['htv3', 'htv 3'],
    'htvkey': ['htv key', 'htvkey', 'kenh htv key', 'key htv'],
    'hitv': ['hi tv', 'hitv', 'kenh hitv', 'kenh hi tv'],
    'youtv': ['you tv', 'youtv', 'kenh you tv', 'kenh youtv'],
    'phim-anh-hung': ['anh hung', 'phim anh hung'],
    'phim-quy-nhap-trang-2': ['quy nhap trang 2', 'quy nhap trang hai', 'phim quy nhap trang 2'],
    'htv9-hd': ['htv9', 'htv 9', 'htv9 hd'],
  };

  for (const [channelId, keywords] of Object.entries(aliasMap)) {
    for (const kw of keywords) {
      if (cleanNorm.includes(kw) || norm.includes(kw)) {
        const found = channels.find((c) => c.id === channelId);
        if (found) return found;
      }
    }
  }

  // C. Exact match on channel ID or Channel Name
  const exactMatch = channels.find((c) => {
    const cNorm = removeVietnameseAccents(c.name);
    return c.id.toLowerCase() === cleanNorm || cNorm === cleanNorm;
  });
  if (exactMatch) return exactMatch;

  // D. Substring / Keyword Score Search
  let bestChannel: Channel | null = null;
  let highestScore = 0;

  for (const c of channels) {
    const nameNorm = removeVietnameseAccents(c.name);
    const idNorm = removeVietnameseAccents(c.id);
    let score = 0;

    // Check if clean query is inside channel name or vice versa
    if (nameNorm.includes(cleanNorm)) {
      score += 50;
    }
    if (cleanNorm.includes(nameNorm)) {
      score += 40;
    }
    if (idNorm.includes(cleanNorm)) {
      score += 30;
    }

    // Word token matching
    const queryTokens = cleanNorm.split(' ').filter((t) => t.length > 1);
    const nameTokens = nameNorm.split(' ').filter((t) => t.length > 1);

    for (const qt of queryTokens) {
      if (nameTokens.includes(qt)) {
        score += 15;
      } else if (nameNorm.includes(qt)) {
        score += 8;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestChannel = c;
    }
  }

  if (highestScore >= 15) {
    return bestChannel;
  }

  return null;
}
