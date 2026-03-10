import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-data-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { PrivateAsset } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function PrivateAssetDetailScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data, deletePrivateAsset } = useAppData();
  const [isDeleting, setIsDeleting] = useState(false);

  const asset = useMemo(() => {
    return data.privateAssets.find(a => a.id === id);
  }, [data.privateAssets, id]);

  if (!asset) {
    return (
      <ScreenContainer className="p-4 justify-center items-center">
        <Text className="text-foreground text-lg font-semibold">Asset not found</Text>
      </ScreenContainer>
    );
  }

  const unrealisedPnL = asset.currentEstimatedValue - asset.purchasePrice;
  const percentReturn = asset.purchasePrice > 0 
    ? ((unrealisedPnL) / asset.purchasePrice) * 100 
    : 0;

  const handleDelete = () => {
    Alert.alert(
      'Delete Asset',
      `Are you sure you want to delete "${asset.assetName}"?`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Delete',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deletePrivateAsset(asset.id);
              // Go back to the previous screen (usually the Private Assets list)
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete asset');
            } finally {
              setIsDeleting(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: '/private-asset-form',
      params: { id: asset.id },
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Pressable onPress={() => router.back()} className="mb-4">
            <Text className="text-accent text-base font-semibold">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground mb-1">{asset.assetName}</Text>
          {asset.assetType && (
            <Text className="text-muted text-base">{asset.assetType}</Text>
          )}
        </View>

        {/* Key Metrics */}
        <View style={[styles.card, { backgroundColor: colors.surface }]} className="mb-4 p-4 rounded-lg">
          <View className="mb-4">
            <Text className="text-muted text-sm mb-1">Current Estimated Value</Text>
            <Text className="text-2xl font-bold text-foreground">
              {formatCurrency(asset.currentEstimatedValue, asset.currency)}
            </Text>
          </View>

          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-muted text-sm mb-1">Purchase Price</Text>
              <Text className="text-lg font-semibold text-foreground">
                {formatCurrency(asset.purchasePrice, asset.currency)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-muted text-sm mb-1">Unrealised P&L</Text>
              <Text className={`text-lg font-semibold ${unrealisedPnL >= 0 ? 'text-success' : 'text-error'}`}>
                {unrealisedPnL >= 0 ? '+' : ''}{formatCurrency(unrealisedPnL, asset.currency)}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-muted text-sm mb-1">Return %</Text>
              <Text className={`text-lg font-semibold ${percentReturn >= 0 ? 'text-success' : 'text-error'}`}>
                {percentReturn >= 0 ? '+' : ''}{percentReturn.toFixed(2)}%
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-muted text-sm mb-1">Confidence</Text>
              <Text className="text-lg font-semibold text-foreground capitalize">
                {asset.confidenceLevel}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.card, { backgroundColor: colors.surface }]} className="mb-4 p-4 rounded-lg">
          <Text className="text-lg font-bold text-foreground mb-4">Details</Text>

          {asset.description && (
            <View className="mb-4">
              <Text className="text-muted text-sm mb-1">Description</Text>
              <Text className="text-foreground">{asset.description}</Text>
            </View>
          )}

          <View className="mb-4">
            <Text className="text-muted text-sm mb-1">Purchase Date</Text>
            <Text className="text-foreground">{asset.purchaseDate}</Text>
          </View>

          {asset.quantity && (
            <View className="mb-4">
              <Text className="text-muted text-sm mb-1">Quantity</Text>
              <Text className="text-foreground">{asset.quantity}</Text>
            </View>
          )}

          {asset.valuationNotes && (
            <View className="mb-4">
              <Text className="text-muted text-sm mb-1">Valuation Notes</Text>
              <Text className="text-foreground">{asset.valuationNotes}</Text>
            </View>
          )}

          {asset.valuationSource && (
            <View>
              <Text className="text-muted text-sm mb-1">Valuation Source</Text>
              <Text className="text-foreground">{asset.valuationSource}</Text>
            </View>
          )}
        </View>

        {/* Historical Valuations */}
        {asset.historicalValuations.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]} className="mb-4 p-4 rounded-lg">
            <Text className="text-lg font-bold text-foreground mb-4">Valuation History</Text>
            {asset.historicalValuations.map((valuation, index) => (
              <View key={index} className="mb-3 pb-3 border-b border-border">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-foreground font-semibold">
                    {formatCurrency(valuation.estimatedValue, asset.currency)}
                  </Text>
                  <Text className="text-muted text-sm">{valuation.date}</Text>
                </View>
                {valuation.source && (
                  <Text className="text-muted text-xs">Source: {valuation.source}</Text>
                )}
                {valuation.note && (
                  <Text className="text-muted text-xs mt-1">{valuation.note}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Custom Attributes */}
        {Object.keys(asset.customAttributes).length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface }]} className="mb-4 p-4 rounded-lg">
            <Text className="text-lg font-bold text-foreground mb-4">Additional Details</Text>
            {Object.entries(asset.customAttributes).map(([key, value]) => (
              <View key={key} className="mb-3">
                <Text className="text-muted text-sm mb-1 capitalize">{key}</Text>
                <Text className="text-foreground">{String(value)}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View className="flex-row gap-3 mb-6">
          <Pressable
            onPress={handleEdit}
            style={[styles.button, { backgroundColor: colors.accent, flex: 1 }]}
            className="p-3 rounded-lg"
          >
            <Text className="text-background font-semibold text-center">Edit Asset</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            disabled={isDeleting}
            style={[styles.button, { backgroundColor: colors.error, flex: 1, opacity: isDeleting ? 0.5 : 1 }]}
            className="p-3 rounded-lg"
          >
            <Text className="text-background font-semibold text-center">Delete</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});
