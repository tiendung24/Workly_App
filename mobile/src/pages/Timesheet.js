import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../_styles/theme";
import Layout from "../_components/layout/Layout";
import { timesheetStyles as styles } from "../_styles/pages/timesheetStyles";
import CorrectionForm from "../_components/timesheet/CorrectionForm";
import { correctionService } from "../_utils/requestService";

const MONTH_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const STATUS_COLORS = {
  pending: { bg: "#FFFBEB", text: "#D97706", label: "Pending" },
  approved: { bg: "#D1FAE5", text: "#059669", label: "Approved" },
  rejected: { bg: "#FEE2E2", text: "#EF4444", label: "Rejected" },
};

const TYPE_ICONS = {
  Forgot_CheckOut: { icon: "logout", color: "#EF4444", dir: "OUT", label: "Forgot Check-out" },
  Forgot_CheckIn: { icon: "login", color: "#F59E0B", dir: "IN", label: "Forgot Check-in" },
  Wrong_Time: { icon: "edit-calendar", color: "#2563EB", dir: "IN/OUT", label: "Wrong Time" },
  Work_Outside: { icon: "location-on", color: "#10B981", dir: "IN", label: "Work Outside" },
};

const DIR_COLORS = {
  IN: { bg: "#D1FAE5", text: "#059669" },
  OUT: { bg: "#FEE2E2", text: "#EF4444" },
  "IN/OUT": { bg: "#DBEAFE", text: "#2563EB" },
};

// TODO: fetch from API
const INITIAL_REQUESTS = [];

const TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function Timesheet({ navigation }) {
  const [tab, setTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const res = await correctionService.getRequests();
      if (res && res.data) {
        // Map backend to UI shape
        const mapped = res.data.map(r => {
          const d = new Date(r.date);
          const crt = new Date(r.createdAt || r.created_at || new Date());
          
          let timeStr = "";
          let computedDir = "IN";

          if (r.type === "Wrong_Time") {
              if (r.requested_check_in) {
                  computedDir = "IN";
                  timeStr = new Date(r.requested_check_in).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
              } else if (r.requested_check_out) {
                  computedDir = "OUT";
                  timeStr = new Date(r.requested_check_out).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
              }
          } else if (r.type === "Work_Outside") {
              computedDir = "IN/OUT";
              if (r.requested_check_in && r.requested_check_out) {
                  const start = new Date(r.requested_check_in).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  const end = new Date(r.requested_check_out).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
                  timeStr = `${start} - ${end}`;
              }
          } else {
             computedDir = TYPE_ICONS[r.type]?.dir || "IN";
             if (r.requested_check_in) {
                 timeStr = new Date(r.requested_check_in).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
             } else if (r.requested_check_out) {
                 timeStr = new Date(r.requested_check_out).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
             }
          }

          return {
            id: r.id.toString(),
            day: d.getDate(),
            month: d.getMonth(), 
            type: r.type, 
            typeLabel: TYPE_ICONS[r.type]?.label || r.type,
            reason: r.reason,
            status: r.status.toLowerCase(), 
            correctedTime: timeStr, 
            dir: computedDir,
            createdAt: crt.toLocaleDateString("en-GB")
          };
        });
        setRequests(mapped);
      }
    } catch (error) {
      console.log("Error loading corrections:", error);
    }
  };

  const filteredRequests = tab === "all"
    ? requests
    : requests.filter((r) => r.status === tab);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  const handleSubmit = async (data) => {
    if (loading) return;
    setLoading(true);
    try {
      // Assuming data from form is { date: "YYYY-MM-DD", type: "missed_checkout", correctedTime: "17:00", reason: "..." }
      // The old mock code had "DD/MM/YYYY" but API wants YYYY-MM-DD usually. Let's assume standard YYYY-MM-DD from a DatePicker
      // We'll normalize if needed below, but just pass raw for now.
      let dt = data.date;
      if (dt.includes("/")) {
          const p = dt.split("/");
          dt = `${p[2]}-${p[1]}-${p[0]}`;
      }
      
      const res = await correctionService.createRequest({
        date: dt,
        type: data.type,
        requested_check_in: data.requested_check_in,
        requested_check_out: data.requested_check_out,
        reason: data.reason
      });
      if (res && res.data) {
        setShowForm(false);
        loadData();
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {({ theme, isDark, insets, isWeb, webPadding }) => (
        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              isWeb && { paddingHorizontal: webPadding },
              { paddingBottom: Math.round(100 + insets.bottom) },
            ]}
          >
            <View style={styles.content}>
              {/* Banner */}
              <View style={[styles.banner, { backgroundColor: COLORS.primary }]}>
                <View style={styles.bannerRow}>
                  <View style={styles.bannerIconWrap}>
                    <MaterialIcons name="assignment" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text style={styles.bannerTitle}>
                      {pendingCount} pending
                    </Text>
                    <Text style={styles.bannerSub}>
                      correction request{pendingCount !== 1 ? "s" : ""} awaiting approval
                    </Text>
                  </View>
                </View>
              </View>

              {/* Status Tabs */}
              <View style={styles.tabsRow}>
                {TABS.map((t) => {
                  const active = tab === t.key;
                  return (
                    <TouchableOpacity
                      key={t.key}
                      style={[
                        styles.tab,
                        {
                          backgroundColor: active ? COLORS.primary : theme.card,
                          borderColor: active ? COLORS.primary : theme.navBorder,
                        },
                      ]}
                      activeOpacity={0.85}
                      onPress={() => setTab(t.key)}
                    >
                      <Text style={[styles.tabText, { color: active ? "#fff" : theme.sub }]}>
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Request List */}
              {filteredRequests.length > 0 ? (
                filteredRequests.map((req) => {
                  const sc = STATUS_COLORS[req.status];
                  const ti = TYPE_ICONS[req.type] || { icon: "help", color: "#6B7280" };
                  return (
                    <View
                      key={req.id}
                      style={[styles.requestCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}
                    >
                      <View style={styles.requestHeader}>
                        <View style={styles.requestDateRow}>
                          <View style={[styles.requestDateBadge, { backgroundColor: ti.color + "15" }]}>
                            <Text style={[styles.requestDateDay, { color: ti.color }]}>{req.day}</Text>
                            <Text style={[styles.requestDateMonth, { color: ti.color }]}>
                              {MONTH_SHORT[req.month]}
                            </Text>
                          </View>
                          <View>
                            <Text style={[styles.requestType, { color: theme.text }]}>
                              {req.typeLabel}
                            </Text>
                            <Text style={[styles.requestReason, { color: theme.sub }]} numberOfLines={1}>
                              {req.reason}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                          <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                        </View>
                      </View>

                      <View style={styles.requestDetailRow}>
                        <View style={[styles.requestDetailItem, { backgroundColor: theme.bg }]}>
                          <MaterialIcons name="schedule" size={14} color={COLORS.primary} />
                          <View>
                            <Text style={[styles.requestDetailLabel, { color: theme.sub }]}>Corrected</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              <Text style={[styles.requestDetailValue, { color: theme.text }]}>{req.correctedTime}</Text>
                              {(() => {
                                const dir = req.dir || ti.dir || "IN";
                                const dc = DIR_COLORS[dir] || DIR_COLORS["IN"];
                                return (
                                  <View style={{ backgroundColor: dc.bg, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                                    <Text style={{ fontSize: 9, fontWeight: "900", color: dc.text }}>{dir}</Text>
                                  </View>
                                );
                              })()}
                            </View>
                          </View>
                        </View>
                        <View style={[styles.requestDetailItem, { backgroundColor: theme.bg }]}>
                          <MaterialIcons name="event" size={14} color={theme.sub} />
                          <View>
                            <Text style={[styles.requestDetailLabel, { color: theme.sub }]}>Submitted</Text>
                            <Text style={[styles.requestDetailValue, { color: theme.text }]}>{req.createdAt}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={[styles.emptyCard, { borderColor: theme.navBorder }]}>
                  <MaterialIcons name="assignment-turned-in" size={36} color={theme.sub} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>
                    No requests
                  </Text>
                  <Text style={[styles.emptyDesc, { color: theme.sub }]}>
                    {tab === "all"
                      ? "Tap + to create a correction request"
                      : `No ${tab} requests found`}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* FAB */}
          <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.85}
            onPress={() => setShowForm(true)}
          >
            <MaterialIcons name="add" size={28} color="#fff" />
          </TouchableOpacity>

          {/* Form Modal */}
          <CorrectionForm
            visible={showForm}
            onClose={() => setShowForm(false)}
            onSubmit={handleSubmit}
            theme={theme}
          />
        </View>
      )}
    </Layout>
  );
}