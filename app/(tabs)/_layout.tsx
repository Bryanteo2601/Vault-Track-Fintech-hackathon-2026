import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppColors } from "@/hooks/use-app-colors";

export default function TabLayout() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: tabBarHeight,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="banks"
        options={{
          title: "Banks",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="building.columns.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="investments"
        options={{
          title: "Investments",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.pie.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="loans"
        options={{
          title: "Loans",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="insurance"
        options={{
          title: "Insurance",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="shield.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
