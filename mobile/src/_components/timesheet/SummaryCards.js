import React from "react";
import { View, Text } from "react-native";

export default function SummaryCards({ styles, theme }) {
  // không data => hiển thị —
  return (
    <View style={styles.summaryRow}>
      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
        <Text style={[styles.summaryValue, { color: theme.text }]}>—</Text>
        <Text style={[styles.summaryLabel, { color: theme.sub }]}>Total Hours</Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
        <Text style={[styles.summaryValue, { color: theme.text }]}>—</Text>
        <Text style={[styles.summaryLabel, { color: theme.sub }]}>Late / Early</Text>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
        <Text style={[styles.summaryValue, { color: theme.text }]}>—</Text>
        <Text style={[styles.summaryLabel, { color: theme.sub }]}>Approved OT</Text>
      </View>
    </View>
  );
}