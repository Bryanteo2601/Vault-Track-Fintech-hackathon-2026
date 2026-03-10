import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { signUp } from '@/lib/firebase-auth';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await signUp(email, password, fullName);
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

  const isFormValid = email && password && fullName && password.length >= 6;

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-8 py-12">
          {/* Header */}
          <View className="mb-12">
            <Text className="text-3xl font-bold text-foreground mb-2">Create Account</Text>
            <Text className="text-sm text-muted">Join Wealth Hub</Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-error/10 border border-error rounded-md p-4 mb-8">
              <Text className="text-error text-sm font-medium">{error}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-4 mb-8">
            {/* Full Name */}
            <View>
              <Text className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">
                Full Name
              </Text>
              <TextInput
                placeholder="John Doe"
                placeholderTextColor="#6A6A6A"
                value={fullName}
                onChangeText={setFullName}
                editable={!loading}
                className="bg-surface border border-border rounded-md px-4 py-3 text-foreground text-sm"
                style={{ color: '#E5E5E5' }}
              />
            </View>

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
                placeholder="Minimum 6 characters"
                placeholderTextColor="#6A6A6A"
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                secureTextEntry
                className="bg-surface border border-border rounded-md px-4 py-3 text-foreground text-sm"
                style={{ color: '#E5E5E5' }}
              />
              {password && password.length < 6 && (
                <Text className="text-error text-xs mt-2">Password must be at least 6 characters</Text>
              )}
            </View>
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignup}
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
              <Text className="text-foreground font-semibold text-sm">Create Account</Text>
            )}
          </Pressable>

          {/* Sign In Link */}
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-muted text-sm">Already have an account? </Text>
            <Pressable onPress={() => router.navigate({ pathname: '/auth/login' } as any)}>
              <Text className="text-primary font-semibold text-sm">Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
