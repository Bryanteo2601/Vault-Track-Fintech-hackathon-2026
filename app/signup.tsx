import { View, Text, Pressable, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';


export default function SignupScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'method' | 'details'>('method');



  const handleGoogleSignup = async () => {
    // Move to details form
    setStep('details');
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

    try {
      setIsLoading(true);
      // Save user data to localStorage/AsyncStorage
      const userData = {
        name: name.trim(),
        age: ageNum,
        createdAt: new Date().toISOString(),
      };
      // TODO: Save to backend via API
      // For now, redirect to main app
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-gradient-to-b from-slate-900 to-slate-800">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, justifyContent: 'space-between', paddingVertical: 40 }}>
          {/* Header */}
          <View style={{ paddingHorizontal: 24, gap: 8 }}>
            <Pressable
              onPress={() => (step === 'details' ? setStep('method') : router.back())}
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
              {step === 'method' ? 'Create Account' : 'Tell us about you'}
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
                : 'Help us personalize your experience'}
            </Text>
          </View>

          {/* Content */}
          <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
            {step === 'method' ? (
              <View style={{ gap: 12 }}>
                {/* Google Signup Button */}
                <Pressable
                  onPress={handleGoogleSignup}
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
                  <MaterialIcons name="mail" size={20} color={colors.foreground} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: colors.foreground,
                    }}
                  >
                    Continue with Gmail
                  </Text>
                </Pressable>

                {/* Divider */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    marginVertical: 16,
                  }}
                >
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                  <Text style={{ color: colors.muted, fontSize: 12 }}>or</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                </View>

                {/* Email Input (future feature) */}
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.muted,
                    textAlign: 'center',
                  }}
                >
                  Email signup coming soon
                </Text>
              </View>
            ) : (
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
            )}
          </View>

          {/* Button */}
          <View style={{ paddingHorizontal: 24, gap: 12 }}>
            <Pressable
              onPress={step === 'method' ? handleGoogleSignup : handleSignup}
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
                  {step === 'method' ? 'Continue with Gmail' : 'Complete Signup'}
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
