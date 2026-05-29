import { Platform } from 'react-native';

export const COLORS = {
  background: '#0F172A',// #07070F
  cardBackground: '#1E2938',
  
  purple: '#7C3AED',
  purpleLight: '#A855F7',
  blue: '#00CAFF',
  blueLight: '#22D3EE',
  
  textMain: '#FFFFFF',
  textSecondary: '#94A3B8',
  onlineGreen: '#39FF14',
  rankDiamond: '#A855F7',
  actionRed: '#E82260',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
