/**
 * Glassmorphism utilities for liquid glass UI effects
 * Provides reusable styles for glass cards, containers, and blur effects
 */

import { ViewStyle, TextStyle } from 'react-native';

export interface GlassStyle {
  container: ViewStyle;
  text: TextStyle;
}

/**
 * Base glass container style with blur effect appearance
 * Uses semi-transparent background to simulate frosted glass
 */
export const glassContainerStyle: ViewStyle = {
  backgroundColor: 'rgba(26, 58, 71, 0.65)',
  borderRadius: 20,
  borderWidth: 1,
  borderColor: 'rgba(126, 204, 196, 0.25)',
  overflow: 'hidden',
};

/**
 * Light glass style for secondary elements
 * More transparent for layered glass effect
 */
export const glassLightStyle: ViewStyle = {
  backgroundColor: 'rgba(35, 74, 87, 0.45)',
  borderRadius: 16,
  borderWidth: 1,
  borderColor: 'rgba(126, 204, 196, 0.2)',
  overflow: 'hidden',
};

/**
 * Deep glass style for primary cards and hero sections
 * More opaque for better readability
 */
export const glassDeepStyle: ViewStyle = {
  backgroundColor: 'rgba(13, 27, 35, 0.8)',
  borderRadius: 24,
  borderWidth: 1.5,
  borderColor: 'rgba(126, 204, 196, 0.3)',
  overflow: 'hidden',
};

/**
 * Glass button style with interactive states
 */
export const glassButtonStyle: ViewStyle = {
  backgroundColor: 'rgba(126, 204, 196, 0.15)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(126, 204, 196, 0.4)',
  paddingHorizontal: 16,
  paddingVertical: 12,
};

/**
 * Glass button pressed state
 */
export const glassButtonPressedStyle: ViewStyle = {
  backgroundColor: 'rgba(126, 204, 196, 0.25)',
  borderColor: 'rgba(126, 204, 196, 0.6)',
};

/**
 * Shimmer/glow effect for glass edges
 * Creates a subtle light reflection on glass surfaces
 */
export const glassGlowStyle: ViewStyle = {
  shadowColor: '#7ECCC4',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.25,
  shadowRadius: 12,
  elevation: 8,
};

/**
 * Animation timing presets for smooth glass transitions
 */
export const glassAnimationTiming = {
  fast: 150,      // Quick interactions (button press)
  normal: 300,    // Standard transitions
  slow: 500,      // Deliberate animations
  verySlow: 800,  // Entrance animations
};

/**
 * Easing functions for glass animations
 */
export const glassEasing = {
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
  smooth: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

/**
 * Helper to create glass container with custom opacity
 */
export function createGlassContainer(opacity: number = 0.65): ViewStyle {
  return {
    backgroundColor: `rgba(26, 58, 71, ${opacity})`,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `rgba(126, 204, 196, ${Math.min(opacity * 0.4, 0.3)})`,
    overflow: 'hidden',
  };
}

/**
 * Helper to create glass button with custom colors
 */
export function createGlassButton(
  bgOpacity: number = 0.15,
  borderOpacity: number = 0.4
): ViewStyle {
  return {
    backgroundColor: `rgba(126, 204, 196, ${bgOpacity})`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `rgba(126, 204, 196, ${borderOpacity})`,
    paddingHorizontal: 16,
    paddingVertical: 12,
  };
}

/**
 * Helper to add glow effect with custom color
 */
export function createGlowEffect(color: string = '#7ECCC4', intensity: number = 0.25): ViewStyle {
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 12,
    elevation: 8,
  };
}
