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
