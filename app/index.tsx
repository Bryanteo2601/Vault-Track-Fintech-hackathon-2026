import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LandingScreen() {
  const router = useRouter();
  const colors = useAppColors();

  // Landing page always shows - no auto-redirect

  const handleGetStarted = () => {
    router.push('/onboarding');
  };

  return (
    <ScreenContainer containerClassName="bg-slate-900" edges={['top', 'left', 'right', 'bottom']}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 40 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 12,
              backgroundColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.background }}>W</Text>
          </View>
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Hero Content */}
        <View style={{ marginBottom: 60 }}>
          <Text
            style={{
              fontSize: 48,
              fontWeight: '700',
              color: colors.primary,
              lineHeight: 56,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Grow your wealth today
          </Text>

          <Text
            style={{
              fontSize: 16,
              color: colors.muted,
              lineHeight: 24,
              textAlign: 'center',
            }}
          >
            Track your finances, manage investments, and build wealth with AI-powered insights
          </Text>
        </View>

        {/* Get Started Button */}
        <View>
          <Pressable
            onPress={handleGetStarted}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 28,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
              marginBottom: 12,
            })}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.background,
              }}
            >
              Get Started
            </Text>
          </Pressable>

          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              textAlign: 'center',
            }}
          >
            Join thousands managing their wealth
          </Text>
        </View>
      </View>
    </ScreenContainer>
  );
}
