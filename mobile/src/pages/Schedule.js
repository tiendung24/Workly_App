import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../_styles/theme";
import { scheduleStyles as s } from "../_styles/pages/scheduleStyles";
import Layout from "../_components/layout/Layout";
import { scheduleService } from "../_utils/scheduleService";

const DAYS_HEADER = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES_FULL = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
];

function padTwo(n) { return n < 10 ? "0" + n : String(n); }

function isSameDay(a, b) {
  return a.getDate()===b.getDate() && a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear();
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1; // Mon=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null); // blanks before 1st
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

/* ─── dynamic loading ─── */
const today = new Date();

function getDayData(year, month, day, apiData) {
  const key = `${year}-${padTwo(month + 1)}-${padTwo(day)}`;
  const dt = new Date(year, month, day);
  const dow = dt.getDay(); // 0=Sun
  const isSunday = dow === 0;
  const isSaturday = dow === 6;
  const isPast = dt < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday_ = isSameDay(dt, today);

  let type = "work"; // work, half, off, leave, holiday
  let timeRange = "08:00-17:00";
  let leave = null;
  let ot = null;
  let checkin = null;
  
  if (isSunday) { type = "off"; timeRange = ""; }
  else if (isSaturday) { type = "half"; timeRange = "08:00-12:00"; }
  
  // Apply API data overrides
  if (apiData && apiData[key]) {
      const record = apiData[key];
      
      // Override timeRange if shift exists
      if (record.shift && record.shift !== 'Không có ca') {
          timeRange = record.shift;
      }
      
      if (record.status === 'Absent') {
          type = isPast ? (isSunday ? 'off' : 'work') : type;
          // Could leave as work and it just has no checkin
      } else if (record.status === 'Leave') {
          type = "leave"; timeRange = "";
          leave = { 
              type: record.leaveInfo?.type?.toLowerCase().includes("ốm") ? 'sick' : 'annual', 
              reason: `${record.leaveInfo?.type || 'Nghỉ'} - ${record.leaveInfo?.reason || ''}` 
          };
      } else if (record.status === 'Holiday') {
          type = "holiday"; timeRange = "";
      } else if (record.status === 'Off') {
          type = "off"; timeRange = "";
      }
      
      // Populate Checkin Data (Late, etc)
      if (record.checkIn || record.checkOut || record.status === 'Present' || record.status === 'Late' || record.status === 'EarlyLeave') {
          let actualHoursLabel = '—';
          let lateMins = 0;
          let earlyMins = 0;

          const cInDate = record.checkIn ? new Date(record.checkIn) : null;
          const cOutDate = record.checkOut ? new Date(record.checkOut) : null;

          if (cInDate && cOutDate) {
              const diffMs = cOutDate - cInDate;
              const diffMins = Math.floor(diffMs / 60000);
              
              if (diffMins < 60) {
                  actualHoursLabel = `${diffMins} phút`;
              } else {
                  const hrs = Math.floor(diffMins / 60);
                  const mns = diffMins % 60;
                  actualHoursLabel = mns > 0 ? `${hrs}h ${mns}m` : `${hrs}h`;
              }
          }

          // Calculate Late/Early based on Time Range (e.g., "08:00-17:00")
          if (timeRange && timeRange.includes("-")) {
              const [sTr, eTr] = timeRange.split("-");
              if (sTr && eTr && cInDate) {
                  const expectedIn = new Date(cInDate);
                  const [inH, inM] = sTr.split(":");
                  expectedIn.setHours(parseInt(inH, 10), parseInt(inM, 10), 0, 0);
                  
                  if (cInDate > expectedIn) {
                      lateMins = Math.floor((cInDate - expectedIn) / 60000);
                  }
              }
              if (sTr && eTr && cOutDate) {
                  const expectedOut = new Date(cOutDate);
                  const [outH, outM] = eTr.split(":");
                  expectedOut.setHours(parseInt(outH, 10), parseInt(outM, 10), 0, 0);

                  if (cOutDate < expectedOut) {
                      earlyMins = Math.floor((expectedOut - cOutDate) / 60000);
                  }
              }
          }

          checkin = {
              checkIn: cInDate ? cInDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : '—',
              checkOut: cOutDate ? cOutDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : '—',
              hoursLabel: actualHoursLabel,
              late: record.status === 'Late' || lateMins > 0,
              lateMins,
              earlyMins
          };
      }
  }

  return { key, dt, dow, type, timeRange, leave, ot, checkin, isPast, isToday: isToday_, isSunday, isSaturday };
}

/* ═══════════════════════════════════════════
   DAY CELL COMPONENT
   ═══════════════════════════════════════════ */

function DayCell({ day, year, month, theme, onPress, filter, apiData }) {
  if (day === null) return <View style={s.dayCell} />;

  const data = getDayData(year, month, day, apiData);
  const { type, timeRange, ot, checkin, isPast, isToday: isToday_, isSunday } = data;

  // Filter logic
  if (filter === "ot" && !ot) return <View style={s.dayCell}><View style={[s.dayCellInner, { borderColor: "transparent", opacity: 0.2 }]}><Text style={[s.dayNumber, { color: theme.sub }]}>{day}</Text></View></View>;
  if (filter === "late" && (!checkin || !checkin.late)) return <View style={s.dayCell}><View style={[s.dayCellInner, { borderColor: "transparent", opacity: 0.2 }]}><Text style={[s.dayNumber, { color: theme.sub }]}>{day}</Text></View></View>;

  // Colors
  const isOff = type === "off" || type === "holiday";
  const isLeave = type === "leave";
  const dimmed = isOff || isLeave;
  const opacity = dimmed ? 0.45 : 1;

  let bgColor = theme.card;
  let borderColor = theme.navBorder;
  if (isToday_) { bgColor = COLORS.primary + "12"; borderColor = COLORS.primary; }
  else if (isOff) { bgColor = theme.bg; borderColor = theme.navBorder; }
  else if (isLeave) { bgColor = "#FEF3C7"; borderColor = "#FDE68A"; }

  return (
    <TouchableOpacity style={s.dayCell} activeOpacity={0.85} onPress={() => onPress(data)}>
      <View style={[s.dayCellInner, { backgroundColor: bgColor, borderColor, opacity: dimmed && !isToday_ ? 0.5 : 1 }]}>
        {/* Day number */}
        <Text style={[
          s.dayNumber,
          { color: isToday_ ? COLORS.primary : isOff ? theme.sub : isLeave ? "#92400E" : theme.text },
          isToday_ && { fontWeight: "900" },
        ]}>
          {day}
        </Text>

        {/* Content based on type */}
        {type === "off" && (
          <Text style={[s.dayOffText, { color: theme.sub }]}>OFF</Text>
        )}

        {type === "holiday" && (
          <Text style={[s.dayOffText, { color: "#EF4444" }]}>🎉</Text>
        )}

        {type === "leave" && (
          <Text style={[s.dayLeaveText, { color: "#92400E" }]} numberOfLines={2}>
            {data.leave?.type === "annual" ? "Phép" : "Nghỉ"}
          </Text>
        )}

        {(type === "work" || type === "half") && (
          <>
            <Text style={[s.dayTimeText, { color: theme.sub }]}>
              {type === "half" ? "8-12" : "8-17"}
            </Text>

            {/* Check mark for completed days */}
            {checkin && (
              <View style={s.dayCheck}>
                <MaterialIcons name="check-circle" size={14} color="#10B981" />
              </View>
            )}

            {/* OT badge */}
            {ot && (
              <View style={[s.dayOtBadge, { backgroundColor: COLORS.primary + "18" }]}>
                <Text style={[s.dayOtText, { color: COLORS.primary }]}>+{ot.hours}h</Text>
              </View>
            )}

            {/* Late indicator */}
            {checkin?.late && (
              <View style={[s.dayOtBadge, { backgroundColor: "#FEE2E2" }]}>
                <Text style={[s.dayOtText, { color: "#EF4444" }]}>Trễ</Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

/* ═══════════════════════════════════════════
   DETAIL BOTTOM SHEET
   ═══════════════════════════════════════════ */

function DayDetailSheet({ data, visible, onClose, theme }) {
  if (!data) return null;

  const { dt, type, timeRange, leave, ot, checkin, isPast, isToday: isToday_ } = data;
  const dayName = DAY_NAMES_FULL[dt.getDay()];
  const dateStr = `${padTwo(dt.getDate())}/${padTwo(dt.getMonth()+1)}/${dt.getFullYear()}`;

  // Status
  let statusLabel = "Upcoming";
  let statusBg = "#E0E7FF";
  let statusColor = "#4338CA";
  if (type === "off" || type === "holiday") { statusLabel = type === "holiday" ? "Holiday" : "Day Off"; statusBg = "#F3F4F6"; statusColor = "#6B7280"; }
  else if (type === "leave") { statusLabel = leave?.type === "annual" ? "Nghỉ phép" : "Nghỉ ốm"; statusBg = "#FEF3C7"; statusColor = "#92400E"; }
  else if (checkin) { statusLabel = "Checked In"; statusBg = "#D1FAE5"; statusColor = "#059669"; }
  else if (isToday_) { statusLabel = "Today"; statusBg = COLORS.primary + "18"; statusColor = COLORS.primary; }

  const rows = [];

  if ((type === "work" || type === "half") && timeRange) {
    rows.push({
      icon: "schedule",
      iconBg: COLORS.primary + "18",
      iconColor: COLORS.primary,
      label: "Scheduled Hours",
      value: type === "half" ? "08:00 - 12:00 (4h)" : "08:00 - 17:00 (8h)",
    });
  }

  if (checkin) {
    rows.push({
      icon: "login",
      iconBg: "#D1FAE5",
      iconColor: "#059669",
      label: "Check In",
      value: checkin.checkIn,
    });
    rows.push({
      icon: "logout",
      iconBg: "#FEE2E2",
      iconColor: "#EF4444",
      label: "Check Out",
      value: checkin.checkOut || "—",
    });
    rows.push({
      icon: "timer",
      iconBg: "#E0E7FF",
      iconColor: "#4338CA",
      label: "Actual Hours",
      value: checkin.hoursLabel,
    });
    if (checkin.lateMins > 0) {
      const h = Math.floor(checkin.lateMins / 60);
      const m = checkin.lateMins % 60;
      const lateStr = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m} phút`;
      rows.push({
        icon: "warning",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        label: "Late Arrival",
        value: `Trễ ${lateStr}`,
      });
    } else if (checkin.late) {
       // Fallback to simple "Đi trễ" if lateMins = 0 but status was somehow Late
       rows.push({
        icon: "warning",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        label: "Status",
        value: "Đi trễ",
      });
    }
    if (checkin.earlyMins > 0) {
      const h2 = Math.floor(checkin.earlyMins / 60);
      const m2 = checkin.earlyMins % 60;
      const earlyStr = h2 > 0 ? (m2 > 0 ? `${h2}h ${m2}m` : `${h2}h`) : `${m2} phút`;
      rows.push({
        icon: "run-circle",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        label: "Early Leave",
        value: `Sớm ${earlyStr}`,
      });
    }
  }

  if (ot) {
    rows.push({
      icon: "more-time",
      iconBg: COLORS.primary + "18",
      iconColor: COLORS.primary,
      label: "Overtime",
      value: `+${ot.hours}h`,
    });
    if (ot.reason) {
      rows.push({
        icon: "description",
        iconBg: "#F3F4F6",
        iconColor: "#6B7280",
        label: "OT Reason",
        value: ot.reason,
      });
    }
  }

  if (leave) {
    rows.push({
      icon: "event-busy",
      iconBg: "#FEF3C7",
      iconColor: "#92400E",
      label: "Leave Type",
      value: leave.type === "annual" ? "Nghỉ phép tháng" : leave.type === "sick" ? "Nghỉ ốm" : "Nghỉ",
    });
    if (leave.reason) {
      rows.push({
        icon: "chat",
        iconBg: "#F3F4F6",
        iconColor: "#6B7280",
        label: "Reason",
        value: leave.reason,
      });
    }
  }

  if (type === "off") {
    rows.push({
      icon: "weekend",
      iconBg: "#F3F4F6",
      iconColor: "#6B7280",
      label: "Type",
      value: "Ngày nghỉ hàng tuần",
    });
  }

  if (type === "holiday") {
    rows.push({
      icon: "celebration",
      iconBg: "#FEE2E2",
      iconColor: "#EF4444",
      label: "Type",
      value: "Ngày lễ",
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={s.sheetOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={[s.sheet, { backgroundColor: theme.card }]}>
            <View style={[s.sheetHandle, { backgroundColor: theme.navBorder }]} />

            <View style={s.sheetDateRow}>
              <View>
                <Text style={[s.sheetDate, { color: theme.text }]}>{dayName}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: theme.sub, marginTop: 2 }}>{dateStr}</Text>
              </View>
              <View style={[s.sheetStatusBadge, { backgroundColor: statusBg }]}>
                <Text style={[s.sheetStatusText, { color: statusColor }]}>{statusLabel}</Text>
              </View>
            </View>

            {rows.map((row, i) => (
              <View key={i} style={[s.sheetRow, { borderBottomColor: theme.navBorder }]}>
                <View style={[s.sheetRowIcon, { backgroundColor: row.iconBg }]}>
                  <MaterialIcons name={row.icon} size={18} color={row.iconColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.sheetRowLabel, { color: theme.sub }]}>{row.label}</Text>
                  <Text style={[s.sheetRowValue, { color: theme.text }]}>{row.value}</Text>
                </View>
              </View>
            ))}

            {rows.length === 0 && (
              <View style={{ alignItems: "center", paddingVertical: 20 }}>
                <MaterialIcons name="info-outline" size={28} color={theme.sub} />
                <Text style={{ color: theme.sub, fontSize: 13, fontWeight: "700", marginTop: 8 }}>
                  No data available for this day
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

/* ═══════════════════════════════════════════
   MAIN SCHEDULE PAGE
   ═══════════════════════════════════════════ */

const FILTERS = [
  { key: "all", label: "All", icon: "calendar-today" },
  { key: "ot", label: "OT Days", icon: "more-time" },
  { key: "late", label: "Late Days", icon: "warning" },
];

export default function Schedule() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [filter, setFilter] = useState("all");
  const [apiDataMap, setApiDataMap] = useState({});

  const viewDate = useMemo(() => {
    const d = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    return d;
  }, [monthOffset]);

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const cells = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);
  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  useFocusEffect(
    useCallback(() => {
      loadScheduleData(viewYear, viewMonth + 1); // API expects 1-indexed month
    }, [viewYear, viewMonth])
  );

  const loadScheduleData = async (year, month) => {
    try {
      const res = await scheduleService.getMonthly(year, month);
      if (res && res.data) {
        // Build map: { "2026-03-01": { status: 'Present', ... } }
        const map = {};
        res.data.forEach(item => {
          map[item.date] = item;
        });
        setApiDataMap(map);
      }
    } catch (error) {
      console.log("Error loading schedule data:", error);
    }
  };

  const handleDayPress = (data) => {
    setSelectedDay(data);
    setShowDetail(true);
  };

  return (
    <Layout>
      {({ theme }) => (
        <View style={{ flex: 1 }}>
          <ScrollView
            style={s.container}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {/* Month Header */}
            <View style={s.monthHeader}>
              <Text style={[s.monthTitle, { color: theme.text }]}>{monthLabel}</Text>
              <View style={s.monthNav}>
                <TouchableOpacity
                  style={[s.monthNavBtn, { backgroundColor: theme.card }]}
                  activeOpacity={0.8}
                  onPress={() => setMonthOffset((o) => o - 1)}
                >
                  <MaterialIcons name="chevron-left" size={22} color={theme.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.monthNavBtn, { backgroundColor: COLORS.primary }]}
                  activeOpacity={0.8}
                  onPress={() => setMonthOffset(0)}
                >
                  <MaterialIcons name="today" size={16} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.monthNavBtn, { backgroundColor: theme.card }]}
                  activeOpacity={0.8}
                  onPress={() => setMonthOffset((o) => o + 1)}
                >
                  <MaterialIcons name="chevron-right" size={22} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Filters */}
            <View style={s.filterRow}>
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <TouchableOpacity
                    key={f.key}
                    style={[
                      s.filterChip,
                      {
                        backgroundColor: active ? COLORS.primary : theme.card,
                        borderColor: active ? COLORS.primary : theme.navBorder,
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setFilter(f.key)}
                  >
                    <MaterialIcons name={f.icon} size={14} color={active ? "#fff" : theme.sub} />
                    <Text style={[s.filterText, { color: active ? "#fff" : theme.sub }]}>{f.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Week header */}
            <View style={s.weekHeaderRow}>
              {DAYS_HEADER.map((d) => (
                <View key={d} style={s.weekHeaderCell}>
                  <Text style={[s.weekHeaderText, { color: d === "Sun" ? "#EF4444" : theme.sub }]}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Calendar grid */}
            <View style={s.calendarGrid}>
              {cells.map((day, i) => (
                <DayCell
                  key={i}
                  day={day}
                  year={viewYear}
                  month={viewMonth}
                  theme={theme}
                  onPress={handleDayPress}
                  filter={filter}
                  apiData={apiDataMap}
                />
              ))}
            </View>

            {/* Legend */}
            <View style={s.legendRow}>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#10B981" }]} />
                <Text style={[s.legendText, { color: theme.sub }]}>Checked in</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={[s.legendText, { color: theme.sub }]}>OT</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#FDE68A" }]} />
                <Text style={[s.legendText, { color: theme.sub }]}>Leave</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#E5E7EB" }]} />
                <Text style={[s.legendText, { color: theme.sub }]}>Off</Text>
              </View>
              <View style={s.legendItem}>
                <View style={[s.legendDot, { backgroundColor: "#FEE2E2" }]} />
                <Text style={[s.legendText, { color: theme.sub }]}>Late</Text>
              </View>
            </View>
          </ScrollView>

          {/* Detail bottom sheet */}
          <DayDetailSheet
            data={selectedDay}
            visible={showDetail}
            onClose={() => setShowDetail(false)}
            theme={theme}
          />
        </View>
      )}
    </Layout>
  );
}
