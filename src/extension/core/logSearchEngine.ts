import { LogEntry, LogFile } from '../models/logEntry';
import { SearchQuery, SearchResult } from '../models/searchQuery';
import { LogParser } from './logParser';
import { LRUCache } from '../services/cacheService';

export class LogSearchEngine {
  private parser: LogParser;
  private cache: LRUCache<string, SearchResult>;

  constructor() {
    this.parser = new LogParser();
    this.cache = new LRUCache(50);
  }

  public async search(
    query: SearchQuery,
    files: LogFile[],
    maxEntries: number = 1000
  ): Promise<SearchResult> {
    const startTime = Date.now();

    const cacheKey = this.generateCacheKey(query, files);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return {
        ...cached,
        executionTime: Date.now() - startTime,
      };
    }

    const allEntries: LogEntry[] = [];

    for (const file of files) {
      const entries = await this.parser.parseFile(file.path, maxEntries * 2);
      allEntries.push(...entries);
    }

    const filteredEntries = this.applyFilters(allEntries, query);

    filteredEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const limitedEntries = filteredEntries.slice(0, maxEntries);

    const result: SearchResult = {
      entries: limitedEntries,
      total: filteredEntries.length,
      executionTime: Date.now() - startTime,
      filesSearched: files.length,
    };

    this.cache.set(cacheKey, result);

    return result;
  }

  private applyFilters(entries: LogEntry[], query: SearchQuery): LogEntry[] {
    return entries.filter((entry) => {
      if (query.keyword) {
        const keyword = query.keyword.toLowerCase();
        const messageMatch = entry.message.toLowerCase().includes(keyword);
        const envMatch = entry.environment.toLowerCase().includes(keyword);
        if (!messageMatch && !envMatch) {
          return false;
        }
      }

      if (query.levels && query.levels.length > 0) {
        if (!query.levels.includes(entry.level)) {
          return false;
        }
      }

      if (query.environments && query.environments.length > 0) {
        if (!query.environments.includes(entry.environment)) {
          return false;
        }
      }

      if (query.dateRange) {
        const entryTime = entry.timestamp.getTime();
        const startTime = query.dateRange.start.getTime();
        const endTime = query.dateRange.end.getTime();

        if (entryTime < startTime || entryTime > endTime) {
          return false;
        }
      }

      return true;
    });
  }

  private generateCacheKey(query: SearchQuery, files: LogFile[]): string {
    return JSON.stringify({
      query,
      files: files.map((f) => `${f.path}:${f.mtime.getTime()}`),
    });
  }

  public clearCache(): void {
    this.cache.clear();
  }
}
