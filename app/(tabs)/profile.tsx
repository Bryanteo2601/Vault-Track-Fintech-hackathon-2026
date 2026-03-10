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
        <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 24 }}>
          {/* ===== HEADER ===== */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ fontSize: 32, fontWeight: 'bold', color: colors.foreground }}>Settings</Text>
          </View>

          {/* ===== USER PROFILE CARD ===== */}
          <Pressable
            onPress={() => setShowEditModal(true)}
            style={({ pressed }) => [
              {
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 16,
                padding: 20,
                marginBottom: 32,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.primary,
                  flexShrink: 0,
                }}
              >
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.background }}>
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, marginBottom: 4 }}>
                  {appData?.userProfile?.name || user?.displayName || 'User'}
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  {age ? `${age} years old` : 'Age not set'} • {stageName || 'Life stage not set'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.muted} />
          </Pressable>

          {/* ===== OTHER SETTINGS SECTION ===== */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, marginBottom: 16 }}>
            Other Settings
          </Text>

          {/* Profile Details */}
          <Pressable
            onPress={() => setShowEditModal(true)}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="person" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                Profile Details
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Password */}
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="lock" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                Password
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Notifications */}
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="notifications" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                Notifications
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Manage Subscriptions */}
          <Pressable
            onPress={() => router.push('/manage-subscriptions' as any)}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="card-membership" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                Manage Subscriptions
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Support */}
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="help" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                Support
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Report an Issue */}
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="bug-report" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                Report an Issue
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* About */}
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 8,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="info" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                About Wealth Wellness Hub
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* Language */}
          <Pressable
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 32,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="language" size={22} color={colors.primary} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                Language
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
          </Pressable>

          {/* ===== LOG OUT BUTTON ===== */}
          <Pressable
            onPress={handleLogout}
            disabled={loggingOut}
            style={({ pressed }) => [
              {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 32,
                backgroundColor: colors.surface,
                opacity: pressed && !loggingOut ? 0.8 : loggingOut ? 0.6 : 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
              <MaterialIcons name="logout" size={22} color="#EF5350" />
              <Text style={{ fontSize: 16, fontWeight: '500', color: '#EF5350' }}>
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
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={{ flex: 1, flexDirection: 'column' }}>
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 24,
                paddingVertical: 24,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Pressable
                onPress={() => setShowEditModal(false)}
                hitSlop={8}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              >
                <MaterialIcons name="arrow-back" size={28} color={colors.foreground} />
              </Pressable>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.foreground }}>
                Profile Details
              </Text>
              <View style={{ width: 28 }} />
            </View>

            {/* Form Content */}
            <View style={{ flex: 1, paddingHorizontal: 24, paddingVertical: 32 }}>
              {/* User Info Display */}
              <View
                style={{
                  marginBottom: 32,
                  padding: 20,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                }}
              >
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>
                  Email
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                  {appData?.userProfile?.email || user?.email || 'Not available'}
                </Text>
              </View>

              {/* Birth Date Input */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 8 }}>
                  Birth Date (YYYY-MM-DD)
                </Text>
                <TextInput
                  value={birthDateInput}
                  onChangeText={setBirthDateInput}
                  placeholder="e.g., 1990-01-15"
                  placeholderTextColor={colors.muted}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontSize: 16,
                    color: colors.foreground,
                    backgroundColor: colors.background,
                  }}
                />
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleSaveBirthDate}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    borderRadius: 8,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.background }}>
                  Save Changes
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
