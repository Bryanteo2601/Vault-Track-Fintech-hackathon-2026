import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Animated, Dimensions, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabItem {
  name: string;
  title: string;
  icon: string;
}

interface ArcTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabName: string) => void;
}

export function ArcTabBar({ tabs, activeTab, onTabChange }: ArcTabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const bottomPadding = Math.max(insets.bottom, 8);
  const barHeight = 100 + bottomPadding;
  
  // Arc configuration
  const arcRadius = 120; // Radius of the arc
  const arcStartAngle = 180; // Start angle in degrees (180 = left)
  const arcEndAngle = 360; // End angle in degrees (360 = right)
  const arcCenter = { x: screenWidth / 2, y: barHeight - 20 };

  // Calculate tab positions on the arc
  const getTabPosition = (index: number) => {
    const totalTabs = tabs.length;
    const angleRange = arcEndAngle - arcStartAngle;
    const anglePerTab = angleRange / (totalTabs - 1);
    const angle = arcStartAngle + anglePerTab * index;
    
    // Convert angle to radians
    const radians = (angle * Math.PI) / 180;
    
    // Calculate position on arc
    const x = arcCenter.x + arcRadius * Math.cos(radians);
    const y = arcCenter.y - arcRadius * Math.sin(radians);
    
    return { x, y, angle };
  };

  return (
    <View
      style={{
        height: barHeight,
        backgroundColor: colors.surface,
        borderTopColor: colors.border,
        borderTopWidth: 0.5,
        overflow: 'visible',
        position: 'relative',
      }}
    >
      {/* Arc background (optional visual guide) */}
      <View
        style={{
          position: 'absolute',
          width: arcRadius * 2,
          height: arcRadius,
          bottom: 0,
          left: screenWidth / 2 - arcRadius,
          borderTopLeftRadius: arcRadius,
          borderTopRightRadius: arcRadius,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          borderLeftColor: colors.border,
          borderLeftWidth: 0.5,
          borderRightColor: colors.border,
          borderRightWidth: 0.5,
          opacity: 0.1,
        }}
      />

      {/* Tabs positioned on arc */}
      {tabs.map((tab, index) => {
        const isActive = tab.name === activeTab;
        const position = getTabPosition(index);
        const tabColor = isActive ? colors.primary : colors.muted;
        
        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabChange(tab.name)}
            style={{
              position: 'absolute',
              left: position.x - 25,
              top: position.y - 25,
              width: 50,
              height: 50,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 25,
              backgroundColor: isActive ? `${colors.primary}20` : 'transparent',
              borderColor: tabColor,
              borderWidth: isActive ? 2 : 1,
              opacity: isActive ? 1 : 0.7,
            }}
          >
            <View style={{ alignItems: 'center', gap: 2 }}>
              <IconSymbol
                size={24}
                name={tab.icon as any}
                color={tabColor}
              />
              <Text 
                style={{ 
                  fontSize: 8, 
                  fontWeight: '600', 
                  color: tabColor,
                  textAlign: 'center',
                  maxWidth: 45,
                }}
                numberOfLines={1}
              >
                {tab.title}
              </Text>
            </View>

            {/* Active indicator dot */}
            {isActive && (
              <View
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  top: -4,
                  right: -4,
                }}
              />
            )}
          </Pressable>
        );
      })}

      {/* Center indicator */}
      <View
        style={{
          position: 'absolute',
          width: 12,
          height: 12,
          borderRadius: 6,
          backgroundColor: colors.primary,
          left: screenWidth / 2 - 6,
          bottom: 8,
          zIndex: 10,
        }}
      />
    </View>
  );
}

export default ArcTabBar;
