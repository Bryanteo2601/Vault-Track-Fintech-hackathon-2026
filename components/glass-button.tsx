import React from 'react';
import { Pressable, PressableProps, Text, StyleSheet } from 'react-native';
import { glassButtonStyle, glassButtonPressedStyle } from '@/lib/glass-utils';
import { useAppColors } from '@/hooks/use-app-colors';

interface GlassButtonProps extends PressableProps {
  label: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

/**
 * GlassButton - Interactive button with glass aesthetic and smooth animations
 */
export function GlassButton({
  label,
  variant = 'primary',
  size = 'medium',
  onPress,
  disabled,
  style,
  ...props
}: GlassButtonProps) {
  const colors = useAppColors();

  const sizeStyles = {
    small: { paddingHorizontal: 12, paddingVertical: 8, fontSize: 12 },
    medium: { paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
    large: { paddingHorizontal: 20, paddingVertical: 16, fontSize: 16 },
  };

  const buttonColor = variant === 'primary' ? colors.primary : colors.muted;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        glassButtonStyle,
        sizeStyles[size] as any,
        pressed && glassButtonPressedStyle,
        disabled && { opacity: 0.5 },
        style,
      ]}
      {...props}
    >
      <Text
        style={[
          styles.label,
          {
            color: buttonColor,
            fontSize: sizeStyles[size].fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: {
    fontWeight: '600',
    textAlign: 'center',
  },
});
