import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAppColors } from '@/hooks/use-app-colors';
import { IconSymbol } from './ui/icon-symbol';

interface NavItem {
  name: string;
  route: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', route: '/(tabs)', icon: 'chart.bar.fill' },
  { name: 'Portfolio', route: '/(tabs)/investments', icon: 'briefcase.fill' },
  { name: 'Banks', route: '/(tabs)/banks', icon: 'building.2.fill' },
  { name: 'Loans', route: '/(tabs)/loans', icon: 'creditcard.fill' },
  { name: 'Insurance', route: '/(tabs)/insurance', icon: 'shield.fill' },
  { name: 'Profile', route: '/(tabs)/profile', icon: 'person.fill' },
];

export function SidebarNav() {
  const router = useRouter();
  const pathname = usePathname();
  const colors = useAppColors();

  const isActive = (route: string) => {
    return pathname.includes(route.replace('/(tabs)', '').replace('/(tabs)/', ''));
  };

  return (
    <View className="w-56 bg-background border-r border-border flex flex-col h-full">
      {/* Logo / Header */}
      <View className="px-6 py-6 border-b border-border">
        <Text className="text-lg font-bold text-foreground">Wealth Hub</Text>
        <Text className="text-xs text-muted mt-1">Financial Dashboard</Text>
      </View>

      {/* Navigation Items */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-3 py-4 gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.route);
            return (
              <Pressable
                key={item.route}
                onPress={() => router.push(item.route as any)}
                style={({ pressed }) => ({
                  backgroundColor: active
                    ? '#2F6FED15'
                    : pressed
                      ? '#252525'
                      : 'transparent',
                })}
                className="flex-row items-center gap-3 px-4 py-3 rounded-md transition-colors"
              >
                <IconSymbol
                  name={item.icon as any}
                  size={18}
                  color={active ? '#2F6FED' : '#A0A0A0'}
                />
                <Text
                  className={`text-sm font-medium ${
                    active ? 'text-primary' : 'text-muted'
                  }`}
                >
                  {item.name}
                </Text>
                {active && (
                  <View
                    className="ml-auto w-1 h-1 rounded-full"
                    style={{ backgroundColor: '#2F6FED' }}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="px-6 py-4 border-t border-border">
        <Text className="text-xs text-muted text-center">
          v1.0.0
        </Text>
      </View>
    </View>
  );
}
