import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { MaterialIcons } from '@expo/vector-icons';

type SubscriptionPlan = 'yearly' | 'weekly';

export default function ManageSubscriptionsScreen() {
  const router = useRouter();
  const colors = useAppColors();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('yearly');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      // Simulate subscription processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const planName = selectedPlan === 'yearly' ? 'Yearly ($39.99/year)' : 'Weekly ($6.99/week)';
      Alert.alert('Success', `You have subscribed to the ${planName} plan!`, [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (err) {
      const error = err as Error;
      Alert.alert('Error', error.message || 'Failed to subscribe');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-6">
          {/* ===== HEADER ===== */}
          <View className="flex-row items-center justify-between mb-8">
            <Pressable onPress={() => router.back()} className="active:opacity-60">
              <MaterialIcons name="arrow-back" size={28} color={colors.foreground} />
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Manage Subscription</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* ===== SELECT YOUR PLAN ===== */}
          <Text className="text-2xl font-bold text-foreground mb-6">Select your plan</Text>

          {/* ===== YEARLY PLAN ===== */}
          <Pressable
            onPress={() => setSelectedPlan('yearly')}
            className="rounded-2xl p-5 mb-4 border-2 active:opacity-80"
            style={{
              borderColor: selectedPlan === 'yearly' ? colors.primary : colors.border,
              backgroundColor: selectedPlan === 'yearly' ? colors.surface : colors.background,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-4 flex-1">
                <View
                  className="w-6 h-6 rounded-full border-2 items-center justify-center"
                  style={{ borderColor: colors.primary }}
                >
                  {selectedPlan === 'yearly' && (
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                  )}
                </View>
                <Text className="text-xl font-bold text-foreground">Yearly</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                  $0.77
                </Text>
                <Text className="text-sm text-muted">/week</Text>
              </View>
            </View>
            <Text className="text-sm text-muted">just $39.99 year</Text>

            {/* Save Badge */}
            {selectedPlan === 'yearly' && (
              <View className="absolute top-0 left-6 transform -translate-y-1/2">
                <View
                  className="px-4 py-2 rounded-full"
                  style={{ backgroundColor: '#000' }}
                >
                  <Text className="text-white font-bold text-sm">Save 90%</Text>
                </View>
              </View>
            )}
          </Pressable>

          {/* ===== WEEKLY PLAN ===== */}
          <Pressable
            onPress={() => setSelectedPlan('weekly')}
            className="rounded-2xl p-5 mb-8 border-2 active:opacity-80"
            style={{
              borderColor: selectedPlan === 'weekly' ? colors.primary : colors.border,
              backgroundColor: selectedPlan === 'weekly' ? colors.surface : colors.background,
            }}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-4 flex-1">
                <View
                  className="w-6 h-6 rounded-full border-2 items-center justify-center"
                  style={{ borderColor: colors.primary }}
                >
                  {selectedPlan === 'weekly' && (
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                  )}
                </View>
                <Text className="text-xl font-bold text-foreground">Weekly</Text>
              </View>
              <View className="items-end">
                <Text className="text-2xl font-bold" style={{ color: colors.primary }}>
                  $6.99
                </Text>
                <Text className="text-sm text-muted">/week</Text>
              </View>
            </View>
          </Pressable>

          {/* ===== SUBSCRIBE BUTTON ===== */}
          <Pressable
            onPress={handleSubscribe}
            disabled={isSubscribing}
            className="p-4 rounded-full items-center justify-center mb-4 active:opacity-80"
            style={{ backgroundColor: '#000' }}
          >
            {isSubscribing ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="font-bold text-lg" style={{ color: '#fff' }}>
                Subscribe
              </Text>
            )}
          </Pressable>

          {/* ===== CANCEL ANYTIME ===== */}
          <Pressable className="items-center mb-6 active:opacity-60">
            <Text className="text-base font-medium text-foreground">Cancel anytime</Text>
          </Pressable>

          {/* ===== FOOTER LINKS ===== */}
          <View className="items-center">
            <Text className="text-sm text-muted">
              Terms of use • Privacy policy • Purchases
            </Text>
          </View>

          {/* ===== INFO TEXT ===== */}
          <View className="mt-8 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row gap-3 mb-3">
              <MaterialIcons name="info" size={20} color={colors.primary} />
              <Text className="flex-1 text-sm text-muted">
                Your subscription will renew automatically. You can cancel anytime from your account settings.
              </Text>
            </View>
            <View className="flex-row gap-3">
              <MaterialIcons name="info" size={20} color={colors.primary} />
              <Text className="flex-1 text-sm text-muted">
                Annual plans save you 90% compared to weekly billing.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
