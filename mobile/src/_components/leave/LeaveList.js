import React from "react";
import { View, Text } from "react-native";

export default function LeaveList({ styles, theme, items = [] }) {
  if (items.length === 0) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>No leave requests</Text>
        <Text style={[styles.emptyDesc, { color: theme.sub }]}>
          Your leave requests will appear here after you create one.
        </Text>
      </View>
    );
  }

  // Sau này bạn map items từ DB vào đây
  return (
    <View>
      {items.map((x) => (
        <View key={x.id} />
      ))}
    </View>
  );
}