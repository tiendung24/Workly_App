import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../_styles/theme";
import { profileStyles as s } from "../_styles/pages/profileStyles";
import Layout from "../_components/layout/Layout";
import { LinearGradient } from "expo-linear-gradient";
import { profileService } from "../_utils/profileService";

// TODO: pass employee data from API via props
const DEFAULT_EMPLOYEE = {
  name: "—",
  role: "—",
  department: "—",
  employeeId: "—",
  email: "—",
  phone: "—",
  address: "—",
  startDate: "—",
  position: "—",
};

function getInfoItems(emp) {
  return [
    { icon: "badge", label: "Mã nhân viên", value: emp.employeeId, color: COLORS.primary },
    { icon: "email", label: "Email", value: emp.email, color: "#2563EB" },
    { icon: "phone", label: "Số điện thoại", value: emp.phone, color: "#10B981" },
    { icon: "location-on", label: "Địa chỉ", value: emp.address, color: "#F59E0B" },
    { icon: "date-range", label: "Ngày bắt đầu", value: emp.startDate, color: "#EF4444" },
    { icon: "business", label: "Vị trí làm việc", value: emp.position, color: "#8B5CF6" },
  ];
}

function getWorkItems(emp) {
  return [
    { icon: "work", label: "Phòng ban", value: emp.department, color: "#0EA5E9" },
    { icon: "person", label: "Chức vụ", value: emp.role, color: "#EC4899" },
  ];
}

export default function Profile({ onLogout, avatarUrl }) {
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await profileService.getMe();
      if (res && res.data) {
        setEmployeeData(res.data);
      }
    } catch (error) {
      console.log("Error loading profile:", error);
    }
  };

  const emp = employeeData ? {
    name: employeeData.full_name || "—",
    role: employeeData.position ? employeeData.position.name : "—",
    department: employeeData.department ? employeeData.department.name : "—",
    employeeId: employeeData.employee_code || "—",
    email: employeeData.email || "—",
    phone: employeeData.phone || "—",
    address: employeeData.address || "—",
    startDate: employeeData.start_date ? new Date(employeeData.start_date).toLocaleDateString("en-GB") : "—",
    position: employeeData.position ? employeeData.position.name : "—",
  } : DEFAULT_EMPLOYEE;
  const INFO_ITEMS = getInfoItems(emp);
  const WORK_ITEMS = getWorkItems(emp);

  return (
    <Layout>
      {({ theme, isDark, insets, isWeb, webPadding }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            s.scrollContent,
            isWeb && { paddingHorizontal: webPadding },
            { paddingBottom: Math.round(100 + insets.bottom) },
          ]}
        >
          {/* ─── Top: Avatar + Name ─── */}
          <LinearGradient
            colors={[COLORS.primary, "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.topSection}
          >
            <View style={s.avatarWrap}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={s.avatar} />
              ) : (
                <View style={s.avatarFallback}>
                  <Text style={s.avatarInitial}>
                    {emp.name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={s.userName}>{emp.name}</Text>
            <Text style={s.userRole}>{emp.role} • {emp.department}</Text>
            <TouchableOpacity style={s.editBtn} activeOpacity={0.8}>
              <MaterialIcons name="edit" size={14} color="#fff" />
              <Text style={s.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* ─── Personal Info ─── */}
          <View style={s.infoSection}>
            <View style={[s.infoCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
              <Text style={[s.infoTitle, { color: theme.text }]}>
                Personal Information
              </Text>
              {INFO_ITEMS.map((item, i) => (
                <View
                  key={item.label}
                  style={[
                    s.infoRow,
                    { borderBottomColor: theme.navBorder },
                    i === INFO_ITEMS.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={[s.infoIconWrap, { backgroundColor: item.color + "15" }]}>
                    <MaterialIcons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.infoLabel, { color: theme.sub }]}>{item.label}</Text>
                    <Text style={[s.infoValue, { color: theme.text }]}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ─── Work Info ─── */}
            <View style={[s.infoCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
              <Text style={[s.infoTitle, { color: theme.text }]}>
                Work Information
              </Text>
              {WORK_ITEMS.map((item, i) => (
                <View
                  key={item.label}
                  style={[
                    s.infoRow,
                    { borderBottomColor: theme.navBorder },
                    i === WORK_ITEMS.length - 1 && { borderBottomWidth: 0 },
                  ]}
                >
                  <View style={[s.infoIconWrap, { backgroundColor: item.color + "15" }]}>
                    <MaterialIcons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.infoLabel, { color: theme.sub }]}>{item.label}</Text>
                    <Text style={[s.infoValue, { color: theme.text }]}>{item.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ─── Settings ─── */}
            <View style={[s.infoCard, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
              <Text style={[s.infoTitle, { color: theme.text }]}>Settings</Text>

              {[
                { icon: "lock", label: "Change Password", color: "#6B7280" },
                { icon: "notifications", label: "Notifications", color: "#6B7280" },
                { icon: "language", label: "Language", color: "#6B7280" },
              ].map((item, i, arr) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    s.actionRow,
                    { borderBottomColor: theme.navBorder },
                    i === arr.length - 1 && { borderBottomWidth: 0 },
                  ]}
                  activeOpacity={0.7}
                >
                  <View style={s.actionLeft}>
                    <MaterialIcons name={item.icon} size={20} color={item.color} />
                    <Text style={[s.actionText, { color: theme.text }]}>{item.label}</Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={20} color={theme.sub} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ─── Logout ─── */}
          {onLogout && (
            <TouchableOpacity
              style={[s.logoutBtn, { borderColor: "#EF4444" }]}
              activeOpacity={0.85}
              onPress={onLogout}
            >
              <MaterialIcons name="logout" size={18} color="#EF4444" />
              <Text style={[s.logoutText, { color: "#EF4444" }]}>Đăng xuất</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </Layout>
  );
}
