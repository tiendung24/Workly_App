import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Modal, TextInput, Platform, Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import Layout from "../../_components/layout/Layout";
import { COLORS } from "../../_styles/theme";
import { apiGet, apiPost, apiPut } from "../../_utils/api";
import Toast from "react-native-toast-message";

export default function AdminPayroll({ navigation }) {
    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    // Edit Modal
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [formData, setFormData] = useState({ allowances: "0", deductions: "0", net_salary: "0" });

    useFocusEffect(
        useCallback(() => {
            loadData(month, year);
        }, [month, year])
    );

    const loadData = async (m, y) => {
        try {
            setLoading(true);
            const res = await apiGet(`/admin/payroll?month=${m}&year=${y}`);
            if (res && res.data) setPayrolls(res.data);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setLoading(true);
            await apiPost('/admin/payroll/generate', { month, year });
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã tự động tính lương xong' });
            loadData(month, year);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message });
            setLoading(false);
        }
    };

    const handleImportExcel = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'application/vnd.ms-excel'],
                copyToCacheDirectory: true
            });
            
            if (result.canceled) return;
            
            const file = result.assets[0];
            const formData = new FormData();
            formData.append('file', {
                uri: Platform.OS === 'web' ? file.uri : file.uri.replace('file://', ''),
                type: file.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                name: file.name
            });

            setLoading(true);
            await apiPost('/admin/payroll/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Import file lương thành công' });
            loadData(month, year);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi Import', text2: error.message });
            setLoading(false);
        }
    };

    const handlePublish = async () => {
        if (Platform.OS === 'web') {
            if (!window.confirm('Bạn có chắc chắn muốn công bố bảng lương tháng này cho toàn thể nhân viên?')) return;
        } else {
            Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn công bố bảng lương tháng này?', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Công bố', onPress: () => confirmPublish() }
            ]);
            return;
        }
        confirmPublish();
    };

    const confirmPublish = async () => {
        try {
            setLoading(true);
            await apiPost('/admin/payroll/publish', { month, year });
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã công bố lương cho nhân viên' });
            loadData(month, year);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message });
            setLoading(false);
        }
    };

    const openEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            allowances: String(record.allowances || 0),
            deductions: String(record.deductions || 0),
            net_salary: String(record.net_salary || 0)
        });
        setModalVisible(true);
    };

    const saveEdit = async () => {
        try {
            await apiPut(`/admin/payroll/${editingRecord.id}`, {
                allowances: parseFloat(formData.allowances),
                deductions: parseFloat(formData.deductions),
                net_salary: parseFloat(formData.net_salary),
                status: 'Draft' // Đưa về Draft nếu sửa đổi để phải Publish lại
            });
            Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã cập nhật lương' });
            setModalVisible(false);
            loadData(month, year);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi', text2: error.message });
        }
    };

    return (
        <Layout>
            {({ theme, isDark, insets, isWeb, webPadding }) => (
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 100, ...(isWeb ? { paddingHorizontal: webPadding } : {}) }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, flex: 1 }}>Quản lý Bảng Lương</Text>
                    </View>

                    {/* Filter & Actions */}
                    <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => { let m = month - 1; if(m<1){ m=12; setYear(year-1); } setMonth(m); }} style={{ padding: 8, backgroundColor: theme.bg, borderRadius: 8 }}>
                                    <MaterialIcons name="chevron-left" size={24} color={theme.text} />
                                </TouchableOpacity>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginHorizontal: 16 }}>Tháng {month}/{year}</Text>
                                <TouchableOpacity onPress={() => { let m = month + 1; if(m>12){ m=1; setYear(year+1); } setMonth(m); }} style={{ padding: 8, backgroundColor: theme.bg, borderRadius: 8 }}>
                                    <MaterialIcons name="chevron-right" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
                            <TouchableOpacity onPress={handleGenerate} style={{ flex: 1, minWidth: 100, backgroundColor: COLORS.primary, padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                <MaterialIcons name="auto-fix-high" size={20} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tự động chốt</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleImportExcel} style={{ flex: 1, minWidth: 100, backgroundColor: '#10B981', padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                <MaterialIcons name="upload-file" size={20} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Nhập Excel</Text>
                            </TouchableOpacity>
                        </View>
                        {payrolls.length > 0 && (
                            <TouchableOpacity onPress={handlePublish} style={{ width: '100%', marginTop: 12, backgroundColor: '#F59E0B', padding: 12, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}>
                                <MaterialIcons name="campaign" size={20} color="#fff" style={{ marginRight: 6 }} />
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Công bố Bảng Lương</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Payroll List */}
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                    ) : payrolls.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <MaterialIcons name="description" size={64} color={theme.sub} />
                            <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', marginTop: 12 }}>Chưa có dữ liệu</Text>
                            <Text style={{ color: theme.sub, marginTop: 4 }}>Nhấn "Tự động chốt" hoặc tải file Excel lên.</Text>
                        </View>
                    ) : (
                        <View style={{ backgroundColor: theme.card, borderRadius: 16, overflow: 'hidden' }}>
                            {payrolls.map((item, index) => (
                                <TouchableOpacity 
                                    key={item.id}
                                    onPress={() => openEdit(item)}
                                    style={{ flexDirection: 'row', padding: 16, borderBottomWidth: index === payrolls.length - 1 ? 0 : 1, borderBottomColor: theme.navBorder, alignItems: 'center' }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold' }}>{item.user?.full_name}</Text>
                                        <Text style={{ color: theme.sub, fontSize: 13 }}>Mã NV: {item.user?.employee_code}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                                        <Text style={{ color: COLORS.primary, fontSize: 16, fontWeight: 'bold' }}>{Number(item.net_salary).toLocaleString('en-US')} đ</Text>
                                        <Text style={{ color: item.status === 'Published' ? '#10B981' : '#F59E0B', fontSize: 12, fontWeight: 'bold' }}>
                                            {item.status === 'Published' ? 'Đã công bố' : 'Bản nháp'}
                                        </Text>
                                    </View>
                                    <MaterialIcons name="edit" size={20} color={theme.sub} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Edit Modal */}
                    <Modal visible={modalVisible} animationType="slide" transparent>
                        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
                            <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text }}>Chỉnh sửa - {editingRecord?.user?.full_name}</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <MaterialIcons name="close" size={24} color={theme.sub} />
                                    </TouchableOpacity>
                                </View>
                                
                                <Text style={{ color: theme.text, marginBottom: 8, fontWeight: 'bold' }}>Khoản cộng thêm (VND)</Text>
                                <TextInput 
                                    style={{ backgroundColor: theme.bg, color: theme.text, padding: 12, borderRadius: 12, marginBottom: 16 }} 
                                    keyboardType="numeric" 
                                    value={formData.allowances} 
                                    onChangeText={t => setFormData({...formData, allowances: t})} 
                                />

                                <Text style={{ color: theme.text, marginBottom: 8, fontWeight: 'bold' }}>Khấu trừ (VND)</Text>
                                <TextInput 
                                    style={{ backgroundColor: theme.bg, color: theme.text, padding: 12, borderRadius: 12, marginBottom: 16 }} 
                                    keyboardType="numeric" 
                                    value={formData.deductions} 
                                    onChangeText={t => setFormData({...formData, deductions: t})} 
                                />

                                <Text style={{ color: theme.text, marginBottom: 8, fontWeight: 'bold' }}>Tổng Thực Lĩnh chốt cuối (VND)</Text>
                                <TextInput 
                                    style={{ backgroundColor: theme.bg, color: theme.text, padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: COLORS.primary }} 
                                    keyboardType="numeric" 
                                    value={formData.net_salary} 
                                    onChangeText={t => setFormData({...formData, net_salary: t})} 
                                />

                                <TouchableOpacity onPress={saveEdit} style={{ backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Lưu thay đổi</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                </ScrollView>
            )}
        </Layout>
    );
}
