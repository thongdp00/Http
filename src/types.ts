export type CategoryId = 
  | 'vtv' 
  | 'vtvcab' 
  | 'htv' 
  | 'sctv' 
  | 'thethaoquocte'
  | 'sukien'
  | 'diaphuong' 
  | 'phim' 
  | 'quocte'
  | 'nghenhac';

export interface DRMConfig {
  type: 'clearkey' | 'widevine';
  licenseUrl?: string;
  keys?: Record<string, string>;
}

export interface StreamSource {
  url: string;
  type?: 'hls' | 'mpd' | 'mp4' | 'ts';
  userAgent?: string;
  drm?: DRMConfig;
  label?: string;
}

export interface Channel {
  id: string;
  number: number;
  name: string;
  category: CategoryId;
  categoryName: string;
  logo: string;
  url: string;
  userAgent?: string;
  drm?: DRMConfig;
  type?: 'hls' | 'mpd' | 'mp4' | 'ts';
  backupUrl?: string;
  backupType?: 'hls' | 'mpd' | 'mp4' | 'ts';
  backupUserAgent?: string;
  backupDrm?: DRMConfig;
  urls?: string[];
  sources?: StreamSource[];
}

export type PlayerEngine = 'auto' | 'exoplayer' | 'okplayer';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  iconName: string;
}
