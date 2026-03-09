import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
} from "react-native";

import Layout from "../_components/layout/Layout";
import { leaveStyles as styles } from "../_styles/pages/leaveStyles";

import LeaveBalance from "../_components/leave/LeaveBalance";
import StatusTabs from "../_components/leave/StatusTabs";
import LeaveList from "../_components/leave/LeaveList";
import FloatingAddButton from "../_components/leave/FloatingAddButton";
import LeaveForm from "../_components/leave/LeaveForm";
import { leaveService } from "../_utils/leaveService";

export default function Leave({ navigation }) {
  const [tab, setTab] = useState("all");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [balance, setBalance] = useState({ total_days: 0, used_days: 0, remaining_days: 0 });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balRes, reqsRes] = await Promise.all([
        leaveService.getBalance(),
        leaveService.getRequests()
      ]);
      if (balRes && balRes.data) {
        setBalance(balRes.data);
      }
      if (reqsRes && reqsRes.data) {
        setLeaveRequests(reqsRes.data);
      }
    } catch (error) {
      console.log("Error loading leave data:", error);
    }
  };

  const handleSubmitLeave = async (data) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await leaveService.createRequest({
        leave_type_id: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
        reason: data.reason
      });
      if (res.data) {
        setShowForm(false);
        loadData(); // Refresh list 
      }
    } catch (error) {
      alert("Error creating request: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      {({ theme, isDark, insets, isWeb, webPadding }) => {
        const fabBottom = Math.round(96 + insets.bottom);

        return (
          <>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={[
                styles.scrollContent,
                isWeb && { paddingHorizontal: webPadding },
                { paddingBottom: Math.round(84 + insets.bottom) },
              ]}
            >
              <View style={styles.content}>
                <LeaveBalance styles={styles} theme={theme} balance={balance} />

                <View style={styles.sectionRow}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>
                    Leave Requests
                  </Text>
                </View>

                <StatusTabs
                  styles={styles}
                  theme={theme}
                  value={tab}
                  onChange={setTab}
                />
                <LeaveList styles={styles} theme={theme} items={leaveRequests} />
              </View>
            </ScrollView>

            <FloatingAddButton
              styles={styles}
              bottomOffset={fabBottom}
              onPress={() => setShowForm(true)}
            />

            <LeaveForm
              visible={showForm}
              onClose={() => setShowForm(false)}
              onSubmit={handleSubmitLeave}
              theme={theme}
            />
          </>
        );
      }}
    </Layout>
  );
}
