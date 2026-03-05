import React from "react";
import { View, Text } from "react-native";

export default function OvertimeList({ styles, theme, items = [] }) {
  if (items.length === 0) {
    return (
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: theme.card, borderColor: theme.navBorder },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          No overtime requests
        </Text>
        <Text style={[styles.emptyDesc, { color: theme.sub }]}>
          Your overtime submissions will appear here after you create one.
        </Text>
      </View>
    );
  }

  return <View />;
}