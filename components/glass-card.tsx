import React from 'react';
import { View, ViewProps } from 'react-native';
import { glassContainerStyle, glassLightStyle, glassDeepStyle, glassGlowStyle } from '@/lib/glass-utils';

interface GlassCardProps extends ViewProps {
  variant?: 'default' | 'light' | 'deep';
  glow?: boolean;
  padding?: number;
  children?: React.ReactNode;
}

/**
 * GlassCard - Reusable glassmorphism container component
 * Provides consistent glass aesthetic across the app
 */
export function GlassCard({
  variant = 'default',
  glow = false,
  padding = 16,
  children,
  style,
  ...props
}: GlassCardProps) {
  const baseStyle = 
    variant === 'light' ? glassLightStyle :
    variant === 'deep' ? glassDeepStyle :
    glassContainerStyle;

  const containerStyle = [
    baseStyle,
    { padding },
    glow && glassGlowStyle,
    style,
  ];

  return (
    <View style={containerStyle} {...props}>
      {children}
    </View>
  );
}
