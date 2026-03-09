import React, { useState, useEffect } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import Layout from "../_components/layout/Layout";
import { overtimeStyles as styles } from "../_styles/pages/overtimeStyles";
import { COLORS } from "../_styles/theme";

import OvertimeSummary from "../_components/overtime/OvertimeSummary";
import StatusTabs from "../_components/overtime/StatusTabs";
import OvertimeList from "../_components/overtime/OvertimeList";
import OvertimeForm from "../_components/overtime/OvertimeForm";
import { overtimeService } from "../_utils/requestService";

export default function Overtime({ navigation }) {
  const [tab, setTab] = useState("all");
  const [otRequests, setOtRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await overtimeService.getRequests();
      if (res && res.data) {
        setOtRequests(res.data);
      }
    } catch (error) {
      console.log("Error loading OT requests:", error);
    }
  };

  const handleSubmitOT = async (data) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await overtimeService.createRequest({
        date: data.date,
        hours: data.hours,
        reason: data.reason
      });
      if (res && res.data) {
        setShowForm(false);
        loadData(); // Refresh list
      }
    } catch (error) {
      alert("Error creating OT request: " + error.message);
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
                <OvertimeSummary styles={styles} theme={theme} />

                <StatusTabs
                  styles={styles}
                  theme={theme}
                  value={tab}
                  onChange={setTab}
                />

                <OvertimeList
                  styles={styles}
                  theme={theme}
                  items={otRequests}
                />
              </View>
            </ScrollView>

            {/* FAB to open OT form */}
            <TouchableOpacity
              style={[localS.fabWrap, { bottom: fabBottom }]}
              activeOpacity={0.9}
              onPress={() => setShowForm(true)}
            >
              <View style={[localS.fab, { backgroundColor: COLORS.primary }]}>
                <MaterialIcons name="add" size={30} color="#fff" />
              </View>
            </TouchableOpacity>

            <OvertimeForm
              visible={showForm}
              onClose={() => setShowForm(false)}
              onSubmit={handleSubmitOT}
              theme={theme}
            />
          </>
        );
      }}
    </Layout>
  );
}

const localS = StyleSheet.create({
  fabWrap: {
    position: "absolute",
    right: 18,
    zIndex: 50,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
});