import { ScrollView, Text, View, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { sendPasswordReset } from '@/lib/firebase-auth';
import { useAppColors } from '@/hooks/use-app-colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const result = await sendPasswordReset(email);
      if (result.success) {
        setSuccess(true);
        setEmail('');
      } else {
        setError(result.error || 'Password reset failed');
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-foreground mb-2">Reset Password</Text>
            <Text className="text-base text-muted">Enter your email to receive a password reset link</Text>
          </View>

          {/* Success Message */}
          {success ? (
            <View className="bg-success/10 border border-success rounded-lg p-4 mb-6">
              <Text className="text-success font-medium">Password reset email sent! Check your inbox.</Text>
            </View>
          ) : null}

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
          </View>

          {/* Reset Button */}
          <Pressable
            onPress={handleResetPassword}
            disabled={!email || loading}
            style={({ pressed }) => [
              {
                backgroundColor: email && !loading ? colors.primary : colors.border,
                opacity: pressed && email && !loading ? 0.9 : 1,
              },
            ]}
            className="rounded-lg py-4 flex-row items-center justify-center gap-2"
          >
            {loading ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text className="text-background font-semibold text-base">Send Reset Link</Text>
            )}
          </Pressable>

          {/* Back to Login Link */}
          <View className="flex-row items-center justify-center mt-6 gap-1">
            <Pressable onPress={() => router.back()}>
              <Text className="text-primary font-semibold">Back to Sign In</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
