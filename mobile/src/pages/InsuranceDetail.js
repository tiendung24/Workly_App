// mobile/src/pages/InsuranceDetail.js
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Layout from "../_components/layout/Layout";
import { COLORS } from "../_styles/theme";
import { apiGet, apiPost } from "../_utils/api";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

export default function InsuranceDetail() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [paying, setPaying] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchStatus();
    }, [])
  );

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/insurance/my-status');
      if (res) setData(res);
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tải thông tin bảo hiểm' });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paying) return;
    try {
      setPaying(true);
      const res = await apiPost('/insurance/create-payment-link');
      if (res && res.checkoutUrl) {
        Linking.openURL(res.checkoutUrl);
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: e.message || 'Không thể tạo link thanh toán' });
    } finally {
      setPaying(false);
    }
  };

  const currentRecord = data?.currentRecord;
  const history = data?.history || [];

  return (
    <Layout>
      {({ theme, isWeb, webPadding, insets }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && { paddingHorizontal: webPadding },
            { paddingBottom: Math.round(60 + insets.bottom) },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : currentRecord ? (
            <View style={styles.container}>
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.headerRow}>
                  <MaterialIcons name="health-and-safety" size={28} color={COLORS.primary} />
                  <Text style={[styles.title, { color: theme.text }]}>Phí tháng này</Text>
                  <Text style={[styles.statusBadge, currentRecord.status === 'Paid' ? styles.statusPaid : styles.statusUnpaid]}>
                    {currentRecord.status === 'Paid' ? 'Đã thu' : 'Chưa thu'}
                  </Text>
                </View>
                
                <View style={styles.row}>
                  <Text style={[styles.label, { color: theme.sub }]}>Phí cơ bản:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {Number(currentRecord.monthly_fee).toLocaleString('en-US')} VND
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={[styles.label, { color: theme.sub }]}>Nợ cũ:</Text>
                  <Text style={[styles.value, { color: '#ff4757' }]}>
                    {Number(currentRecord.old_debt).toLocaleString('en-US')} VND
                  </Text>
                </View>

                <View style={styles.divider} />
                
                <View style={styles.row}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Tổng phải thanh toán:</Text>
                  <Text style={[styles.totalValue, { color: COLORS.primary }]}>
                    {Number(currentRecord.total_amount).toLocaleString('en-US')} VND
                  </Text>
                </View>

                {currentRecord.status === 'Unpaid' && currentRecord.total_amount > 0 && (
                  <TouchableOpacity style={styles.payBtn} onPress={handlePayment} disabled={paying}>
                    {paying ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="qr-code-scanner" size={20} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.payBtnText}>Thanh toán ngay bằng QR</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Lịch sử đóng bảo hiểm</Text>
              
              {history.map((record, index) => (
                <View key={index} style={[styles.historyCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.historyMonth, { color: theme.text }]}>Tháng {record.month}/{record.year}</Text>
                  <Text style={[styles.historyStatus, record.status === 'Paid' ? { color: '#2ed573' } : { color: '#ff4757' }]}>
                    {record.status === 'Paid' ? 'Hoàn thành' : 'Nợ'}
                  </Text>
                  <Text style={[styles.historyAmount, { color: theme.sub }]}>
                    {(Number(record.monthly_fee) + Number(record.old_debt)).toLocaleString('en-US')} VND
                  </Text>
                </View>
              ))}

            </View>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.sub }}>Chưa có dữ liệu</Text>
          )}
        </ScrollView>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  container: {
    flex: 1,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    overflow: 'hidden',
  },
  statusPaid: {
    backgroundColor: '#2ed573',
  },
  statusUnpaid: {
    backgroundColor: '#ff4757',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  historyStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 16,
  },
  historyAmount: {
    fontSize: 14,
  }
});
