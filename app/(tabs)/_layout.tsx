import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppColors } from "@/hooks/use-app-colors";
import { HorizontalTabBar } from "@/components/HorizontalTabBar";
import { useState, useRef } from "react";
import React from "react";
import { usePathname } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

export default function TabLayout() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState("index");
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  // Update active tab based on current route within the (tabs) group
  React.useEffect(() => {
    const segments = pathname.split("/").filter(Boolean);

    // Expect paths like "/(tabs)" or "/(tabs)/banks"
    if (!segments[0] || !segments[0].startsWith("(tabs")) {
      return;
    }

    // "/(tabs)" or "/(tabs)/index" should highlight the dashboard tab
    if (segments.length === 1 || (segments.length === 2 && segments[1] === "index")) {
      setActiveTab("index");
      return;
    }

    // Otherwise, use the last segment as the tab name (e.g. "banks", "loans")
    const routeName = segments[segments.length - 1];
    setActiveTab(routeName);
  }, [pathname]);

  const tabs = [
    { name: "index", title: "Dashboard", icon: "house.fill" },
    { name: "banks", title: "Banks", icon: "building.columns.fill" },
    { name: "investments", title: "Investments", icon: "chart.pie.fill" },
    { name: "loans", title: "Loans", icon: "creditcard.fill" },
    { name: "insurance", title: "Insurance", icon: "shield.fill" },
    { name: "cpf", title: "CPF", icon: "building.2.fill" },
    { name: "private-assets", title: "Assets", icon: "diamond.fill" },
    { name: "profile", title: "Profile", icon: "person.fill" },
  ];

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);

    // Stay within the (tabs) group for all tab navigation
    if (tabName === "index") {
      // Default dashboard route for the tabs group
      router.push("/(tabs)" as any);
    } else {
      router.push(`/(tabs)/${tabName}` as any);
    }
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          display: 'none',
        },
      }}
      tabBar={(props) => (
        <HorizontalTabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      )}
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
      <Tabs.Screen
        name="cpf"
        options={{
          title: "CPF",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="building.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="private-assets"
        options={{
          title: "Assets",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="diamond.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
