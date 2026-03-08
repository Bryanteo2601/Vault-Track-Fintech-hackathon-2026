import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-data-context';
import { useColors } from '@/hooks/use-colors';
import { formatCurrency } from '@/lib/store';
import { PrivateAsset } from '@/lib/types';

export default function PrivateAssetsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data } = useAppData();
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'date'>('name');
  const [filterType, setFilterType] = useState<string | null>(null);

  // Get unique asset types
  const assetTypes = useMemo(() => {
    const types = new Set(data.privateAssets.map(a => a.assetType));
    return Array.from(types);
  }, [data.privateAssets]);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = data.privateAssets;
    
    if (filterType) {
      filtered = filtered.filter(a => a.assetType === filterType);
    }

    const sorted = [...filtered];
    switch (sortBy) {
      case 'value':
        sorted.sort((a, b) => b.currentEstimatedValue - a.currentEstimatedValue);
        break;
      case 'date':
        sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'name':
      default:
        sorted.sort((a, b) => a.assetName.localeCompare(b.assetName));
    }
    return sorted;
  }, [data.privateAssets, sortBy, filterType]);

  // Calculate total value
  const totalValue = useMemo(() => {
    return data.privateAssets.reduce((sum, asset) => sum + asset.currentEstimatedValue, 0);
  }, [data.privateAssets]);

  // Calculate total gain/loss
  const totalGainLoss = useMemo(() => {
    return data.privateAssets.reduce((sum, asset) => {
      const gain = asset.currentEstimatedValue - asset.purchasePrice;
      return sum + gain;
    }, 0);
  }, [data.privateAssets]);

  const handleAddAsset = () => {
    console.log('Add asset');
  };

  const handleEditAsset = (asset: PrivateAsset) => {
    console.log('Edit asset:', asset.id);
  };

  const handleViewDetail = (asset: PrivateAsset) => {
    console.log('View detail:', asset.id);
  };

  const renderAssetCard = ({ item }: { item: PrivateAsset }) => {
    const gainLoss = item.currentEstimatedValue - item.purchasePrice;
    const gainLossPercent = item.purchasePrice > 0 ? (gainLoss / item.purchasePrice) * 100 : 0;
    const isGain = gainLoss >= 0;

    return (
      <TouchableOpacity
        style={[styles.assetCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
        onPress={() => handleViewDetail(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <Text style={[styles.assetName, { color: colors.foreground }]}>{item.assetName}</Text>
            <Text style={[styles.assetType, { color: colors.muted }]}>{item.assetType}</Text>
          </View>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => handleEditAsset(item)}
            >
              <Text style={[styles.actionButtonText, { color: colors.background }]}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.valueRow}>
            <Text style={[styles.label, { color: colors.muted }]}>Current Value</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>
              {formatCurrency(item.currentEstimatedValue, item.currency)}
            </Text>
          </View>

          <View style={styles.valueRow}>
            <Text style={[styles.label, { color: colors.muted }]}>Purchase Price</Text>
            <Text style={[styles.value, { color: colors.muted }]}>
              {formatCurrency(item.purchasePrice, item.currency)}
            </Text>
          </View>

          <View style={[styles.valueRow, styles.gainLossRow]}>
            <Text style={[styles.label, { color: colors.muted }]}>Gain/Loss</Text>
            <View style={styles.gainLossValue}>
              <Text style={[styles.value, { color: isGain ? colors.success : colors.error }]}>
                {formatCurrency(gainLoss, item.currency)}
              </Text>
              <Text style={[styles.gainLossPercent, { color: isGain ? colors.success : colors.error }]}>
                {gainLossPercent > 0 ? '+' : ''}{gainLossPercent.toFixed(1)}%
              </Text>
            </View>
          </View>

          {item.quantity && (
            <View style={styles.valueRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Quantity</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>{item.quantity}</Text>
            </View>
          )}

          {item.confidenceLevel && (
            <View style={styles.valueRow}>
              <Text style={[styles.label, { color: colors.muted }]}>Confidence</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>{item.confidenceLevel}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Private Assets</Text>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddAsset}
          >
            <Text style={[styles.addButtonText, { color: colors.background }]}>+ Add Asset</Text>
          </TouchableOpacity>
        </View>

        {data.privateAssets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Private Assets Yet</Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              Start tracking your jewelry, property, art, and collectibles
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.primary }]}
              onPress={handleAddAsset}
            >
              <Text style={[styles.emptyButtonText, { color: colors.background }]}>Add Your First Asset</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summarySection}>
              <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Total Value</Text>
                <Text style={[styles.summaryValue, { color: colors.foreground }]}>
                  {formatCurrency(totalValue)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.summaryLabel, { color: colors.muted }]}>Total Gain/Loss</Text>
                <Text style={[styles.summaryValue, { color: totalGainLoss >= 0 ? colors.success : colors.error }]}>
                  {formatCurrency(totalGainLoss)}
                </Text>
              </View>
            </View>

            {/* Filters and Sort */}
            <View style={styles.controlsSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filterType === null && { backgroundColor: colors.primary },
                    filterType === null && { borderColor: colors.primary },
                    filterType !== null && { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                  onPress={() => setFilterType(null)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      filterType === null && { color: colors.background },
                      filterType !== null && { color: colors.foreground },
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {assetTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.filterButton,
                      filterType === type && { backgroundColor: colors.primary },
                      filterType === type && { borderColor: colors.primary },
                      filterType !== type && { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => setFilterType(type)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        filterType === type && { color: colors.background },
                        filterType !== type && { color: colors.foreground },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Sort Options */}
            <View style={styles.sortSection}>
              <Text style={[styles.sortLabel, { color: colors.muted }]}>Sort by:</Text>
              <View style={styles.sortButtons}>
                {(['name', 'value', 'date'] as const).map(option => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.sortButton,
                      sortBy === option && { backgroundColor: colors.primary },
                      sortBy !== option && { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    onPress={() => setSortBy(option)}
                  >
                    <Text
                      style={[
                        styles.sortButtonText,
                        sortBy === option && { color: colors.background },
                        sortBy !== option && { color: colors.foreground },
                      ]}
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Assets List */}
            <View style={styles.assetsList}>
              {filteredAssets.length === 0 ? (
                <View style={styles.noResults}>
                  <Text style={[styles.noResultsText, { color: colors.muted }]}>No assets match your filter</Text>
                </View>
              ) : (
                <FlatList
                  data={filteredAssets}
                  renderItem={renderAssetCard}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  controlsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sortSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sortLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  assetsList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
  },
  assetCard: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  assetType: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardContent: {
    gap: 8,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 13,
    fontWeight: '500',
  },
  gainLossRow: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  gainLossValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gainLossPercent: {
    fontSize: 12,
    fontWeight: '500',
  },
  noResults: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
  },
});
