import { Platform, type TextStyle } from 'react-native';
import type { ExpiryStatus } from './types/models';

// Pantree tokens. Sourced from the ShelfLife SwiftUI theme; update when Figma design system is synced.
export const colors = {
  accent: '#354A39',
  accentSoft: '#5E7A62',
  background: '#F3EADB',
  surface: '#E7D6BC',
  surfaceStrong: '#C4A07A',
  card: '#FBF6EE',
  border: '#DCCBB0',
  textPrimary: '#354A39',
  textSecondary: '#7C6D52',
  onAccent: '#FFFFFF',
  fresh: '#CFD8C0',
  soon: '#F0DCAE',
  expired: '#EFD3C4',
  freshText: '#3E5A3F',
  soonText: '#8A6418',
  expiredText: '#9A4628',
  danger: '#B5482D',
  success: '#4F7A4F',
} as const;

export const statusColors: Record<ExpiryStatus, { background: string; text: string }> = {
  fresh: { background: colors.fresh, text: colors.freshText },
  soon: { background: colors.soon, text: colors.soonText },
  expired: { background: colors.expired, text: colors.expiredText },
};

export const spacing = { xs: 4, s: 8, m: 12, l: 16, xl: 24, xxl: 32 } as const;

export const radius = { card: 14, input: 10, pill: 999 } as const;

const rounded = Platform.select({ ios: 'System', default: undefined });

export const fonts = {
  largeTitle: { fontFamily: rounded, fontSize: 32, fontWeight: '700', color: colors.textPrimary },
  title: { fontFamily: rounded, fontSize: 24, fontWeight: '700', color: colors.textPrimary },
  headline: { fontFamily: rounded, fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  body: { fontFamily: rounded, fontSize: 16, color: colors.textPrimary },
  caption: { fontFamily: rounded, fontSize: 13, color: colors.textSecondary },
} satisfies Record<string, TextStyle>;

export const shadow = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 5 },
  elevation: 3,
} as const;
