export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' | 'NOTICE' | 'ALERT' | 'EMERGENCY';

export interface StackTraceLine {
  file: string;
  line: number;
  method: string;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  environment: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  stackTrace?: StackTraceLine[];
  filePath: string;
  lineNumber: number;
}

export interface LogFile {
  path: string;
  size: number;
  mtime: Date;
  type: 'single' | 'daily' | 'environment' | 'custom';
}
