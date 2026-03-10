import { View, Text, TextInput, Pressable, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');

  const handleContinue = async () => {
    // Clear previous errors
    setNameError('');
    setAgeError('');

    let hasError = false;

    // Name
    if (!name.trim()) {
      setNameError('Please enter your name.');
      hasError = true;
    }

    // Age
    if (!age.trim()) {
      setAgeError('Please enter your age.');
      hasError = true;
    } else {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
        setAgeError('Age must be a number between 18 and 120.');
        hasError = true;
      }
    }

    if (hasError) {
      return;
    }

    const ageNum = parseInt(age, 10);

    setIsLoading(true);
    try {
      // Persist simple onboarding profile locally (name and age only)
      await AsyncStorage.setItem(
        'userProfile',
        JSON.stringify({
          name: name.trim(),
          age: ageNum,
          onboardingComplete: true,
        }),
      );

      // Navigate straight to dashboard tabs
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScreenContainer containerClassName="bg-background" edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 40, justifyContent: 'space-between' }}>
            {/* Header */}
            <View>
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

              {/* Title */}
              <Text
                style={{
                  fontSize: 32,
                  fontWeight: '700',
                  color: colors.foreground,
                  textAlign: 'center',
                  marginBottom: 12,
                }}
              >
                Let's Get Started
              </Text>

              <Text
                style={{
                  fontSize: 16,
                  color: colors.muted,
                  textAlign: 'center',
                  marginBottom: 40,
                  lineHeight: 24,
                }}
              >
                Tell us a bit about yourself so we can personalize your wealth management experience
              </Text>
            </View>

            {/* Form: only name and age */}
            <View style={{ gap: 20 }}>
              {/* Name Input */}
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.foreground,
                    marginBottom: 8,
                  }}
                >
                  What's your name?
                </Text>
                <TextInput
                  placeholder="Enter your name"
                  placeholderTextColor={colors.muted}
                  value={name}
                  onChangeText={setName}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                  editable={!isLoading}
                />
                {nameError ? (
                  <Text style={{ marginTop: 4, fontSize: 12, color: colors.error }}>
                    {nameError}
                  </Text>
                ) : null}
              </View>

              {/* Age Input */}
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: colors.foreground,
                    marginBottom: 8,
                  }}
                >
                  How old are you?
                </Text>
                <TextInput
                  placeholder="Enter your age"
                  placeholderTextColor={colors.muted}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                  editable={!isLoading}
                />
                {ageError ? (
                  <Text style={{ marginTop: 4, fontSize: 12, color: colors.error }}>
                    {ageError}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Button */}
            <View>
              <Pressable
                onPress={handleContinue}
                disabled={isLoading}
                style={({ pressed }) => ({
                  backgroundColor: colors.primary,
                  paddingVertical: 16,
                  borderRadius: 28,
                  alignItems: 'center',
                  opacity: pressed || isLoading ? 0.8 : 1,
                })}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: colors.background,
                  }}
                >
                  {isLoading ? 'Setting up...' : 'Continue to Dashboard'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
