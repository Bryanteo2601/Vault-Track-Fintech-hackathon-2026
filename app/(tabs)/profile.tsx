import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator, Modal, TextInput, Switch } from 'react-native';
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
        <View className="flex-1 px-6 py-6">
          {/* ===== HEADER ===== */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-foreground">Settings</Text>
          </View>

          {/* ===== USER PROFILE CARD ===== */}
          <Pressable
            onPress={() => setShowEditModal(true)}
            className="rounded-2xl p-5 mb-8 flex-row items-center justify-between active:opacity-80"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <View
                className="w-16 h-16 rounded-full items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.primary }}
              >
                <Text className="text-3xl font-bold" style={{ color: colors.background }}>
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-lg font-bold text-foreground mb-1">
                  {user?.displayName || 'User'}
                </Text>
                <Text className="text-sm text-muted">
                  {age ? `${age} years old` : 'Age not set'} • {stageName || 'Life stage not set'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
          </Pressable>

          {/* ===== OTHER SETTINGS SECTION ===== */}
          <Text className="text-lg font-bold text-foreground mb-4">Other Settings</Text>

          {/* Profile Details */}
          <Pressable
            onPress={() => setShowEditModal(true)}
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-2 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="person" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-foreground">Profile Details</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Password */}
          <Pressable
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-2 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="lock" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-foreground">Password</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Notifications */}
          <Pressable
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-2 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="notifications" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-foreground">Notifications</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Manage Subscriptions */}
          <Pressable
            onPress={() => router.push('/(tabs)/manage-subscriptions' as any)}
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-2 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="card-membership" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-foreground">Manage Subscriptions</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Support */}
          <Pressable
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-2 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="help" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-foreground">Support</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Report an Issue */}
          <Pressable
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-2 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="bug-report" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-foreground">Report an Issue</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* About */}
          <Pressable
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-2 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="info" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-foreground">About Wealth Wellness Hub</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Language */}
          <Pressable
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-8 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="language" size={22} color={colors.primary} />
              <Text className="text-base font-medium text-foreground">Language</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* ===== LOG OUT BUTTON ===== */}
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            className="flex-row items-center justify-between px-5 py-4 rounded-xl mb-8 active:opacity-80"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="flex-row items-center gap-4 flex-1">
              <MaterialIcons name="logout" size={22} color="#EF5350" />
              <Text className="text-base font-medium" style={{ color: '#EF5350' }}>
                {loggingOut ? 'Signing Out...' : 'Log out'}
              </Text>
            </View>
            {!loggingOut && <MaterialIcons name="chevron-right" size={22} color={colors.muted} />}
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
              <Pressable onPress={() => setShowEditModal(false)} className="active:opacity-60">
                <MaterialIcons name="arrow-back" size={28} color={colors.foreground} />
              </Pressable>
              <Text className="text-2xl font-bold text-foreground">Profile Details</Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Form Content */}
            <View className="flex-1 px-6 py-8">
              {/* User Info Display */}
              <View className="mb-8 p-5 rounded-xl" style={{ backgroundColor: colors.surface }}>
                <Text className="text-sm font-semibold text-muted mb-2">Name</Text>
                <Text className="text-lg font-bold text-foreground mb-6">{user?.displayName || 'User'}</Text>
                
                <Text className="text-sm font-semibold text-muted mb-2">Email</Text>
                <Text className="text-base text-foreground mb-6">{user?.email}</Text>

                {age !== null && (
                  <>
                    <Text className="text-sm font-semibold text-muted mb-2">Age</Text>
                    <Text className="text-base text-foreground mb-6">{age} years old</Text>
                  </>
                )}

                {stageName && (
                  <>
                    <Text className="text-sm font-semibold text-muted mb-2">Life Stage</Text>
                    <Text className="text-base text-foreground">{stageName}</Text>
                  </>
                )}
              </View>

              {/* Birth Date Input */}
              <Text className="text-sm font-semibold text-muted mb-3">Birth Date</Text>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  padding: 12,
                  color: colors.foreground,
                  fontSize: 16,
                  backgroundColor: colors.surface,
                  marginBottom: 20,
                }}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                value={birthDateInput}
                onChangeText={setBirthDateInput}
              />
              <Text className="text-xs text-muted mb-8">Format: YYYY-MM-DD (e.g., 1993-12-15)</Text>

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowEditModal(false)}
                  className="flex-1 p-4 rounded-xl items-center active:opacity-80"
                  style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                >
                  <Text className="font-semibold text-base text-foreground">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveBirthDate}
                  className="flex-1 p-4 rounded-xl items-center active:opacity-80"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Text className="font-semibold text-base" style={{ color: colors.background }}>
                    Save
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
