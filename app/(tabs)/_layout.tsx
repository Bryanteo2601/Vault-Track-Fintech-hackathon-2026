import { Tabs, useNavigation, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAppColors } from "@/hooks/use-app-colors";
import { TabsLayoutWrapper } from "@/components/TabsLayoutWrapper";
import { useState } from "react";
import React from "react";

export default function TabLayout() {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('index');
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  // Update active tab based on current route
  React.useEffect(() => {
    const routeName = pathname.split('/').pop() || 'index';
    setActiveTab(routeName);
  }, [pathname]);

  const tabs = [
    { name: 'index', title: 'Home', icon: 'house.fill' },
    { name: 'banks', title: 'Banks', icon: 'building.columns.fill' },
    { name: 'investments', title: 'Investments', icon: 'chart.pie.fill' },
    { name: 'loans', title: 'Loans', icon: 'creditcard.fill' },
    { name: 'insurance', title: 'Insurance', icon: 'shield.fill' },
    { name: 'cpf', title: 'CPF', icon: 'building.2.fill' },
    { name: 'private-assets', title: 'Assets', icon: 'diamond.fill' },
    { name: 'profile', title: 'Profile', icon: 'person.fill' },
  ];

  const handleTabChange = (tabName: string) => {
    setActiveTab(tabName);
    (navigation as any).navigate(tabName);
  };

  return (
    <TabsLayoutWrapper tabs={tabs}>
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
      >
      <Tabs.Screen
        name="index"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            setActiveTab('index');
          },
        })}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="banks"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            setActiveTab('banks');
          },
        })}
        options={{
          title: "Banks",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="building.columns.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="investments"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            setActiveTab('investments');
          },
        })}
        options={{
          title: "Investments",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="chart.pie.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="loans"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            setActiveTab('loans');
          },
        })}
        options={{
          title: "Loans",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="insurance"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            setActiveTab('insurance');
          },
        })}
        options={{
          title: "Insurance",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="shield.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cpf"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            setActiveTab('cpf');
          },
        })}
        options={{
          title: "CPF",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="building.2.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="private-assets"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            setActiveTab('private-assets');
          },
        })}
        options={{
          title: "Assets",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="diamond.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            setActiveTab('profile');
          },
        })}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={26} name="paperplane.fill" color={color} />,
        }}
      />
      </Tabs>
    </TabsLayoutWrapper>
  );
}
