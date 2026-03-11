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

export default function AdminOrgs() {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [formType, setFormType] = useState('dept'); // 'dept' or 'pos'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dRes, pRes] = await Promise.all([
        adminService.getDepartments(),
        adminService.getPositions()
      ]);
      if (dRes.data) setDepartments(dRes.data);
      if (pRes.data) setPositions(pRes.data);
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
      setFormData({
        name: item.name,
        description: item.description || ""
      });
    } else {
      setEditingId(null);
      setFormData({ name: "", description: "" });
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.name) {
        Toast.show({ type: "error", text1: "Error", text2: "Name cannot be empty" });
        return;
      }

      if (formType === 'dept') {
          if (editingId) await adminService.updateDepartment(editingId, formData);
          else await adminService.createDepartment(formData);
      } else {
          if (editingId) await adminService.updatePosition(editingId, formData);
          else await adminService.createPosition(formData);
      }
      
      Toast.show({ type: "success", text1: "Success", text2: "Updated successfully" });
      setModalVisible(false);
      loadData();
    } catch (error) {
      Toast.show({ type: "error", text1: "Error", text2: error.response?.data?.message || "An error occurred" });
    }
  };

  const handleDelete = async (type, id) => {
      try {
          if (type === 'dept') await adminService.deleteDepartment(id);
          else await adminService.deletePosition(id);
          Toast.show({ type: "success", text1: "Success", text2: "Deleted successfully" });
          loadData();
      } catch (error) {
          Toast.show({ type: "error", text1: "Error", text2: error.response?.data?.message || "Delete failed" });
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
                {/* Departments Section */}
                <View style={[s.row, { borderBottomWidth: 0, marginBottom: 12, marginTop: 10 }]}>
                    <Text style={[s.title, { color: theme.text, marginBottom: 0 }]}>Departments</Text>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#3B82F6' }]} activeOpacity={0.8} onPress={() => handleOpenForm('dept')}>
                    <Text style={s.btnText}>+ Department</Text>
                    </TouchableOpacity>
                </View>
                <View style={[s.card, { backgroundColor: theme.card, padding: 0, overflow: 'hidden' }]}>
                    {departments.map((item, index) => (
                        <View key={item.id} style={[
                            s.row,
                            { paddingHorizontal: 16, paddingVertical: 14, borderBottomColor: theme.navBorder },
                            index === departments.length - 1 && { borderBottomWidth: 0 }
                        ]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.rowTitle, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[s.rowSubtitle, { color: theme.sub }]}>{item.description || "No description"}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity onPress={() => handleOpenForm('dept', item)}>
                                    <MaterialIcons name="edit" size={20} color={theme.sub} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete('dept', item.id)}>
                                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    {departments.length === 0 && (
                        <Text style={{ padding: 16, color: theme.sub, textAlign: 'center' }}>No departments found</Text>
                    )}
                </View>

                {/* Positions Section */}
                <View style={[s.row, { borderBottomWidth: 0, marginBottom: 12, marginTop: 20 }]}>
                    <Text style={[s.title, { color: theme.text, marginBottom: 0 }]}>Positions</Text>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#F59E0B' }]} activeOpacity={0.8} onPress={() => handleOpenForm('pos')}>
                    <Text style={s.btnText}>+ Position</Text>
                    </TouchableOpacity>
                </View>
                <View style={[s.card, { backgroundColor: theme.card, padding: 0, overflow: 'hidden' }]}>
                    {positions.map((item, index) => (
                        <View key={item.id} style={[
                            s.row,
                            { paddingHorizontal: 16, paddingVertical: 14, borderBottomColor: theme.navBorder },
                            index === positions.length - 1 && { borderBottomWidth: 0 }
                        ]}>
                            <View style={{ flex: 1 }}>
                                <Text style={[s.rowTitle, { color: theme.text }]}>{item.name}</Text>
                                <Text style={[s.rowSubtitle, { color: theme.sub }]}>{item.description || "No description"}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity onPress={() => handleOpenForm('pos', item)}>
                                    <MaterialIcons name="edit" size={20} color={theme.sub} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete('pos', item.id)}>
                                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    {positions.length === 0 && (
                        <Text style={{ padding: 16, color: theme.sub, textAlign: 'center' }}>No positions found</Text>
                    )}
                </View>
            </>
          )}

          {/* Form Modal */}
          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={[{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }]}>
               <View style={[{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' }]}>
                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>
                      {editingId ? "Edit" : "Add"} {formType === 'dept' ? 'Department' : 'Position'}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={24} color={theme.sub} />
                    </TouchableOpacity>
                 </View>

                 <ScrollView style={{ marginBottom: 20 }}>
                    <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Name (*)</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="Enter name..." placeholderTextColor={theme.sub} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Description</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text, minHeight: 80, textAlignVertical: 'top' }]} placeholder="Short description..." placeholderTextColor={theme.sub} multiline value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />
                 </ScrollView>

                 <TouchableOpacity style={[s.btn, { paddingVertical: 14 }]} onPress={handleSave}>
                    <Text style={s.btnText}>Save Changes</Text>
                 </TouchableOpacity>
               </View>
            </View>
          </Modal>

        </ScrollView>
      )}
    </Layout>
  );
}
