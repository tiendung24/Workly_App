import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../../_components/layout/Layout";
import { adminStyles as s } from "../../_styles/pages/adminStyles";
import { COLORS } from "../../_styles/theme";
import { adminService } from "../../_utils/adminService";
import moment from "moment";
import Toast from "react-native-toast-message";

export default function AdminTimesheet() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Date selection
  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month() + 1);

  useEffect(() => {
    loadTimesheet();
  }, [year, month]);

  const loadTimesheet = async () => {
    try {
      setLoading(true);
      const res = await adminService.getTimesheet(year, month);
      if (res.data) setData(res.data);
    } catch (error) {
      console.error(error);
      Toast.show({ type: "error", text1: "Lỗi", text2: "Không thể lấy dữ liệu chấm công" });
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(y => y - 1);
    } else {
      setMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(y => y + 1);
    } else {
      setMonth(m => m + 1);
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
          {/* Header Controls */}
          <View style={[s.card, { backgroundColor: theme.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 }]}>
            <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 5 }}>
              <MaterialIcons name="chevron-left" size={28} color={theme.text} />
            </TouchableOpacity>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 16, color: theme.sub }}>Bảng công tháng</Text>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text }}>
                {month < 10 ? `0${month}` : month} / {year}
              </Text>
            </View>

            <TouchableOpacity onPress={handleNextMonth} style={{ padding: 5 }}>
              <MaterialIcons name="chevron-right" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Export Button */}
           <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 15 }}>
              <TouchableOpacity style={[s.btn, { backgroundColor: '#10B981', flexDirection: 'row', alignItems: 'center', gap: 5 }]} onPress={() => Toast.show({type: 'info', text1: 'Xuất Excel', text2: 'Chức năng đang phát triển lúc publish'})}>
                 <MaterialIcons name="file-download" size={18} color="#fff" />
                 <Text style={s.btnText}>Xuất Excel</Text>
              </TouchableOpacity>
           </View>

          {/* Data List */}
          {loading ? (
             <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
          ) : data.length === 0 ? (
             <Text style={{ textAlign: 'center', color: theme.sub, marginTop: 40 }}>Không có dữ liệu chấm công cho tháng này</Text>
          ) : (
            <View style={[s.card, { backgroundColor: theme.card, padding: 0, overflow: 'hidden' }]}>
              {data.map((item, index) => (
                <View
                  key={item.user_id}
                  style={[
                    { paddingHorizontal: 16, paddingVertical: 14, borderBottomColor: theme.navBorder },
                    index !== data.length - 1 && { borderBottomWidth: 1 }
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>
                       {item.full_name} <Text style={{ fontSize: 13, color: theme.sub, fontWeight: 'normal' }}>({item.employee_code})</Text>
                    </Text>
                    <View style={[s.badge, { backgroundColor: COLORS.primary + "20" }]}>
                       <Text style={{ fontSize: 12, fontWeight: 'bold', color: COLORS.primary }}>
                         Công chuẩn: {item.present_days}
                       </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                     <View style={{ backgroundColor: theme.bg, padding: 8, borderRadius: 8, minWidth: '48%' }}>
                        <Text style={{ fontSize: 12, color: theme.sub }}>Đi muộn (Lần)</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B' }}>{item.late_days}</Text>
                     </View>
                     <View style={{ backgroundColor: theme.bg, padding: 8, borderRadius: 8, minWidth: '48%' }}>
                        <Text style={{ fontSize: 12, color: theme.sub }}>Nghỉ không phép</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EF4444' }}>{item.absent_days}</Text>
                     </View>
                     <View style={{ backgroundColor: theme.bg, padding: 8, borderRadius: 8, minWidth: '48%' }}>
                        <Text style={{ fontSize: 12, color: theme.sub }}>Làm thêm (Giờ)</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8B5CF6' }}>{item.overtime_hours}</Text>
                     </View>
                     <View style={{ backgroundColor: theme.bg, padding: 8, borderRadius: 8, minWidth: '48%' }}>
                        <Text style={{ fontSize: 12, color: theme.sub }}>Ngày công</Text>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981' }}>{item.total_working_days}</Text>
                     </View>
                  </View>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      )}
    </Layout>
  );
}
