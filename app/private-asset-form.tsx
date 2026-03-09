import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useAppData } from '@/lib/app-data-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { PrivateAsset, ConfidenceLevel } from '@/lib/types';

export default function PrivateAssetFormScreen() {
  const colors = useAppColors();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { data, addPrivateAsset, updatePrivateAsset } = useAppData();
  const [isSaving, setIsSaving] = useState(false);

  const existingAsset = useMemo(() => {
    return id ? data.privateAssets.find(a => a.id === id) : null;
  }, [data.privateAssets, id]);

  // Form state
  const [assetName, setAssetName] = useState(existingAsset?.assetName || '');
  const [assetType, setAssetType] = useState(existingAsset?.assetType || '');
  const [description, setDescription] = useState(existingAsset?.description || '');
  const [purchasePrice, setPurchasePrice] = useState(String(existingAsset?.purchasePrice || ''));
  const [currentEstimatedValue, setCurrentEstimatedValue] = useState(String(existingAsset?.currentEstimatedValue || ''));
  const [purchaseDate, setPurchaseDate] = useState(existingAsset?.purchaseDate || '');
  const [quantity, setQuantity] = useState(String(existingAsset?.quantity || ''));
  const [currency, setCurrency] = useState(existingAsset?.currency || 'SGD');
  const [valuationNotes, setValuationNotes] = useState(existingAsset?.valuationNotes || '');
  const [confidenceLevel, setConfidenceLevel] = useState<'Very High' | 'High' | 'Medium' | 'Low' | 'Very Low'>(existingAsset?.confidenceLevel || 'Medium');

  const handleSave = useCallback(async () => {
    if (!assetName.trim()) {
      Alert.alert('Error', 'Please enter an asset name');
      return;
    }
    if (!purchasePrice || isNaN(Number(purchasePrice))) {
      Alert.alert('Error', 'Please enter a valid purchase price');
      return;
    }
    if (!currentEstimatedValue || isNaN(Number(currentEstimatedValue))) {
      Alert.alert('Error', 'Please enter a valid current estimated value');
      return;
    }
    if (!purchaseDate.trim()) {
      Alert.alert('Error', 'Please enter a purchase date');
      return;
    }

    setIsSaving(true);
    try {
      const assetData = {
        assetName: assetName.trim(),
        assetType: assetType.trim(),
        description: description.trim(),
        purchasePrice: Number(purchasePrice),
        currentEstimatedValue: Number(currentEstimatedValue),
        purchaseDate,
        quantity: quantity ? Number(quantity) : undefined,
        currency,
        valuationNotes: valuationNotes.trim(),
        valuationSource: 'manual',
        confidenceLevel: confidenceLevel as ConfidenceLevel,
        historicalValuations: existingAsset?.historicalValuations || [],
        customAttributes: existingAsset?.customAttributes || {},
        inferredCategory: assetType.toLowerCase(),
      };

      if (existingAsset) {
        await updatePrivateAsset(existingAsset.id, assetData);
      } else {
        await addPrivateAsset(assetData);
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save asset');
    } finally {
      setIsSaving(false);
    }
  }, [assetName, assetType, description, purchasePrice, currentEstimatedValue, purchaseDate, quantity, currency, valuationNotes, confidenceLevel, existingAsset, addPrivateAsset, updatePrivateAsset, router]);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Pressable onPress={() => router.back()} className="mb-4">
            <Text className="text-accent text-base font-semibold">← Back</Text>
          </Pressable>
          <Text className="text-2xl font-bold text-foreground">
            {existingAsset ? 'Edit Asset' : 'Add New Asset'}
          </Text>
        </View>

        {/* Basic Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]} className="mb-4 p-4 rounded-lg">
          <Text className="text-lg font-bold text-foreground mb-4">Basic Information</Text>

          <View className="mb-4">
            <Text className="text-muted text-sm mb-2">Asset Name *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g., Gold Ring, Rolex Watch"
              placeholderTextColor={colors.muted}
              value={assetName}
              onChangeText={setAssetName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-muted text-sm mb-2">Asset Type (optional)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g., Jewelry, Watch, Property"
              placeholderTextColor={colors.muted}
              value={assetType}
              onChangeText={setAssetType}
            />
          </View>

          <View className="mb-4">
            <Text className="text-muted text-sm mb-2">Description</Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]}
              placeholder="Describe the asset in detail"
              placeholderTextColor={colors.muted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Valuation Information */}
        <View style={[styles.section, { backgroundColor: colors.surface }]} className="mb-4 p-4 rounded-lg">
          <Text className="text-lg font-bold text-foreground mb-4">Valuation</Text>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-muted text-sm mb-2">Purchase Price *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={purchasePrice}
                onChangeText={setPurchasePrice}
                keyboardType="decimal-pad"
              />
            </View>
            <View className="flex-1">
              <Text className="text-muted text-sm mb-2">Current Value *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={currentEstimatedValue}
                onChangeText={setCurrentEstimatedValue}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View className="flex-1">
              <Text className="text-muted text-sm mb-2">Purchase Date *</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                value={purchaseDate}
                onChangeText={setPurchaseDate}
              />
            </View>
            <View className="flex-1">
              <Text className="text-muted text-sm mb-2">Currency</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
                placeholder="SGD"
                placeholderTextColor={colors.muted}
                value={currency}
                onChangeText={setCurrency}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-muted text-sm mb-2">Quantity (optional)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              placeholder="1"
              placeholderTextColor={colors.muted}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
            />
          </View>

          <View className="mb-4">
            <Text className="text-muted text-sm mb-2">Confidence Level</Text>
            <View className="flex-row gap-2">
              {(['Low', 'Medium', 'High'] as const).map(level => (
                <Pressable
                  key={level}
                  onPress={() => setConfidenceLevel(level)}
                  style={[
                    styles.confidenceButton,
                    { backgroundColor: confidenceLevel === level ? colors.accent : colors.border },
                  ]}
                  className="flex-1 p-2 rounded"
                >
                  <Text className={`text-center font-semibold capitalize ${confidenceLevel === level ? 'text-background' : 'text-foreground'}`}>
                    {level}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View>
            <Text className="text-muted text-sm mb-2">Valuation Notes</Text>
            <TextInput
              style={[styles.textArea, { borderColor: colors.border, color: colors.foreground }]}
              placeholder="Add any notes about this valuation"
              placeholderTextColor={colors.muted}
              value={valuationNotes}
              onChangeText={setValuationNotes}
              multiline
              numberOfLines={2}
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, { backgroundColor: colors.accent, opacity: isSaving ? 0.5 : 1 }]}
          className="p-4 rounded-lg mb-6"
        >
          <Text className="text-background font-bold text-center text-lg">
            {isSaving ? 'Saving...' : existingAsset ? 'Update Asset' : 'Add Asset'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  confidenceButton: {
    paddingVertical: 8,
  },
  saveButton: {
    paddingVertical: 14,
  },
});
