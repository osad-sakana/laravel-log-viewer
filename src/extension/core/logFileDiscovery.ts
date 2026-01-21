import * as path from 'path';
import * as fs from 'fs';
import * as fg from 'fast-glob';
import { LogFile } from '../models/logEntry';

export class LogFileDiscovery {
  public async discover(
    workspaceRoot: string,
    logPath: string,
    patterns: string[] = ['laravel.log', 'laravel-*.log', '*.log']
  ): Promise<LogFile[]> {
    const basePath = path.join(workspaceRoot, logPath);

    try {
      if (!fs.existsSync(basePath)) {
        return [];
      }

      const globPatterns = patterns.map((pattern) =>
        path.join(basePath, pattern)
      );

      const filePaths = await fg.default(globPatterns, {
        absolute: true,
        onlyFiles: true,
      });

      const files: LogFile[] = filePaths.map((filePath: string) => {
        const stats = fs.statSync(filePath);

        return {
          path: filePath,
          size: stats.size,
          mtime: stats.mtime,
          type: this.detectLogFileType(filePath),
        };
      });

      return files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    } catch (error) {
      throw new Error(`Failed to discover log files: ${error}`);
    }
  }

  public async getFileMetadata(filePath: string): Promise<LogFile> {
    try {
      const stats = fs.statSync(filePath);
      return {
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
        type: this.detectLogFileType(filePath),
      };
    } catch (error) {
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  private detectLogFileType(filePath: string): LogFile['type'] {
    const filename = path.basename(filePath);

    if (filename === 'laravel.log') {
      return 'single';
    }
    if (/laravel-\d{4}-\d{2}-\d{2}\.log/.test(filename)) {
      return 'daily';
    }
    if (/^(local|production|staging|development)\.log$/.test(filename)) {
      return 'environment';
    }

    return 'custom';
  }
}
