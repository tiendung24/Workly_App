// mobile/src/_components/home/QuickActionsGrid.js
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";
import { menuToneBg, menuToneIcon } from "../../_utils/tone";

export default function QuickActionsGrid({ styles, theme, isDark, actions = [], badges = {}, onPressAction }) {
  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginHorizontal: -8 }}>
        {actions.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.actionItem, { width: '30%', marginHorizontal: '1.5%', marginBottom: 12 }]}
            activeOpacity={0.85}
            onPress={() => onPressAction?.(item.key)}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: menuToneBg(item.tone, isDark) }]}>
              <MaterialIcons
                name={item.icon}
                size={22}
                color={menuToneIcon(item.tone, isDark, COLORS.primary)}
              />
              {badges[item.key] ? (
                 <View style={{
                   position: 'absolute', top: -2, right: -2,
                   width: 10, height: 10, borderRadius: 5, backgroundColor: '#ff4757',
                   borderWidth: 1.5, borderColor: theme.card
                 }} />
              ) : null}
            </View>
            <Text style={[styles.actionLabel, { color: theme.sub }]} numberOfLines={1}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}