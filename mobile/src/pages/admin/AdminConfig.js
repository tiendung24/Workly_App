import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../../_components/layout/Layout";
import { adminStyles as s } from "../../_styles/pages/adminStyles";
import { COLORS } from "../../_styles/theme";
import { adminService } from "../../_utils/adminService";
import Toast from "react-native-toast-message";
import TimePickerInput from "../../_components/shared/TimePickerInput";

export default function AdminConfig() {
  const [shifts, setShifts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [formType, setFormType] = useState('shift'); // 'shift' or 'leave'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, lRes] = await Promise.all([
        adminService.getShifts(),
        adminService.getLeaveTypes()
      ]);
      if (sRes.data) setShifts(sRes.data);
      if (lRes.data) setLeaves(lRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (type, item = null) => {
    setFormType(type);
    if (item) {
      setEditingId(item.id);
      if (type === 'shift') {
        setFormData({
            name: item.name,
            start_time: item.start_time,
            end_time: item.end_time,
            grace_period_minutes: item.grace_period_minutes?.toString() || "0",
            description: item.description || ""
        });
      } else {
        setFormData({
            name: item.name,
            default_days: item.default_days?.toString() || "0",
            description: item.description || ""
        });
      }
    } else {
      setEditingId(null);
      if (type === 'shift') {
        setFormData({ name: "", start_time: "08:00:00", end_time: "17:00:00", grace_period_minutes: "15", description: "" });
      } else {
        setFormData({ name: "", default_days: "12", description: "" });
      }
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        Toast.show({ type: "error", text1: "Lỗi", text2: "Tên không được để trống" });
        return;
      }

      let payload = { ...formData };
      if (formType === 'shift') {
         payload.grace_period_minutes = parseInt(payload.grace_period_minutes) || 0;
      } else {
         payload.default_days = parseInt(payload.default_days) || 0;
      }

      if (formType === 'shift') {
          if (editingId) await adminService.updateShift(editingId, payload);
          else await adminService.createShift(payload);
      } else {
          if (editingId) await adminService.updateLeaveType(editingId, payload);
          else await adminService.createLeaveType(payload);
      }
      
      Toast.show({ type: "success", text1: "Thành công", text2: "Cập nhật thành công" });
      setModalVisible(false);
      loadData();
    } catch (error) {
      Toast.show({ type: "error", text1: "Lỗi", text2: error.response?.data?.message || "Có lỗi xảy ra" });
    }
  };

  const handleDelete = async (type, id) => {
      // Simplification: directly delete to save code lines
      try {
          if (type === 'shift') await adminService.deleteShift(id);
          else await adminService.deleteLeaveType(id);
          Toast.show({ type: "success", text1: "Thành công", text2: "Xoá thành công" });
          loadData();
      } catch (error) {
          Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể xoá vì đang có dữ liệu liên kết" });
      }
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
          {loading ? (
             <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <>
                {/* Shifts Section */}
                <View style={[s.row, { borderBottomWidth: 0, marginBottom: 12, marginTop: 10 }]}>
                    <Text style={[s.title, { color: theme.text, marginBottom: 0 }]}>Cấu Hình Ca Làm Việc</Text>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#10B981' }]} activeOpacity={0.8} onPress={() => handleOpenForm('shift')}>
                    <Text style={s.btnText}>+ Thêm Ca</Text>
                    </TouchableOpacity>
                </View>
                <View style={[s.card, { backgroundColor: theme.card, padding: 0, overflow: 'hidden' }]}>
                    {shifts.map((item, index) => (
                        <View key={item.id} style={[
                            s.row,
                            { paddingHorizontal: 16, paddingVertical: 14, borderBottomColor: theme.navBorder },
                            index === shifts.length - 1 && { borderBottomWidth: 0 }
                        ]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.rowTitle, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[s.rowSubtitle, { color: theme.sub }]}>{item.start_time} - {item.end_time} • {item.description}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity onPress={() => handleOpenForm('shift', item)}>
                                    <MaterialIcons name="edit" size={20} color={theme.sub} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete('shift', item.id)}>
                                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Leave Types Section */}
                <View style={[s.row, { borderBottomWidth: 0, marginBottom: 12, marginTop: 20 }]}>
                    <Text style={[s.title, { color: theme.text, marginBottom: 0 }]}>Cấu Hình Nghỉ Phép Tháng</Text>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#8B5CF6' }]} activeOpacity={0.8} onPress={() => handleOpenForm('leave')}>
                    <Text style={s.btnText}>+ Thêm Phép Tháng</Text>
                    </TouchableOpacity>
                </View>
                <View style={[s.card, { backgroundColor: theme.card, padding: 0, overflow: 'hidden' }]}>
                    {leaves.map((item, index) => (
                        <View key={item.id} style={[
                            s.row,
                            { paddingHorizontal: 16, paddingVertical: 14, borderBottomColor: theme.navBorder },
                            index === leaves.length - 1 && { borderBottomWidth: 0 }
                        ]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.rowTitle, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[s.rowSubtitle, { color: theme.sub }]}>Mặc định: {item.default_days} lần / tháng • {item.description}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity onPress={() => handleOpenForm('leave', item)}>
                                    <MaterialIcons name="edit" size={20} color={theme.sub} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete('leave', item.id)}>
                                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </>
          )}

          {/* Form Modal */}
          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }]}>
               <View style={[{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' }]}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>
                      {editingId ? "Sửa" : "Thêm"} {formType === 'shift' ? 'Ca Làm Việc' : 'Nghỉ Phép Tháng'}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={24} color={theme.sub} />
                    </TouchableOpacity>
                 </View>

                 <ScrollView style={{ marginBottom: 20 }}>
                    <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Tên (*)</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="VD: Ca Sáng" placeholderTextColor={theme.sub} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Mô tả bổ sung</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="Dành cho..." placeholderTextColor={theme.sub} value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />

                    {formType === 'shift' ? (
                        <>
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Giờ Vào (*)</Text>
                                    <TimePickerInput theme={theme} value={formData.start_time?.substring(0, 5)} onChangeText={t => setFormData({...formData, start_time: t.includes(':') && t.length === 5 ? t + ":00" : t})} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Giờ Ra (*)</Text>
                                    <TimePickerInput theme={theme} value={formData.end_time?.substring(0, 5)} onChangeText={t => setFormData({...formData, end_time: t.includes(':') && t.length === 5 ? t + ":00" : t})} />
                                </View>
                            </View>
                            <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Biên độ muộn (Phút)</Text>
                            <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="15" placeholderTextColor={theme.sub} keyboardType="numeric" value={formData.grace_period_minutes} onChangeText={t => setFormData({...formData, grace_period_minutes: t})} />
                        </>
                    ) : (
                        <>
                            <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Số lần nghỉ phép mặc định mỗi tháng</Text>
                            <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="12" placeholderTextColor={theme.sub} keyboardType="numeric" value={formData.default_days} onChangeText={t => setFormData({...formData, default_days: t})} />
                        </>
                    )}
                 </ScrollView>

                 <TouchableOpacity style={[s.btn, { paddingVertical: 14 }]} onPress={handleSave}>
                    <Text style={s.btnText}>Lưu Cấu Hình</Text>
                 </TouchableOpacity>
               </View>
            </View>
          </Modal>

        </ScrollView>
      )}
    </Layout>
  );
}
