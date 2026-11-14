/**
 * Design tokens for code that needs raw values (charts, canvas, inline styles).
 * The source of truth is the @theme block in src/index.css; keep these in step with it.
 */
export const themeTokens = {
  colors: {
    primary: '#4654E0',
    primaryHover: '#3843C4',
    primarySoft: '#F0F3FF',
    accent: '#7951D8',
    indigo: '#574FDD',
    success: '#14825A',
    warning: '#C66C12',
    danger: '#CC342C',
    info: '#1F7AA2',
    ink: '#121829',
    inkSecondary: '#4C5569',
    inkMuted: '#636C80',
    line: '#E3E6EE',
    lineStrong: '#CDD2DD',
    canvas: '#F6F7FB',
    surface: '#FFFFFF',
    navy950: '#091024',
    navy900: '#0E1731',
    navy800: '#152040',
    navy700: '#1D2A50',
  },
  /** Categorical chart series, in order. Distinct in hue and lightness, readable on white. */
  chartSeries: ['#4654E0', '#1F7AA2', '#21A06F', '#E48A1C', '#7951D8', '#CC342C'] as const,
  /** Spacing scale in px (Tailwind steps 1, 2, 3, 4, 5, 6, 8, 10, 12, 16). */
  spacing: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64] as const,
  radius: { sm: 6, md: 8, lg: 10, xl: 12, '2xl': 14, '3xl': 16 } as const,
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    displayFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
    monoFamily: "'JetBrains Mono', monospace",
  },
} as const;
