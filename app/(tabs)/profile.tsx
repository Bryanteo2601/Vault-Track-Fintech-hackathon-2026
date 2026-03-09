import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';
import { logOut } from '@/lib/firebase-auth';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { determineLifeStage, getLifeStageName, getRecommendedGoals, getKeyFocusAreas } from '@/lib/life-stage';
import { MaterialIcons } from '@expo/vector-icons';
import { EducationalContentCard } from '@/components/educational-content-card';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { user, userData, loading } = useFirebaseAuth();
  const { data: appData, updateUserProfile } = useAppData();
  const [loggingOut, setLoggingOut] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [expandedPlan, setExpandedPlan] = useState<'pro' | 'premium' | null>(null);
  const [birthDate, setBirthDate] = useState(appData?.userProfile?.birthDate || '');
  const [editingBirthDate, setEditingBirthDate] = useState(false);

  const lifeStage = appData?.userProfile ? determineLifeStage(appData.userProfile.birthDate) : null;
  const stageName = lifeStage ? getLifeStageName(lifeStage) : null;
  const goals = lifeStage ? getRecommendedGoals(lifeStage) : [];
  const focusAreas = lifeStage ? getKeyFocusAreas(lifeStage) : [];

  const getStageIcon = (stage: string) => {
    const icons: Record<string, string> = {
      fresh_entrant: '🚀',
      starting_family: '👨‍👩‍👧',
      supporting_parents: '👴',
      dual_responsibility: '⚖️',
      pre_retiree: '⏰',
      golden_years: '🌟',
    };
    return icons[stage] || '💰';
  };

  const handleSaveBirthDate = async () => {
    if (birthDate) {
      try {
        await updateUserProfile({ birthDate });
        setEditingBirthDate(false);
        Alert.alert('Success', 'Birth date updated successfully');
      } catch (err) {
        Alert.alert('Error', 'Failed to update birth date');
      }
    }
  };

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
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-foreground mb-2">Profile</Text>
            <Text className="text-base text-muted">Manage your account</Text>
          </View>

          {/* Life Stage Card */}
          {lifeStage && (
            <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
              <View className="flex-row items-center gap-3 mb-3">
                <Text className="text-4xl">{getStageIcon(lifeStage)}</Text>
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-muted mb-1">LIFE STAGE</Text>
                  <Text className="text-lg font-bold text-foreground">{stageName}</Text>
                </View>
              </View>

              {/* Key Focus Areas */}
              <View className="mb-4 border-t border-border pt-3">
                <Text className="text-xs font-semibold text-muted mb-2">KEY FOCUS AREAS</Text>
                <View className="gap-1">
                  {focusAreas.slice(0, 3).map((area, idx) => (
                    <View key={idx} className="flex-row items-start gap-2">
                      <Text className="text-primary font-bold">•</Text>
                      <Text className="text-xs text-muted flex-1">{area}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Recommended Goals */}
              <View className="border-t border-border pt-3">
                <Text className="text-xs font-semibold text-muted mb-2">RECOMMENDED GOALS</Text>
                <View className="gap-1">
                  {goals.slice(0, 3).map((goal, idx) => (
                    <View key={idx} className="flex-row items-start gap-2">
                      <Text className="text-success font-bold">✓</Text>
                      <Text className="text-xs text-muted flex-1">{goal}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Educational Content */}
          <EducationalContentCard />

          {/* Birth Date Input Card */}
          <View className="bg-surface border border-border rounded-2xl p-4 mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold text-foreground">Birth Date</Text>
              {!editingBirthDate && (
                <Pressable
                  onPress={() => setEditingBirthDate(true)}
                  className="active:opacity-60"
                >
                  <MaterialIcons name="edit" size={18} color={colors.primary} />
                </Pressable>
              )}
            </View>
            {editingBirthDate ? (
              <View className="gap-2">
                <TextInput
                  placeholder="YYYY-MM-DD"
                  value={birthDate}
                  onChangeText={setBirthDate}
                  className="border border-border rounded-lg p-2 text-foreground"
                  placeholderTextColor={colors.muted}
                />
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleSaveBirthDate}
                    className="flex-1 bg-primary rounded-lg py-2 active:opacity-80"
                  >
                    <Text className="text-center text-xs font-semibold text-background">Save</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setEditingBirthDate(false);
                      setBirthDate(appData?.userProfile?.birthDate || '');
                    }}
                    className="flex-1 bg-surface border border-border rounded-lg py-2 active:opacity-60"
                  >
                    <Text className="text-center text-xs font-semibold text-foreground">Cancel</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Text className="text-sm text-muted">
                {birthDate || 'Not set'}
              </Text>
            )}
          </View>

          {/* User Info Card */}
          <View className="bg-surface border border-border rounded-2xl p-6 mb-6">
            <View className="flex-row items-center gap-4 mb-6">
              <View className="w-16 h-16 bg-primary rounded-full items-center justify-center">
                <Text className="text-2xl font-bold text-background">
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-foreground">{user?.displayName || 'User'}</Text>
                <Text className="text-sm text-muted">{user?.email}</Text>
              </View>
            </View>

            {/* User Details */}
            <View className="gap-4 border-t border-border pt-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Account Created</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {userData?.createdAt ? new Date(userData.createdAt.toDate?.()).toLocaleDateString() : 'N/A'}
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">User ID</Text>
                <Text className="text-xs font-mono text-foreground">{user?.uid?.slice(0, 8)}...</Text>
              </View>
            </View>
          </View>

          {/* Manage Subscription Section */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">Manage Subscription</Text>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                <Text className="text-xs font-bold" style={{ color: colors.primary }}>FREE</Text>
              </View>
            </View>

            {/* Current Plan Info */}
            <View className="bg-background border border-border rounded-2xl p-4 mb-4">
              <Text className="text-xs text-muted mb-2">Current Plan</Text>
              <Text className="text-2xl font-bold text-foreground">Free</Text>
              <Text className="text-xs text-muted mt-1">No cost • Limited features</Text>
            </View>

            {/* Billing Cycle Toggle */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-foreground mb-2">Billing Cycle</Text>
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => setBillingCycle('monthly')}
                  className="flex-1 p-2 rounded-lg items-center active:opacity-80"
                  style={{
                    backgroundColor: billingCycle === 'monthly' ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: billingCycle === 'monthly' ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className="font-semibold text-xs"
                    style={{ color: billingCycle === 'monthly' ? colors.background : colors.foreground }}
                  >
                    Monthly
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setBillingCycle('annual')}
                  className="flex-1 p-2 rounded-lg items-center active:opacity-80"
                  style={{
                    backgroundColor: billingCycle === 'annual' ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: billingCycle === 'annual' ? colors.primary : colors.border,
                  }}
                >
                  <View className="items-center">
                    <Text
                      className="font-semibold text-xs"
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
            </View>

            {/* Pro Plan */}
            <View
              className="rounded-2xl p-4 mb-3 border"
              style={{
                backgroundColor: colors.surface,
                borderColor: expandedPlan === 'pro' ? colors.primary : colors.border,
              }}
            >
              <Pressable
                onPress={() => setExpandedPlan(expandedPlan === 'pro' ? null : 'pro')}
                className="flex-row items-center justify-between active:opacity-80"
              >
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">Pro</Text>
                  <Text className="text-xs text-muted mt-1">Perfect for serious investors</Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                    SGD {billingCycle === 'monthly' ? '30' : '300'}
                  </Text>
                  <Text className="text-xs text-muted">{billingCycle === 'monthly' ? '/mo' : '/yr'}</Text>
                </View>
              </Pressable>

              {expandedPlan === 'pro' && (
                <View className="border-t border-border pt-3 mt-3 gap-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">Financial health breakdown</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">Diversification analysis</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">CPF retirement projections</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">50 AI chats/month</Text>
                  </View>
                  <Pressable
                    className="mt-2 p-2 rounded-lg items-center active:opacity-80"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="font-bold text-xs" style={{ color: colors.background }}>
                      Choose Pro
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Premium Plan */}
            <View
              className="rounded-2xl p-4 border-2"
              style={{
                backgroundColor: colors.surface,
                borderColor: expandedPlan === 'premium' ? colors.primary : colors.primary + '40',
              }}
            >
              <View className="absolute top-2 right-2 px-2 py-1 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                <Text className="text-xs font-bold" style={{ color: colors.primary }}>RECOMMENDED</Text>
              </View>

              <Pressable
                onPress={() => setExpandedPlan(expandedPlan === 'premium' ? null : 'premium')}
                className="flex-row items-center justify-between active:opacity-80"
              >
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">Premium</Text>
                  <Text className="text-xs text-muted mt-1">Everything + AI wealth coach</Text>
                </View>
                <View className="items-end">
                  <Text className="text-lg font-bold" style={{ color: colors.primary }}>
                    SGD {billingCycle === 'monthly' ? '50' : '400'}
                  </Text>
                  <Text className="text-xs text-muted">{billingCycle === 'monthly' ? '/mo' : '/yr'}</Text>
                </View>
              </Pressable>

              {expandedPlan === 'premium' && (
                <View className="border-t border-border pt-3 mt-3 gap-2">
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">All Pro features</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">AI wealth coach</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">Portfolio stress testing</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">Unlimited AI chats</Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="check-circle" size={14} color={colors.success} />
                    <Text className="text-xs text-muted">Global retirement planner</Text>
                  </View>
                  <Pressable
                    className="mt-2 p-2 rounded-lg items-center active:opacity-80"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="font-bold text-xs" style={{ color: colors.background }}>
                      Choose Premium
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            {/* Billing Info */}
            <View className="bg-background border border-border rounded-2xl p-3 mt-4 gap-2">
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

          {/* Wealth Data Summary */}
          <View className="bg-surface border border-border rounded-2xl p-6 mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">Wealth Data</Text>
            <View className="gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Bank Accounts</Text>
                <Text className="text-sm font-semibold text-foreground">{userData?.bankAccounts?.length || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Loans</Text>
                <Text className="text-sm font-semibold text-foreground">{userData?.loans?.length || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Investments</Text>
                <Text className="text-sm font-semibold text-foreground">{userData?.holdings?.length || 0}</Text>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Insurance Policies</Text>
                <Text className="text-sm font-semibold text-foreground">{userData?.insurancePolicies?.length || 0}</Text>
              </View>
            </View>
          </View>

          {/* Settings Section */}
          <View className="gap-3 mb-8">
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className="flex-row items-center justify-between border border-border rounded-lg px-4 py-3"
            >
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="lock" size={20} color={colors.muted} />
                <Text className="text-sm font-semibold text-foreground">Change Password</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              className="flex-row items-center justify-between border border-border rounded-lg px-4 py-3"
            >
              <View className="flex-row items-center gap-3">
                <MaterialIcons name="privacy-tip" size={20} color={colors.muted} />
                <Text className="text-sm font-semibold text-foreground">Privacy Settings</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {/* Sign Out Button */}
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              {
                backgroundColor: '#EF5350',
                opacity: pressed || loggingOut ? 0.8 : 1,
              },
            ]}
            className="p-3 rounded-lg items-center justify-center"
          >
            <Text className="font-bold text-sm text-white">
              {loggingOut ? 'Signing Out...' : 'Sign Out'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
