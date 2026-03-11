import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

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

  return (
    <View style={{ marginTop: 10 }}>
      {items.map((it, idx) => {
         const isApproved = it.status === "Approved";
         const isRejected = it.status === "Rejected";
         const isPending = it.status === "Pending";

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

         const dateStr = it.date ? new Date(it.date).toLocaleDateString("en-GB") : "N/A";
         const safeStartTime = it.start_time ? it.start_time.substring(0, 5) : "";
         const safeEndTime = it.end_time ? it.end_time.substring(0, 5) : "";
         let hoursRender = it.total_hours ?? it.hours;
         if (!hoursRender && safeStartTime && safeEndTime) {
             const [h1, m1] = safeStartTime.split(":");
             const [h2, m2] = safeEndTime.split(":");
             const d1 = new Date(); d1.setHours(h1, m1, 0);
             const d2 = new Date(); d2.setHours(h2, m2, 0);
             hoursRender = Math.max(0, (d2 - d1) / 3600000).toFixed(1);
         }
         hoursRender = hoursRender || 0;

         return (
           <TouchableOpacity 
             key={it.id || idx} 
             activeOpacity={0.8}
             style={[styles.historyCard, { backgroundColor: theme.card, borderColor: theme.navBorder, marginBottom: 12 }]}
           >
             <View style={styles.historyRow}>
               <View>
                 <Text style={[styles.historyType, { color: theme.text }]}>
                   Overtime ({hoursRender}h)
                 </Text>
                 <Text style={[styles.historyDates, { color: theme.sub }]}>
                   {dateStr} ({safeStartTime} - {safeEndTime})
                 </Text>
               </View>
               <View style={[styles.historyStatusBadge, { backgroundColor: statusBg }]}>
                 <MaterialIcons name={icon} size={14} color={statusColor} />
                 <Text style={[styles.historyStatusText, { color: statusColor }]}>{it.status}</Text>
               </View>
             </View>
             
             {it.reason && (
               <Text style={[styles.historyReason, { color: theme.sub }]} numberOfLines={2}>
                 "{it.reason}"
               </Text>
             )}
             
             {it.manager_comment && (
               <View style={[styles.managerCommentBox, { backgroundColor: theme.bg }]}>
                 <MaterialIcons name="forum" size={14} color={theme.sub} style={{ marginRight: 6 }} />
                 <Text style={[styles.managerCommentText, { color: theme.text }]} numberOfLines={2}>
                   Feedback: {it.manager_comment}
                 </Text>
               </View>
             )}
           </TouchableOpacity>
         );
      })}
    </View>
  );
}