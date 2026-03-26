// mobile/src/pages/admin/AdminInsurance.js
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Layout from "../../_components/layout/Layout";
import { COLORS } from "../../_styles/theme";
import { apiGet } from "../../_utils/api";
import { MaterialIcons } from "@expo/vector-icons";

export default function AdminInsurance() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, txRes] = await Promise.all([
        apiGet('/insurance/admin/dashboard'),
        apiGet('/insurance/admin/transactions')
      ]);
      setDashboard(dashRes.data || dashRes);
      setTransactions(txRes.data || txRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const paidTransactions = transactions?.filter(tx => tx.status === 'Success') || [];

  return (
    <Layout>
      {({ theme, isWeb, webPadding, insets }) => (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isWeb && { paddingHorizontal: webPadding },
            { paddingBottom: Math.round(100 + insets.bottom) },
          ]}
        >
          {loading ? (
             <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.container}>
               {/* Dashboard Cards */}
               <View style={styles.summaryRow}>
                 <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.summaryLabel, { color: theme.sub }]}>Đã thu</Text>
                    <Text style={[styles.summaryValue, { color: COLORS.primary }]}>{dashboard?.percentage || '0'}%</Text>
                    <Text style={[styles.summaryDesc, { color: theme.sub }]}>{Number(dashboard?.totalCollected || 0).toLocaleString()} VND</Text>
                 </View>
                 <View style={[styles.summaryCard, { backgroundColor: theme.card }]}>
                    <Text style={[styles.summaryLabel, { color: theme.sub }]}>Còn thiếu</Text>
                    <Text style={[styles.summaryValue, { color: '#ff4757' }]}>{dashboard?.unpaidUsers?.length || 0}</Text>
                    <Text style={[styles.summaryDesc, { color: theme.sub }]}>nhân sự chưa nộp phí</Text>
                 </View>
               </View>

                {/* Unpaid List */}
                {dashboard?.unpaidUsers?.length > 0 && (
                  <>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Nhân sự chưa thanh toán</Text>
                    {dashboard.unpaidUsers.map((u, i) => (
                       <View key={i} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                          <MaterialIcons name="person" size={24} color={theme.sub} />
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[styles.itemName, { color: theme.text }]}>{u.user?.full_name || 'Update Required'}</Text>
                            <Text style={[styles.itemSub, { color: theme.sub }]}>{u.user?.employee_code || ''} • {u.user?.email}</Text>
                          </View>
                          <Text style={[styles.itemAmount, { color: '#ff4757' }]}>
                            {Number(u.amount || 0).toLocaleString()}đ
                          </Text>
                       </View>
                    ))}
                  </>
                )}

               {/* Paid Employees List */}
               <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Nhân sự đã thanh toán</Text>
               {paidTransactions.length > 0 ? paidTransactions.map((tx, i) => (
                 <TouchableOpacity key={i} style={[styles.itemCard, { backgroundColor: theme.card }]} activeOpacity={0.7} onPress={() => setSelectedTx(tx)}>
                    <View style={[styles.iconWrap, { backgroundColor: '#2ed57315' }]}>
                      <MaterialIcons name="check-circle" size={24} color="#2ed573" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                       <Text style={[styles.itemName, { color: theme.text }]}>{tx.user?.full_name || 'N/A'}</Text>
                       <Text style={[styles.itemSub, { color: theme.sub }]}>{tx.user?.employee_code || ''} • {new Date(tx.transaction_date || tx.createdAt).toLocaleString('en-GB')}</Text>
                    </View>
                    <Text style={[styles.itemAmount, { color: '#2ed573' }]}>
                      {Number(tx.amount).toLocaleString()}đ
                    </Text>
                 </TouchableOpacity>
               )) : (
                  <Text style={{ color: theme.sub, textAlign: 'center', marginTop: 10 }}>Chưa có nhân sự nào thanh toán</Text>
               )}
            </View>
          )}
        </ScrollView>
      )}
    </Layout>

    {/* Detail Modal */}
    <Modal visible={!!selectedTx} animationType="fade" transparent>
       <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}>
         {selectedTx && (
           <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 20 }}>
             <View style={{ alignItems: 'center', marginBottom: 20 }}>
               <MaterialIcons name="check-circle" size={48} color="#2ed573" />
               <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111', marginTop: 10 }}>THANH TOÁN THÀNH CÔNG</Text>
               <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2ed573', marginTop: 5 }}>{Number(selectedTx.amount).toLocaleString()} VND</Text>
             </View>

             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Tên nhân sự</Text>
               <Text style={styles.detailValue}>{selectedTx.user?.full_name || 'N/A'}</Text>
             </View>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Mã NV</Text>
               <Text style={styles.detailValue}>{selectedTx.user?.employee_code || 'N/A'}</Text>
             </View>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Mã giao dịch</Text>
               <Text style={styles.detailValue}>{selectedTx.transaction_code}</Text>
             </View>
             <View style={styles.detailRow}>
               <Text style={styles.detailLabel}>Thời gian nộp</Text>
               <Text style={styles.detailValue}>{new Date(selectedTx.transaction_date || selectedTx.createdAt).toLocaleString('en-GB')}</Text>
             </View>
             
             <TouchableOpacity style={{ marginTop: 20, backgroundColor: COLORS.primary, padding: 14, borderRadius: 12, alignItems: 'center' }} onPress={() => setSelectedTx(null)}>
               <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Đóng</Text>
             </TouchableOpacity>
           </View>
         )}
       </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16 },
  container: { flex: 1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  summaryCard: { flex: 0.48, padding: 16, borderRadius: 16, alignItems: 'center' },
  summaryLabel: { fontSize: 14, marginBottom: 8 },
  summaryValue: { fontSize: 24, fontWeight: 'bold' },
  summaryDesc: { fontSize: 12, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  itemCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 12 },
  iconWrap: { padding: 8, borderRadius: 8 },
  itemName: { fontSize: 15, fontWeight: 'bold' },
  itemSub: { fontSize: 13, marginTop: 2 },
  itemAmount: { fontSize: 15, fontWeight: 'bold' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  detailLabel: { color: '#666', fontSize: 14 },
  detailValue: { color: '#111', fontSize: 14, fontWeight: '500' }
});
