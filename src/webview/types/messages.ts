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

export type MessageFromExtension =
  | { type: 'init'; payload: { message: string } }
  | { type: 'logsLoaded'; payload: { entries: LogEntry[]; total: number } }
  | { type: 'error'; payload: { message: string } };

export type MessageToExtension =
  | { type: 'ready' }
  | { type: 'loadLogs' }
  | { type: 'openFile'; payload: { filePath: string; line: number } };
