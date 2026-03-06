import React from "react";
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

const AVATAR_URL = "https://i.pravatar.cc/200?img=12";

// Sample employee data (replace with API)
const EMPLOYEE = {
  name: "Nguyễn Văn A",
  role: "Software Developer",
  department: "Engineering",
  employeeId: "NV-20231045",
  email: "nguyenvana@company.com",
  phone: "0912 345 678",
  address: "12 Nguyễn Huệ, Quận 1, TP.HCM",
  startDate: "15/06/2023",
  position: "Main Office - Tầng 5",
};

const INFO_ITEMS = [
  { icon: "badge", label: "Mã nhân viên", value: EMPLOYEE.employeeId, color: COLORS.primary },
  { icon: "email", label: "Email", value: EMPLOYEE.email, color: "#2563EB" },
  { icon: "phone", label: "Số điện thoại", value: EMPLOYEE.phone, color: "#10B981" },
  { icon: "location-on", label: "Địa chỉ", value: EMPLOYEE.address, color: "#F59E0B" },
  { icon: "date-range", label: "Ngày bắt đầu", value: EMPLOYEE.startDate, color: "#EF4444" },
  { icon: "business", label: "Vị trí làm việc", value: EMPLOYEE.position, color: "#8B5CF6" },
];

const WORK_ITEMS = [
  { icon: "work", label: "Phòng ban", value: EMPLOYEE.department, color: "#0EA5E9" },
  { icon: "person", label: "Chức vụ", value: EMPLOYEE.role, color: "#EC4899" },
];

export default function Profile({ onLogout }) {
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
              {AVATAR_URL ? (
                <Image source={{ uri: AVATAR_URL }} style={s.avatar} />
              ) : (
                <View style={s.avatarFallback}>
                  <Text style={s.avatarInitial}>
                    {EMPLOYEE.name.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <Text style={s.userName}>{EMPLOYEE.name}</Text>
            <Text style={s.userRole}>{EMPLOYEE.role} • {EMPLOYEE.department}</Text>
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
