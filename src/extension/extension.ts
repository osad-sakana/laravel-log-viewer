import * as vscode from 'vscode';
import { LogViewerPanel } from './logViewerPanel';

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'laravel-log-explorer.open',
    () => {
      LogViewerPanel.createOrShow(context.extensionUri);
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
