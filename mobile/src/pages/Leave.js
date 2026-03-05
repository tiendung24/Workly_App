import React, { useState } from "react";
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

export default function Leave({ navigation }) {
  const [tab, setTab] = useState("all");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const handleSubmitLeave = (data) => {
    const newRequest = {
      id: Date.now().toString(),
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    setLeaveRequests((prev) => [newRequest, ...prev]);
    setShowForm(false);
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
                <LeaveBalance styles={styles} theme={theme} monthlyBalance={12} />

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
