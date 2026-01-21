# Laravel Log Viewer

Laravel Log Viewerは、VS Code内でLaravelアプリケーションのログファイルを快適に閲覧・検索するための拡張機能です。
ログファイルを開いてgrepする手間を省き、色分けされた見やすいインターフェースで効率的にデバッグを行えます。

## 特徴

*   **視認性の高いログ表示**: ログレベル（DEBUG, INFO, ERRORなど）に応じて色分け表示され、一目で重要度を把握できます。
*   **詳細な情報**: タイムスタンプ、環境（local, productionなど）、エラーメッセージを見やすくフォーマットして表示します。
*   **スタックトレース対応**: エラーログに含まれるスタックトレースの有無を表示します。
*   **柔軟な設定**: ログファイルの場所や検索パターン、表示件数などをカスタマイズ可能です。
*   **高速な動作**: 大容量のログファイルでも快適に動作するように設計されています（インデックス機能搭載）。

## 使い方

1.  VS CodeでLaravelプロジェクトを開きます。
2.  コマンドパレットを開きます (`Cmd+Shift+P` on macOS / `Ctrl+Shift+P` on Windows/Linux)。
3.  `Laravel Log Viewer: Open` と入力して実行します。
4.  パネルにログビューアが表示され、`storage/logs` 内のログを確認できます。

## 設定

`settings.json` またはVS Codeの設定画面から以下の項目を変更できます。

| 設定項目 | 説明 | デフォルト値 |
| :--- | :--- | :--- |
| `laravelLogViewer.logPath` | ログファイルが格納されているディレクトリの相対パス | `storage/logs` |
| `laravelLogViewer.logPatterns` | 読み込むログファイルのグロブパターン | `["laravel.log", "laravel-*.log", "*.log"]` |
| `laravelLogViewer.autoRefresh` | ログファイル変更時に自動的にリフレッシュするか | `false` |
| `laravelLogViewer.maxEntries` | 一度に表示する最大ログエントリ数 | `1000` |
| `laravelLogViewer.dateFormat` | タイムスタンプの表示フォーマット | `yyyy-MM-dd HH:mm:ss` |
| `laravelLogViewer.searchDebounceMs` | 検索入力時のデバウンス遅延（ミリ秒） | `300` |
| `laravelLogViewer.indexingEnabled` | 高速検索のためのインデックス機能を有効にするか | `true` |
| `laravelLogViewer.maxFileSizeMB` | 処理する最大ファイルサイズ (MB) | `100` |

## 開発環境のセットアップ

この拡張機能を開発・修正する場合の手順です。

1.  リポジトリをクローンします。
2.  依存関係をインストールします。
    ```bash
    npm install
    # または
    pnpm install
    ```
3.  ビルドを実行します。
    ```bash
    npm run build
    ```
    開発中は以下のコマンドで変更を監視できます：
    ```bash
    npm run watch
    ```
4.  VS Codeでプロジェクトを開き、`F5` キーを押してデバッグ実行を開始します。新しいVS Codeウィンドウが開き、そこで拡張機能が動作します。
