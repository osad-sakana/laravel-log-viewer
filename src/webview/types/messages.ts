export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'NOTICE' | 'ALERT' | 'EMERGENCY';

export interface StackTraceLine {
  file: string;
  line: number;
  method: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  environment: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stackTrace?: StackTraceLine[];
  filePath: string;
  lineNumber: number;
}

export interface SearchQuery {
  keyword?: string;
  levels?: LogLevel[];
  dateRange?: {
    start: string;
    end: string;
  };
  environments?: string[];
}

export type MessageFromExtension =
  | { type: 'init'; payload: { message: string } }
  | { type: 'logsLoaded'; payload: { entries: LogEntry[]; total: number } }
  | { type: 'searchResult'; payload: { entries: LogEntry[]; total: number; executionTime: number; filesSearched: number } }
  | { type: 'error'; payload: { message: string } };

export type MessageToExtension =
  | { type: 'ready' }
  | { type: 'loadLogs'; payload?: { logPath?: string } }
  | { type: 'search'; payload: SearchQuery & { logPath?: string } }
  | { type: 'openFile'; payload: { filePath: string; line: number } };
