import * as path from 'path';
import * as fs from 'fs';
import { LogFile } from '../models/logEntry';

export class LogFileDiscovery {
  public async discover(workspaceRoot: string, logPath: string): Promise<LogFile[]> {
    const basePath = path.join(workspaceRoot, logPath);

    try {
      const files: LogFile[] = [];

      const laravelLogPath = path.join(basePath, 'laravel.log');
      if (fs.existsSync(laravelLogPath)) {
        const stats = fs.statSync(laravelLogPath);
        files.push({
          path: laravelLogPath,
          size: stats.size,
          mtime: stats.mtime,
          type: 'single',
        });
      }

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
