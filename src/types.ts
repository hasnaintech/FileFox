import { SupportedFormat } from './lib/converter';

export interface HistoryItem {
  id: string;
  fileName: string;
  fileSize: number;
  originalFormat: string;
  targetFormat: string;
  timestamp: number;
  downloadUrl?: string; // only available during active session
}

export type AppTheme = 'slate' | 'sunset' | 'ocean' | 'emerald' | 'aurora';

export interface AppSettings {
  quality: number; // 0.1 to 1.0
  autoDownload: boolean;
  theme: AppTheme;
}
