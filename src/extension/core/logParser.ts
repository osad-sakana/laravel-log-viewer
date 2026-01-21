import * as fs from 'fs';
import * as readline from 'readline';
import { LogEntry, LogLevel, StackTraceLine } from '../models/logEntry';

export class LogParser {
  private static readonly LOG_PATTERN = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\](?:\s+(\w+))?\.(\w+):\s+(.+)$/;
  private static readonly STACK_TRACE_PATTERN = /^#\d+\s+(.+?)\((\d+)\):\s+(.+)$/;

  public async *parseStream(filePath: string, maxEntries: number = 1000): AsyncGenerator<LogEntry> {
    try {
      const fileStream = fs.createReadStream(filePath, { encoding: 'utf8' });
      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      let currentEntry: Partial<LogEntry> | null = null;
      let stackTraceLines: string[] = [];
      let lineNumber = 0;
      let entriesCount = 0;
      let isCollectingStackTrace = false;

      for await (const line of rl) {
        lineNumber++;

        const logMatch = line.match(LogParser.LOG_PATTERN);

        if (logMatch) {
          if (currentEntry && currentEntry.timestamp) {
            if (stackTraceLines.length > 0) {
              currentEntry.stackTrace = this.parseStackTrace(stackTraceLines);
              stackTraceLines = [];
            }
            yield currentEntry as LogEntry;
            entriesCount++;
            if (entriesCount >= maxEntries) {
              break;
            }
          }

          const [, timestamp, environment, level, message] = logMatch;

          currentEntry = {
            id: `${filePath}:${lineNumber}`,
            timestamp: new Date(timestamp),
            environment: environment || 'production',
            level: level.toUpperCase() as LogLevel,
            message: message.trim(),
            filePath,
            lineNumber,
          };
          isCollectingStackTrace = false;
        } else if (currentEntry) {
          if (line.trim().toLowerCase().includes('stack trace:') || line.trim().startsWith('Stack trace:')) {
            isCollectingStackTrace = true;
          } else if (isCollectingStackTrace && line.trim().startsWith('#')) {
            stackTraceLines.push(line);
          } else if (line.trim() && !isCollectingStackTrace) {
            currentEntry.message += '\n' + line.trim();
          }
        }
      }

      if (currentEntry && currentEntry.timestamp) {
        if (stackTraceLines.length > 0) {
          currentEntry.stackTrace = this.parseStackTrace(stackTraceLines);
        }
        yield currentEntry as LogEntry;
      }

      fileStream.close();
    } catch (error) {
      throw new Error(`Failed to parse log file: ${error}`);
    }
  }

  public async parseFile(filePath: string, maxEntries: number = 1000): Promise<LogEntry[]> {
    const entries: LogEntry[] = [];

    try {
      for await (const entry of this.parseStream(filePath, maxEntries)) {
        entries.push(entry);
      }
    } catch (error) {
      throw error;
    }

    return entries;
  }

  private parseStackTrace(lines: string[]): StackTraceLine[] {
    const stackTrace: StackTraceLine[] = [];

    for (const line of lines) {
      const match = line.match(LogParser.STACK_TRACE_PATTERN);
      if (match) {
        const [, file, lineNum, method] = match;
        stackTrace.push({
          file: file.trim(),
          line: parseInt(lineNum, 10),
          method: method.trim(),
        });
      }
    }

    return stackTrace;
  }

  public static isValidLogLevel(level: string): level is LogLevel {
    const validLevels: LogLevel[] = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL', 'NOTICE', 'ALERT', 'EMERGENCY'];
    return validLevels.includes(level.toUpperCase() as LogLevel);
  }
}
