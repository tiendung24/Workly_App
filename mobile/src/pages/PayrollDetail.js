import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../_components/layout/Layout";
import { COLORS } from "../_styles/theme";
import { apiGet } from "../_utils/api";
import Toast from "react-native-toast-message";

export default function PayrollDetail({ route, navigation }) {
    const { payrollId } = route.params || {};
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            if (payrollId) loadData();
        }, [payrollId])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await apiGet(`/payroll/${payrollId}`);
            if (res && res.data) setData(res.data);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi tải chi tiết', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

    const InfoRow = ({ label, value, isBold = false, isSub = false, color }) => (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(150,150,150,0.1)' }}>
            <Text style={{ color: isSub ? '#888' : (color || '#555'), fontSize: 15, fontWeight: isBold ? 'bold' : 'normal' }}>{label}</Text>
            <Text style={{ color: color || '#111', fontSize: 15, fontWeight: isBold ? 'bold' : 'normal' }}>{value}</Text>
        </View>
    );

    return (
        <Layout>
            {({ theme, isDark, insets, isWeb, webPadding }) => (
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 60, ...(isWeb ? { paddingHorizontal: webPadding } : {}) }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8, backgroundColor: theme.card, borderRadius: 12, marginRight: 12 }}>
                            <MaterialIcons name="arrow-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Chi tiết Lương</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                    ) : !data ? (
                        <Text style={{ color: theme.text }}>Không tìm thấy phiếu lương</Text>
                    ) : (
                        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}>
                            <View style={{ alignItems: 'center', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: theme.navBorder, paddingBottom: 24 }}>
                                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', marginBottom: 12 }}>
                                    <MaterialIcons name="account-balance-wallet" size={32} color={COLORS.primary} />
                                </View>
                                <Text style={{ fontSize: 16, color: theme.sub, marginBottom: 4 }}>Phiếu lương tháng {data.month}/{data.year}</Text>
                                <Text style={{ fontSize: 32, fontWeight: '900', color: COLORS.primary }}>
                                    {Number(data.net_salary).toLocaleString('en-US')} <Text style={{ fontSize: 18 }}>VND</Text>
                                </Text>
                            </View>

                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 8 }}>Chi tiết thu nhập</Text>
                            <InfoRow label="Lương cơ bản" value={`${Number(data.base_salary).toLocaleString('en-US')} đ`} color={theme.text} />
                            <InfoRow label="Ngày công thực tế" value={`${data.actual_working_days} / ${data.standard_working_days} ngày`} color={theme.text} />
                            <InfoRow label="Tăng ca (OT)" value={`+ ${Number(data.overtime_pay).toLocaleString('en-US')} đ`} color={theme.text} />
                            <InfoRow label="Trợ cấp khác" value={`+ ${Number(data.allowances).toLocaleString('en-US')} đ`} color={theme.text} />
                            
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginTop: 24, marginBottom: 8 }}>Các khoản khấu trừ</Text>
                            <InfoRow label="Các khoản trừ (Thuế, BHXH...)" value={`- ${Number(data.deductions).toLocaleString('en-US')} đ`} color="#EF4444" />

                            <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 2, borderTopColor: theme.navBorder }}>
                                <InfoRow label="Thực lĩnh" value={`${Number(data.net_salary).toLocaleString('en-US')} đ`} isBold color={COLORS.primary} />
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </Layout>
    );
}
