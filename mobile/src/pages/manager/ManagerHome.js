import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Layout from "../../_components/layout/Layout";
import { COLORS } from "../../_styles/theme";

export default function ManagerHome({ navigation }) {
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
          <Text style={[s.title, { color: theme.text }]}>Manager Portal</Text>

          <View style={s.cardsWrapper}>
            <TouchableOpacity 
              style={[s.card, { backgroundColor: theme.card, borderColor: theme.navBorder }]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate("ManagerApprovalScreen")}
            >
               <View style={[s.iconBg, { backgroundColor: '#F59E0B20' }]}>
                 <MaterialIcons name="fact-check" size={32} color="#F59E0B" />
               </View>
               <View style={s.cardText}>
                 <Text style={[s.cardTitle, { color: theme.text }]}>Phê duyệt Đơn</Text>
                 <Text style={[s.cardDesc, { color: theme.sub }]}>Duyệt đơn nghỉ phép, làm thêm, giải trình của nhân viên.</Text>
               </View>
               <MaterialIcons name="chevron-right" size={24} color={theme.sub} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.card, { backgroundColor: theme.card, borderColor: theme.navBorder }]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate("ManagerTeamScreen")}
            >
               <View style={[s.iconBg, { backgroundColor: '#3B82F620' }]}>
                 <MaterialIcons name="groups" size={32} color="#3B82F6" />
               </View>
               <View style={s.cardText}>
                 <Text style={[s.cardTitle, { color: theme.text }]}>Quản lý Đội nhóm</Text>
                 <Text style={[s.cardDesc, { color: theme.sub }]}>Xem danh sách team, lịch làm việc và tình hình chuyên cần.</Text>
               </View>
               <MaterialIcons name="chevron-right" size={24} color={theme.sub} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </Layout>
  );
}

const s = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 20,
  },
  cardsWrapper: {
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconBg: {
    padding: 12,
    borderRadius: 12,
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  }
});
