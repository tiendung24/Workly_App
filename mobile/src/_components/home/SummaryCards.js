import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

/**
 * Summary cards: Công tháng, OT tuần, Nghỉ phép tháng
 * TODO: replace hardcoded values with API data
 */
export default function SummaryCards({ styles, theme, workedDays = 0, standardDays = 0, otHoursWeek = 0, paidLeavePerMonth = 0, usedPaidLeave = 0 }) {
  const remainingLeave = paidLeavePerMonth - usedPaidLeave;

  return (
    <View style={styles.summaryRow}>
      {/* Công tháng */}
      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <MaterialIcons name="event-available" size={16} color="#10B981" />
          <Text style={[styles.summaryLabel, { color: theme.sub, marginTop: 0 }]}>Working Days</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={[styles.summaryValue, { color: "#10B981" }]}>
            {workedDays}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.sub }}>
            {" "}/ {standardDays}
          </Text>
        </View>
      </View>

      {/* OT tuần */}
      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <MaterialIcons name="more-time" size={16} color={COLORS.primary} />
          <Text style={[styles.summaryLabel, { color: theme.sub, marginTop: 0 }]}>Weekly OT</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={[styles.summaryValue, { color: COLORS.primary }]}>
            {otHoursWeek}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.sub }}>
            {" "} hours
          </Text>
        </View>
      </View>

      {/* Phép còn lại */}
      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 }}>
          <MaterialIcons name="beach-access" size={16} color="#F59E0B" />
          <Text style={[styles.summaryLabel, { color: theme.sub, marginTop: 0 }]}>Leave Bal</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "baseline" }}>
          <Text style={[styles.summaryValue, { color: "#F59E0B" }]}>
            {remainingLeave}
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "700", color: theme.sub }}>
            {" "} / {paidLeavePerMonth} days
          </Text>
        </View>
      </View>
    </View>
  );
}