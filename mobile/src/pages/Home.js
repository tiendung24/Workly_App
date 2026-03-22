import React, { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  ScrollView,
  useWindowDimensions,
} from "react-native";

import Layout from "../_components/layout/Layout";
import { homeStyles as styles } from "../_styles/pages/homeStyles";

import HeaderSection from "../_components/home/HeaderSection";
import SummaryCards from "../_components/home/SummaryCards";
import QuickActionsGrid from "../_components/home/QuickActionsGrid";

import { formatTime } from "../_utils/dateTime";
import { getQuickActions } from "../_utils/homeConfig";
import { attendanceService } from "../_utils/attendanceService";
import { AuthContext } from "../_utils/AuthContext";
import { apiGet } from "../_utils/api";
import Toast from "react-native-toast-message";

const AVATAR_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC9wDdMYNbAG8bXNx5s6yV54bWQGDsIGcCxECKR3QZJfPiyvn6T76EsoxFMhW0UQXOcLzI4AaqxlVB3woa56wWJ-nqu5pl1lgoN_4t1EGGtRbe5fL3vtT_x3ECGXEACuePPGpo8Byy7wT08g0oDqGptbtiPlzb_XoGv_Wa5TiJKHhV54vpMnqypJcjhmBalHDKEGsyWrBJY4PZ6K-IAwTf4XpBwepPqYS56AJ1Gz4cph66NOlMS1o4N4_56ZJPznmZIAIvT_wFUobXG";

function formatDateLabel(d) {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Home({ navigation }) {
  const { userInfo } = useContext(AuthContext);
  const role = userInfo?.role?.toLowerCase() || "employee";

  const [now, setNow] = useState(new Date());
  const [activeCheck, setActiveCheck] = useState(null); // 'IN' or 'OUT'
  const [attendanceLabel, setAttendanceLabel] = useState("Not Checked In");
  const [loadingAction, setLoadingAction] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  // Time ticker
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(t);
  }, []);

  // Fetch today status on mount/focus
  useFocusEffect(
    useCallback(() => {
      loadTodayStatus();
      loadDashboard();
    }, [])
  );

  const loadTodayStatus = async () => {
    try {
      const res = await attendanceService.getTodayStatus();
      if (res && res.attendance) {
        if (res.attendance.check_out_time) {
          setActiveCheck("OUT");
          setAttendanceLabel("Checked Out");
        } else if (res.attendance.check_in_time) {
          setActiveCheck("IN");
          setAttendanceLabel("Working");
        }
      } else {
        setActiveCheck(null);
        setAttendanceLabel("Not Checked In");
      }
    } catch (error) {
      console.log("Error loading today status", error);
    }
  };

  const loadDashboard = async () => {
    try {
      const res = await apiGet('/profile/dashboard');
      if (res && res.data) {
        setDashboardData(res.data);
      }
    } catch (error) {
      console.log("Error loading dashboard data", error);
    }
  };

  const handleChangeCheck = async (type) => {
    if (loadingAction) return;
    setLoadingAction(true);
    try {
      if (type === "IN") {
        await attendanceService.checkIn();
        Toast.show({ type: 'success', text1: 'Success', text2: 'Checked in successfully!' });
      } else if (type === "OUT") {
        await attendanceService.checkOut();
        Toast.show({ type: 'success', text1: 'Success', text2: 'Checked out successfully!' });
      }
      await loadTodayStatus();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error.message || 'An error occurred' });
    } finally {
      setLoadingAction(false);
    }
  };

  const time = formatTime(now);
  const actions = useMemo(() => getQuickActions(role), [role]);

  const statusLabel = "Status: " + attendanceLabel;

  const onPressAction = (key) => {
    if (key === "timesheet") {
      navigation.navigate("Timesheet");
    } else if (key === "leave") {
      navigation.navigate("Leave");
    } else if (key === "overtime") {
      navigation.navigate("Overtime");
    } else if (key === "schedule") {
      navigation.navigate("Schedule");
    }
  };

  return (
    <Layout>
      {({ theme, isDark, insets, isWeb, webPadding }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && { paddingHorizontal: webPadding },
            { paddingBottom: Math.round(60 + insets.bottom) },
          ]}
        >
          <HeaderSection
            styles={styles}
            theme={theme}
            insetsTop={0}
            avatarUrl={AVATAR_URL}
            userName={role === "employee" ? "Employee" : role}
            dateLabel={formatDateLabel(now)}
            time={time}
          
            statusLabel={statusLabel}
            activeCheck={activeCheck}
            onChangeCheck={handleChangeCheck}
          />

          <View style={styles.body}>
            <View
              style={[
                styles.mainContent,
                {
                  justifyContent: isWeb ? "center" : "flex-end",
                },
              ]}
            >
              <SummaryCards styles={styles} theme={theme} {...(dashboardData || {})} />
              <View style={{ marginTop: 12 }}>
                <QuickActionsGrid
                  styles={styles}
                  theme={theme}
                  isDark={isDark}
                  actions={actions}
                  onPressAction={onPressAction}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
    </Layout>
  );
}
