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

export default function OvertimeForm({ visible, onClose, onSubmit, theme }) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!date || !startTime || !endTime) return;
    onSubmit({ date, startTime, endTime, reason });
    setDate("");
    setStartTime("");
    setEndTime("");
    setReason("");
  };

  const handleClose = () => {
    setDate("");
    setStartTime("");
    setEndTime("");
    setReason("");
    onClose();
  };

  const canSubmit = date && startTime && endTime;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <View style={s.overlay}>
        <View style={[s.sheet, { backgroundColor: theme.card }]}>
          {/* Header */}
          <View style={s.sheetHeader}>
            <Text style={[s.sheetTitle, { color: theme.text }]}>
              Register Overtime
            </Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <MaterialIcons name="close" size={24} color={theme.sub} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.formBody}
          >
            {/* Date */}
            <Text style={[s.label, { color: theme.text }]}>Date</Text>
            <DatePickerInput
              value={date}
              onChangeText={setDate}
              placeholder="DD/MM/YYYY"
              theme={theme}
            />

            {/* Time Range */}
            <Text style={[s.label, { color: theme.text }]}>Start Time</Text>
            <TimePickerInput
              value={startTime}
              onChangeText={setStartTime}
              placeholder="HH:MM"
              theme={theme}
              iconColor={COLORS.primary}
            />

            <Text style={[s.label, { color: theme.text }]}>End Time</Text>
            <TimePickerInput
              value={endTime}
              onChangeText={setEndTime}
              placeholder="HH:MM"
              theme={theme}
              iconColor="#EA580C"
            />

            {/* Reason */}
            <Text style={[s.label, { color: theme.text }]}>Reason</Text>
            <TextInput
              style={[
                s.input,
                s.textArea,
                {
                  backgroundColor: theme.bg,
                  color: theme.text,
                  borderColor: theme.navBorder,
                },
              ]}
              placeholder="Enter reason for overtime..."
              placeholderTextColor={theme.sub}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Info hint */}
            <View style={[s.hintCard, { backgroundColor: theme.bg }]}>
              <MaterialIcons name="info-outline" size={18} color={COLORS.primary} />
              <Text style={[s.hintText, { color: theme.sub }]}>
                Overtime requests require manager approval. You will be notified once reviewed.
              </Text>
            </View>
          </ScrollView>

          {/* Submit */}
          <View style={s.footer}>
            <TouchableOpacity
              style={[s.cancelBtn, { borderColor: theme.navBorder }]}
              activeOpacity={0.85}
              onPress={handleClose}
            >
              <Text style={[s.cancelText, { color: theme.sub }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                s.submitBtn,
                { backgroundColor: canSubmit ? COLORS.primary : "#D1D5DB" },
              ]}
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <MaterialIcons name="send" size={18} color="#fff" />
              <Text style={s.submitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
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
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "900",
  },
  formBody: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  textArea: {
    minHeight: 90,
    paddingTop: 12,
  },
  hintCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "800",
  },
  submitBtn: {
    flex: 2,
    flexDirection: "row",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
  },
});
