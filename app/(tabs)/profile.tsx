import { ScrollView, Text, View, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useFirebaseAuth } from '@/lib/firebase-auth-context';
import { logOut } from '@/lib/firebase-auth';
import { useAppColors } from '@/hooks/use-app-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { user, userData, loading } = useFirebaseAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleViewPlans = () => {
    setShowUpgradeModal(true);
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

  // Upgrade Modal Component
  const UpgradeModal = () => {
    if (!showUpgradeModal) return null;

    return (
      <View
        className="absolute inset-0 bg-black/50 flex items-end"
        style={{ zIndex: 1000 }}
      >
        <View
          className="w-full bg-surface rounded-t-3xl p-6 gap-4"
          style={{ maxHeight: '80%' }}
        >
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-bold text-foreground">Upgrade Your Plan</Text>
            <Pressable onPress={() => setShowUpgradeModal(false)}>
              <Text className="text-2xl text-muted">×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Pro Plan */}
            <View className="bg-background rounded-2xl p-4 mb-3 border border-border">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-bold text-foreground">Pro</Text>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>SGD 30/mo</Text>
              </View>
              <Text className="text-xs text-muted mb-3">Perfect for serious investors</Text>
              <View className="gap-2">
                <Text className="text-xs text-muted">✓ Financial health breakdown</Text>
                <Text className="text-xs text-muted">✓ Diversification analysis</Text>
                <Text className="text-xs text-muted">✓ CPF retirement projections</Text>
                <Text className="text-xs text-muted">✓ 50 AI chats/month</Text>
              </View>
              <Pressable
                className="mt-3 p-2 rounded-lg items-center active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-bold text-sm" style={{ color: colors.background }}>Choose Pro</Text>
              </Pressable>
            </View>

            {/* Premium Plan */}
            <View className="bg-background rounded-2xl p-4 border" style={{ borderColor: colors.primary, borderWidth: 2 }}>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-bold text-foreground">Premium</Text>
                <Text className="text-sm font-semibold" style={{ color: colors.primary }}>SGD 50/mo</Text>
              </View>
              <Text className="text-xs text-muted mb-3">Everything + AI wealth coach</Text>
              <View className="gap-2">
                <Text className="text-xs text-muted">✓ All Pro features</Text>
                <Text className="text-xs text-muted">✓ AI wealth coach</Text>
                <Text className="text-xs text-muted">✓ Portfolio stress testing</Text>
                <Text className="text-xs text-muted">✓ Unlimited AI chats</Text>
                <Text className="text-xs text-muted">✓ Global retirement planner</Text>
              </View>
              <Pressable
                className="mt-3 p-2 rounded-lg items-center active:opacity-80"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-bold text-sm" style={{ color: colors.background }}>Choose Premium</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-8">
          <UpgradeModal />
          {/* Header */}
          <View className="mb-8">
            <Text className="text-4xl font-bold text-foreground mb-2">Profile</Text>
            <Text className="text-base text-muted">Manage your account</Text>
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

          {/* Subscription Card */}
          <View className="bg-surface border border-border rounded-2xl p-6 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-foreground">Subscription</Text>
              <View className="px-3 py-1 rounded-full" style={{ backgroundColor: colors.primary + '20' }}>
                <Text className="text-xs font-bold" style={{ color: colors.primary }}>
                  FREE
                </Text>
              </View>
            </View>
            <Text className="text-sm text-muted mb-4">Unlock AI analytics, advanced planning, and premium insights</Text>
            <View className="gap-2">
              <Pressable
                onPress={handleViewPlans}
                className="p-3 rounded-lg items-center justify-center active:opacity-80 flex-row gap-2"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="font-bold" style={{ fontSize: 14, color: colors.background }}>
                  Upgrade Now
                </Text>
              </Pressable>
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
                <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                <Text className="text-base font-semibold text-foreground">Change Password</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
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
                <IconSymbol name="paperplane.fill" size={20} color={colors.primary} />
                <Text className="text-base font-semibold text-foreground">Privacy Settings</Text>
              </View>
              <IconSymbol name="chevron.right" size={20} color={colors.muted} />
            </Pressable>
          </View>

          {/* Sign Out Button */}
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              {
                backgroundColor: colors.error,
                opacity: pressed && !loggingOut ? 0.9 : 1,
              },
            ]}
            className="rounded-lg py-4 flex-row items-center justify-center gap-2"
          >
            {loggingOut ? (
              <ActivityIndicator color={colors.background} size="small" />
            ) : (
              <Text className="text-background font-semibold text-base">Sign Out</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
