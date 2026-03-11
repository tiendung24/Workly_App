import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";
import Layout from "../../_components/layout/Layout";
import { managerService } from "../../_utils/managerService";
import moment from "moment";

const TABS = [
  { key: "list", label: "Members" },
  { key: "schedule", label: "Schedule" },
  { key: "attendance", label: "Stats" },
];

export default function ManagerTeam() {
  const [tab, setTab] = useState("list");
  const [loading, setLoading] = useState(false);
  
  const [members, setMembers] = useState([]);
  const [schedule, setSchedule] = useState({ attendances: [], leaves: [] });
  const [attendanceStats, setAttendanceStats] = useState([]);

  const [year, setYear] = useState(moment().year());
  const [month, setMonth] = useState(moment().month() + 1);

  useEffect(() => {
    loadData();
  }, [tab, year, month]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (tab === 'list') {
         const res = await managerService.getTeamMembers();
         if (res && res.data) setMembers(res.data);
      } else if (tab === 'schedule') {
         const res = await managerService.getTeamSchedule(year, month);
         if (res && res.data) setSchedule(res.data);
      } else if (tab === 'attendance') {
         const res = await managerService.getTeamAttendance(year, month);
         if (res && res.data) setAttendanceStats(res.data);
      }
    } catch (error) {
      console.log("Error loading team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); } 
    else { setMonth(m => m - 1); }
  };

  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); } 
    else { setMonth(m => m + 1); }
  };

  const renderMembers = (theme) => {
     if (members.length === 0) return <Text style={{ color: theme.sub, textAlign: 'center', marginTop: 20 }}>No members found</Text>;
     return members.map(m => (
        <View key={m.id} style={[s.card, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
           <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
             {m.avatar_url ? (
                <Image source={{ uri: m.avatar_url }} style={s.avatar} />
             ) : (
                <View style={[s.avatarFallback, { backgroundColor: COLORS.primary + "20" }]}>
                  <Text style={[s.avatarText, { color: COLORS.primary }]}>{m.full_name?.charAt(0) || "U"}</Text>
                </View>
             )}
             <View style={{ flex: 1 }}>
                <Text style={[s.userName, { color: theme.text }]}>{m.full_name} <Text style={{ fontSize: 13, color: theme.sub, fontWeight: 'normal' }}>({m.employee_code})</Text></Text>
                <Text style={{ color: theme.sub, fontSize: 13, marginTop: 4 }}>{m.position?.name || 'No position'} • {m.department?.name || 'No department'}</Text>
                <Text style={{ color: theme.sub, fontSize: 13, marginTop: 2 }}>{m.email} | {m.phone || 'No phone number'}</Text>
             </View>
           </View>
        </View>
     ));
  };

  const renderAttendanceStats = (theme) => {
     if (attendanceStats.length === 0) return <Text style={{ color: theme.sub, textAlign: 'center', marginTop: 20 }}>No data available</Text>;
     return attendanceStats.map((item, index) => (
       <View key={item.id} style={[s.card, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 10 }}>
            {item.full_name} <Text style={{ fontSize: 13, color: theme.sub, fontWeight: 'normal' }}>({item.employee_code})</Text>
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
             <View style={{ backgroundColor: theme.bg, padding: 8, borderRadius: 8, minWidth: '48%' }}>
                <Text style={{ fontSize: 12, color: theme.sub }}>Working Days</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#10B981' }}>{item.total_working_days}</Text>
             </View>
             <View style={{ backgroundColor: theme.bg, padding: 8, borderRadius: 8, minWidth: '48%' }}>
                <Text style={{ fontSize: 12, color: theme.sub }}>Late Days</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#F59E0B' }}>{item.late_days}</Text>
             </View>
             <View style={{ backgroundColor: theme.bg, padding: 8, borderRadius: 8, minWidth: '48%' }}>
                <Text style={{ fontSize: 12, color: theme.sub }}>OT (Hours)</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#8B5CF6' }}>{item.ot_hours}</Text>
             </View>
             <View style={{ backgroundColor: theme.bg, padding: 8, borderRadius: 8, minWidth: '48%' }}>
                <Text style={{ fontSize: 12, color: theme.sub }}>Absent Days</Text>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#EF4444' }}>{item.absent_days}</Text>
             </View>
          </View>
       </View>
     ));
  };

  const renderSchedule = (theme) => {
      // Basic grouping by date for view
      const datesMap = {};
      schedule.attendances.forEach(a => {
          const dateStr = moment(a.date).format('DD/MM/YYYY');
          if(!datesMap[dateStr]) datesMap[dateStr] = [];
          datesMap[dateStr].push({ 
              id: `att_${a.id}`, 
              type: 'att', 
              user: a.user, 
              status: a.status, 
              time: `${moment(a.check_in_time, 'HH:mm:ss').format('HH:mm')} - ${a.check_out_time ? moment(a.check_out_time, 'HH:mm:ss').format('HH:mm') : '...'}` 
          });
      });
      schedule.leaves.forEach(l => {
          let curr = moment(l.start_date);
          const end = moment(l.end_date);
          while (curr.isSameOrBefore(end)) {
              const dateStr = curr.format('DD/MM/YYYY');
              if(!datesMap[dateStr]) datesMap[dateStr] = [];
              datesMap[dateStr].push({
                  id: `lv_${l.id}_${curr.format('DD')}`,
                  type: 'leave',
                  user: l.user,
                  status: 'Leave',
                  time: l.leaveType?.name || 'Leave'
              });
              curr.add(1, 'days');
          }
      });

      const sortedDates = Object.keys(datesMap).sort((a,b) => moment(a, 'DD/MM/YYYY').valueOf() - moment(b, 'DD/MM/YYYY').valueOf());
      
      if (sortedDates.length === 0) return <Text style={{ color: theme.sub, textAlign: 'center', marginTop: 20 }}>No schedule recorded</Text>;

      return sortedDates.map(date => (
          <View key={date} style={{ marginBottom: 20 }}>
             <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 8 }}>{moment(date, 'DD/MM/YYYY').format('ddd, DD/MM/YYYY')}</Text>
             <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.navBorder, padding: 0, overflow: 'hidden' }]}>
                {datesMap[date].map((item, idx) => (
                    <View key={item.id} style={[{ padding: 12, borderBottomColor: theme.navBorder }, idx !== datesMap[date].length - 1 && { borderBottomWidth: 1 }]}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                {item.user?.avatar_url ? (
                                    <Image source={{ uri: item.user.avatar_url }} style={{ width: 24, height: 24, borderRadius: 12 }} />
                                ) : (
                                    <View style={[{ width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + "20" }]}>
                                      <Text style={[{ fontSize: 10, fontWeight: 'bold', color: COLORS.primary }]}>{item.user?.full_name?.charAt(0) || "U"}</Text>
                                    </View>
                                )}
                                <Text style={{ color: theme.text, fontWeight: 'bold' }}>{item.user?.full_name}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end' }}>
                                <Text style={{ color: item.type === 'leave' || item.status === 'Absent' ? '#EF4444' : (item.status === 'Late' ? '#F59E0B' : '#10B981'), fontWeight: 'bold', fontSize: 12 }}>{item.status}</Text>
                                <Text style={{ color: theme.sub, fontSize: 12 }}>{item.time}</Text>
                            </View>
                        </View>
                    </View>
                ))}
             </View>
          </View>
      ));
  };

  return (
    <Layout>
      {({ theme, isDark, insets, isWeb, webPadding }) => (
        <View style={{ flex: 1 }}>
          <View style={s.tabsRow}>
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <TouchableOpacity
                  key={t.key}
                  style={[
                    s.tab,
                    {
                      backgroundColor: active ? COLORS.primary : theme.card,
                      borderColor: active ? COLORS.primary : theme.navBorder,
                    },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setTab(t.key)}
                >
                  <Text style={[s.tabText, { color: active ? "#fff" : theme.sub }]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {(tab === 'schedule' || tab === 'attendance') && (
              <View style={[s.monthSelector, { backgroundColor: theme.card, borderColor: theme.navBorder }]}>
                 <TouchableOpacity onPress={handlePrevMonth} style={{ padding: 5 }}><MaterialIcons name="chevron-left" size={24} color={theme.text} /></TouchableOpacity>
                 <Text style={{ fontSize: 16, fontWeight: 'bold', color: theme.text }}>Month {month < 10 ? `0${month}` : month} / {year}</Text>
                 <TouchableOpacity onPress={handleNextMonth} style={{ padding: 5 }}><MaterialIcons name="chevron-right" size={24} color={theme.text} /></TouchableOpacity>
              </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              s.scrollContent,
              isWeb && { paddingHorizontal: webPadding },
              { paddingBottom: Math.round(100 + insets.bottom) },
            ]}
          >
            {loading ? (
               <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
            ) : (
               <>
                 {tab === 'list' && renderMembers(theme)}
                 {tab === 'attendance' && renderAttendanceStats(theme)}
                 {tab === 'schedule' && renderSchedule(theme)}
               </>
            )}
          </ScrollView>
        </View>
      )}
    </Layout>
  );
}

const s = StyleSheet.create({
  tabsRow: {
    flexDirection: "row",
    paddingHorizontal: 18,
    marginTop: 18,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: "800",
  },
  monthSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginHorizontal: 18,
      marginTop: 15,
      padding: 10,
      borderRadius: 12,
      borderWidth: 1
  },
  scrollContent: {
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold'
  }
});
