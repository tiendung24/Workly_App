import React, { useState } from "react";
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

function padTwo(n) {
  return n < 10 ? "0" + n : String(n);
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function TimePickerInput({
  value,
  onChangeText,
  placeholder = "HH:MM",
  theme,
  iconColor = COLORS.primary,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [selHour, setSelHour] = useState(null);
  const [selMin, setSelMin] = useState(null);

  // Parse current value
  const parseTime = () => {
    if (value) {
      const parts = value.split(":");
      if (parts.length === 2) {
        return {
          h: parseInt(parts[0], 10),
          m: parseInt(parts[1], 10),
        };
      }
    }
    return { h: null, m: null };
  };

  const openPicker = () => {
    const { h, m } = parseTime();
    setSelHour(h !== null && !isNaN(h) ? h : new Date().getHours());
    setSelMin(m !== null && !isNaN(m) ? m : 0);
    setShowPicker(true);
  };

  const handleConfirm = () => {
    if (selHour !== null && selMin !== null) {
      onChangeText(`${padTwo(selHour)}:${padTwo(selMin)}`);
    }
    setShowPicker(false);
  };

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
        <MaterialIcons name="schedule" size={20} color={iconColor} />
        <TextInput
          style={[s.input, { color: theme.text }]}
          placeholder={placeholder}
          placeholderTextColor={theme.sub}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity
          onPress={openPicker}
          activeOpacity={0.7}
          style={s.pickerBtn}
        >
          <MaterialIcons name="access-time" size={20} color={iconColor} />
        </TouchableOpacity>
      </View>

      {/* Time Picker Modal */}
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
                <Text style={[s.title, { color: theme.text }]}>Select Time</Text>

                {/* Large display */}
                <View style={s.displayRow}>
                  <Text style={[s.displayTime, { color: COLORS.primary }]}>
                    {selHour !== null ? padTwo(selHour) : "--"}
                  </Text>
                  <Text style={[s.displayColon, { color: theme.sub }]}>:</Text>
                  <Text style={[s.displayTime, { color: COLORS.primary }]}>
                    {selMin !== null ? padTwo(selMin) : "--"}
                  </Text>
                </View>

                <View style={s.pickersRow}>
                  {/* Hour */}
                  <View style={s.column}>
                    <Text style={[s.colLabel, { color: theme.sub }]}>Hour</Text>
                    <ScrollView
                      style={[s.scrollCol, { borderColor: theme.navBorder }]}
                      showsVerticalScrollIndicator={false}
                    >
                      {HOURS.map((h) => {
                        const active = h === selHour;
                        return (
                          <TouchableOpacity
                            key={h}
                            style={[
                              s.timeItem,
                              active && { backgroundColor: COLORS.primary },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => setSelHour(h)}
                          >
                            <Text
                              style={[
                                s.timeItemText,
                                { color: active ? "#fff" : theme.text },
                              ]}
                            >
                              {padTwo(h)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Minute */}
                  <View style={s.column}>
                    <Text style={[s.colLabel, { color: theme.sub }]}>Minute</Text>
                    <ScrollView
                      style={[s.scrollCol, { borderColor: theme.navBorder }]}
                      showsVerticalScrollIndicator={false}
                    >
                      {MINUTES.map((m) => {
                        const active = m === selMin;
                        return (
                          <TouchableOpacity
                            key={m}
                            style={[
                              s.timeItem,
                              active && { backgroundColor: COLORS.primary },
                            ]}
                            activeOpacity={0.8}
                            onPress={() => setSelMin(m)}
                          >
                            <Text
                              style={[
                                s.timeItemText,
                                { color: active ? "#fff" : theme.text },
                              ]}
                            >
                              {padTwo(m)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>

                {/* Actions */}
                <View style={s.footer}>
                  <TouchableOpacity
                    style={[s.cancelBtn, { borderColor: theme.navBorder }]}
                    activeOpacity={0.85}
                    onPress={() => setShowPicker(false)}
                  >
                    <Text style={[s.cancelText, { color: theme.sub }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.confirmBtn, { backgroundColor: COLORS.primary }]}
                    activeOpacity={0.85}
                    onPress={handleConfirm}
                  >
                    <MaterialIcons name="check" size={18} color="#fff" />
                    <Text style={s.confirmText}>Confirm</Text>
                  </TouchableOpacity>
                </View>

                {/* Now shortcut */}
                <TouchableOpacity
                  style={s.nowBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    const now = new Date();
                    onChangeText(`${padTwo(now.getHours())}:${padTwo(now.getMinutes())}`);
                    setShowPicker(false);
                  }}
                >
                  <Text style={[s.nowText, { color: COLORS.primary }]}>Now</Text>
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
    fontWeight: "700",
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
    width: 300,
  },
  popup: {
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 10,
  },
  displayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  displayTime: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
  },
  displayColon: {
    fontSize: 36,
    fontWeight: "900",
    marginHorizontal: 6,
  },
  pickersRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  colLabel: {
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  scrollCol: {
    height: 170,
    borderWidth: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  timeItem: {
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  timeItemText: {
    fontSize: 15,
    fontWeight: "800",
  },
  footer: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 13,
    fontWeight: "800",
  },
  confirmBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  confirmText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  nowBtn: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  nowText: {
    fontSize: 14,
    fontWeight: "900",
  },
});
