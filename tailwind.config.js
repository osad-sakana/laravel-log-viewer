/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/webview/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        vscode: {
          'foreground': 'var(--vscode-foreground)',
          'background': 'var(--vscode-editor-background)',
          'input-background': 'var(--vscode-input-background)',
          'input-border': 'var(--vscode-input-border)',
          'button-background': 'var(--vscode-button-background)',
          'button-foreground': 'var(--vscode-button-foreground)',
          'button-hover': 'var(--vscode-button-hoverBackground)',
        },
      },
    },
  },
  plugins: [],
};
