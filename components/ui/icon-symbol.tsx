// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for Wealth Wellness Hub
 */
const MAPPING = {
  // Navigation
  "house.fill": "home",
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  // App tabs
  "chart.pie.fill": "pie-chart",
  "building.columns.fill": "account-balance",
  "creditcard.fill": "credit-card",
  "shield.fill": "shield",
  "doc.fill": "description",
  // Actions
  "plus": "add",
  "plus.circle.fill": "add-circle",
  "minus.circle.fill": "remove-circle",
  "pencil": "edit",
  "trash.fill": "delete",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  // Finance
  "dollarsign.circle.fill": "attach-money",
  "arrow.up.right": "trending-up",
  "arrow.down.right": "trending-down",
  "arrow.up.arrow.down": "swap-vert",
  "banknote.fill": "payments",
  "percent": "percent",
  "calendar": "calendar-today",
  "clock.fill": "access-time",
  // Status
  "exclamationmark.triangle.fill": "warning",
  "info.circle.fill": "info",
  "star.fill": "star",
  "heart.fill": "favorite",
  // Files
  "doc.text.fill": "article",
  "arrow.up.doc.fill": "upload-file",
  "eye.fill": "visibility",
  "lock.fill": "lock",
  // Misc
  "person.fill": "person",
  "gear": "settings",
  "bell.fill": "notifications",
  "magnifyingglass": "search",
  "ellipsis": "more-horiz",
  "ellipsis.circle": "more-vert",
  "chart.bar.fill": "bar-chart",
  "chart.line.uptrend.xyaxis": "show-chart",
  "waveform.path.ecg": "monitor-heart",
  "building.2.fill": "business",
  "briefcase.fill": "work",
  "tag.fill": "label",
  "sparkles": "auto-awesome",
  "arrow.clockwise": "refresh",
  "diamond.fill": "diamond",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
