Laravelログビューア拡張機能の開発プランを作成する。 プロジェクト概要 名称: Laravel Log Viewer (仮) 目的: VSCode内でLaravelログを見やすく表示・フィルタリング 主要機能

カスタムビュー Webview Panelで専用のログビューアを表示 サイドバーまたはエディタエリアに配置可能
フィルター機能 ログレベル（DEBUG, INFO, WARNING, ERROR, CRITICAL等） 日時範囲 キーワード検索 環境（local, production等）
スタックトレース展開 デフォルトは折りたたみ クリックで展開/折りたたみ ファイルパスクリックでエディタで開く
リアルタイム監視 ログファイルの変更を監視 新しいログを自動追加 技術スタック フロントエンド（Webview） React + TypeScript Tailwind CSS（スタイリング） Vite（ビルドツール） バックエンド（拡張機能本体） TypeScript VSCode Extension API Node.js fs module（ファイル監視） ログパーサー カスタムパーサー（Laravelログ形式に特化） 正規表現でログエントリを分割 ディレクトリ構成 laravel-log-viewer/ ├── src/ │ ├── extension.ts # エントリーポイント │ ├── logParser.ts # ログパーサー │ ├── logWatcher.ts # ファイル監視 │ └── webview/ │ ├── LogViewerPanel.ts # Webview管理 │ └── ui/ # React UI │ ├── App.tsx │ ├── FilterBar.tsx │ ├── LogEntry.tsx │ └── StackTrace.tsx ├── package.json └── tsconfig.json
開発フェーズ Phase 1: 基礎構築（1-2週間） [ ] 拡張機能の骨組み作成 [ ] Laravelログパーサー実装 [ ] 基本的なWebview表示 Phase 2: UI実装（2-3週間） [ ] Reactベースのログビューア [ ] フィルターUIコンポーネント [ ] ログエントリ表示コンポーネント [ ] スタックトレース展開機能 Phase 3: 高度な機能（1-2週間） [ ] ファイル監視・リアルタイム更新 [ ] ファイルパスのクリックでエディタ開く [ ] 設定画面（ログファイルパス等） [ ] パフォーマンス最適化（大量ログ対応） Phase 4: 仕上げ（1週間） [ ] テスト [ ] ドキュメント作成 [ ] VSCode Marketplaceへ公開 データ構造 ログエントリ型定義 interface LogEntry { timestamp: Date; level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'; environment: string; message: string; stackTrace?: StackTraceLine[]; context?: Record<string, any>; }

interface StackTraceLine { file: string; line: number; method: string; }

主要API使用 vscode.window.createWebviewPanel() - Webview作成 vscode.workspace.createFileSystemWatcher() - ファイル監視 vscode.window.showTextDocument() - ファイルを開く vscode.workspace.getConfiguration() - 設定取得 設定項目 { "laravelLogViewer.logPath": "storage/logs/laravel.log", "laravelLogViewer.autoRefresh": true, "laravelLogViewer.maxEntries": 1000, "laravelLogViewer.dateFormat": "YYYY-MM-DD HH:mm:ss" }

リスク・課題 大量ログのパフォーマンス → 仮想スクロール実装 ログ形式の多様性 → カスタムログ形式への対応 リアルタイム更新の負荷 → デバウンス処理

追加で、
Laravelのログはいくつものファイルに分かれるが、それらを集計して適切に検索して持ってこられるようにするのが目的。
