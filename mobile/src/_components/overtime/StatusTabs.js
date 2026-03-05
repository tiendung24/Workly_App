import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../../_styles/theme";

export default function StatusTabs({ styles, theme, value, onChange }) {
  const tabs = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <View style={styles.tabsRow}>
      {tabs.map((t) => {
        const active = value === t.key;
        return (
          <TouchableOpacity
            key={t.key}
            style={[
              styles.tab,
              {
                backgroundColor: active ? COLORS.primary : theme.card,
                borderColor: active ? "transparent" : theme.navBorder,
              },
            ]}
            activeOpacity={0.9}
            onPress={() => onChange(t.key)}
          >
            <Text style={[styles.tabText, { color: active ? "#fff" : theme.sub }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}