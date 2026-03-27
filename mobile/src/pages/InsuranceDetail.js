// mobile/src/pages/InsuranceDetail.js
import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Dimensions, Linking } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useFocusEffect } from "@react-navigation/native";
import Layout from "../_components/layout/Layout";
import { COLORS } from "../_styles/theme";
import { apiGet, apiPost } from "../_utils/api";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function InsuranceDetail() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [paying, setPaying] = useState(false);
  const [qrModal, setQrModal] = useState(false);
  const [qrData, setQrData] = useState(null);

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
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to load insurance information' });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (paying) return;
    try {
      setPaying(true);
      const res = await apiPost('/insurance/create-payment-link');
      if (res && res.qrCode) {
        setQrData(res);
        setQrModal(true);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'No QR code received from PayOS' });
      }
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Error', text2: e.message || 'Failed to create payment link' });
    } finally {
      setPaying(false);
    }
  };

  const closeQrModal = () => {
    setQrModal(false);
    setQrData(null);
    fetchStatus(); // Reload to check if payment was completed
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
            { paddingBottom: Math.round(100 + insets.bottom) },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
          ) : currentRecord ? (
            <View style={styles.container}>
              <View style={[styles.card, { backgroundColor: theme.card }]}>
                <View style={styles.headerRow}>
                  <MaterialIcons name="health-and-safety" size={28} color={COLORS.primary} />
                  <Text style={[styles.title, { color: theme.text }]}>Monthly Fee</Text>
                  <Text style={[styles.statusBadge, currentRecord.status === 'Paid' ? styles.statusPaid : styles.statusUnpaid]}>
                    {currentRecord.status === 'Paid' ? 'Paid' : 'Unpaid'}
                  </Text>
                </View>

                <View style={[styles.infoBanner, { backgroundColor: 'rgba(52, 152, 219, 0.1)' }]}>
                  <MaterialIcons name="info" size={20} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={styles.infoTextContainer}>
                    <Text style={[styles.infoTitle, { color: COLORS.primary }]}>Insurance Information</Text>
                    <Text style={[styles.infoDesc, { color: theme.text }]}>
                      A deduction of 10.5% is applied for mandatory insurance:
                    </Text>
                    <Text style={[styles.infoDesc, { color: theme.sub, marginTop: 4 }]}>
                      • 8% Social Insurance (BHXH){'\n'}
                      • 1.5% Health Insurance (BHYT){'\n'}
                      • 1% Unemployment Insurance (BHTN)
                    </Text>
                    <Text style={[styles.infoDesc, { color: theme.text, marginTop: 4, fontStyle: 'italic', fontWeight: '500' }]}>
                      * Thông tin bảo hiểm: Trừ 10.5% lưu lượng lương cơ sở theo quy định.
                    </Text>
                  </View>
                </View>
                
                <View style={styles.row}>
                  <Text style={[styles.label, { color: theme.sub }]}>Base Fee:</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {Number(currentRecord.monthly_fee).toLocaleString('en-US')} VND
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={[styles.label, { color: theme.sub }]}>Old Debt:</Text>
                  <Text style={[styles.value, { color: '#ff4757' }]}>
                    {Number(currentRecord.old_debt).toLocaleString('en-US')} VND
                  </Text>
                </View>

                <View style={styles.divider} />
                
                <View style={styles.row}>
                  <Text style={[styles.totalLabel, { color: theme.text }]}>Total Due:</Text>
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
                        <Text style={styles.payBtnText}>Pay Now with QR</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[styles.sectionTitle, { color: theme.text }]}>Insurance Payment History</Text>
              
              {history.map((record, index) => (
                <View key={index} style={[styles.historyCard, { backgroundColor: theme.card }]}>
                  <Text style={[styles.historyMonth, { color: theme.text }]}>Month {record.month}/{record.year}</Text>
                  <Text style={[styles.historyStatus, record.status === 'Paid' ? { color: '#2ed573' } : { color: '#ff4757' }]}>
                    {record.status === 'Paid' ? 'Paid' : 'Unpaid'}
                  </Text>
                  <Text style={[styles.historyAmount, { color: theme.sub }]}>
                    {(Number(record.monthly_fee) + Number(record.old_debt)).toLocaleString('en-US')} VND
                  </Text>
                </View>
              ))}

            </View>
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 20, color: theme.sub }}>No data available</Text>
          )}

          {/* ─── QR Code Modal ─── */}
          <Modal
            visible={qrModal}
            transparent={true}
            animationType="fade"
            onRequestClose={closeQrModal}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                <View style={styles.modalHeader}>
                  <MaterialIcons name="qr-code" size={28} color={COLORS.primary} />
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Scan to Pay</Text>
                </View>

                <View style={styles.qrWrapper}>
                  {qrData?.qrCode ? (
                    <QRCode
                      value={qrData.qrCode}
                      size={SCREEN_WIDTH * 0.55}
                      backgroundColor="#fff"
                      color="#000"
                    />
                  ) : (
                    <ActivityIndicator size="large" color={COLORS.primary} />
                  )}
                </View>

                <Text style={[styles.modalAmount, { color: COLORS.primary }]}>
                  {currentRecord ? Number(currentRecord.total_amount).toLocaleString('en-US') : '0'} VND
                </Text>
                <Text style={[styles.modalHint, { color: theme.sub }]}>
                  Ask someone to scan the QR, or tap the button below to pay directly
                </Text>

                {qrData?.checkoutUrl && (
                  <TouchableOpacity
                    style={styles.openBankBtn}
                    onPress={() => Linking.openURL(qrData.checkoutUrl)}
                  >
                    <MaterialIcons name="account-balance" size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.openBankBtnText}>Pay via Banking App</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.closeBtn} onPress={closeQrModal}>
                  <MaterialIcons name="close" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.closeBtnText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    // flex: 1 removed to allow ScrollView to scroll properly
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
  infoBanner: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 13,
    lineHeight: 18,
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
  },
  // ─── QR Modal Styles ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 380,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  qrWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrImage: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    maxWidth: 280,
    maxHeight: 280,
  },
  modalAmount: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  openBankBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  openBankBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    backgroundColor: '#636e72',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
