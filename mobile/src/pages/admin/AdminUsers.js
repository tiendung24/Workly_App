import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../../_components/layout/Layout";
import { adminStyles as s } from "../../_styles/pages/adminStyles";
import { COLORS } from "../../_styles/theme";
import { adminService } from "../../_utils/adminService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      if (res.data) setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    if (role === "Admin") return "#EF4444";
    if (role === "Manager") return "#F59E0B";
    return "#3B82F6";
  };

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
          <View style={[s.row, { borderBottomWidth: 0, marginBottom: 12 }]}>
            <Text style={[s.title, { color: theme.text, marginBottom: 0 }]}>Danh sách Nhân Sự</Text>
            <TouchableOpacity style={s.btn} activeOpacity={0.8} onPress={() => alert("Mở form thêm mới")}>
              <Text style={s.btnText}>+ Thêm Mới</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
             <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={[s.card, { backgroundColor: theme.card, padding: 0, overflow: 'hidden' }]}>
              {users.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    s.row,
                    { paddingHorizontal: 16, paddingVertical: 14, borderBottomColor: theme.navBorder },
                    index === users.length - 1 && { borderBottomWidth: 0 },
                    !item.is_active && { opacity: 0.5 }
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[s.rowTitle, { color: theme.text }]}>
                      {item.full_name} <Text style={{ fontSize: 13, color: theme.sub, fontWeight: 'normal' }}>({item.employee_code})</Text>
                    </Text>
                    <Text style={[s.rowSubtitle, { color: theme.sub }]}>
                      {item.department ? item.department.name : "Chưa có phòng ban"} • {item.position ? item.position.name : "Chưa có chức vụ"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", marginLeft: 10 }}>
                     <View style={[s.badge, { backgroundColor: getRoleColor(item.role) + "20" }]}>
                       <Text style={[s.badgeText, { color: getRoleColor(item.role) }]}>{item.role}</Text>
                     </View>
                     <Text style={{ fontSize: 12, color: theme.sub, marginTop: 4 }}>
                       {item.is_active ? "Hoạt động" : "Đã khóa"}
                     </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </Layout>
  );
}
