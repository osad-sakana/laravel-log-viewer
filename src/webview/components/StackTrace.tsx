import React, { useState } from 'react';
import { StackTraceLine } from '../types/messages';

interface StackTraceProps {
  stackTrace: StackTraceLine[];
}

export const StackTrace: React.FC<StackTraceProps> = ({ stackTrace }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFileClick = (file: string, line: number) => {
    // @ts-ignore - VSCode API is injected globally
    const vscode = acquireVsCodeApi();
    vscode.postMessage({
      type: 'openFile',
      payload: { filePath: file, line },
    });
  };

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-300 transition-colors"
      >
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span className="font-semibold">Stack Trace</span>
        <span className="text-gray-500">({stackTrace.length} frames)</span>
      </button>

      {isExpanded && (
        <div className="mt-2 ml-6 space-y-1 border-l-2 border-gray-700 pl-3">
          {stackTrace.map((frame, index) => (
            <div
              key={index}
              className="text-xs font-mono text-gray-400 hover:bg-gray-800 px-2 py-1 rounded transition-colors"
            >
              <span className="text-gray-600">#{index}</span>{' '}
              <button
                onClick={() => handleFileClick(frame.file, frame.line)}
                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                title={`Open ${frame.file}:${frame.line}`}
              >
                {frame.file}({frame.line})
              </button>
              : <span className="text-gray-300">{frame.method}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
