import { useColorScheme } from './use-color-scheme';

// Extended color palette for Wealth Wellness Hub
const appColors = {
  light: {
    primary: '#1A3C5E',
    accent: '#00C896',
    background: '#F0F4F8',
    surface: '#FFFFFF',
    foreground: '#11181C',
    muted: '#64748B',
    border: '#E2E8F0',
    success: '#00C896',
    warning: '#F59E0B',
    error: '#EF4444',
    card: '#FFFFFF',
    tint: '#1A3C5E',
    text: '#11181C',
    tabIconDefault: '#64748B',
    tabIconSelected: '#1A3C5E',
    icon: '#64748B',
  },
  dark: {
    primary: '#2A5C8E',
    accent: '#00E0A8',
    background: '#0D1B2A',
    surface: '#1A2B3C',
    foreground: '#ECEDEE',
    muted: '#94A3B8',
    border: '#243447',
    success: '#00E0A8',
    warning: '#FBBF24',
    error: '#F87171',
    card: '#1E3248',
    tint: '#00C896',
    text: '#ECEDEE',
    tabIconDefault: '#94A3B8',
    tabIconSelected: '#00C896',
    icon: '#94A3B8',
  },
};

export type AppColors = typeof appColors.light;

export function useAppColors(): AppColors {
  const scheme = useColorScheme();
  return appColors[scheme ?? 'light'];
}
