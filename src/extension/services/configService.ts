import * as vscode from 'vscode';

export interface ExtensionConfig {
  logPath: string;
  logPatterns: string[];
  autoRefresh: boolean;
  maxEntries: number;
  dateFormat: string;
  searchDebounceMs: number;
  indexingEnabled: boolean;
  maxFileSizeMB: number;
  indexExpirationDays: number;
}

export class ConfigService {
  private static readonly CONFIG_SECTION = 'laravelLogViewer';

  public static getConfig(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration(this.CONFIG_SECTION);

    return {
      logPath: config.get<string>('logPath', 'storage/logs'),
      logPatterns: config.get<string[]>('logPatterns', ['laravel.log', 'laravel-*.log', '*.log']),
      autoRefresh: config.get<boolean>('autoRefresh', false),
      maxEntries: config.get<number>('maxEntries', 1000),
      dateFormat: config.get<string>('dateFormat', 'yyyy-MM-dd HH:mm:ss'),
      searchDebounceMs: config.get<number>('searchDebounceMs', 300),
      indexingEnabled: config.get<boolean>('indexingEnabled', true),
      maxFileSizeMB: config.get<number>('maxFileSizeMB', 100),
      indexExpirationDays: config.get<number>('indexExpirationDays', 7),
    };
  }

  public static onConfigChange(callback: (config: ExtensionConfig) => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(this.CONFIG_SECTION)) {
        callback(this.getConfig());
      }
    });
  }

  public static getWorkspaceRoot(): string | undefined {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }
    return workspaceFolders[0].uri.fsPath;
  }
}
