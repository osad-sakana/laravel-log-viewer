import * as vscode from 'vscode';
import { LogParser } from '../core/logParser';
import { LogFileDiscovery } from '../core/logFileDiscovery';
import { ConfigService } from './configService';
import { LogEntry } from '../models/logEntry';

export class MessageHandler {
  private parser: LogParser;
  private discovery: LogFileDiscovery;

  constructor(
    private panel: vscode.WebviewPanel
  ) {
    this.parser = new LogParser();
    this.discovery = new LogFileDiscovery();
  }

  public async handleMessage(message: any): Promise<void> {
    try {
      switch (message.type) {
        case 'loadLogs':
          await this.handleLoadLogs();
          break;

        case 'openFile':
          await this.handleOpenFile(message.payload);
          break;

        default:
          break;
      }
    } catch (error) {
      this.sendError(`Error handling message: ${error}`);
    }
  }

  private async handleLoadLogs(): Promise<void> {
    try {
      const workspaceRoot = ConfigService.getWorkspaceRoot();
      if (!workspaceRoot) {
        this.sendError('No workspace folder open. Please open a Laravel project.');
        return;
      }

      const config = ConfigService.getConfig();
      const logFiles = await this.discovery.discover(workspaceRoot, config.logPath);

      if (logFiles.length === 0) {
        this.sendError(`No log files found in ${config.logPath}. Please check your configuration.`);
        return;
      }

      const allEntries: LogEntry[] = [];

      for (const logFile of logFiles) {
        const entries = await this.parser.parseFile(logFile.path, config.maxEntries);
        allEntries.push(...entries);
      }

      allEntries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const limitedEntries = allEntries.slice(0, config.maxEntries);

      const serializedEntries = limitedEntries.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp.toISOString(),
      }));

      this.panel.webview.postMessage({
        type: 'logsLoaded',
        payload: {
          entries: serializedEntries,
          total: allEntries.length,
        },
      });
    } catch (error) {
      this.sendError(`Failed to load logs: ${error}`);
    }
  }

  private async handleOpenFile(payload: { filePath: string; line: number }): Promise<void> {
    try {
      const { filePath, line } = payload;
      const document = await vscode.workspace.openTextDocument(filePath);
      const editor = await vscode.window.showTextDocument(document);
      const position = new vscode.Position(line - 1, 0);
      editor.selection = new vscode.Selection(position, position);
      editor.revealRange(
        new vscode.Range(position, position),
        vscode.TextEditorRevealType.InCenter
      );
    } catch (error) {
      this.sendError(`Failed to open file: ${error}`);
    }
  }

  private sendError(message: string): void {
    this.panel.webview.postMessage({
      type: 'error',
      payload: { message },
    });
  }
}
