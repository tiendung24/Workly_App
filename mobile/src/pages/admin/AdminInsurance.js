// mobile/src/pages/admin/AdminInsurance.js
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Layout from "../../_components/layout/Layout";
import { COLORS } from "../../_styles/theme";
import { apiGet } from "../../_utils/api";
import { MaterialIcons } from "@expo/vector-icons";

export default function AdminInsurance() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);

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
                    <Text style={[styles.summaryDesc, { color: theme.sub }]}>nhân sự chưa nộp</Text>
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
                           <Text style={[styles.itemName, { color: theme.text }]}>{u.user?.name || 'Unknown'}</Text>
                           <Text style={[styles.itemSub, { color: theme.sub }]}>{u.user?.email || ''}</Text>
                         </View>
                         <Text style={[styles.itemAmount, { color: '#ff4757' }]}>
                           {(Number(u.monthly_fee) + Number(u.old_debt)).toLocaleString()}đ
                         </Text>
                      </View>
                   ))}
                 </>
               )}

               {/* Transactions List */}
               <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 24 }]}>Lịch sử dòng tiền (Real-time)</Text>
               {transactions?.length > 0 ? transactions.map((tx, i) => (
                 <View key={i} style={[styles.itemCard, { backgroundColor: theme.card }]}>
                    <View style={[styles.iconWrap, { backgroundColor: tx.status === 'Success' ? '#2ed57320' : '#ffa50220' }]}>
                      <MaterialIcons name={tx.status === 'Success' ? 'check-circle' : 'pending'} size={24} color={tx.status === 'Success' ? '#2ed573' : '#ffa502'} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.itemName, { color: theme.text }]}>Mã GD: {tx.transaction_code}</Text>
                      <Text style={[styles.itemSub, { color: theme.sub }]}>{new Date(tx.transaction_date || tx.createdAt).toLocaleString('en-GB')}</Text>
                    </View>
                    <Text style={[styles.itemAmount, { color: tx.status === 'Success' ? '#2ed573' : '#ffa502' }]}>
                      +{Number(tx.amount).toLocaleString()}đ
                    </Text>
                 </View>
               )) : (
                  <Text style={{ color: theme.sub, textAlign: 'center', marginTop: 10 }}>Chưa có giao dịch nào</Text>
               )}
            </View>
          )}
        </ScrollView>
      )}
    </Layout>
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
  itemAmount: { fontSize: 15, fontWeight: 'bold' }
});
