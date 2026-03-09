import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";
import DatePickerInput from "../shared/DatePickerInput";
import TimePickerInput from "../shared/TimePickerInput";

const CORRECTION_TYPES = [
  { key: "Forgot_CheckOut", label: "Quên Check-out", icon: "logout", color: "#EF4444" },
  { key: "Forgot_CheckIn", label: "Quên Check-in", icon: "login", color: "#F59E0B" },
  { key: "Wrong_Time", label: "Sai giờ ghi nhận", icon: "edit-calendar", color: "#2563EB" },
  { key: "Work_Outside", label: "Làm việc ngoài", icon: "location-on", color: "#10B981" },
];

export default function CorrectionForm({ visible, onClose, onSubmit, theme }) {
  const [corrType, setCorrType] = useState(null);
  const [wrongTimeOption, setWrongTimeOption] = useState("check_in");
  const [date, setDate] = useState("");
  const [correctedTime, setCorrectedTime] = useState("");
  const [offsiteStartTime, setOffsiteStartTime] = useState("08:00");
  const [offsiteEndTime, setOffsiteEndTime] = useState("17:00");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    let typeValid = false;
    let reqIn = null;
    let reqOut = null;

    if (corrType === "Forgot_CheckIn") {
       if (!correctedTime) return;
       reqIn = correctedTime;
    } else if (corrType === "Forgot_CheckOut") {
       if (!correctedTime) return;
       reqOut = correctedTime;
    } else if (corrType === "Wrong_Time") {
       if (!correctedTime) return;
       if (wrongTimeOption === "check_in") reqIn = correctedTime;
       else reqOut = correctedTime;
    } else if (corrType === "Work_Outside") {
       if (!offsiteStartTime || !offsiteEndTime) return;
       reqIn = offsiteStartTime;
       reqOut = offsiteEndTime;
    }

    if (!corrType || !date || !reason.trim()) return;

    onSubmit({
      type: corrType,
      date,
      requested_check_in: reqIn,
      requested_check_out: reqOut,
      reason,
      typeLabel: CORRECTION_TYPES.find((t) => t.key === corrType)?.label || corrType,
    });
    setCorrType(null);
    setDate("");
    setCorrectedTime("");
    setReason("");
    setOffsiteStartTime("08:00");
    setOffsiteEndTime("17:00");
  };

  const handleClose = () => {
    setCorrType(null);
    setDate("");
    setCorrectedTime("");
    setReason("");
    onClose();
  };

  let typeValid = false;
  if (corrType === "Work_Outside") {
     typeValid = !!(offsiteStartTime && offsiteEndTime);
  } else {
     typeValid = !!correctedTime;
  }
  const canSubmit = corrType && date && typeValid && reason.trim();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={fs.overlay}>
        <View style={[fs.sheet, { backgroundColor: theme.card }]}>
          <View style={fs.sheetHeader}>
            <Text style={[fs.sheetTitle, { color: theme.text }]}>
              Gửi giải trình
            </Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <MaterialIcons name="close" size={24} color={theme.sub} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={fs.formBody}>
            {/* Correction Type */}
            <Text style={[fs.label, { color: theme.text }]}>Loại giải trình</Text>
            <View style={fs.typeGrid}>
              {CORRECTION_TYPES.map((t) => {
                const selected = corrType === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[
                      fs.typeCard,
                      {
                        backgroundColor: selected ? t.color : theme.bg,
                        borderColor: selected ? t.color : theme.navBorder,
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setCorrType(t.key)}
                  >
                    <MaterialIcons name={t.icon} size={20} color={selected ? "#fff" : t.color} />
                    <Text style={[fs.typeLabel, { color: selected ? "#fff" : theme.text }]} numberOfLines={1}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Date */}
            <Text style={[fs.label, { color: theme.text }]}>Ngày cần giải trình</Text>
            <DatePickerInput value={date} onChangeText={setDate} placeholder="DD/MM/YYYY" theme={theme} />

            {/* Conditional Corrected Time */}
            {corrType === "Work_Outside" ? (
              <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                <View style={{ flex: 1 }}>
                   <Text style={[fs.label, { color: theme.text, marginTop: 0 }]}>Từ giờ</Text>
                   <TimePickerInput value={offsiteStartTime} onChangeText={setOffsiteStartTime} placeholder="08:00" theme={theme} />
                </View>
                <View style={{ flex: 1 }}>
                   <Text style={[fs.label, { color: theme.text, marginTop: 0 }]}>Đến giờ</Text>
                   <TimePickerInput value={offsiteEndTime} onChangeText={setOffsiteEndTime} placeholder="17:00" theme={theme} />
                </View>
              </View>
            ) : (
              <>
                {corrType === "Wrong_Time" && (
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
                    <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center'}} onPress={() => setWrongTimeOption('check_in')}>
                       <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: wrongTimeOption === 'check_in' ? COLORS.primary : theme.sub, alignItems: 'center', justifyContent: 'center' }}>
                          {wrongTimeOption === 'check_in' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary }} />}
                       </View>
                       <Text style={{ marginLeft: 8, color: theme.text, fontSize: 13, fontWeight: '600' }}>Sửa Check-in</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={{flex: 1, flexDirection: 'row', alignItems: 'center'}} onPress={() => setWrongTimeOption('check_out')}>
                       <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: wrongTimeOption === 'check_out' ? COLORS.primary : theme.sub, alignItems: 'center', justifyContent: 'center' }}>
                          {wrongTimeOption === 'check_out' && <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary }} />}
                       </View>
                       <Text style={{ marginLeft: 8, color: theme.text, fontSize: 13, fontWeight: '600' }}>Sửa Check-out</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <Text style={[fs.label, { color: theme.text }]}>Giờ đề nghị ghi nhận</Text>
                <TimePickerInput
                  value={correctedTime}
                  onChangeText={setCorrectedTime}
                  placeholder="HH:MM"
                  theme={theme}
                />
              </>
            )}

            {/* Reason */}
            <Text style={[fs.label, { color: theme.text }]}>Lý do</Text>
            <TextInput
              style={[
                fs.input,
                fs.textArea,
                { backgroundColor: theme.bg, color: theme.text, borderColor: theme.navBorder },
              ]}
              placeholder="VD: Quên check-out, xin ghi nhận giờ về là 17:30..."
              placeholderTextColor={theme.sub}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Hint */}
            <View style={[fs.hintCard, { backgroundColor: theme.bg }]}>
              <MaterialIcons name="info-outline" size={16} color={COLORS.primary} />
              <Text style={[fs.hintText, { color: theme.sub }]}>
                Yêu cầu sẽ được gửi đến quản lý để phê duyệt. Bạn sẽ nhận thông báo khi có kết quả.
              </Text>
            </View>
          </ScrollView>

          <View style={fs.footer}>
            <TouchableOpacity
              style={[fs.cancelBtn, { borderColor: theme.navBorder }]}
              activeOpacity={0.85}
              onPress={handleClose}
            >
              <Text style={[fs.cancelText, { color: theme.sub }]}>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[fs.submitBtn, { backgroundColor: canSubmit ? COLORS.primary : "#D1D5DB" }]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <MaterialIcons name="send" size={18} color="#fff" />
              <Text style={fs.submitText}>Gửi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const fs = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingTop: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 20, fontWeight: "900" },
  formBody: { paddingHorizontal: 20, paddingBottom: 10 },
  label: { fontSize: 13, fontWeight: "800", marginBottom: 8, marginTop: 14 },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
  },
  typeLabel: { fontSize: 12, fontWeight: "800", flexShrink: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  textArea: { minHeight: 80, paddingTop: 12 },
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  hintText: { flex: 1, fontSize: 11, fontWeight: "600", lineHeight: 16 },
  footer: { flexDirection: "row", gap: 12, paddingHorizontal: 20, paddingTop: 14 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { fontSize: 14, fontWeight: "800" },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: { color: "#fff", fontSize: 14, fontWeight: "900" },
});
