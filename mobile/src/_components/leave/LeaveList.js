import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

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

  return (
    <View style={{ gap: 12 }}>
      {items.map((item) => {
        const isPending = item.status === "Pending";
        const isApproved = item.status === "Approved";
        const isRejected = item.status === "Rejected";

        let statusColor = "#6B7280";
        let statusBg = "#F3F4F6";
        let icon = "schedule";

        if (isApproved) {
          statusColor = "#059669";
          statusBg = "#D1FAE5";
          icon = "check-circle";
        } else if (isRejected) {
          statusColor = "#DC2626";
          statusBg = "#FEE2E2";
          icon = "cancel";
        } else if (isPending) {
          statusColor = "#D97706";
          statusBg = "#FEF3C7";
          icon = "pending";
        }

        const dateRange = item.end_date && item.end_date !== item.start_date
          ? `${new Date(item.start_date).toLocaleDateString("en-GB")} - ${new Date(item.end_date).toLocaleDateString("en-GB")}`
          : new Date(item.start_date).toLocaleDateString("en-GB");

        return (
          <TouchableOpacity 
            key={item.id} 
            activeOpacity={0.8}
            style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}
          >
            <View style={styles.historyRow}>
              <View>
                <Text style={[styles.historyType, { color: theme.text }]}>
                  {item.leaveType?.name || "Nghỉ"}
                </Text>
                <Text style={[styles.historyDates, { color: theme.sub }]}>
                  {dateRange}
                </Text>
              </View>
              <View style={[styles.historyStatusBadge, { backgroundColor: statusBg }]}>
                <MaterialIcons name={icon} size={14} color={statusColor} />
                <Text style={[styles.historyStatusText, { color: statusColor }]}>{item.status}</Text>
              </View>
            </View>
            
            {item.reason && (
              <Text style={[styles.historyReason, { color: theme.sub }]} numberOfLines={2}>
                "{item.reason}"
              </Text>
            )}
            
            {item.manager_comment && (
              <View style={[styles.managerCommentBox, { backgroundColor: theme.bg }]}>
                <MaterialIcons name="forum" size={14} color={theme.sub} style={{ marginRight: 6 }} />
                <Text style={[styles.managerCommentText, { color: theme.text }]} numberOfLines={2}>
                  Phản hồi: {item.manager_comment}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}