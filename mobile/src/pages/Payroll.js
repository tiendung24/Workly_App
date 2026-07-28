import React, { useState, useCallback, useMemo } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../_components/layout/Layout";
import { COLORS, getTheme } from "../_styles/theme";
import { apiGet } from "../_utils/api";
import Toast from "react-native-toast-message";

export default function Payroll({ navigation }) {
    const [estimate, setEstimate] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const [estRes, histRes] = await Promise.all([
                apiGet('/payroll/estimate'),
                apiGet('/payroll')
            ]);
            if (estRes && estRes.data) setEstimate(estRes.data);
            if (histRes && histRes.data) setHistory(histRes.data);
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Lỗi tải dữ liệu', text2: error.message });
        } finally {
            setLoading(false);
        }
    };

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
                        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text }}>Quản lý Lương</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
                    ) : (
                        <>
                            {/* Live Estimate Card */}
                            {estimate && (
                                <View style={{ backgroundColor: '#10B981', borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: '#10B981', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 12 }}>
                                            <MaterialIcons name="attach-money" size={28} color="#fff" />
                                        </View>
                                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Tạm tính Tháng {estimate.month}/{estimate.year}</Text>
                                    </View>
                                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 }}>Tổng thu nhập ước tính</Text>
                                    <Text style={{ color: '#fff', fontSize: 36, fontWeight: 'bold', marginBottom: 20 }}>
                                        {Number(estimate.net_salary || 0).toLocaleString('en-US')} <Text style={{ fontSize: 20, fontWeight: 'normal' }}>VND</Text>
                                    </Text>
                                    
                                    <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Lương cơ bản</Text>
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{Number(estimate.base_salary).toLocaleString('en-US')} đ</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                                            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Ngày công hợp lệ</Text>
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{estimate.actual_working_days + estimate.paid_leave_days} / {estimate.standard_working_days}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ color: 'rgba(255,255,255,0.9)' }}>Tiền tăng ca (OT)</Text>
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>+ {Number(estimate.overtime_pay).toLocaleString('en-US')} đ</Text>
                                        </View>
                                    </View>
                                </View>
                            )}

                            {/* History List */}
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, marginBottom: 16 }}>Lịch sử Lương (Đã chốt)</Text>
                            
                            {history.length === 0 ? (
                                <View style={{ backgroundColor: theme.card, padding: 24, borderRadius: 16, alignItems: 'center' }}>
                                    <MaterialIcons name="inbox" size={48} color={theme.sub} style={{ marginBottom: 12 }} />
                                    <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold' }}>Chưa có phiếu lương nào</Text>
                                    <Text style={{ color: theme.sub, marginTop: 4 }}>Các phiếu lương đã chốt sẽ hiển thị ở đây.</Text>
                                </View>
                            ) : (
                                history.map(item => (
                                    <TouchableOpacity 
                                        key={item.id} 
                                        activeOpacity={0.8}
                                        onPress={() => navigation.navigate("PayrollDetail", { payrollId: item.id })}
                                        style={{ backgroundColor: theme.card, borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                    >
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ backgroundColor: COLORS.primary + '20', padding: 12, borderRadius: 12, marginRight: 16 }}>
                                                <MaterialIcons name="receipt" size={24} color={COLORS.primary} />
                                            </View>
                                            <View>
                                                <Text style={{ color: theme.text, fontSize: 16, fontWeight: 'bold', marginBottom: 4 }}>Tháng {item.month}/{item.year}</Text>
                                                <Text style={{ color: theme.sub, fontSize: 13 }}>{Number(item.net_salary).toLocaleString('en-US')} VND</Text>
                                            </View>
                                        </View>
                                        <MaterialIcons name="chevron-right" size={24} color={theme.sub} />
                                    </TouchableOpacity>
                                ))
                            )}
                        </>
                    )}
                </ScrollView>
            )}
        </Layout>
    );
}
