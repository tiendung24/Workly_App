import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { COLORS } from "../../_styles/theme";

export default function HeaderSection({
  styles,
  theme,
  insetsTop,
  avatarUrl,
  userName = "Employee",
  dateLabel,
  time,
 
  statusLabel = "Status: —",
  activeCheck,
  onChangeCheck,
  onPressNotifications,
}) {
  const isIn = activeCheck === "IN";
  const isOut = activeCheck === "OUT";

  return (
    <View style={[styles.header, { paddingTop: 16 + insetsTop }]}>
      <StatusBar style="light" backgroundColor={COLORS.primary} />

      <View style={styles.headerTop}>
        <View style={styles.userRow}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          </View>
          <View>
            <Text style={styles.welcomeSmall}>Welcome,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.85} onPress={onPressNotifications}>
          <MaterialIcons name="notifications" size={22} color="#fff" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <View style={styles.clockBlock}>
        <Text style={styles.dateText}>{dateLabel}</Text>

        <View style={styles.timeRow}>
          <Text style={styles.timeBig}>
            {time.hh}:{time.mm}
          </Text>
          <Text style={styles.ampm}>{time.ampm}</Text>
        </View>

        <View style={styles.pillRow}>
         
          <View style={styles.pill}>
            <MaterialIcons name="fact-check" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={[styles.pillText, { marginLeft: 6 }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>

      {/* Core nghiệp vụ: Check-in / Check-out */}
      <View style={styles.segment}>
        <TouchableOpacity
   
          style={[styles.segBtn, isIn ? styles.segBtnActive : {}]}
          onPress={() => onChangeCheck("IN")}
          activeOpacity={0.9}
        >
          <MaterialIcons name="login" size={18} color={isIn ? "#fff" : "#6B7280"} />
          <Text style={[styles.segText, isIn ? styles.segTextActive : styles.segTextInactive]}>
            Check In
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segBtn, isOut ? styles.segBtnActive : {}]}
          onPress={() => onChangeCheck("OUT")}
          activeOpacity={0.9}
        >
          <Text style={[styles.segText, isOut ? styles.segTextActive : styles.segTextInactive]}>
            Check Out
          </Text>
          <MaterialIcons name="logout" size={18} color={isOut ? "#fff" : "#6B7280"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}