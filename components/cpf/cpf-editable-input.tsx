import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useAppColors } from '@/hooks/use-app-colors';
import { formatCurrency } from '@/lib/store';

interface CPFEditableInputProps {
  label: string;
  icon: string;
  value: number;
  onValueChange: (newValue: number) => void;
  color: string;
  description?: string;
  isEditing: boolean;
  onEditToggle: () => void;
  unit?: 'currency' | 'years'; // 'currency' for SGD, 'years' for age
}

export function CPFEditableInput({
  label,
  icon,
  value,
  onValueChange,
  color,
  description,
  isEditing,
  onEditToggle,
  unit = 'currency',
}: CPFEditableInputProps) {
  const colors = useAppColors();
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSave = () => {
    const newValue = parseInt(inputValue, 10);
    if (!isNaN(newValue) && newValue >= 0) {
      onValueChange(newValue);
      onEditToggle();
    }
  };

  const handleCancel = () => {
    setInputValue(value.toString());
    onEditToggle();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.labelRow}>
          <Text style={styles.icon}>{icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
            {description && <Text style={[styles.description, { color: colors.muted }]}>{description}</Text>}
          </View>
        </View>
        <Pressable onPress={onEditToggle} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <Text style={styles.editIcon}>{isEditing ? '✓' : '✏️'}</Text>
        </Pressable>
      </View>

      {/* Value Display or Input */}
      {isEditing ? (
        <View style={styles.editMode}>
          <View style={[styles.inputContainer, { borderColor: color }]}>
            {unit === 'currency' && (
              <Text style={[styles.currencySymbol, { color: colors.muted }]}>SGD</Text>
            )}
            <TextInput
              style={[styles.textInput, { color: colors.foreground }]}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.muted}
            />
            {unit === 'years' && (
              <Text style={[styles.unitSuffix, { color: colors.muted }]}>years old</Text>
            )}
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              onPress={handleCancel}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                { backgroundColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.foreground }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [
                styles.button,
                styles.saveButton,
                { backgroundColor: color, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>Save</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Text style={[styles.value, { color: colors.foreground }]}>
          {unit === 'currency' ? formatCurrency(value) : `${value} years old`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 11,
    marginTop: 2,
  },
  editIcon: {
    fontSize: 18,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
  },
  editMode: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  unitSuffix: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {},
  saveButton: {},
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
