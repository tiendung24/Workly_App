import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

export default function LeaveBalance({ styles, theme, balance }) {
  const remaining = balance ? balance.remaining_days : 0;
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quỹ Phép Của Tôi</Text>
      </View>

      <View
        style={[
          styles.balanceCard,
          {
            backgroundColor: COLORS.primary,
            borderColor: "transparent",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View
            style={[
              styles.balanceIconWrap,
              { backgroundColor: "rgba(255,255,255,0.18)" },
            ]}
          >
            <MaterialIcons name="calendar-month" size={22} color="#fff" />
          </View>
          <View>
            <Text style={[styles.balanceValue, { color: "#fff", fontSize: 26 }]}>
              {remaining}
            </Text>
            <Text
              style={[
                styles.balanceLabel,
                { color: "rgba(255,255,255,0.85)" },
              ]}
            >
              Số phép tháng còn lại
            </Text>
          </View>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.6)" />
      </View>
    </View>
  );
}