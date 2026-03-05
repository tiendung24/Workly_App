import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { COLORS } from "../../_styles/theme";

export default function PeriodTabs({ styles, theme, period, onChange }) {
  const tabs = [
    { key: "day", label: "Day" },
    { key: "week", label: "Week" },
    { key: "month", label: "Month" },
  ];

  return (
    <View style={styles.tabsRow}>
      {tabs.map((t) => {
        const active = period === t.key;
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