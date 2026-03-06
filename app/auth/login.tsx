import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { signIn } from '@/lib/firebase-auth';
import { useAppColors } from '@/hooks/use-app-colors';

export default function LoginScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = email && password;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-foreground mb-2">Welcome Back</Text>
            <Text className="text-base text-muted">Sign in to your account</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-error/10 border border-error rounded-lg p-4 mb-6">
              <Text className="text-error font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-4 mb-6">
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
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                style={{ color: colors.foreground }}
              />
            </View>
          </View>

          {/* Forgot Password Link */}
          <Pressable onPress={() => router.navigate({ pathname: '/auth/forgot-password' } as any)} className="mb-6">
            <Text className="text-primary font-semibold text-sm">Forgot password?</Text>
          </Pressable>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
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
              <Text className="text-background font-semibold text-base">Sign In</Text>
            )}
          </Pressable>

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Text className="text-muted">Don't have an account? </Text>
            <Pressable onPress={() => router.navigate({ pathname: '/auth/signup' } as any)}>
              <Text className="text-primary font-semibold">Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
