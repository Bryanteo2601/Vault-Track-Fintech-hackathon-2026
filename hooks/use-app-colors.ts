import { useColorScheme } from './use-color-scheme';
import { themeColors } from '@/theme.config';

export type AppColors = {
  primary: string;
  accent: string;
  background: string;
  surface: string;
  foreground: string;
  muted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  card: string;
  tint: string;
  text: string;
  tabIconDefault: string;
  tabIconSelected: string;
  icon: string;
};

export function useAppColors(): AppColors {
  const scheme = useColorScheme() ?? 'light';
  const schemeKey = scheme as 'light' | 'dark';
  
  // Map theme.config.js colors to app colors
  return {
    primary: themeColors.primary[schemeKey],
    accent: themeColors.primary[schemeKey], // Use primary as accent
    background: themeColors.background[schemeKey],
    surface: themeColors.surface[schemeKey],
    foreground: themeColors.foreground[schemeKey],
    muted: themeColors.muted[schemeKey],
    border: themeColors.border[schemeKey],
    success: themeColors.success[schemeKey],
    warning: themeColors.warning[schemeKey],
    error: themeColors.error[schemeKey],
    card: themeColors.surface[schemeKey], // Use surface as card
    tint: themeColors.primary[schemeKey], // Use primary as tint
    text: themeColors.foreground[schemeKey],
    tabIconDefault: themeColors.muted[schemeKey],
    tabIconSelected: themeColors.primary[schemeKey],
    icon: themeColors.muted[schemeKey],
  };
}
