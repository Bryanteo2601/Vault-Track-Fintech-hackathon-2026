import React, { useRef, useEffect } from 'react';
import { View, Pressable, ScrollView, Text, Dimensions } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabItem {
  name: string;
  title: string;
  icon: string;
}

interface HorizontalTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export function HorizontalTabBar({ tabs, activeTab, onTabChange }: HorizontalTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const bottomPadding = Math.max(insets.bottom, 8);
  const barHeight = 70 + bottomPadding;
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto-scroll to active tab
  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.name === activeTab);
    if (activeIndex >= 0) {
      const tabWidth = 90;
      const scrollPosition = activeIndex * tabWidth - screenWidth / 2 + tabWidth / 2;
      scrollViewRef.current?.scrollTo({
        x: Math.max(0, scrollPosition),
        animated: true,
      });
    }
  }, [activeTab, tabs, screenWidth]);

  return (
    <View
      style={{
        height: barHeight,
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 0.5,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingVertical: 8,
        }}
      >
        {tabs.map((tab) => {
          const isActive = tab.name === activeTab;
          const tabColor = isActive ? colors.primary : colors.muted;

          return (
            <Pressable
              key={tab.name}
              onPress={() => onTabChange(tab.name)}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginHorizontal: 4,
                borderBottomWidth: isActive ? 2 : 0,
                borderBottomColor: isActive ? colors.primary : 'transparent',
                minWidth: 70,
              }}
            >
              <IconSymbol
                size={24}
                name={tab.icon as any}
                color={tabColor}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? '600' : '500',
                  color: tabColor,
                  marginTop: 4,
                  textAlign: 'center',
                }}
                numberOfLines={1}
              >
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

export default HorizontalTabBar;
