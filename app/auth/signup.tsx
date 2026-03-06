import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { signUp } from '@/lib/firebase-auth';
import { useAppColors } from '@/hooks/use-app-colors';
import { cn } from '@/lib/utils';

export default function SignUpScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signUp(email, password, displayName);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error || 'Sign up failed');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password && displayName && password.length >= 6;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-foreground mb-2">Create Account</Text>
            <Text className="text-base text-muted">Join Wealth Wellness Hub</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-error/10 border border-error rounded-lg p-4 mb-6">
              <Text className="text-error font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-4 mb-6">
            {/* Display Name */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
              <TextInput
                placeholder="John Doe"
                placeholderTextColor={colors.muted}
                value={displayName}
                onChangeText={setDisplayName}
                editable={!loading}
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Email */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Email</Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>

            {/* Password */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">Password</Text>
              <TextInput
                placeholder="At least 6 characters"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
              {password && password.length < 6 && (
                <Text className="text-error text-xs mt-1">Password must be at least 6 characters</Text>
              )}
            </View>
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
            disabled={!isFormValid || loading}
            style={({ pressed }) => [
              {
                backgroundColor: isFormValid && !loading ? colors.primary : colors.border,
                opacity: pressed && isFormValid && !loading ? 0.9 : 1,
              },
            ]}
            className="rounded-lg py-4 flex-row items-center justify-center gap-2"
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text className="text-background font-semibold text-base">Sign Up</Text>
            )}
          </Pressable>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="text-muted">Already have an account? </Text>
            <Pressable onPress={() => router.navigate({ pathname: '/auth/login' } as any)}>
              <Text className="text-primary font-semibold">Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
