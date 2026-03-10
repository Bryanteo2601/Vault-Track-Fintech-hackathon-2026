import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { MaterialIcons } from '@expo/vector-icons';
import { signIn } from '@/lib/firebase-auth';
import { db } from '@/lib/firebase-config';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export default function LoginScreen() {
  const router = useRouter();
  const colors = useAppColors();

  const [identifier, setIdentifier] = useState(''); // email or username
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter your email/username and password');
      return;
    }

    try {
      setIsLoading(true);

      const raw = identifier.trim();

      // Determine email to use: if identifier looks like an email, use directly;
      // otherwise, try to resolve it as a username from Firestore.
      let emailToUse = raw;
      const looksLikeEmail = raw.includes('@');

      if (!looksLikeEmail) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('displayName', '==', raw), limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          Alert.alert('Login failed', 'User not found');
          return;
        }

        const userDoc = snapshot.docs[0].data() as { email?: string };
        if (!userDoc.email) {
          Alert.alert('Login failed', 'User does not have an email configured');
          return;
        }

        emailToUse = userDoc.email;
      }

      const result = await signIn(emailToUse, password);

      if (!result.success) {
        Alert.alert('Login failed', result.error || 'Invalid credentials');
        return;
      }

      // On successful login, go to main app tabs
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login failed', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <ScreenContainer containerClassName="bg-gradient-to-b from-slate-900 to-slate-800">
      <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 40 }}>
        {/* Header */}
        <View style={{ gap: 8 }}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              opacity: pressed ? 0.6 : 1,
              width: 40,
              height: 40,
              justifyContent: 'center',
            })}
          >
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>

          <Text
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: colors.foreground,
              marginTop: 16,
            }}
          >
            Log in
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: colors.muted,
              marginTop: 8,
            }}
          >
            Enter your credentials to access your account
          </Text>
        </View>

        {/* Form */}
        <View style={{ flex: 1, justifyContent: 'center', gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.foreground,
              }}
            >
              Email or Username
            </Text>
            <TextInput
              placeholder="Enter your email or username"
              placeholderTextColor={colors.muted}
              value={identifier}
              onChangeText={setIdentifier}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.foreground,
                fontSize: 16,
              }}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.foreground,
              }}
            >
              Password
            </Text>
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor={colors.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                color: colors.foreground,
                fontSize: 16,
              }}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={{ gap: 12 }}>
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            style={({ pressed }) => ({
              backgroundColor: colors.primary,
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
              opacity: pressed || isLoading ? 0.8 : 1,
            })}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: colors.background,
                }}
              >
                Log in
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

