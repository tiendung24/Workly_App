import React, { useState, useEffect } from "react";
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
import { leaveService } from "../../_utils/leaveService";

export default function LeaveForm({ visible, onClose, onSubmit, theme }) {
  const [leaveType, setLeaveType] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [apiTypes, setApiTypes] = useState([]);

  useEffect(() => {
    if (visible) {
      loadTypes();
    }
  }, [visible]);

  const loadTypes = async () => {
    try {
      const res = await leaveService.getLeaveTypes();
      if (res && res.data) {
        // Map backend types to UI colors
        const mapped = res.data.map(t => {
          let icon = "event";
          let color = "#6B7280";
          const name = (t.name || "").toLowerCase();
          
          if (name.includes("phép năm") || name.includes("annual")) { color = COLORS.primary; icon = "calendar-month"; }
          else if (name.includes("ốm") || name.includes("thái sản") || name.includes("sick")) { color = "#EA580C"; icon = "medical-services"; }
          else if (name.includes("cá nhân") || name.includes("personal")) { color = "#2563EB"; icon = "person"; }
          else { color = "#6B7280"; icon = "money-off"; }
          
          return {
            key: t.id,
            label: t.name,
            icon,
            color
          };
        });
        setApiTypes(mapped);
      }
    } catch (error) {
      console.log("Error loading leave types:", error);
    }
  };

  const handleSubmit = () => {
    if (!leaveType || !startDate) return;
    
    const parseDate = (dStr) => {
      if (!dStr) return null;
      if (dStr.includes("-")) return dStr; // already parsed?
      const parts = dStr.split("/");
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dStr;
    };

    onSubmit({
      type: leaveType,
      startDate: parseDate(startDate),
      endDate: parseDate(endDate || startDate),
      reason,
    });
    setLeaveType(null);
    setStartDate("");
    setEndDate("");
    setReason("");
  };

  const handleClose = () => {
    setLeaveType(null);
    setStartDate("");
    setEndDate("");
    setReason("");
    onClose();
  };

  const canSubmit = leaveType && startDate;

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
              Create Leave Request
            </Text>
            <TouchableOpacity onPress={handleClose} activeOpacity={0.7}>
              <MaterialIcons name="close" size={24} color={theme.sub} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.formBody}
          >
            {/* Leave Type */}
            <Text style={[s.label, { color: theme.text }]}>Leave Type</Text>
            <View style={s.typeGrid}>
              {apiTypes.map((t) => {
                const selected = leaveType === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[
                      s.typeCard,
                      {
                        backgroundColor: selected ? t.color : theme.bg,
                        borderColor: selected ? t.color : theme.navBorder,
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => setLeaveType(t.key)}
                  >
                    <MaterialIcons
                      name={t.icon}
                      size={22}
                      color={selected ? "#fff" : t.color}
                    />
                    <Text
                      style={[
                        s.typeLabel,
                        { color: selected ? "#fff" : theme.text },
                      ]}
                    >
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Start Date */}
            <Text style={[s.label, { color: theme.text }]}>Start Date</Text>
            <DatePickerInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="DD/MM/YYYY"
              theme={theme}
            />

            {/* End Date */}
            <Text style={[s.label, { color: theme.text }]}>End Date</Text>
            <DatePickerInput
              value={endDate}
              onChangeText={setEndDate}
              placeholder="DD/MM/YYYY (optional)"
              theme={theme}
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
              placeholder="Enter reason for leave..."
              placeholderTextColor={theme.sub}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  typeLabel: {
    fontSize: 13,
    fontWeight: "800",
    flexShrink: 1,
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
