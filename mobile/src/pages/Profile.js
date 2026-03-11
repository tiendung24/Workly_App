import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import DatePickerInput from "../_components/shared/DatePickerInput";
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
  manager: "—",
  avatarUrl: null,
};

function getInfoItems(emp) {
  return [
    { icon: "badge", label: "Employee ID", value: emp.employeeId, color: COLORS.primary },
    { icon: "email", label: "Email", value: emp.email, color: "#2563EB" },
    { icon: "phone", label: "Phone", value: emp.phone, color: "#10B981" },
    { icon: "location-on", label: "Address", value: emp.address, color: "#F59E0B" },
    { icon: "date-range", label: "Start Date", value: emp.startDate, color: "#EF4444" },
    { icon: "business", label: "Position", value: emp.position, color: "#8B5CF6" },
  ];
}

function getWorkItems(emp) {
  return [
    { icon: "work", label: "Department", value: emp.department, color: "#0EA5E9" },
    { icon: "person", label: "Role", value: emp.role, color: "#EC4899" },
    { icon: "supervisor-account", label: "Line Manager", value: emp.manager, color: "#F97316" },
  ];
}

export default function Profile({ onLogout, avatarUrl }) {
  const [employeeData, setEmployeeData] = useState(null);
  
  // Edit logic
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editFullName, setEditFullName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editPos, setEditPos] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  // Password logic
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [isChangingPass, setIsChangingPass] = useState(false);

  const mockTheme = { bg: "#FAFAFA", card: "#fff", text: "#1F2937", sub: "#9CA3AF", navBorder: "#E5E7EB" };


  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

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
    role: employeeData.role || "—",
    department: employeeData.department ? employeeData.department.name : "—",
    employeeId: employeeData.employee_code || "—",
    email: employeeData.email || "—",
    phone: employeeData.phone || "—",
    address: employeeData.address || "—",
    startDate: employeeData.start_date ? new Date(employeeData.start_date).toLocaleDateString("en-GB") : "—",
    position: employeeData.position ? employeeData.position.name : "—",
    manager: employeeData.manager ? employeeData.manager.full_name : "—",
    avatarUrl: employeeData.avatar_url || null,
  } : DEFAULT_EMPLOYEE;
  const INFO_ITEMS = getInfoItems(emp);
  const WORK_ITEMS = getWorkItems(emp);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const payload = {};
      if (editPhone !== employeeData?.phone) payload.phone = editPhone;
      if (editAddress !== employeeData?.address) payload.address = editAddress;
      if (editAvatar !== (employeeData?.avatar_url || "")) payload.avatar_url = editAvatar;
      if (editFullName !== employeeData?.full_name) payload.full_name = editFullName;
      if (editCode !== employeeData?.employee_code) payload.employee_code = editCode;
      if (editEmail !== employeeData?.email) payload.email = editEmail;
      if (editDept !== (employeeData?.department?.name || "")) payload.department_name = editDept;
      if (editPos !== (employeeData?.position?.name || "")) payload.position_name = editPos;
      
      const oldStartDate = employeeData?.start_date ? new Date(employeeData.start_date).toLocaleDateString("en-GB") : "";
      if (editStartDate !== oldStartDate) {
        payload.start_date = editStartDate ? editStartDate.split("/").reverse().join("-") : "";
      }

      if (Object.keys(payload).length > 0) {
        const res = await profileService.updateMe(payload);
        Toast.show({ type: "success", text1: "Success", text2: "Profile updated successfully" });
        loadProfile(); // reload data
      }
      setShowEditModal(false);
    } catch (err) {
      console.log("Save error", err);
      Toast.show({ type: "error", text1: "Error", text2: "Failed to update profile" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      return Toast.show({ type: "error", text1: "Error", text2: "Please fill all fields" });
    }
    if (newPass !== confirmPass) {
      return Toast.show({ type: "error", text1: "Error", text2: "Passwords do not match" });
    }

    setIsChangingPass(true);
    try {
      await profileService.changePassword({ oldPassword: oldPass, newPassword: newPass });
      Toast.show({ type: "success", text1: "Success", text2: "Password changed successfully" });
      setShowPasswordModal(false);
      setOldPass("");
      setNewPass("");
      setConfirmPass("");
    } catch (err) {
      console.log("Change password error", err);
      const msg = err.response?.data?.message || "Cannot change password";
      Toast.show({ type: "error", text1: "Error", text2: msg });
    } finally {
      setIsChangingPass(false);
    }
  };

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
              {emp.avatarUrl ? (
                <Image source={{ uri: emp.avatarUrl }} style={s.avatar} />
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
            <TouchableOpacity 
              style={s.editBtn} 
              activeOpacity={0.8}
              onPress={() => {
                setEditFullName(employeeData?.full_name || "");
                setEditCode(employeeData?.employee_code || "");
                setEditEmail(employeeData?.email || "");
                setEditDept(employeeData?.department?.name || "");
                setEditPos(employeeData?.position?.name || "");
                setEditStartDate(employeeData?.start_date ? new Date(employeeData.start_date).toLocaleDateString("en-GB") : "");
                setEditPhone(employeeData?.phone || "");
                setEditAddress(employeeData?.address || "");
                setEditAvatar(employeeData?.avatar_url || "");
                setShowEditModal(true);
              }}
            >
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
                { icon: "lock", label: "Change Password", color: "#6B7280", onPress: () => setShowPasswordModal(true) },
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
                  onPress={item.onPress}
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
              <Text style={[s.logoutText, { color: "#EF4444" }]}>Log Out</Text>
            </TouchableOpacity>
          )}

          {/* ─── Edit Modal ─── */}
          <Modal
            visible={showEditModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowEditModal(false)}
          >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
              <View style={{ width: "90%", maxHeight: "85%", backgroundColor: theme.card, borderRadius: 16, padding: 20, elevation: 5 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Edit Profile</Text>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                  {/* Full Name */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Full Name</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                    <MaterialIcons name="person" size={18} color={theme.sub} />
                    <TextInput style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }} value={editFullName} onChangeText={setEditFullName} placeholder="Enter full name" placeholderTextColor={theme.sub} />
                  </View>

                  {/* Employee Code */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Employee ID</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                    <MaterialIcons name="badge" size={18} color={theme.sub} />
                    <TextInput style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }} value={editCode} onChangeText={setEditCode} placeholder="EMP001" placeholderTextColor={theme.sub} />
                  </View>

                  {/* Email */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Email</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                    <MaterialIcons name="email" size={18} color={theme.sub} />
                    <TextInput style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" placeholder="email@ext.com" placeholderTextColor={theme.sub} />
                  </View>

                  {/* Department */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Department</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                    <MaterialIcons name="work" size={18} color={theme.sub} />
                    <TextInput style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }} value={editDept} onChangeText={setEditDept} placeholder="Enter department" placeholderTextColor={theme.sub} />
                  </View>

                  {/* Position */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Position</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                    <MaterialIcons name="business" size={18} color={theme.sub} />
                    <TextInput style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }} value={editPos} onChangeText={setEditPos} placeholder="Enter position" placeholderTextColor={theme.sub} />
                  </View>

                  {/* Start Date */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Start Date</Text>
                  <View style={{ marginBottom: 12 }}>
                    <DatePickerInput value={editStartDate} onChangeText={setEditStartDate} placeholder="DD/MM/YYYY" theme={mockTheme} />
                  </View>

                  {/* Phone */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Phone Number</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                    <MaterialIcons name="phone" size={18} color={theme.sub} />
                    <TextInput
                      style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }}
                      value={editPhone}
                      onChangeText={setEditPhone}
                      keyboardType="phone-pad"
                      placeholder="09xx xxx xxx"
                      placeholderTextColor={theme.sub}
                    />
                  </View>

                  {/* Address */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Address</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 12 }}>
                    <MaterialIcons name="location-pin" size={18} color={theme.sub} />
                    <TextInput
                      style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }}
                      value={editAddress}
                      onChangeText={setEditAddress}
                      placeholder="Enter address"
                      placeholderTextColor={theme.sub}
                    />
                  </View>

                  {/* Avatar URL */}
                  <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Avatar URL</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 }}>
                    <MaterialIcons name="image" size={18} color={theme.sub} />
                    <TextInput
                      style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }}
                      value={editAvatar}
                      onChangeText={setEditAvatar}
                      placeholder="https://..."
                      placeholderTextColor={theme.sub}
                      autoCapitalize="none"
                    />
                  </View>
                </ScrollView>

                <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                  <TouchableOpacity 
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.navBorder, alignItems: "center" }}
                    onPress={() => setShowEditModal(false)}
                  >
                    <Text style={{ fontWeight: "600", color: theme.text }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                    onPress={handleSaveProfile}
                    disabled={isSaving}
                  >
                    {isSaving && <ActivityIndicator size="small" color="#fff" />}
                    <Text style={{ fontWeight: "600", color: "#fff" }}>Save</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </Modal>

          {/* ─── Change Password Modal ─── */}
          <Modal
            visible={showPasswordModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowPasswordModal(false)}
          >
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
              <View style={{ width: "85%", backgroundColor: theme.card, borderRadius: 16, padding: 24, elevation: 5 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text, marginBottom: 16 }}>Change Password</Text>
                
                <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Current Password</Text>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 }}>
                  <MaterialIcons name="lock" size={18} color={theme.sub} />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }}
                    value={oldPass}
                    onChangeText={setOldPass}
                    placeholder="Enter current password"
                    placeholderTextColor={theme.sub}
                    secureTextEntry
                  />
                </View>

                <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>New Password</Text>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 16 }}>
                  <MaterialIcons name="lock-outline" size={18} color={theme.sub} />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }}
                    value={newPass}
                    onChangeText={setNewPass}
                    placeholder="Enter new password"
                    placeholderTextColor={theme.sub}
                    secureTextEntry
                  />
                </View>

                <Text style={{ fontSize: 13, fontWeight: "600", color: theme.text, marginBottom: 6 }}>Confirm Password</Text>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 24 }}>
                  <MaterialIcons name="lock-outline" size={18} color={theme.sub} />
                  <TextInput
                    style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: theme.text, fontSize: 14 }}
                    value={confirmPass}
                    onChangeText={setConfirmPass}
                    placeholder="Re-enter new password"
                    placeholderTextColor={theme.sub}
                    secureTextEntry
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TouchableOpacity 
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: theme.navBorder, alignItems: "center" }}
                    onPress={() => setShowPasswordModal(false)}
                  >
                    <Text style={{ fontWeight: "600", color: theme.text }}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                    onPress={handleChangePassword}
                    disabled={isChangingPass}
                  >
                    {isChangingPass && <ActivityIndicator size="small" color="#fff" />}
                    <Text style={{ fontWeight: "600", color: "#fff" }}>Save</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </View>
          </Modal>

        </ScrollView>
      )}
    </Layout>
  );
}
