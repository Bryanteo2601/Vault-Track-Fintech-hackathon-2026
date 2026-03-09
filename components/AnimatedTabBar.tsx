import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Dimensions, Text, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabItem {
  name: string;
  title: string;
  icon: string;
}

interface AnimatedTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export function AnimatedTabBar({ tabs, activeTab, onTabChange }: AnimatedTabBarProps) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = 70; // Fixed width for each tab
  const visibleTabs = 4; // Show ~4 tabs at a time
  const bottomPadding = Math.max(insets.bottom, 8);
  const tabBarHeight = 70 + bottomPadding;

  // Auto-scroll to active tab
  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.name === activeTab);
    if (activeIndex !== -1) {
      const scrollX = Math.max(0, activeIndex * tabWidth - (screenWidth / 2 - tabWidth / 2));
      scrollViewRef.current?.scrollTo({ x: scrollX, animated: true });
    }
  }, [activeTab, tabs, tabWidth, screenWidth]);

  // Handle scroll and auto-navigate to nearest tab
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    
    // Calculate which tab is closest to center
    const centerX = scrollX + screenWidth / 2;
    const closestTabIndex = Math.round(centerX / tabWidth);
    const closestTab = tabs[closestTabIndex];

    if (closestTab && closestTab.name !== activeTab) {
      // Auto-navigate to the tab in view
      onTabChange(closestTab.name);
    }
  };

  const handleTabPress = (tabName: string) => {
    onTabChange(tabName);
  };

  return (
    <View
      style={{
        height: tabBarHeight,
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 0.5,
        paddingTop: 8,
        paddingBottom: bottomPadding,
        overflow: 'hidden',
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        snapToInterval={tabWidth}
        snapToAlignment="center"
        decelerationRate="fast"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: screenWidth / 2 - tabWidth / 2,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.name === activeTab;
          const tabColor = isActive ? colors.accent : colors.muted;

          return (
            <Pressable
              key={tab.name}
              onPress={() => handleTabPress(tab.name)}
              style={{
                width: tabWidth,
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: isActive ? 1 : 0.6,
              }}
            >
              <View style={{ alignItems: 'center', gap: 4 }}>
                <IconSymbol
                  size={26}
                  name={tab.icon as any}
                  color={tabColor}
                />
                <Text 
                  style={{ 
                    fontSize: 9, 
                    fontWeight: '600', 
                    color: tabColor,
                    textAlign: 'center',
                    maxWidth: tabWidth - 4,
                  }}
                  numberOfLines={1}
                >
                  {tab.title}
                </Text>
              </View>

              {/* Active indicator */}
              {isActive && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    width: '70%',
                    height: 2,
                    backgroundColor: colors.accent,
                    borderRadius: 1,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default AnimatedTabBar;
