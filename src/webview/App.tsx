import React, { useState, useEffect } from 'react';
import { LogEntry as LogEntryComponent } from './components/LogEntry';
import { LogEntry, MessageFromExtension, MessageToExtension } from './types/messages';

declare const acquireVsCodeApi: () => {
  postMessage: (message: MessageToExtension) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();

const App: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    vscode.postMessage({ type: 'ready' });

    const messageHandler = (event: MessageEvent<MessageFromExtension>) => {
      const message = event.data;

      switch (message.type) {
        case 'init':
          setLoading(false);
          break;

        case 'logsLoaded':
          setLogs(message.payload.entries);
          setTotal(message.payload.total);
          setLoading(false);
          setError(null);
          break;

        case 'error':
          setError(message.payload.message);
          setLoading(false);
          break;
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  const handleLoadLogs = () => {
    setLoading(true);
    setError(null);
    vscode.postMessage({ type: 'loadLogs' });
  };

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--vscode-editor-background)' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{
          borderColor: 'var(--vscode-panel-border)',
          backgroundColor: 'var(--vscode-sideBar-background)'
        }}
      >
        <h1 className="text-xl font-bold" style={{ color: 'var(--vscode-foreground)' }}>
          Laravel Log Viewer
        </h1>
        <button
          onClick={handleLoadLogs}
          disabled={loading}
          className="px-4 py-2 rounded font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: loading ? 'var(--vscode-button-secondaryBackground)' : 'var(--vscode-button-background)',
            color: 'var(--vscode-button-foreground)',
          }}
        >
          {loading ? 'Loading...' : 'Load Logs'}
        </button>
      </div>

      {/* Stats */}
      {logs.length > 0 && (
        <div
          className="px-4 py-2 text-sm border-b"
          style={{
            borderColor: 'var(--vscode-panel-border)',
            backgroundColor: 'var(--vscode-sideBar-background)',
            color: 'var(--vscode-descriptionForeground)'
          }}
        >
          Showing {logs.length} of {total} log entries
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div
          className="px-4 py-3 border-b"
          style={{
            borderColor: 'var(--vscode-panel-border)',
            backgroundColor: 'var(--vscode-inputValidation-errorBackground)',
            color: 'var(--vscode-inputValidation-errorForeground)'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Log Entries */}
      <div className="flex-1 overflow-y-auto">
        {logs.length === 0 && !loading && !error && (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--vscode-descriptionForeground)' }}
          >
            <div className="text-center">
              <p className="text-lg mb-2">No logs loaded</p>
              <p className="text-sm">Click "Load Logs" to view Laravel logs</p>
            </div>
          </div>
        )}

        {loading && (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: 'var(--vscode-descriptionForeground)' }}
          >
            <p className="text-lg">Loading logs...</p>
          </div>
        )}

        {logs.length > 0 && (
          <div>
            {logs.map((log) => (
              <LogEntryComponent key={log.id} entry={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
