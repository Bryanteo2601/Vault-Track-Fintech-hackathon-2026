import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { signIn } from '@/lib/firebase-auth';
import { signInWithApple, isAppleSignInAvailable } from '@/lib/firebase-apple-auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    const checkAppleAuth = async () => {
      const available = await isAppleSignInAvailable();
      setAppleAvailable(available);
    };
    checkAppleAuth();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

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

  const handleAppleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithApple();
      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error || 'Apple Sign-In failed');
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
        <View className="flex-1 justify-center px-8 py-12">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold text-foreground mb-2">Wealth Hub</Text>
            <Text className="text-sm text-muted">Institutional Financial Dashboard</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-error/10 border border-error rounded-md p-4 mb-8">
              <Text className="text-error text-sm font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-4 mb-8">
            {/* Email */}
            <View>
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Email Address
              </Text>
              <TextInput
                placeholder="you@example.com"
                placeholderTextColor="#6A6A6A"
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-surface border border-border rounded-md px-4 py-3 text-foreground text-sm"
                style={{ color: '#E5E5E5' }}
              />
            </View>

            {/* Password */}
            <View>
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Password
              </Text>
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#6A6A6A"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                className="bg-surface border border-border rounded-md px-4 py-3 text-foreground text-sm"
                style={{ color: '#E5E5E5' }}
              />
            </View>
          </View>

          {/* Login Button */}
          <Pressable
            onPress={handleLogin}
            disabled={!isFormValid || loading}
            style={({ pressed }) => [
              {
                backgroundColor: isFormValid && !loading ? '#2F6FED' : '#3A3A3A',
                opacity: pressed && isFormValid && !loading ? 0.9 : 1,
              },
            ]}
            className="rounded-md py-3 flex-row items-center justify-center gap-2 mb-6"
          >
            {loading ? (
              <ActivityIndicator color="#E5E5E5" size="small" />
            ) : (
              <Text className="text-foreground font-semibold text-sm">Sign In</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-muted text-xs">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Apple Sign-In Button */}
          {appleAvailable && Platform.OS === 'ios' ? (
            <Pressable
              onPress={handleAppleSignIn}
              disabled={loading}
              style={({ pressed }) => [
                {
                  backgroundColor: '#1A1A1A',
                  borderColor: '#2A2A2A',
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              className="rounded-md py-3 flex-row items-center justify-center gap-2 border mb-6"
            >
              <Text className="text-lg">🍎</Text>
              <Text className="text-foreground font-semibold text-sm">Sign in with Apple</Text>
            </Pressable>
          ) : null}

          {/* Sign Up Link */}
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-muted text-sm">Don't have an account? </Text>
            <Pressable onPress={() => router.navigate({ pathname: '/auth/signup' } as any)}>
              <Text className="text-primary font-semibold text-sm">Sign Up</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
