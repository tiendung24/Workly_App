import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../../_styles/theme";

export default function FloatingAddButton({ styles, bottomOffset = 120, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.fabWrap, { bottom: bottomOffset }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <TouchableOpacity style={[styles.fab, { backgroundColor: COLORS.primary }]} activeOpacity={0.9} onPress={onPress}>
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}