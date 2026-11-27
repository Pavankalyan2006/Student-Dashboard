/**
 * NEXORA AI design tokens for code that needs raw values (charts, canvas, inline styles).
 * The source of truth is the @theme block in src/index.css (light) and scripts/gen_theme_palette.py (dark);
 * keep these in step with them.
 */
export const themeTokens = {
  colors: {
    primary: '#6957E8',
    primaryHover: '#5744CC',
    primarySoft: '#F3F1FE',
    accent: '#8B72F5',
    indigo: '#6957E8',
    cyan: '#37C9E8',
    success: '#12936A',
    warning: '#C77814',
    danger: '#D63535',
    info: '#128CAB',
    ink: '#182033',
    inkSecondary: '#4E5871',
    inkMuted: '#647089',
    line: '#E8EAF2',
    lineStrong: '#D3D7E4',
    canvas: '#F6F7FC',
    surface: '#FFFFFF',
    navy950: '#0A0E1B',
    navy900: '#0D1222',
    navy800: '#141B31',
    navy700: '#1C2440',
  },
  /** The dark theme's raw values (spec palette). */
  dark: {
    background: '#080B16',
    backgroundSecondary: '#0D1222',
    sidebar: '#0A0E1B',
    card: '#11182B',
    elevated: '#17213A',
    primary: '#7865F5',
    secondary: '#9B78FF',
    cyan: '#37C9E8',
    success: '#36D399',
    warning: '#F5B942',
    error: '#F87171',
    text: '#F4F5FF',
    textSecondary: '#9CA8C2',
    border: 'rgba(255,255,255,0.08)',
  },
  /** Categorical chart series, in order. Distinct in hue and lightness; readable on light and dark cards. */
  chartSeries: ['#7865F5', '#37C9E8', '#36D399', '#F5B942', '#9B78FF', '#F87171'] as const,
  /** Spacing scale in px (Tailwind steps 1, 2, 3, 4, 5, 6, 8, 10, 12, 16). */
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const,
  radius: { sm: 6, md: 8, lg: 10, xl: 12, '2xl': 14, '3xl': 16 } as const,
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    displayFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    monoFamily: "'JetBrains Mono', monospace",
  },
} as const;
