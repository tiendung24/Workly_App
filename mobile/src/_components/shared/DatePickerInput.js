import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

const DAYS_OF_WEEK = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday = 0
}

function padTwo(n) {
  return n < 10 ? "0" + n : String(n);
}

function parseInputDate(str) {
  // Accepts DD/MM/YYYY
  const parts = str.split("/");
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y) && y > 1900) {
      return new Date(y, m, d);
    }
  }
  return null;
}

export default function DatePickerInput({
  value,
  onChangeText,
  placeholder = "DD/MM/YYYY",
  theme,
  label,
}) {
  const [showPicker, setShowPicker] = useState(false);

  const today = new Date();
  const parsedDate = parseInputDate(value);

  const [viewYear, setViewYear] = useState(
    parsedDate ? parsedDate.getFullYear() : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(
    parsedDate ? parsedDate.getMonth() : today.getMonth()
  );

  const daysInMonth = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const firstDay = useMemo(() => getFirstDayOfWeek(viewYear, viewMonth), [viewYear, viewMonth]);

  const selectedDay = parsedDate
    ? parsedDate.getDate()
    : null;
  const selectedMonth = parsedDate ? parsedDate.getMonth() : null;
  const selectedYear = parsedDate ? parsedDate.getFullYear() : null;

  const handleSelectDay = (day) => {
    const formatted = `${padTwo(day)}/${padTwo(viewMonth + 1)}/${viewYear}`;
    onChangeText(formatted);
    setShowPicker(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Build grid cells
  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const isToday = (day) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const isSelected = (day) =>
    day === selectedDay &&
    viewMonth === selectedMonth &&
    viewYear === selectedYear;

  return (
    <View>
      {/* Input Row */}
      <View
        style={[
          s.inputRow,
          {
            backgroundColor: theme.bg,
            borderColor: theme.navBorder,
          },
        ]}
      >
        <MaterialIcons name="event" size={20} color={COLORS.primary} />
        <TextInput
          style={[s.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.sub}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity
          onPress={() => {
            // Sync view to current value
            if (parsedDate) {
              setViewYear(parsedDate.getFullYear());
              setViewMonth(parsedDate.getMonth());
            } else {
              setViewYear(today.getFullYear());
              setViewMonth(today.getMonth());
            }
            setShowPicker(true);
          }}
          activeOpacity={0.7}
          style={s.pickerBtn}
        >
          <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={s.popupWrap}>
            <TouchableOpacity activeOpacity={1} onPress={() => {}}>
              <View style={[s.popup, { backgroundColor: theme.card }]}>
                {/* Month/Year nav */}
                <View style={s.navRow}>
                  <TouchableOpacity onPress={prevMonth} activeOpacity={0.7} style={s.navArrow}>
                    <MaterialIcons name="chevron-left" size={26} color={theme.text} />
                  </TouchableOpacity>
                  <Text style={[s.monthLabel, { color: theme.text }]}>
                    {MONTHS[viewMonth]} {viewYear}
                  </Text>
                  <TouchableOpacity onPress={nextMonth} activeOpacity={0.7} style={s.navArrow}>
                    <MaterialIcons name="chevron-right" size={26} color={theme.text} />
                  </TouchableOpacity>
                </View>

                {/* Day headers */}
                <View style={s.weekRow}>
                  {DAYS_OF_WEEK.map((d) => (
                    <View key={d} style={s.dayCell}>
                      <Text style={[s.dayHeader, { color: theme.sub }]}>{d}</Text>
                    </View>
                  ))}
                </View>

                {/* Day grid */}
                <View style={s.grid}>
                  {cells.map((day, i) => (
                    <View key={i} style={s.dayCell}>
                      {day ? (
                        <TouchableOpacity
                          style={[
                            s.dayBtn,
                            isSelected(day) && { backgroundColor: COLORS.primary },
                            isToday(day) && !isSelected(day) && {
                              borderWidth: 2,
                              borderColor: COLORS.primary,
                            },
                          ]}
                          activeOpacity={0.8}
                          onPress={() => handleSelectDay(day)}
                        >
                          <Text
                            style={[
                              s.dayText,
                              { color: isSelected(day) ? "#fff" : theme.text },
                              isToday(day) && !isSelected(day) && { color: COLORS.primary, fontWeight: "900" },
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  ))}
                </View>

                {/* Today shortcut */}
                <TouchableOpacity
                  style={s.todayBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    const formatted = `${padTwo(today.getDate())}/${padTwo(today.getMonth() + 1)}/${today.getFullYear()}`;
                    onChangeText(formatted);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[s.todayText, { color: COLORS.primary }]}>Today</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 10,
  },
  pickerBtn: {
    padding: 6,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  popupWrap: {
    width: 320,
  },
  popup: {
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  navArrow: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: "900",
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 3,
  },
  dayHeader: {
    fontSize: 12,
    fontWeight: "800",
  },
  dayBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "700",
  },
  todayBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 6,
  },
  todayText: {
    fontSize: 14,
    fontWeight: "900",
  },
});
