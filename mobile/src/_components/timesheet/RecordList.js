import React from "react";
import { View, Text } from "react-native";

/**
 * records: [
 *  { id, dow, day, title, sub, status }  // sau này map từ API
 * ]
 */
export default function RecordList({ styles, theme, records = [] }) {
  const pillStyle = (status) => {
    if (status === "on_time") return { bg: "#DCFCE7", text: "#166534", label: "ON TIME" };
    if (status === "late") return { bg: "#FEF3C7", text: "#92400E", label: "LATE" };
    if (status === "early") return { bg: "#DBEAFE", text: "#1D4ED8", label: "EARLY" };
    return { bg: "#E5E7EB", text: "#374151", label: "—" };
  };

  return (
    <View style={{ marginTop: 8 }}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Attendance Records</Text>

      {records.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No records yet</Text>
          <Text style={[styles.emptyDesc, { color: theme.sub }]}>
            Your check-in/check-out history will appear here.
          </Text>
        </View>
      ) : (
        records.map((r) => {
          const p = pillStyle(r.status);
          return (
            <View
              key={r.id}
              style={[styles.recordCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}
            >
              <View style={styles.recordLeft}>
                <View style={[styles.dateBadge, { backgroundColor: "#F3F4F6" }]}>
                  <Text style={[styles.dateDow, { color: theme.sub }]}>{r.dow}</Text>
                  <Text style={[styles.dateDay, { color: theme.text }]}>{r.day}</Text>
                </View>

                <View>
                  <Text style={[styles.recordTitle, { color: theme.text }]}>{r.title}</Text>
                  <Text style={[styles.recordSub, { color: theme.sub }]}>{r.sub}</Text>
                </View>
              </View>

              <View style={[styles.pill, { backgroundColor: p.bg }]}>
                <Text style={[styles.pillText, { color: p.text }]}>{p.label}</Text>
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}