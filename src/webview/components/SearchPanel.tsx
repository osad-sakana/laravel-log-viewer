import React, { useState } from 'react';
import { LogLevel, SearchQuery } from '../types/messages';

interface SearchPanelProps {
  onSearch: (query: SearchQuery) => void;
  loading: boolean;
  logPath: string;
  onPathChange: (path: string) => void;
  onPathSubmit: () => void;
}

const LOG_LEVELS: LogLevel[] = ['DEBUG', 'INFO', 'NOTICE', 'WARNING', 'ERROR', 'CRITICAL', 'ALERT', 'EMERGENCY'];

export const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, loading, logPath, onPathChange, onPathSubmit }) => {
  const [keyword, setKeyword] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([]);

  const handleSearch = () => {
    const query: SearchQuery = {
      keyword: keyword.trim() || undefined,
      levels: selectedLevels.length > 0 ? selectedLevels : undefined,
    };
    onSearch(query);
  };

  const toggleLevel = (level: LogLevel) => {
    const newLevels = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];

    setSelectedLevels(newLevels);

    onSearch({
      keyword: keyword.trim() || undefined,
      levels: newLevels.length > 0 ? newLevels : undefined,
    });
  };

  const clearFilters = () => {
    setKeyword('');
    setSelectedLevels([]);
    onSearch({});
  };

  return (
    <div
      className="p-4 border-b"
      style={{
        borderColor: 'var(--vscode-panel-border)',
        backgroundColor: 'var(--vscode-sideBar-background)',
      }}
    >
      {/* Search Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search logs..."
          disabled={loading}
          className="flex-1 px-3 py-2 rounded text-sm"
          style={{
            backgroundColor: 'var(--vscode-input-background)',
            color: 'var(--vscode-input-foreground)',
            border: '1px solid var(--vscode-input-border)',
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--vscode-button-background)',
            color: 'var(--vscode-button-foreground)',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
        <button
          onClick={clearFilters}
          disabled={loading}
          className="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--vscode-button-secondaryBackground)',
            color: 'var(--vscode-button-secondaryForeground)',
          }}
        >
          Clear
        </button>
      </div>

      {/* Level Filters */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs font-semibold mr-2 self-center" style={{ color: 'var(--vscode-foreground)' }}>
          Levels:
        </span>
        {LOG_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => toggleLevel(level)}
            disabled={loading}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 ${
              selectedLevels.includes(level) ? 'opacity-100' : 'opacity-50'
            }`}
            style={{
              backgroundColor: getLevelColor(level),
              color: '#fff',
            }}
          >
            {level}
          </button>
        ))}
      </div>

      {/* Log Path */}
      <div className="flex gap-2 items-center">
        <span className="text-xs font-semibold" style={{ color: 'var(--vscode-foreground)' }}>
          Path:
        </span>
        <input
          type="text"
          value={logPath}
          onChange={(e) => onPathChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onPathSubmit()}
          placeholder="storage/logs"
          disabled={loading}
          className="flex-1 px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: 'var(--vscode-input-background)',
            color: 'var(--vscode-input-foreground)',
            border: '1px solid var(--vscode-input-border)',
          }}
        />
        <button
          onClick={onPathSubmit}
          disabled={loading}
          className="px-3 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50"
          style={{
            backgroundColor: 'var(--vscode-button-secondaryBackground)',
            color: 'var(--vscode-button-secondaryForeground)',
          }}
        >
          Load
        </button>
      </div>
    </div>
  );
};

function getLevelColor(level: LogLevel): string {
  const colors: Record<LogLevel, string> = {
    DEBUG: '#6B7280',
    INFO: '#3B82F6',
    NOTICE: '#06B6D4',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    CRITICAL: '#DC2626',
    ALERT: '#F97316',
    EMERGENCY: '#991B1B',
  };
  return colors[level] || '#6B7280';
}
