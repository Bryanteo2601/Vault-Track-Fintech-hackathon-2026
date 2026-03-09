import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';
import { logOut } from '@/lib/firebase-auth';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { MaterialIcons } from '@expo/vector-icons';
import { determineLifeStage, getLifeStageName } from '@/lib/life-stage';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { user, loading } = useFirebaseAuth();
  const { data: appData, updateUserProfile } = useAppData();
  const [loggingOut, setLoggingOut] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [expandedPlan, setExpandedPlan] = useState<'pro' | 'premium' | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [birthDateInput, setBirthDateInput] = useState(appData?.userProfile?.birthDate || '');

  // Get life stage from userProfile if available
  const userLifeStage = appData?.userProfile?.lifeStage;
  const stageName = userLifeStage ? getLifeStageName(userLifeStage) : null;

  // Calculate age from birthDate
  const age = useMemo(() => {
    if (!appData?.userProfile?.birthDate) return null;
    const birthDate = new Date(appData.userProfile.birthDate);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  }, [appData?.userProfile?.birthDate]);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          setLoggingOut(true);
          try {
            const result = await logOut();
            if (result.success) {
              router.replace('/auth/login' as any);
            } else {
              Alert.alert('Error', result.error || 'Failed to sign out');
            }
          } catch (err) {
            const error = err as Error;
            Alert.alert('Error', error.message || 'An error occurred');
          } finally {
            setLoggingOut(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleSaveBirthDate = async () => {
    if (!birthDateInput.trim()) {
      Alert.alert('Error', 'Please enter a birth date');
      return;
    }

    try {
      await updateUserProfile({
        birthDate: birthDateInput,
      });
      setShowEditModal(false);
      Alert.alert('Success', 'Birth date updated successfully');
    } catch (err) {
      const error = err as Error;
      Alert.alert('Error', error.message || 'Failed to update birth date');
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-8">
          {/* ===== PROFILE HEADER ===== */}
          <View className="mb-12">
            <View className="flex-row items-center gap-4 mb-6">
              <View
                className="w-20 h-20 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-4xl font-bold" style={{ color: colors.background }}>
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-foreground mb-1">
                  {user?.displayName || 'User'}
                </Text>
                <Text className="text-sm text-muted mb-3">{user?.email}</Text>
                <Pressable onPress={() => setShowEditModal(true)} className="flex-row items-center gap-1 active:opacity-60">
                  <MaterialIcons name="edit" size={16} color={colors.primary} />
                  <Text className="text-xs font-semibold" style={{ color: colors.primary }}>
                    Edit Profile
                  </Text>
                </Pressable>
                {appData?.userProfile && (
                  <View className="mt-3 pt-3 border-t" style={{ borderColor: colors.border }}>
                    {age !== null && (
                      <View className="mb-3">
                        <Text className="text-xs font-semibold text-muted mb-1">AGE</Text>
                        <Text className="text-sm font-bold text-foreground">{age} years old</Text>
                      </View>
                    )}
                    <View>
                      <Text className="text-xs font-semibold text-muted mb-1">LIFE STAGE</Text>
                      <Text className="text-sm font-bold text-foreground">
                        {stageName || 'Not Set'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ===== SUBSCRIPTION SECTION ===== */}
          <View className="mb-12">
            <Text className="text-lg font-bold text-foreground mb-6">Subscription</Text>

            {/* Billing Cycle Toggle */}
            <View className="mb-6 flex-row gap-2">
              <Pressable
                onPress={() => setBillingCycle('monthly')}
                className="flex-1 p-3 rounded-xl items-center active:opacity-80"
                style={{
                  backgroundColor: billingCycle === 'monthly' ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: billingCycle === 'monthly' ? colors.primary : colors.border,
                }}
              >
                <Text
                  className="font-semibold text-sm"
                  style={{ color: billingCycle === 'monthly' ? colors.background : colors.foreground }}
                >
                  Monthly
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setBillingCycle('annual')}
                className="flex-1 p-3 rounded-xl items-center active:opacity-80"
                style={{
                  backgroundColor: billingCycle === 'annual' ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: billingCycle === 'annual' ? colors.primary : colors.border,
                }}
              >
                <View className="items-center">
                  <Text
                    className="font-semibold text-sm"
                    style={{ color: billingCycle === 'annual' ? colors.background : colors.foreground }}
                  >
                    Annual
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: billingCycle === 'annual' ? colors.background : colors.muted }}
                  >
                    Save 20%
                  </Text>
                </View>
              </Pressable>
            </View>

            {/* Pro Plan Card */}
            <View
              className="rounded-2xl p-6 mb-4 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: expandedPlan === 'pro' ? colors.primary : colors.border,
              }}
            >
              <Pressable
                onPress={() => setExpandedPlan(expandedPlan === 'pro' ? null : 'pro')}
                className="flex-row items-start justify-between active:opacity-80 mb-4"
              >
                <View className="flex-1">
                  <Text className="text-xl font-bold text-foreground">Pro</Text>
                  <Text className="text-sm text-muted mt-1">Perfect for serious investors</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold" style={{ color: colors.primary }}>
                    SGD {billingCycle === 'monthly' ? '30' : '300'}
                  </Text>
                  <Text className="text-xs text-muted">{billingCycle === 'monthly' ? '/month' : '/year'}</Text>
                </View>
              </Pressable>

              {expandedPlan === 'pro' && (
                <View className="border-t" style={{ borderColor: colors.border }}>
                  <View className="pt-4 gap-3">
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">Financial health breakdown</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">Diversification analysis</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">CPF retirement projections</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">50 AI chats/month</Text>
                    </View>
                    <Pressable
                      className="mt-4 p-3 rounded-xl items-center active:opacity-80"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="font-bold text-sm" style={{ color: colors.background }}>
                        Choose Pro
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Premium Plan Card */}
            <View
              className="rounded-2xl p-6 border-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: expandedPlan === 'premium' ? colors.primary : colors.primary + '40',
              }}
            >
              <View className="absolute top-4 right-4 px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                  RECOMMENDED
                </Text>
              </View>

              <Pressable
                onPress={() => setExpandedPlan(expandedPlan === 'premium' ? null : 'premium')}
                className="flex-row items-start justify-between active:opacity-80 mb-4"
              >
                <View className="flex-1 pr-8">
                  <Text className="text-xl font-bold text-foreground">Premium</Text>
                  <Text className="text-sm text-muted mt-1">Everything + AI wealth coach</Text>
                </View>
                <View className="items-end">
                  <Text className="text-xl font-bold" style={{ color: colors.primary }}>
                    SGD {billingCycle === 'monthly' ? '50' : '400'}
                  </Text>
                  <Text className="text-xs text-muted">{billingCycle === 'monthly' ? '/month' : '/year'}</Text>
                </View>
              </Pressable>

              {expandedPlan === 'premium' && (
                <View className="border-t" style={{ borderColor: colors.border }}>
                  <View className="pt-4 gap-3">
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">All Pro features</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">AI wealth coach</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">Portfolio stress testing</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">Unlimited AI chats</Text>
                    </View>
                    <View className="flex-row items-center gap-3">
                      <MaterialIcons name="check-circle" size={16} color={colors.success} />
                      <Text className="text-sm text-muted">Global retirement planner</Text>
                    </View>
                    <Pressable
                      className="mt-4 p-3 rounded-xl items-center active:opacity-80"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Text className="font-bold text-sm" style={{ color: colors.background }}>
                        Choose Premium
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>

            {/* Billing Info */}
            <View className="mt-6 gap-2 px-4 py-3 rounded-xl" style={{ backgroundColor: colors.surface + '40' }}>
              <View className="flex-row items-start gap-2">
                <MaterialIcons name="info" size={14} color={colors.muted} style={{ marginTop: 2 }} />
                <Text className="text-xs text-muted flex-1">
                  Your subscription will renew automatically. Cancel anytime.
                </Text>
              </View>
              <View className="flex-row items-start gap-2">
                <MaterialIcons name="info" size={14} color={colors.muted} style={{ marginTop: 2 }} />
                <Text className="text-xs text-muted flex-1">
                  Annual plans save you 20% compared to monthly billing.
                </Text>
              </View>
            </View>
          </View>

          {/* ===== ACCOUNT SETTINGS SECTION ===== */}
          <View className="mb-12">
            <Text className="text-lg font-bold text-foreground mb-6">Account Settings</Text>

            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className="flex-row items-center justify-between border border-border rounded-xl px-5 py-4 mb-3"
            >
              <View className="flex-row items-center gap-4">
                <MaterialIcons name="lock" size={22} color={colors.primary} />
                <Text className="text-base font-semibold text-foreground">Change Password</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className="flex-row items-center justify-between border border-border rounded-xl px-5 py-4"
            >
              <View className="flex-row items-center gap-4">
                <MaterialIcons name="privacy-tip" size={22} color={colors.primary} />
                <Text className="text-base font-semibold text-foreground">Privacy Settings</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
            </Pressable>
          </View>

          {/* ===== SIGN OUT BUTTON ===== */}
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              {
                backgroundColor: pressed || loggingOut ? '#D32F2F' : '#EF5350',
              },
            ]}
            className="w-full p-4 rounded-xl items-center justify-center mb-8 active:opacity-90"
          >
            <Text className="font-bold text-base text-white">
              {loggingOut ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ===== EDIT PROFILE MODAL ===== */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1" style={{ backgroundColor: colors.background }}>
          <View className="flex-1 flex-col">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 py-6 border-b" style={{ borderColor: colors.border }}>
              <Text className="text-2xl font-bold text-foreground">Edit Profile</Text>
              <Pressable onPress={() => setShowEditModal(false)} className="active:opacity-60">
                <MaterialIcons name="close" size={28} color={colors.foreground} />
              </Pressable>
            </View>

            {/* Form Content */}
            <View className="flex-1 px-6 py-8">
              <Text className="text-sm font-semibold text-muted mb-3">Birth Date</Text>
              <TextInput
                value={birthDateInput}
                onChangeText={setBirthDateInput}
                placeholder="YYYY-MM-DD (e.g., 1995-05-15)"
                placeholderTextColor={colors.muted}
                className="border rounded-xl px-4 py-4 text-foreground text-base"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                }}
              />
              <Text className="text-xs text-muted mt-3 leading-relaxed">
                Enter your birth date to calculate your age and determine your life stage for personalized financial guidance.
              </Text>
            </View>

            {/* Buttons - Fixed at bottom */}
            <View className="px-6 py-6 border-t flex-row gap-3" style={{ borderColor: colors.border }}>
              <Pressable
                onPress={() => setShowEditModal(false)}
                className="flex-1 p-4 rounded-xl items-center justify-center active:opacity-80"
                style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="font-bold text-base text-foreground">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveBirthDate}
                className="flex-1 p-4 rounded-xl items-center justify-center active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-bold text-base text-white">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
