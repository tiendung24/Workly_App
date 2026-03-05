// mobile/src/_components/home/QuickActionsGrid.js
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";
import { menuToneBg, menuToneIcon } from "../../_utils/tone";

export default function QuickActionsGrid({ styles, theme, isDark, actions = [], onPressAction }) {
  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

      <FlatList
        data={actions}
        keyExtractor={(i) => i.key}
        numColumns={2} // 2 icon / hàng
        scrollEnabled={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.actionItem}
            activeOpacity={0.85}
            onPress={() => onPressAction?.(item.key)}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: menuToneBg(item.tone, isDark) }]}>
              <MaterialIcons
                name={item.icon}
                size={22}
                color={menuToneIcon(item.tone, isDark, COLORS.primary)}
              />
            </View>
            <Text style={[styles.actionLabel, { color: theme.sub }]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </>
  );
}