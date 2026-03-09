import React, { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { ArcTabBar } from './ArcTabBar';
import { useColors } from '@/hooks/use-colors';

interface TabItem {
  name: string;
  title: string;
  icon: string;
}

interface TabsLayoutWrapperProps {
  children: React.ReactNode;
  tabs: TabItem[];
}

export function TabsLayoutWrapper({ children, tabs }: TabsLayoutWrapperProps) {
  const colors = useColors();
  const pathname = usePathname();
  const router = useRouter();
  const { height: screenHeight } = useWindowDimensions();

  // Extract active tab from pathname
  const activeTab = pathname.split('/').pop() || 'index';

  const handleTabChange = (tabName: string) => {
    router.push(tabName as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Main content */}
      <View style={{ flex: 1 }}>
        {children}
      </View>

      {/* Arc Tab Bar at bottom */}
      <ArcTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </View>
  );
}

export default TabsLayoutWrapper;
