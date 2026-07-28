import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import ErrorModal from "../../_components/common/ErrorModal";

export default function AdminConfig() {
  const [shifts, setShifts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [officeConfig, setOfficeConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [formType, setFormType] = useState('shift'); // 'shift' or 'leave'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [sRes, lRes, cRes] = await Promise.all([
        adminService.getShifts(),
        adminService.getLeaveTypes(),
        adminService.getConfigs()
      ]);
      if (sRes.data) setShifts(sRes.data);
      if (lRes.data) setLeaves(lRes.data);
      if (cRes.data) setOfficeConfig(cRes.data);
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
      const val = formData.name?.trim();
      if (!val) {
        setErrorMessage("Name cannot be empty");
        setErrorModalVisible(true);
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
      
      Toast.show({ type: "success", text1: "Success", text2: "Updated successfully" });
      setModalVisible(false);
      loadData();
    } catch (error) {
      setErrorMessage(error.response?.data?.message || "An error occurred");
      setErrorModalVisible(true);
    }
  };

  const handleDelete = async (type, id) => {
      // Simplification: directly delete to save code lines
      try {
          if (type === 'shift') await adminService.deleteShift(id);
          else await adminService.deleteLeaveType(id);
          Toast.show({ type: "success", text1: "Success", text2: "Deleted successfully" });
          loadData();
      } catch (error) {
          setErrorMessage("Cannot delete linked data");
          setErrorModalVisible(true);
      }
  };

  const handleSaveOfficeConfig = async () => {
    try {
       await adminService.updateConfigs(officeConfig);
       Toast.show({ type: "success", text1: "Success", text2: "Office Location updated" });
       loadData();
    } catch(e) {
       setErrorMessage("Failed to update configs");
       setErrorModalVisible(true);
    }
  };

  return (
    <>
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
                {/* Office Config Section */}
                <View style={[s.row, { borderBottomWidth: 0, marginBottom: 12, marginTop: 10 }]}>
                    <Text style={[s.title, { color: theme.text, marginBottom: 0 }]}>Office Location Config</Text>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#3B82F6' }]} activeOpacity={0.8} onPress={handleSaveOfficeConfig}>
                       <Text style={s.btnText}>Save Location</Text>
                    </TouchableOpacity>
                </View>
                <View style={[s.card, { backgroundColor: theme.card, padding: 16 }]}>
                   <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Office Address</Text>
                   <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text, marginBottom: 10 }]} value={officeConfig.OFFICE_ADDRESS || ''} onChangeText={t => setOfficeConfig({...officeConfig, OFFICE_ADDRESS: t})} />
                   
                   <View style={{ flexDirection: 'row', gap: 10 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Latitude</Text>
                        <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} value={officeConfig.OFFICE_LATITUDE || ''} onChangeText={t => setOfficeConfig({...officeConfig, OFFICE_LATITUDE: t})} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Longitude</Text>
                        <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} value={officeConfig.OFFICE_LONGITUDE || ''} onChangeText={t => setOfficeConfig({...officeConfig, OFFICE_LONGITUDE: t})} />
                      </View>
                   </View>
                   <Text style={{ color: theme.text, marginTop: 10, marginBottom: 5, fontWeight: 'bold' }}>Radius (Meters)</Text>
                   <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} keyboardType="numeric" value={officeConfig.OFFICE_RADIUS_METERS || ''} onChangeText={t => setOfficeConfig({...officeConfig, OFFICE_RADIUS_METERS: t})} />
                </View>

                {/* Shifts Section */}
                <View style={[s.row, { borderBottomWidth: 0, marginBottom: 12, marginTop: 20 }]}>
                    <Text style={[s.title, { color: theme.text, marginBottom: 0 }]}>Work Shift Config</Text>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#10B981' }]} activeOpacity={0.8} onPress={() => handleOpenForm('shift')}>
                    <Text style={s.btnText}>+ Add Shift</Text>
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
                    <Text style={[s.title, { color: theme.text, marginBottom: 0 }]}>Leave Types Config</Text>
                    <TouchableOpacity style={[s.btn, { backgroundColor: '#8B5CF6' }]} activeOpacity={0.8} onPress={() => handleOpenForm('leave')}>
                    <Text style={s.btnText}>+ Add Leave Type</Text>
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
                                <Text style={[s.rowSubtitle, { color: theme.sub }]}>Default: {item.default_days} days / month • {item.description}</Text>
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
                      {editingId ? "Edit" : "Add"} {formType === 'shift' ? 'Shift' : 'Leave Type'}
                    </Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <MaterialIcons name="close" size={24} color={theme.sub} />
                    </TouchableOpacity>
                 </View>

                 <ScrollView style={{ marginBottom: 20 }}>
                    <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Name (*)</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="e.g. Morning Shift" placeholderTextColor={theme.sub} value={formData.name} onChangeText={t => setFormData({...formData, name: t})} />

                    <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Description</Text>
                    <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="Used for..." placeholderTextColor={theme.sub} value={formData.description} onChangeText={t => setFormData({...formData, description: t})} />

                    {formType === 'shift' ? (
                        <>
                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>Start Time (*)</Text>
                                    <TimePickerInput theme={theme} value={formData.start_time?.substring(0, 5)} onChangeText={t => setFormData({...formData, start_time: t.includes(':') && t.length === 5 ? t + ":00" : t})} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.text, marginBottom: 5, fontWeight: 'bold' }}>End Time (*)</Text>
                                    <TimePickerInput theme={theme} value={formData.end_time?.substring(0, 5)} onChangeText={t => setFormData({...formData, end_time: t.includes(':') && t.length === 5 ? t + ":00" : t})} />
                                </View>
                            </View>
                            <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Late Grace Period (Mins)</Text>
                            <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="15" placeholderTextColor={theme.sub} keyboardType="numeric" value={formData.grace_period_minutes} onChangeText={t => setFormData({...formData, grace_period_minutes: t})} />
                        </>
                    ) : (
                        <>
                            <Text style={{ color: theme.text, marginTop: 15, marginBottom: 5, fontWeight: 'bold' }}>Default leave days</Text>
                            <TextInput style={[s.input, { borderColor: theme.navBorder, color: theme.text }]} placeholder="12" placeholderTextColor={theme.sub} keyboardType="numeric" value={formData.default_days} onChangeText={t => setFormData({...formData, default_days: t})} />
                        </>
                    )}
                 </ScrollView>

                 <TouchableOpacity style={[s.btn, { paddingVertical: 14 }]} onPress={handleSave}>
                    <Text style={s.btnText}>Save Config</Text>
                 </TouchableOpacity>
               </View>
            </View>
          </Modal>

        </ScrollView>
      )}
    </Layout>
    <ErrorModal visible={errorModalVisible} errorMessage={errorMessage} onClose={() => setErrorModalVisible(false)} />
    </>
  );
}
