# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Laravel Log Viewer is a VSCode extension for viewing and searching Laravel application logs. It parses multiple log files, provides filtering by log level and keyword search, and integrates with VSCode's editor.

## Build and Development Commands

```bash
# Install dependencies (use pnpm)
pnpm install

# Build extension (TypeScript) and webview (Vite + React)
pnpm run build

# Watch mode for development
pnpm run watch

# Lint TypeScript/React code
pnpm run lint

# Debug extension in VSCode
# Press F5 to launch Extension Development Host
# Then run "Laravel Log Viewer: Open" from command palette
```

## Architecture

### Dual-Process Design

The extension runs in two separate processes:

1. **Extension Host** (`src/extension/`): Node.js process running VSCode Extension API
2. **Webview** (`src/webview/`): Isolated browser context rendering React UI

Communication happens via `postMessage` API with typed message contracts defined in `src/webview/types/messages.ts`.

### Extension Host Architecture

```
src/extension/
├── extension.ts           # Entry point, registers commands
├── logViewerPanel.ts      # Manages Webview lifecycle and messaging
├── core/                  # Core business logic
│   ├── logParser.ts       # Parses Laravel log format with streaming
│   ├── logFileDiscovery.ts # Finds log files using fast-glob
│   └── logSearchEngine.ts # Search with filtering + LRU cache
├── services/
│   ├── messageHandler.ts  # Handles Webview → Extension messages
│   ├── configService.ts   # VSCode settings accessor
│   └── cacheService.ts    # LRU cache implementation
└── models/                # TypeScript types
```

**Key Design Patterns:**

- **Streaming Parser**: `LogParser` uses Node.js `readline` to parse large log files without loading entire file into memory
- **LRU Cache**: `LogSearchEngine` caches search results (max 50 entries) to avoid re-parsing files
- **Multi-file Search**: `LogFileDiscovery` uses `fast-glob` to find log files matching patterns (`laravel.log`, `laravel-*.log`, `*.log`)

### Webview Architecture

```
src/webview/
├── index.tsx              # React entry point
├── App.tsx                # Main component with state management
├── components/
│   ├── LogEntry.tsx       # Individual log entry display
│   └── SearchPanel.tsx    # Search input + level filters
├── hooks/
│   └── useDebounce.ts     # Debounce hook for search
└── types/
    └── messages.ts        # Message contract with Extension Host
```

**Key Points:**

- Uses VSCode CSS variables for theming (`var(--vscode-foreground)`, etc.)
- `acquireVsCodeApi()` provides message passing interface
- All dates are serialized as ISO strings when crossing process boundary

### Laravel Log Format

Expected format: `[YYYY-MM-DD HH:mm:ss] environment.LEVEL: Message`

Example:
```
[2025-01-21 10:30:45] local.ERROR: Database connection failed
Stack trace:
#0 /var/www/vendor/PDO.php(70): PDO->__construct()
#1 /var/www/app/Database.php(24): connect()
```

The parser handles:
- Multi-line log entries
- Stack traces (detected by "Stack trace:" marker)
- Multiple log levels: DEBUG, INFO, NOTICE, WARNING, ERROR, CRITICAL, ALERT, EMERGENCY

### Message Flow

1. User action in Webview → `vscode.postMessage({ type: 'search', payload: query })`
2. Extension Host receives in `LogViewerPanel._handleMessage()`
3. Delegates to `MessageHandler.handleMessage()`
4. Processes request (parse logs, search, filter)
5. Sends response → `panel.webview.postMessage({ type: 'searchResult', payload: results })`
6. Webview receives in `window.addEventListener('message')` handler
7. Updates React state → UI re-renders

## Configuration

Extension settings (in `package.json` `contributes.configuration`):

- `laravelLogViewer.logPath`: Directory containing log files (default: `storage/logs`)
- `laravelLogViewer.logPatterns`: Glob patterns for log file matching
- `laravelLogViewer.maxEntries`: Max log entries to display (default: 1000)
- `laravelLogViewer.searchDebounceMs`: Search input debounce delay (default: 300ms)

## Build Output

- Extension Host: TypeScript → `out/extension/*.js` (CommonJS)
- Webview: Vite bundles React → `dist/webview.js` + `dist/webview.css`
- Webview loaded via `webview.asWebviewUri()` in `LogViewerPanel._getHtmlForWebview()`

## Important Constraints

- **fast-glob import**: Must use `fg.default()` not `fg()` due to CommonJS/ESM interop
- **Type safety**: Webview and Extension Host share types but dates are serialized differently (Date vs ISO string)
- **Memory**: Streaming parser designed for large files (100MB+), but still limited by VSCode extension host memory
- **Security**: Webview has CSP (Content Security Policy) - only nonce-tagged scripts allowed
