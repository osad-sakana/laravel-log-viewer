import React, { useState } from 'react';
import { format } from 'date-fns';
import { LogEntry as LogEntryType, LogLevel } from '../types/messages';
import { StackTrace } from './StackTrace';

interface LogEntryProps {
  entry: LogEntryType;
}

const getLevelColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    DEBUG: 'text-gray-400',
    INFO: 'text-blue-400',
    NOTICE: 'text-cyan-400',
    WARNING: 'text-yellow-400',
    ERROR: 'text-red-400',
    CRITICAL: 'text-red-600',
    ALERT: 'text-orange-500',
    EMERGENCY: 'text-red-700',
  };
  return colors[level] || 'text-gray-400';
};

const getLevelBadgeColor = (level: LogLevel): string => {
  const colors: Record<LogLevel, string> = {
    DEBUG: 'bg-gray-600',
    INFO: 'bg-blue-600',
    NOTICE: 'bg-cyan-600',
    WARNING: 'bg-yellow-600',
    ERROR: 'bg-red-600',
    CRITICAL: 'bg-red-700',
    ALERT: 'bg-orange-600',
    EMERGENCY: 'bg-red-800',
  };
  return colors[level] || 'bg-gray-600';
};

export const LogEntry: React.FC<LogEntryProps> = ({ entry }) => {
  const [copied, setCopied] = useState(false);
  const levelColor = getLevelColor(entry.level);
  const badgeColor = getLevelBadgeColor(entry.level);

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return timestamp;
    }
  };

  const handleCopy = async () => {
    const stackTraceText = entry.stackTrace
      ? '\n' + entry.stackTrace.map((s) => `  #${s.file}:${s.line} ${s.method}`).join('\n')
      : '';
    const text = `[${formatTimestamp(entry.timestamp)}] ${entry.environment}.${entry.level}: ${entry.message}${stackTraceText}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  };

  return (
    <div className="border-b border-gray-700 p-3 hover:bg-gray-800 transition-colors group">
      <div className="flex items-start gap-3">
        <span className="text-xs font-mono text-gray-500 whitespace-nowrap">
          {formatTimestamp(entry.timestamp)}
        </span>

        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${badgeColor} text-white whitespace-nowrap`}
        >
          {entry.level}
        </span>

        <span className="text-xs text-gray-500 whitespace-nowrap">
          {entry.environment}
        </span>

        <div className="flex-1 min-w-0">
          <p className={`text-sm ${levelColor} break-words whitespace-pre-wrap`}>
            {entry.message}
          </p>

          {entry.stackTrace && entry.stackTrace.length > 0 && (
            <StackTrace stackTrace={entry.stackTrace} />
          )}
        </div>

        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: copied ? 'var(--vscode-button-background)' : 'var(--vscode-button-secondaryBackground)',
            color: 'var(--vscode-button-foreground)',
          }}
          title="Copy log entry"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
};
