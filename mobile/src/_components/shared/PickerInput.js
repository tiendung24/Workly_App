import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

export default function PickerInput({
  value,
  onSelect,
  options = [],
  placeholder = "Select an option",
  theme,
  label,
  icon = "list",
}) {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (item) => {
    onSelect(item.name); // Send name for now as backend uses names
    setShowPicker(false);
  };

  return (
    <View style={s.container}>
      {/* Input Row */}
      <TouchableOpacity
        style={[
          s.inputRow,
          {
            backgroundColor: theme ? theme.bg : "#fff",
            borderColor: theme ? theme.navBorder : "#E5E7EB",
          },
        ]}
        activeOpacity={0.7}
        onPress={() => setShowPicker(true)}
      >
        <MaterialIcons name={icon} size={20} color={COLORS.primary} />
        <Text
          style={[
            s.inputText,
            { color: value ? (theme ? theme.text : "#1F2937") : (theme ? theme.sub : "#9CA3AF") },
          ]}
        >
          {value || placeholder}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={24} color={theme ? theme.sub : "#9CA3AF"} />
      </TouchableOpacity>

      {/* Picker Modal */}
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
          <View style={[s.popup, { backgroundColor: theme ? theme.card : "#fff" }]}>
            <Text style={[s.header, { color: theme ? theme.text : "#1F2937" }]}>
              {label || placeholder}
            </Text>
            
            <FlatList
              data={options}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    s.option,
                    { borderBottomColor: theme ? theme.navBorder : "#F3F4F6" },
                    value === item.name && { backgroundColor: COLORS.primary + "10" }
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text
                    style={[
                      s.optionText,
                      { color: theme ? theme.text : "#1F2937" },
                      value === item.name && { color: COLORS.primary, fontWeight: "700" }
                    ]}
                  >
                    {item.name}
                  </Text>
                  {value === item.name && (
                    <MaterialIcons name="check" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
              style={{ maxHeight: 400 }}
              showsVerticalScrollIndicator={false}
            />

            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => setShowPicker(false)}
            >
              <Text style={s.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  inputText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popup: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
  },
  optionText: {
    fontSize: 15,
    fontWeight: "500",
  },
  cancelBtn: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#6B7280",
    fontWeight: "700",
    fontSize: 15,
  },
});
