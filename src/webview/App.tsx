import React, { useState, useEffect } from 'react';

declare const acquireVsCodeApi: () => {
  postMessage: (message: any) => void;
  getState: () => any;
  setState: (state: any) => void;
};

const vscode = acquireVsCodeApi();

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('Loading...');

  useEffect(() => {
    vscode.postMessage({ type: 'ready' });

    const messageHandler = (event: MessageEvent) => {
      const msg = event.data;
      switch (msg.type) {
        case 'init':
          setMessage(msg.payload.message);
          break;
      }
    };

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-vscode-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4" style={{ color: 'var(--vscode-foreground)' }}>
          Laravel Log Viewer
        </h1>
        <p className="text-lg" style={{ color: 'var(--vscode-descriptionForeground)' }}>
          {message}
        </p>
        <p className="mt-4 text-sm" style={{ color: 'var(--vscode-descriptionForeground)' }}>
          Phase 1: 基本構造完成 ✓
        </p>
      </div>
    </div>
  );
};

export default App;
