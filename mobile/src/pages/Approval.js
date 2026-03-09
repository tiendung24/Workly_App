import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../_styles/theme";
import Layout from "../_components/layout/Layout";
import { managerService } from "../_utils/managerService";

const TABS = [
  { key: "leave", label: "Leave" },
  { key: "overtime", label: "Overtime" },
  { key: "correction", label: "Correction" },
];

export default function Approval({ navigation }) {
  const [tab, setTab] = useState("leave");
  const [requests, setRequests] = useState({ leave: [], overtime: [], correction: [] });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await managerService.getRequests();
      if (res && res.data) {
        setRequests(res.data);
      }
    } catch (error) {
      console.log("Error loading manager requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, id, status) => {
    setActionLoading(id);
    try {
      await managerService.approveRequest(type, id, status);
      loadData();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const renderList = (type, items, theme) => {
    const list = items || [];
    if (list.length === 0) {
      return (
        <View style={[s.emptyCard, { borderColor: theme.navBorder }]}>
          <MaterialIcons name="done-all" size={36} color={theme.sub} />
          <Text style={[s.emptyTitle, { color: theme.text }]}>All clear</Text>
          <Text style={[s.emptyDesc, { color: theme.sub }]}>No pending requests for {type}</Text>
        </View>
      );
    }

    return list.map((req) => (
      <View key={req.id} style={[s.card, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
        <View style={s.cardHeader}>
          <View style={s.userRow}>
             {req.user?.avatar_url ? (
                <Image source={{ uri: req.user.avatar_url }} style={s.avatar} />
             ) : (
                <View style={[s.avatarFallback, { backgroundColor: COLORS.primary + "20" }]}>
                  <Text style={[s.avatarText, { color: COLORS.primary }]}>
                    {req.user?.full_name?.charAt(0) || "U"}
                  </Text>
                </View>
             )}
             <View>
                <Text style={[s.userName, { color: theme.text }]}>{req.user?.full_name}</Text>
                <Text style={[s.userCode, { color: theme.sub }]}>{req.user?.employee_code || "N/A"}</Text>
             </View>
          </View>
          <View style={[s.statusBadge, { backgroundColor: req.status === "Pending" ? "#FFFBEB" : (req.status === "Approved" ? "#D1FAE5" : "#FEE2E2") }]}>
            <Text style={[s.statusText, { color: req.status === "Pending" ? "#D97706" : (req.status === "Approved" ? "#059669" : "#EF4444") }]}>
              {req.status}
            </Text>
          </View>
        </View>

        <View style={s.cardBody}>
          {type === 'leave' && (
             <>
               <Text style={[s.detailText, { color: theme.text }]}><Text style={s.bold}>Type:</Text> {req.leaveType?.name}</Text>
               <Text style={[s.detailText, { color: theme.text }]}><Text style={s.bold}>Date:</Text> {req.start_date} to {req.end_date}</Text>
             </>
          )}
          {type === 'overtime' && (
             <>
               <Text style={[s.detailText, { color: theme.text }]}><Text style={s.bold}>Date:</Text> {req.date}</Text>
               <Text style={[s.detailText, { color: theme.text }]}><Text style={s.bold}>Hours:</Text> {req.hours}</Text>
             </>
          )}
          {type === 'correction' && (
             <>
               <Text style={[s.detailText, { color: theme.text }]}><Text style={s.bold}>Type:</Text> {req.correction_type}</Text>
               <Text style={[s.detailText, { color: theme.text }]}><Text style={s.bold}>Date:</Text> {req.date}</Text>
               <Text style={[s.detailText, { color: theme.text }]}><Text style={s.bold}>Target Time:</Text> {req.correct_time}</Text>
             </>
          )}
          <Text style={[s.detailText, { color: theme.text, marginTop: 4 }]}><Text style={s.bold}>Reason:</Text> {req.reason}</Text>
        </View>

        {req.status === "Pending" && (
          <View style={s.actions}>
            <TouchableOpacity 
               style={[s.btn, { borderColor: "#EF4444" }]} 
               onPress={() => handleAction(type, req.id, "Rejected")}
               disabled={actionLoading === req.id}
            >
               <Text style={[s.btnText, { color: "#EF4444" }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity 
               style={[s.btn, { backgroundColor: COLORS.primary, borderColor: COLORS.primary }]} 
               onPress={() => handleAction(type, req.id, "Approved")}
               disabled={actionLoading === req.id}
            >
               <Text style={[s.btnText, { color: "#fff" }]}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ));
  };

  return (
    <Layout>
      {({ theme, isDark, insets, isWeb, webPadding }) => (
        <View style={{ flex: 1 }}>
          <View style={s.tabsRow}>
            {TABS.map((t) => {
              const active = tab === t.key;
              const pendingCount = requests[t.key] ? requests[t.key].filter(x => x.status === 'Pending').length : 0;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    s.tab,
                    {
                      backgroundColor: active ? COLORS.primary : theme.card,
                      borderColor: active ? COLORS.primary : theme.navBorder,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setTab(t.key)}
                >
                  <Text style={[s.tabText, { color: active ? "#fff" : theme.sub }]}>
                    {t.label}
                  </Text>
                  {pendingCount > 0 && (
                     <View style={[s.badge, { backgroundColor: active ? "#fff" : COLORS.primary }]}>
                        <Text style={[s.badgeText, { color: active ? COLORS.primary : "#fff" }]}>{pendingCount}</Text>
                     </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              s.scrollContent,
              isWeb && { paddingHorizontal: webPadding },
              { paddingBottom: Math.round(100 + insets.bottom) },
            ]}
          >
            {loading ? (
               <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
               renderList(tab, requests[tab], theme)
            )}
          </ScrollView>
        </View>
      )}
    </Layout>
  );
}

const s = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    marginTop: 18,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
    gap: 6
  },
  tabText: {
    fontSize: 13,
    fontWeight: "800",
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  userCode: {
    fontSize: 12,
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  cardBody: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150,150,150,0.1)',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4
  },
  bold: {
    fontWeight: 'bold'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12
  },
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.5
  },
  btnText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 14,
    marginTop: 4,
  },
});
