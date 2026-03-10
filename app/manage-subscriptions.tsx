import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { ScrollView, Text, View, Pressable, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useAppColors } from '@/hooks/use-app-colors';
import { MaterialIcons } from '@expo/vector-icons';

type SubscriptionPlan = 'free' | 'pro-monthly' | 'pro-yearly' | 'premium-monthly' | 'premium-yearly';

interface PlanOption {
  id: SubscriptionPlan;
  name: string;
  price: string;
  period: string;
  yearlyPrice?: string;
  features: string[];
  isPopular?: boolean;
}

const plans: PlanOption[] = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Net worth tracking',
      'Manual assets',
      'Basic portfolio overview',
    ],
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    price: '$30',
    period: '/month',
    yearlyPrice: '$300/year',
    features: [
      'Financial health analysis',
      'CPF projections',
      'Risk insights',
      'Everything in Free',
    ],
  },
  {
    id: 'pro-yearly',
    name: 'Pro',
    price: '$300',
    period: '/year',
    features: [
      'Financial health analysis',
      'CPF projections',
      'Risk insights',
      'Everything in Free',
      'Save $60/year',
    ],
  },
  {
    id: 'premium-monthly',
    name: 'Premium',
    price: '$50',
    period: '/month',
    yearlyPrice: '$400/year',
    isPopular: true,
    features: [
      'AI wealth coach',
      'Stress testing',
      'Retirement simulations',
      'Everything in Pro',
    ],
  },
  {
    id: 'premium-yearly',
    name: 'Premium',
    price: '$400',
    period: '/year',
    isPopular: true,
    features: [
      'AI wealth coach',
      'Stress testing',
      'Retirement simulations',
      'Everything in Pro',
      'Save $200/year',
    ],
  },
];

export default function ManageSubscriptionsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ManageSubscriptionsContent />
    </>
  );
}

function ManageSubscriptionsContent() {
  const router = useRouter();
  const colors = useAppColors();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('free');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const plan = plans.find(p => p.id === selectedPlan);
      const planName = plan?.name || 'Plan';
      Alert.alert('Success', `You have subscribed to the ${planName} plan!`, [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/(tabs)/index' as any);
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

  // Filter plans based on billing cycle
  const displayedPlans = plans.filter(plan => {
    if (plan.id === 'free') return true;
    if (billingCycle === 'monthly') {
      return plan.id === 'pro-monthly' || plan.id === 'premium-monthly';
    } else {
      return plan.id === 'pro-yearly' || plan.id === 'premium-yearly';
    }
  });

  return (
    <ScreenContainer className="bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-6">
          {/* ===== HEADER ===== */}
          <View className="flex-row items-center justify-between mb-8">
            <Pressable onPress={() => router.replace('/(tabs)/index' as any)} className="active:opacity-60">
              <MaterialIcons name="arrow-back" size={28} color={colors.foreground} />
            </Pressable>
            <Text className="text-3xl font-bold text-foreground">Subscription</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* ===== BILLING CYCLE TOGGLE ===== */}
          <View className="flex-row gap-3 mb-8">
            <Pressable
              onPress={() => setBillingCycle('monthly')}
              className="flex-1 py-3 rounded-xl items-center active:opacity-80"
              style={{
                backgroundColor: billingCycle === 'monthly' ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="font-semibold text-base"
                style={{ color: billingCycle === 'monthly' ? colors.background : colors.foreground }}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setBillingCycle('yearly')}
              className="flex-1 py-3 rounded-xl items-center active:opacity-80"
              style={{
                backgroundColor: billingCycle === 'yearly' ? colors.primary : colors.surface,
              }}
            >
              <Text
                className="font-semibold text-base"
                style={{ color: billingCycle === 'yearly' ? colors.background : colors.foreground }}
              >
                Yearly
              </Text>
            </Pressable>
          </View>

          {/* ===== PLAN CARDS ===== */}
          {displayedPlans.map((plan) => (
            <Pressable
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              className="rounded-2xl p-6 mb-6 border-2 active:opacity-80"
              style={{
                borderColor: selectedPlan === plan.id ? colors.primary : colors.border,
                backgroundColor: selectedPlan === plan.id ? colors.surface : colors.background,
              }}
            >
              {/* Popular Badge */}
              {plan.isPopular && (
                <View className="mb-3">
                  <View
                    className="px-3 py-1 rounded-full w-fit"
                    style={{ backgroundColor: colors.primary }}
                  >
                    <Text className="text-white font-bold text-xs">RECOMMENDED</Text>
                  </View>
                </View>
              )}

              {/* Plan Header */}
              <View className="flex-row items-start justify-between mb-4">
                <View className="flex-1 pr-4">
                  <Text className="text-2xl font-bold text-foreground mb-2">{plan.name}</Text>
                  <View className="flex-row items-baseline gap-1 mb-1">
                    <Text className="text-3xl font-bold" style={{ color: colors.primary }}>
                      {plan.price}
                    </Text>
                    <Text className="text-sm text-muted">{plan.period}</Text>
                  </View>
                  {plan.yearlyPrice && billingCycle === 'monthly' && (
                    <Text className="text-xs text-muted">or {plan.yearlyPrice}</Text>
                  )}
                </View>

                {/* Radio Button */}
                <View
                  className="w-6 h-6 rounded-full border-2 items-center justify-center flex-shrink-0 mt-1"
                  style={{ borderColor: colors.primary }}
                >
                  {selectedPlan === plan.id && (
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: colors.primary }}
                    />
                  )}
                </View>
              </View>

              {/* Features List */}
              <View className="border-t" style={{ borderColor: colors.border }}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} className="flex-row items-center gap-3 py-2">
                    <MaterialIcons name="check-circle" size={18} color={colors.primary} />
                    <Text className="text-sm text-foreground flex-1">{feature}</Text>
                  </View>
                ))}
              </View>
            </Pressable>
          ))}

          {/* ===== SUBSCRIBE BUTTON ===== */}
          {selectedPlan !== 'free' && (
            <View className="mt-8 mb-8">
              <Pressable
                onPress={handleSubscribe}
                disabled={isSubscribing}
                className="py-4 px-8 rounded-full items-center justify-center active:opacity-80"
                style={{ backgroundColor: '#1a1a1a' }}
              >
                {isSubscribing ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-bold text-lg text-white">
                    Subscribe
                  </Text>
                )}
              </Pressable>

              {/* ===== CANCEL ANYTIME ===== */}
              <Pressable className="items-center mt-4 active:opacity-60">
                <Text className="text-base text-foreground">Cancel anytime</Text>
              </Pressable>
            </View>
          )}

          {/* ===== INFO TEXT ===== */}
          <View className="mt-6 p-4 rounded-xl" style={{ backgroundColor: colors.surface }}>
            <View className="flex-row gap-3 mb-3">
              <MaterialIcons name="info" size={20} color={colors.primary} />
              <Text className="flex-1 text-sm text-muted">
                Your subscription will renew automatically. You can cancel anytime from your account settings.
              </Text>
            </View>
            {billingCycle === 'yearly' && (
              <View className="flex-row gap-3">
                <MaterialIcons name="info" size={20} color={colors.primary} />
                <Text className="flex-1 text-sm text-muted">
                  Annual plans save you money compared to monthly billing.
                </Text>
              </View>
            )}
          </View>

          {/* ===== FOOTER LINKS ===== */}
          <View className="items-center mt-8">
            <Text className="text-sm text-muted">
              Terms of use • Privacy policy • Purchases
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
