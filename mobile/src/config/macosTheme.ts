import { Platform, TextStyle } from 'react-native';

/**
 * macOS Sequoia / Sonoma Light Human Interface Design System for Project Banwaan Mobile
 * Faithful to the White, Royal Blue, and Sunshine Yellow palette from OrchestrateIQ reference.
 */

export const sfFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  default: 'System',
});

export const macosColors = {
  // Desktop & Window Surfaces (Light Modern Theme)
  windowBackground: '#eceef4',
  sidebarBackground: '#f8f9fc',
  cardBackground: '#ffffff',
  cardBackgroundElevated: '#ffffff',
  cardInset: '#f8f9fc',
  cardBorder: '#e2e8f0',
  cardBorderHover: '#cbd5e1',
  cardHighlight: '#f1f5f9',

  // OrchestrateIQ Primary Vibrant Colors
  appleBlue: '#05389f',
  appleBlueVibrant: '#2563eb',
  appleBlueHover: '#1d4ed8',
  appleBlueSubtle: '#edf3fc',
  appleBlueBorder: 'rgba(5, 56, 159, 0.2)',

  // Sunshine Gold / Yellow Accent (as seen in the "Name your workflows" card)
  nagaGold: '#facc15',
  nagaGoldHover: '#eab308',
  nagaGoldSubtle: '#fef9c3',
  nagaGoldBorder: 'rgba(250, 204, 21, 0.4)',

  // Secondary Accents (Live indicators, status chips)
  appleGreen: '#10b981',
  appleGreenSubtle: '#ecfdf5',
  appleGreenBorder: 'rgba(16, 185, 129, 0.3)',
  appleYellow: '#f59e0b',
  appleYellowSubtle: '#fffbeb',
  appleOrange: '#f97316',
  appleOrangeSubtle: '#fff7ed',
  appleRed: '#ef4444',
  appleRedSubtle: '#fef2f2',
  appleRedBorder: 'rgba(239, 68, 68, 0.3)',
  applePurple: '#8b5cf6',
  applePurpleSubtle: '#f5f3ff',
  applePurpleBorder: 'rgba(139, 92, 246, 0.3)',
  appleTeal: '#0d9488',
  appleTealSubtle: '#f0fdfa',

  // Clean Typography Scale
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textTertiary: '#94a3b8',
  textMuted: '#cbd5e1',
  textOnBlue: '#ffffff',
  textOnYellow: '#0f172a',

  // macOS Traffic Light Dots
  trafficClose: '#ff5f56',
  trafficMin: '#ffbd2e',
  trafficZoom: '#27c93f',

  // Controls & Inputs
  controlBackground: '#f1f5f9',
  controlBorder: '#e2e8f0',
  inputBackground: '#ffffff',
  inputBorder: '#e2e8f0',
  inputFocusBorder: '#05389f',
  dockBackground: '#ffffff',
  dockBorder: '#e2e8f0',
};

export const macosTypography = {
  largeTitle: {
    fontFamily: sfFont,
    fontSize: 24,
    fontWeight: '800' as TextStyle['fontWeight'],
    color: macosColors.textPrimary,
    letterSpacing: -0.5,
  },
  title1: {
    fontFamily: sfFont,
    fontSize: 20,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: macosColors.textPrimary,
    letterSpacing: -0.4,
  },
  title2: {
    fontFamily: sfFont,
    fontSize: 16,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: macosColors.textPrimary,
    letterSpacing: -0.3,
  },
  headline: {
    fontFamily: sfFont,
    fontSize: 14,
    fontWeight: '700' as TextStyle['fontWeight'],
    color: macosColors.textPrimary,
  },
  body: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: macosColors.textSecondary,
    lineHeight: 18,
  },
  callout: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: macosColors.textPrimary,
  },
  subhead: {
    fontFamily: sfFont,
    fontSize: 11,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: macosColors.textSecondary,
    letterSpacing: 0.2,
  },
  footnote: {
    fontFamily: sfFont,
    fontSize: 10,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: macosColors.textTertiary,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'ui-monospace, Menlo, Monaco, monospace', default: 'monospace' }),
    fontSize: 12,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
};
