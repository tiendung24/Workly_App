import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../../_components/layout/Layout";
import { adminStyles as s } from "../../_styles/pages/adminStyles";
import { COLORS } from "../../_styles/theme";
import { adminService } from "../../_utils/adminService";
import Toast from "react-native-toast-message";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    employee_code: "",
    full_name: "",
    email: "",
    password: "",
    department_name: "",
    position_name: "",
    role: "Employee",
    manager_id: null,
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, dRes] = await Promise.all([
        adminService.getUsers(),
        adminService.getDepartments()
      ]);
      if (uRes.data) setUsers(uRes.data);
      if (dRes.data) setDepts(dRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (user = null) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        employee_code: user.employee_code,
        full_name: user.full_name,
        email: user.email,
        password: "", // leave blank if editing
        department_name: user.department?.name || "",
        position_name: user.position?.name || "",
        role: user.role,
        manager_id: user.manager_id || null,
        is_active: user.is_active,
      });
    } else {
      setEditingId(null);
      setFormData({
        employee_code: "",
        full_name: "",
        email: "",
        password: "",
        department_name: "",
        position_name: "",
        role: "Employee",
        manager_id: null,
        is_active: true,
      });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.employee_code || !formData.full_name || !formData.email) {
        Toast.show({ type: "error", text1: "Lỗi", text2: "Vui lòng nhập đủ thông tin bắt buộc" });
        return;
      }
      const payload = { ...formData };

      if (editingId) {
        await adminService.updateUser(editingId, payload);
        Toast.show({ type: "success", text1: "Thành công", text2: "Cập nhật nhân viên thành công" });
      } else {
        await adminService.createUser(payload);
        Toast.show({ type: "success", text1: "Thành công", text2: "Tạo nhân viên thành công" });
      }
      setModalVisible(false);
      loadData();
    } catch (error) {
      Toast.show({ type: "error", text1: "Lỗi", text2: error.response?.data?.message || "Có lỗi xảy ra" });
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
            <TouchableOpacity style={s.btn} activeOpacity={0.8} onPress={() => handleOpenForm()}>
              <Text style={s.btnText}>+ Thêm Mới</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
             <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={[s.card, { backgroundColor: theme.card, padding: 0, overflow: 'hidden' }]}>
              {users.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.7}
                  onPress={() => handleOpenForm(item)}
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
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Form Modal */}
          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }]}>
               <View style={[{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' }]}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>
                      {editingId ? "Sửa Nhân Viên" : "Thêm Nhân Viên"}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={24} color={theme.sub} />
                    </TouchableOpacity>
                 </View>

                 <ScrollView style={{ marginBottom: 20 }}>
                    <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Mã NV (*)</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="VD: NV001" placeholderTextColor={theme.sub} value={formData.employee_code} onChangeText={t => setFormData({...formData, employee_code: t})} />

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Họ Tên (*)</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="Nguyễn Văn A" placeholderTextColor={theme.sub} value={formData.full_name} onChangeText={t => setFormData({...formData, full_name: t})} />

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Email (*)</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="a@workly.com" placeholderTextColor={theme.sub} keyboardType="email-address" value={formData.email} onChangeText={t => setFormData({...formData, email: t})} />

                    {!editingId && (
                      <>
                        <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Mật khẩu (*)</Text>
                        <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="123456" placeholderTextColor={theme.sub} secureTextEntry value={formData.password} onChangeText={t => setFormData({...formData, password: t})} />
                      </>
                    )}

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Phòng Ban (Tuỳ chọn)</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="VD: IT Department" placeholderTextColor={theme.sub} value={formData.department_name} onChangeText={t => setFormData({...formData, department_name: t})} />

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Vị trí làm việc (Tuỳ chọn)</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="VD: Developer" placeholderTextColor={theme.sub} value={formData.position_name} onChangeText={t => setFormData({...formData, position_name: t})} />

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Vai trò (Role)</Text>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {['Employee', 'Manager', 'Admin'].map(r => (
                          <TouchableOpacity key={r} style={[s.badge, { backgroundColor: formData.role === r ? getRoleColor(r) : theme.bg, borderWidth: formData.role === r ? 0 : 1, borderColor: theme.navBorder }]} onPress={() => setFormData({...formData, role: r})}>
                             <Text style={{ color: formData.role === r ? '#fff' : theme.text, fontWeight: 'bold' }}>{r}</Text>
                          </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Quản lý trực tiếp (Tuỳ chọn)</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', paddingBottom: 5 }}>
                        <TouchableOpacity
                          style={[s.badge, { backgroundColor: formData.manager_id === null ? COLORS.primary : theme.bg, borderWidth: formData.manager_id === null ? 0 : 1, borderColor: theme.navBorder, marginRight: 8 }]}
                          onPress={() => setFormData({...formData, manager_id: null})}
                        >
                           <Text style={{ color: formData.manager_id === null ? '#fff' : theme.text, fontWeight: 'bold' }}>Không có</Text>
                        </TouchableOpacity>
                        {users.filter(u => u.role === 'Manager').map(m => (
                          <TouchableOpacity
                            key={m.id}
                            style={[s.badge, { backgroundColor: formData.manager_id === m.id ? COLORS.primary : theme.bg, borderWidth: formData.manager_id === m.id ? 0 : 1, borderColor: theme.navBorder, marginRight: 8 }]}
                            onPress={() => setFormData({...formData, manager_id: m.id})}
                          >
                             <Text style={{ color: formData.manager_id === m.id ? '#fff' : theme.text, fontWeight: 'bold' }}>{m.full_name}</Text>
                          </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {editingId && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
                        <Text style={{ color: theme.text, fontWeight: 'bold' }}>Tài khoản Đang hoạt động</Text>
                        <Switch value={formData.is_active} onValueChange={v => setFormData({...formData, is_active: v})} trackColor={{ false: "#767577", true: COLORS.primary }} />
                      </View>
                    )}
                 </ScrollView>

                 <TouchableOpacity style={[s.btn, { paddingVertical: 14 }]} onPress={handleSave}>
                    <Text style={s.btnText}>Lưu Thông Tin</Text>
                 </TouchableOpacity>
               </View>
            </View>
          </Modal>

        </ScrollView>
      )}
    </Layout>
  );
}
