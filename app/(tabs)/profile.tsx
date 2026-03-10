import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { useAppData } from '@/lib/app-data-context';
import { MaterialIcons } from '@expo/vector-icons';
import { determineLifeStage, getLifeStageName } from '@/lib/life-stage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logOut } from '@/lib/firebase-auth';

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const { data: appData, updateUserProfile, resetData, refreshData } = useAppData();
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
      // Calculate birthDate from age
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - ageNum, today.getMonth(), today.getDate());
      const birthDateStr = birthDate.toISOString().split('T')[0];
      
      const updatedProfile = { name: nameInput.trim(), age: ageNum, birthDate: birthDateStr };
      await AsyncStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      
      // Also update the app data context so dashboard reflects the change immediately
      await updateUserProfile({ name: nameInput.trim(), birthDate: birthDateStr });
      
      // Force refresh to ensure all dependent calculations update
      await refreshData();
      
      setUserProfile(updatedProfile);
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
      // Navigate back to the landing page ("Grow your wealth today")
      router.replace('/landing' as any);
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
        <View className="p-6 gap-6">
          {/* Profile Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Profile</Text>
            <Text className="text-sm text-muted">Manage your personal information</Text>
          </View>

          {/* Profile Info Card */}
          {userProfile && (
            <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted uppercase">Name</Text>
                <Text className="text-lg font-semibold text-foreground">{userProfile.name}</Text>
              </View>
              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted uppercase">Age</Text>
                <Text className="text-lg font-semibold text-foreground">{userProfile.age} years old</Text>
              </View>
              <Pressable
                onPress={() => setShowEditModal(true)}
                className="bg-primary rounded-lg p-3 mt-2 active:opacity-80"
              >
                <Text className="text-center font-semibold text-background">Edit Profile</Text>
              </Pressable>
            </View>
          )}

          {/* Life Stage Info */}
          {stageName && (
            <View className="bg-surface rounded-2xl p-6 border border-border gap-2">
              <Text className="text-xs font-semibold text-muted uppercase">Life Stage</Text>
              <Text className="text-lg font-semibold text-foreground">{stageName}</Text>
            </View>
          )}

          {/* Reset App Button */}
          <Pressable
            onPress={() => {
              Alert.alert(
                'Reset App',
                'This will clear all data and sign you out. Continue?',
                [
                  { text: 'Cancel', onPress: () => {} },
                  { text: 'Reset', onPress: handleResetApp, style: 'destructive' },
                ]
              );
            }}
            className="bg-error/10 rounded-lg p-4 active:opacity-80"
          >
            <Text className="text-center font-semibold text-error">Reset App Data</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-bold text-foreground">Edit Profile</Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <MaterialIcons name="close" size={24} color={colors.foreground} />
              </Pressable>
            </View>

            <View className="gap-4">
              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Name</Text>
                <TextInput
                  value={nameInput}
                  onChangeText={setNameInput}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-lg p-3 text-foreground"
                />
              </View>

              <View className="gap-2">
                <Text className="text-sm font-semibold text-foreground">Age</Text>
                <TextInput
                  value={ageInput}
                  onChangeText={setAgeInput}
                  placeholder="Enter your age"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  className="bg-surface border border-border rounded-lg p-3 text-foreground"
                />
              </View>

              <Pressable
                onPress={handleSaveProfile}
                className="bg-primary rounded-lg p-4 mt-4 active:opacity-80"
              >
                <Text className="text-center font-semibold text-background text-base">Save Profile</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
