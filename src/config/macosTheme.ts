import { Platform, TextStyle, ViewStyle } from 'react-native';

/**
 * macOS San Francisco Human Interface Design System for Project Banwaan Mobile
 * Inspired by macOS Sequoia / Sonoma / Big Sur dark vibrancy aesthetic.
 */

export const sfFont = Platform.select({
  ios: 'System',
  android: 'sans-serif',
  web: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif',
  default: 'System',
});

export const macosColors = {
  // macOS Desktop & Window Surfaces
  windowBackground: '#0d111a',
  sidebarBackground: '#131824',
  cardBackground: '#181e2e',
  cardBackgroundElevated: '#20283d',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  cardBorderHover: 'rgba(255, 255, 255, 0.16)',
  cardHighlight: 'rgba(255, 255, 255, 0.04)',

  // Apple macOS System Colors
  appleBlue: '#0a84ff',
  appleBlueHover: '#0071e3',
  appleBlueSubtle: 'rgba(10, 132, 255, 0.15)',
  appleGreen: '#30d158',
  appleGreenSubtle: 'rgba(48, 209, 88, 0.15)',
  appleYellow: '#ffd60a',
  appleYellowSubtle: 'rgba(255, 214, 10, 0.15)',
  appleOrange: '#ff9f0a',
  appleOrangeSubtle: 'rgba(255, 159, 10, 0.15)',
  appleRed: '#ff453a',
  appleRedSubtle: 'rgba(255, 69, 58, 0.15)',
  applePurple: '#bf5af2',
  applePurpleSubtle: 'rgba(191, 90, 242, 0.15)',
  appleTeal: '#64d2ff',

  // Naga City Gold Accent
  nagaGold: '#fccf17',
  nagaGoldSubtle: 'rgba(252, 207, 23, 0.15)',

  // macOS Text Levels
  textPrimary: '#f5f5f7',
  textSecondary: '#9ca3af',
  textTertiary: '#6b7280',
  textMuted: '#4b5563',

  // macOS Traffic Light Dots
  trafficClose: '#ff5f56',
  trafficMin: '#ffbd2e',
  trafficZoom: '#27c93f',

  // macOS Controls & Inputs
  controlBackground: 'rgba(255, 255, 255, 0.06)',
  controlBorder: 'rgba(255, 255, 255, 0.12)',
  inputBackground: '#090d16',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  inputFocusBorder: '#0a84ff',
  dockBackground: 'rgba(19, 24, 36, 0.88)',
  dockBorder: 'rgba(255, 255, 255, 0.12)',
};

export const macosTypography = {
  largeTitle: {
    fontFamily: sfFont,
    fontSize: 26,
    fontWeight: '700' as TextStyle['fontWeight'],
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
    fontSize: 17,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: macosColors.textPrimary,
    letterSpacing: -0.3,
  },
  headline: {
    fontFamily: sfFont,
    fontSize: 15,
    fontWeight: '600' as TextStyle['fontWeight'],
    color: macosColors.textPrimary,
  },
  body: {
    fontFamily: sfFont,
    fontSize: 13,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: macosColors.textPrimary,
    lineHeight: 18,
  },
  callout: {
    fontFamily: sfFont,
    fontSize: 12,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: macosColors.textSecondary,
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
    fontWeight: '400' as TextStyle['fontWeight'],
    color: macosColors.textTertiary,
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', web: 'ui-monospace, Menlo, Monaco, monospace', default: 'monospace' }),
    fontSize: 12,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
};
