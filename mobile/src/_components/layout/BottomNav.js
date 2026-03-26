import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

function NavBtn({ label, icon, active, onPress, isDark }) {
  const isActive = active === true; // explicit boolean coercion — fixes JSI type error
  const activeColor = COLORS.primary;
  const inactive = isDark ? "#6B7280" : "#9CA3AF";
  const color = isActive ? activeColor : inactive;

  return (
    <TouchableOpacity style={s.navBtn} onPress={onPress} activeOpacity={0.85}>
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={[s.navLabel, s.navLabelBase, { color }, isActive ? s.navLabelActive : s.navLabelInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function BottomNav({
  theme,
  isDark,
  activeTab,
  onTabChange,
  bottomInset = 0,
  userRole = 'Employee'
}) {
  const safeBottomInset = typeof bottomInset === "number" ? bottomInset : 0;
  const bottomPadding = Math.round(18 + safeBottomInset);

  const isRequests =
    activeTab === "Leave" ||
    activeTab === "Leave" ||
    activeTab === "Overtime";

  return (
    <View
      style={[
        s.bottomNav,
        {
          backgroundColor: theme.navGlass,
          borderTopColor: theme.navBorder,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      <NavBtn
        label="Home"
        icon="home"
        active={activeTab === "Home"}
        onPress={() => onTabChange("Home")}
        isDark={isDark}
      />

      <NavBtn
        label="Correction"
        icon="history"
        active={activeTab === "Timesheet"}
        onPress={() => onTabChange("Timesheet")}
        isDark={isDark}
      />

      {/* Center: Check (core) */}
      <View style={s.fabSlot}>
        <TouchableOpacity
          style={[s.fab, { backgroundColor: COLORS.primary, borderColor: theme.bg }]}
          activeOpacity={0.9}
          onPress={() => onTabChange("Check")}
        >
          <MaterialIcons name="fingerprint" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[s.navLabel, s.navLabelActive, { color: COLORS.primary, marginTop: -14 }]}>
          Check
        </Text>
      </View>

      <NavBtn
        label="Leave"
        icon="assignment"
        active={isRequests}
        onPress={() => onTabChange("Leave")}
        isDark={isDark}
      />

      {userRole === 'Manager' && (
        <NavBtn
          label="Manager"
          icon="supervisor-account"
          active={activeTab === "Approval"}
          onPress={() => onTabChange("Approval")}
          isDark={isDark}
        />
      )}

      {userRole === 'Admin' && (
        <NavBtn
          label="Admin"
          icon="admin-panel-settings"
          active={activeTab === "Admin"}
          onPress={() => onTabChange("Admin")}
          isDark={isDark}
        />
      )}

      <NavBtn
        label="Profile"
        icon="person"
        active={activeTab === "Profile"}
        onPress={() => onTabChange("Profile")}
        isDark={isDark}
      />
    </View>
  );
}

const s = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  navBtn: { flex: 1, alignItems: "center" },
  navLabelBase: { marginTop: 4 },
  navLabel: { fontSize: 10 },
  navLabelActive: { fontWeight: "900" },
  navLabelInactive: { fontWeight: "800" },
  fabSlot: { width: 70, alignItems: "center" },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    transform: [{ translateY: -22 }],
  },
});