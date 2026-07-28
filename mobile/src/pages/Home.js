import React, { useEffect, useMemo, useState, useContext, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  ScrollView,
  useWindowDimensions,
  Text,
  TouchableOpacity,
  Modal
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';

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
  const [hasInsuranceDebt, setHasInsuranceDebt] = useState(false);
  const [officeAddress, setOfficeAddress] = useState("Văn phòng Cầu Giấy, Hà Nội");
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
      loadInsuranceStatus();
      loadOfficeAddress();
    }, [])
  );

  const loadOfficeAddress = async () => {
    try {
      const res = await apiGet('/metadata/office');
      if (res && res.data) {
        setOfficeAddress(res.data);
      }
    } catch (error) {
      console.log("Error loading office address", error);
    }
  };

  const loadInsuranceStatus = async () => {
    try {
      const res = await apiGet('/insurance/my-status');
      if (res && res.currentRecord) {
         setHasInsuranceDebt(res.currentRecord.status === 'Unpaid');
      }
    } catch(e) {
      console.log("Error loading insurance status", e);
    }
  };

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
      // 1. Request Permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({ type: 'error', text1: 'Permission Denied', text2: 'Location permission is required to check in/out.' });
        setLoadingAction(false);
        return;
      }

      // 2. Get Location
      const location = await Location.getCurrentPositionAsync({});
      const coords = location.coords;
      const isMocked = location.mocked || false;
      
      const payload = {
         latitude: coords.latitude,
         longitude: coords.longitude,
         accuracy: coords.accuracy,
         isMocked: isMocked
      };

      if (type === "IN") {
        await attendanceService.checkIn(payload);
        Toast.show({ type: 'success', text1: 'Success', text2: 'Checked in successfully!' });
      } else if (type === "OUT") {
        await attendanceService.checkOut(payload);
        Toast.show({ type: 'success', text1: 'Success', text2: 'Checked out successfully!' });
      }
      await loadTodayStatus();
    } catch (error) {
      setErrorMessage(error.message || 'An error occurred');
      setErrorModalVisible(true);
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
    } else if (key === "insurance") {
      navigation.navigate("InsuranceDetail");
    } else if (key === "payroll") {
      if (role === "admin" || role === "accountant") {
        navigation.navigate("Admin", { screen: "AdminPayrollScreen" });
      } else {
        navigation.navigate("Payroll");
      }
    }
  };

  return (
    <>
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
              <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
                 <MaterialIcons name="location-on" size={20} color={theme.primary} />
                 <Text style={{ color: theme.text, marginLeft: 8, fontSize: 13, flex: 1 }}>{officeAddress}</Text>
              </View>

              <SummaryCards styles={styles} theme={theme} {...(dashboardData || {})} />
              <View style={{ marginTop: 12 }}>
                <QuickActionsGrid
                  styles={styles}
                  theme={theme}
                  isDark={isDark}
                  actions={actions}
                  badges={{ insurance: hasInsuranceDebt }}
                  onPressAction={onPressAction}
                />
              </View>

              {/* Salary Bar */}
              {dashboardData && (
                <TouchableOpacity activeOpacity={0.8} style={{ marginTop: 24, marginBottom: 16 }} onPress={() => navigation.navigate("Payroll")}>
                  <View
                    style={{
                      padding: 16,
                      borderRadius: 16,
                      backgroundColor: theme.card,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderWidth: 1.5,
                      borderColor: '#cda8e6', // light purple border
                      shadowColor: '#cda8e6',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      elevation: 3,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ backgroundColor: '#f5eef8', padding: 12, borderRadius: 12, marginRight: 16 }}>
                        <MaterialIcons name="account-balance-wallet" size={26} color="#9b59b6" />
                      </View>
                      <View>
                        <Text style={{ color: theme.sub, fontSize: 13, fontWeight: '600', marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                          Current Base Salary
                        </Text>
                        <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>
                          {Number(dashboardData.baseSalary || 0).toLocaleString('en-US')} VND
                        </Text>
                      </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={28} color="#bdc3c7" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </Layout>

    {/* Custom Error Modal */}
    <Modal
      transparent={true}
      visible={errorModalVisible}
      animationType="fade"
      onRequestClose={() => setErrorModalVisible(false)}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 }}>
          <View style={{ backgroundColor: '#FEE2E2', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
             <MaterialIcons name="error-outline" size={32} color="#EF4444" />
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, textAlign: 'center' }}>Check-in Failed</Text>
          <Text style={{ fontSize: 15, color: '#4B5563', textAlign: 'center', marginBottom: 24, lineHeight: 22 }}>
            {errorMessage}
          </Text>
          <TouchableOpacity 
            style={{ backgroundColor: '#EF4444', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, width: '100%', alignItems: 'center' }}
            onPress={() => setErrorModalVisible(false)}
            activeOpacity={0.8}
          >
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>I Understand</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}
