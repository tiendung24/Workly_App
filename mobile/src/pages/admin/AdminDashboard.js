import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../../_components/layout/Layout";
import { adminStyles as s } from "../../_styles/pages/adminStyles";
import { COLORS } from "../../_styles/theme";
import { adminService } from "../../_utils/adminService";

export default function AdminDashboard({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    departments: 0,
    positions: 0,
    shifts: 0,
    leaves: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, dRes, pRes, sRes, lRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getDepartments(),
        adminService.getPositions(),
        adminService.getShifts(),
        adminService.getLeaveTypes(),
      ]);

      setStats({
        users: uRes.data?.length || 0,
        departments: dRes.data?.length || 0,
        positions: pRes.data?.length || 0,
        shifts: sRes.data?.length || 0,
        leaves: lRes.data?.length || 0,
      });
    } catch (error) {
      console.error("Error loading admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { id: "AdminUsers", label: "Quản lý nhân sự", icon: "people", count: stats.users, desc: "Tài khoản & Phân quyền" },
    { id: "AdminOrgs", label: "Phòng ban & Chức vụ", icon: "business", count: stats.departments + stats.positions, desc: "Cơ cấu tổ chức" },
    { id: "AdminTimesheet", label: "Báo cáo công mạng", icon: "assessment", count: null, desc: "Tính lương & Tổng hợp" },
    { id: "AdminConfig", label: "Cấu hình hệ thống", icon: "settings", count: stats.shifts + stats.leaves, desc: "Ca làm & Phép" },
  ];

  return (
    <Layout>
      {({ theme, isDark, insets, isWeb, webPadding }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.container,
            isWeb && { paddingHorizontal: webPadding },
            { paddingBottom: Math.round(100 + insets.bottom) },
          ]}
        >
          <Text style={[s.title, { color: theme.text }]}>Admin Panel</Text>

          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[s.card, { backgroundColor: theme.card }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (item.id === "AdminUsers") navigation.navigate("AdminUsersScreen");
                    else if (item.id === "AdminTimesheet") navigation.navigate("AdminTimesheetScreen");
                    else if (item.id === "AdminConfig") navigation.navigate("AdminConfigScreen");
                    else alert("Chức năng Cơ cấu tổ chức đang phát triển");
                  }}
                >
                  <View style={s.row}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <View style={{ backgroundColor: COLORS.primary + "1A", padding: 12, borderRadius: 12, marginRight: 16 }}>
                         <MaterialIcons name={item.icon} size={28} color={COLORS.primary} />
                      </View>
                      <View>
                        <Text style={[s.cardTitle, { color: theme.text, marginBottom: 2 }]}>{item.label}</Text>
                        <Text style={s.rowSubtitle}>{item.desc}</Text>
                      </View>
                    </View>
                    {item.count !== null && (
                       <Text style={s.cardValue}>{item.count}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </Layout>
  );
}
