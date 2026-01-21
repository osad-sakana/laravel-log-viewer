import { LogLevel } from './logEntry';

export interface SearchQuery {
  keyword?: string;
  levels?: LogLevel[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  environments?: string[];
  files?: string[];
}

export interface SearchResult {
  entries: any[];
  total: number;
  executionTime: number;
  filesSearched: number;
}
