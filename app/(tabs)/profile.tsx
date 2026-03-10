import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { MaterialIcons } from '@expo/vector-icons';
import { determineLifeStage, getLifeStageName, calculateAge } from '@/lib/life-stage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logOut } from '@/lib/firebase-auth';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { data: appData, updateUserProfile, refreshData, resetData } = useAppData();
  const [showEditModal, setShowEditModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; age: number } | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Load user profile from AsyncStorage
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await AsyncStorage.getItem('userProfile');
        if (profile) {
          const parsed = JSON.parse(profile);
          setUserProfile(parsed);
          setNameInput(parsed.name);
          setAgeInput(parsed.age.toString());
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Get life stage from userProfile if available
  const userLifeStage = appData?.userProfile?.lifeStage;
  const stageName = userLifeStage ? getLifeStageName(userLifeStage) : null;

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!ageInput.trim()) {
      Alert.alert('Error', 'Please enter your age');
      return;
    }

    const ageNum = parseInt(ageInput, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age (18-120)');
      return;
    }

    try {
      const updatedProfile = { name: nameInput.trim(), age: ageNum };
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);

      // Calculate birthDate from age and update AppData
      const today = new Date();
      const birthYear = today.getFullYear() - ageNum;
      const birthDate = new Date(birthYear, today.getMonth(), today.getDate());
      const birthDateString = birthDate.toISOString().split('T')[0];

      // Update the AppData userProfile with birthDate
      await updateUserProfile({
        birthDate: birthDateString,
        name: nameInput.trim(),
      });

      // Refresh data to ensure all dependent calculations update
      await refreshData();

      setShowEditModal(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (err) {
      const error = err as Error;
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  const handleResetApp = async () => {
    try {
      // Best-effort reset: sign out, clear onboarding profile, and reset app data
      await Promise.allSettled([
        (async () => { await logOut(); })(),
        (async () => { await AsyncStorage.removeItem('userProfile'); })(),
        (async () => { await resetData(); })(),
      ]);
      // Navigate to dashboard
      router.replace('/(tabs)' as any);
    } catch (error) {
      Alert.alert('Error', 'Failed to reset app');
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
                  {userProfile?.name?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.foreground, marginBottom: 4 }}>
                  {userProfile?.name || 'User'}
                </Text>
                <Text style={{ fontSize: 14, color: colors.muted }}>
                  {userProfile?.age ? `${userProfile.age} years old` : 'Age not set'} • {stageName || 'Life stage not set'}
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

          {/* Reset App */}
          <Pressable
            onPress={handleResetApp}
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
              <MaterialIcons name="refresh" size={22} color={colors.error} />
              <Text style={{ fontSize: 16, fontWeight: '500', color: colors.error }}>
                Reset App
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.muted} />
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
        <ScreenContainer className="bg-background/80">
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: 24,
                paddingVertical: 24,
                paddingBottom: 40,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.foreground }}>
                  Edit Profile
                </Text>
                <Pressable onPress={() => setShowEditModal(false)}>
                  <MaterialIcons name="close" size={24} color={colors.foreground} />
                </Pressable>
              </View>

              {/* Name Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                  Name
                </Text>
                <TextInput
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
                  placeholder="Enter your name"
                  placeholderTextColor={colors.muted}
                  value={nameInput}
                  onChangeText={setNameInput}
                />
              </View>

              {/* Age Input */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
                  Age
                </Text>
                <TextInput
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
                  placeholder="Enter your age"
                  placeholderTextColor={colors.muted}
                  value={ageInput}
                  onChangeText={setAgeInput}
                  keyboardType="number-pad"
                />
              </View>

              {/* Save Button */}
              <Pressable
                onPress={handleSaveProfile}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    paddingVertical: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.background }}>
                  Save Profile
                </Text>
              </Pressable>
            </View>
          </View>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
