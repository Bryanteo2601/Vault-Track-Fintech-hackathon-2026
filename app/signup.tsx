import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAppData } from '@/lib/app-data-context';
import { signUp } from '@/lib/firebase-auth';


export default function SignupScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'method' | 'gmail' | 'details' | 'password'>('method');

  const { updateUserProfile } = useAppData();

  const handleGoogleSignup = async () => {
    // Move to Gmail authentication step
    setStep('gmail');
  };

  const handleSignup = async () => {
    if (!name.trim() || !age.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age (18-120)');
      return;
    }

    // Move to password setup step
    setStep('password');
  };

  const handlePasswordSetup = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setIsLoading(true);

      // Create Firebase Auth user with email and password
      const result = await signUp(email.trim(), password, name.trim());

      if (!result.success) {
        Alert.alert('Error', result.error || 'Failed to create account');
        return;
      }

      // Calculate birthDate from age
      const today = new Date();
      const birthYear = today.getFullYear() - parseInt(age);
      const birthDate = new Date(birthYear, today.getMonth(), today.getDate());

      // Save user profile data
      await updateUserProfile({
        email: email.trim(),
        name: name.trim(),
        birthDate: birthDate.toISOString().split('T')[0],
      });

      // Redirect to main app
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueFromGmail = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setStep('details');
  };

  return (
    <ScreenContainer containerClassName="bg-gradient-to-b from-slate-900 to-slate-800">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 40 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, gap: 8 }}>
            <Pressable
              onPress={() => {
                if (step === 'password') {
                  setStep('details');
                } else if (step === 'details') {
                  setStep('gmail');
                } else if (step === 'gmail') {
                  setStep('method');
                } else {
                  router.back();
                }
              }}
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
              {step === 'method'
                ? 'Create Account'
                : step === 'gmail'
                ? 'Email'
                : step === 'details'
                ? 'Tell us about you'
                : 'Set Password'}
            </Text>

            <Text
              style={{
                fontSize: 14,
                color: colors.muted,
                marginTop: 8,
              }}
            >
              {step === 'method'
                ? 'Sign up to get started'
                : step === 'gmail'
                ? 'Enter your email address'
                : step === 'details'
                ? 'Help us personalize your experience'
                : 'Create a secure password for your account'}
            </Text>
          </View>

          {/* Content */}
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
            {step === 'method' ? (
              <View style={{ gap: 12 }}>
                {/* Sign In Button */}
                <Pressable
                  onPress={() => router.push('/auth/login' as any)}
                  disabled={isLoading}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 24,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.foreground,
                    }}
                  >
                    Sign In
                  </Text>
                </Pressable>
              </View>
            ) : step === 'gmail' ? (
              <View style={{ gap: 16, alignItems: 'center' }}>
                {/* Email Icon */}
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialIcons name="mail" size={40} color={colors.background} />
                </View>

                {/* Email Input */}
                <View style={{ gap: 8, width: '100%' }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.foreground,
                    }}
                  >
                    Email Address
                  </Text>
                  <TextInput
                    placeholder="Enter your email"
                    placeholderTextColor={colors.muted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
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
            ) : step === 'details' ? (
              <View style={{ gap: 16 }}>
                {/* Name Input */}
                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.foreground,
                    }}
                  >
                    Full Name
                  </Text>
                  <TextInput
                    placeholder="Enter your name"
                    placeholderTextColor={colors.muted}
                    value={name}
                    onChangeText={setName}
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

                {/* Age Input */}
                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.foreground,
                    }}
                  >
                    Age
                  </Text>
                  <TextInput
                    placeholder="Enter your age"
                    placeholderTextColor={colors.muted}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="number-pad"
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

                {/* Info Text */}
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    marginTop: 8,
                  }}
                >
                  We use this information to provide personalized financial insights and recommendations
                </Text>
              </View>
            ) : (
              <View style={{ gap: 16 }}>
                {/* Password Input */}
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
                    placeholder="Enter a password"
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

                {/* Confirm Password Input */}
                <View style={{ gap: 8 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.foreground,
                    }}
                  >
                    Confirm Password
                  </Text>
                  <TextInput
                    placeholder="Confirm your password"
                    placeholderTextColor={colors.muted}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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

                {/* Password Requirements */}
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.muted,
                    marginTop: 8,
                  }}
                >
                  Password must be at least 6 characters long
                </Text>
              </View>
            )}
          </View>

          {/* Button */}
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <Pressable
              onPress={() => {
                if (step === 'method') {
                  handleGoogleSignup();
                } else if (step === 'gmail') {
                  handleContinueFromGmail();
                } else if (step === 'details') {
                  handleSignup();
                } else {
                  handlePasswordSetup();
                }
              }}
              disabled={isLoading}
              style={({ pressed }) => ({
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
                opacity: pressed ? 0.8 : 1,
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
                  {step === 'method'
                    ? 'Sign Up with Email'
                    : step === 'gmail'
                    ? 'Continue'
                    : step === 'details'
                    ? 'Next'
                    : 'Create Account'}
                </Text>
              )}
            </Pressable>

            <Text
              style={{
                fontSize: 12,
                color: colors.muted,
                textAlign: 'center',
              }}
            >
              By signing up, you agree to our Terms of Service
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
