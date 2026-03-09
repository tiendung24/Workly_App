import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

function NavBtn({ label, icon, active, onPress, isDark }) {
  const isActive = active === true;
  const activeColor = COLORS.primary;
  const inactive = isDark ? "#6B7280" : "#9CA3AF";
  const color = isActive ? activeColor : inactive;

  return (
    <TouchableOpacity style={s.navBtn} onPress={onPress} activeOpacity={0.85}>
      <MaterialIcons name={icon} size={22} color={color} />
      <Text style={[s.navLabel, { color }, isActive ? s.navLabelActive : s.navLabelInactive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function AdminBottomNav({
  theme,
  isDark,
  activeTab,
  onTabChange,
  bottomInset = 0,
}) {
  const safeBottomInset = typeof bottomInset === "number" ? bottomInset : 0;
  const bottomPadding = Math.round(18 + safeBottomInset);

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
        label="Dashboard"
        icon="admin-panel-settings"
        active={activeTab === "Admin"}
        onPress={() => onTabChange("Admin")}
        isDark={isDark}
      />

      <NavBtn
        label="Users"
        icon="people"
        active={activeTab === "AdminUsers"}
        onPress={() => onTabChange("AdminUsers")}
        isDark={isDark}
      />

      <NavBtn
        label="Account"
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
    paddingTop: 14,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  navBtn: { alignItems: "center", paddingHorizontal: 16 },
  navLabel: { fontSize: 11, marginTop: 4 },
  navLabelActive: { fontWeight: "900" },
  navLabelInactive: { fontWeight: "700" },
});
