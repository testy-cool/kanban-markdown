import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/webview/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Every colour here comes from the running VS Code theme, so the board
      // matches whatever the user has selected instead of guessing at a light
      // or a dark palette. Each one carries a fallback because a theme is
      // allowed to leave any single colour unset.
      colors: {
        // Surfaces, darkest to lightest in a dark theme.
        board: 'var(--vscode-editor-background, #1e1e1e)',
        column: 'var(--vscode-sideBar-background, var(--vscode-editor-background, #1e1e1e))',
        card: 'var(--vscode-editorWidget-background, #252526)',
        raised: 'var(--vscode-dropdown-background, var(--vscode-editorWidget-background, #252526))',
        hover: 'var(--vscode-list-hoverBackground, rgba(128, 128, 128, 0.15))',
        selected: 'var(--vscode-list-activeSelectionBackground, rgba(128, 128, 128, 0.25))',
        // Lines.
        line: 'var(--vscode-widget-border, var(--vscode-panel-border, rgba(128, 128, 128, 0.35)))',
        focus: 'var(--vscode-focusBorder, #007fd4)',
        // Text.
        fg: 'var(--vscode-foreground, #cccccc)',
        'fg-strong': 'var(--vscode-editor-foreground, var(--vscode-foreground, #cccccc))',
        'fg-dim': 'var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7))',
        'fg-link': 'var(--vscode-textLink-foreground, #3794ff)',
        // Inputs.
        input: 'var(--vscode-input-background, #313131)',
        'input-fg': 'var(--vscode-input-foreground, #cccccc)',
        'input-line': 'var(--vscode-input-border, var(--vscode-widget-border, rgba(128, 128, 128, 0.35)))',
        'input-ph': 'var(--vscode-input-placeholderForeground, rgba(204, 204, 204, 0.5))',
        // Buttons.
        btn: 'var(--vscode-button-background, #0078d4)',
        'btn-fg': 'var(--vscode-button-foreground, #ffffff)',
        'btn-hover': 'var(--vscode-button-hoverBackground, #026ec1)',
        btn2: 'var(--vscode-button-secondaryBackground, rgba(128, 128, 128, 0.25))',
        'btn2-fg': 'var(--vscode-button-secondaryForeground, var(--vscode-foreground, #cccccc))',
        'btn2-hover': 'var(--vscode-button-secondaryHoverBackground, rgba(128, 128, 128, 0.35))',
        // Accents. VS Code defines a chart palette and themes override it, so
        // these stay meaningful without being fixed reds and greens.
        'chart-red': 'var(--vscode-charts-red, #f14c4c)',
        'chart-orange': 'var(--vscode-charts-orange, #d18616)',
        'chart-yellow': 'var(--vscode-charts-yellow, #cca700)',
        'chart-green': 'var(--vscode-charts-green, #89d185)',
        'chart-blue': 'var(--vscode-charts-blue, #3794ff)',
        'chart-purple': 'var(--vscode-charts-purple, #b180d7)',
        // States.
        danger: 'var(--vscode-errorForeground, #f14c4c)',
        badge: 'var(--vscode-badge-background, rgba(128, 128, 128, 0.3))',
        'badge-fg': 'var(--vscode-badge-foreground, #cccccc)',
      },
      fontFamily: {
        sans: ['var(--vscode-font-family)', 'sans-serif'],
        mono: ['var(--vscode-editor-font-family)', 'monospace'],
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--vscode-foreground)',
            '--tw-prose-headings': 'var(--vscode-foreground)',
            '--tw-prose-lead': 'var(--vscode-foreground)',
            '--tw-prose-links': 'var(--vscode-textLink-foreground)',
            '--tw-prose-bold': 'var(--vscode-foreground)',
            '--tw-prose-counters': 'var(--vscode-descriptionForeground)',
            '--tw-prose-bullets': 'var(--vscode-descriptionForeground)',
            '--tw-prose-hr': 'var(--vscode-panel-border)',
            '--tw-prose-quotes': 'var(--vscode-foreground)',
            '--tw-prose-quote-borders': 'var(--vscode-textBlockQuote-border)',
            '--tw-prose-captions': 'var(--vscode-descriptionForeground)',
            '--tw-prose-code': 'var(--vscode-textPreformat-foreground)',
            '--tw-prose-pre-code': 'var(--vscode-editor-foreground)',
            '--tw-prose-pre-bg': 'var(--vscode-textBlockQuote-background)',
            '--tw-prose-th-borders': 'var(--vscode-panel-border)',
            '--tw-prose-td-borders': 'var(--vscode-panel-border)',
            // Invert colors for dark mode handled by CSS variables
            '--tw-prose-invert-body': 'var(--vscode-foreground)',
            '--tw-prose-invert-headings': 'var(--vscode-foreground)',
            '--tw-prose-invert-lead': 'var(--vscode-foreground)',
            '--tw-prose-invert-links': 'var(--vscode-textLink-foreground)',
            '--tw-prose-invert-bold': 'var(--vscode-foreground)',
            '--tw-prose-invert-counters': 'var(--vscode-descriptionForeground)',
            '--tw-prose-invert-bullets': 'var(--vscode-descriptionForeground)',
            '--tw-prose-invert-hr': 'var(--vscode-panel-border)',
            '--tw-prose-invert-quotes': 'var(--vscode-foreground)',
            '--tw-prose-invert-quote-borders': 'var(--vscode-textBlockQuote-border)',
            '--tw-prose-invert-captions': 'var(--vscode-descriptionForeground)',
            '--tw-prose-invert-code': 'var(--vscode-textPreformat-foreground)',
            '--tw-prose-invert-pre-code': 'var(--vscode-editor-foreground)',
            '--tw-prose-invert-pre-bg': 'var(--vscode-textBlockQuote-background)',
            '--tw-prose-invert-th-borders': 'var(--vscode-panel-border)',
            '--tw-prose-invert-td-borders': 'var(--vscode-panel-border)',
          },
        },
      }),
    },
  },
  plugins: [typography],
}
