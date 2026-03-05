import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

export default function OvertimeSummary({ styles, theme }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          This Month OT
        </Text>
      </View>

      <View
        style={[
          styles.summaryCard,
          {
            backgroundColor: COLORS.primary,
            borderColor: "transparent",
          },
        ]}
      >
        <View style={styles.summaryRow}>
          <View>
            <Text style={[styles.summaryValue, { color: "#fff" }]}>—</Text>
            <Text style={[styles.summaryLabel, { color: "rgba(255,255,255,0.85)" }]}>
              Total Hours
            </Text>
          </View>

          <MaterialIcons name="schedule" size={30} color="#fff" />
        </View>
      </View>
    </View>
  );
}