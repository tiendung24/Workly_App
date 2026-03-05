import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
enableScreens(false);
import React, { useState, useMemo, useCallback } from "react";
import {
  Platform,
  useColorScheme,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import Home from "./src/pages/Home";
import Timesheet from "./src/pages/Timesheet";
import Leave from "./src/pages/Leave";
import Overtime from "./src/pages/Overtime";
import Schedule from "./src/pages/Schedule";

import BottomNav from "./src/_components/layout/BottomNav";
import { getTheme, COLORS } from "./src/_styles/theme";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const TimesheetStack = createNativeStackNavigator();
const LeaveStack = createNativeStackNavigator();
const OvertimeStack = createNativeStackNavigator();
const ScheduleStack = createNativeStackNavigator();

/* ─── Custom Tab Bar using BottomNav ─── */

function CustomTabBar({ state, navigation }) {
  const scheme = useColorScheme();
  const isWeb = Platform.OS === "web";
  const isDark = isWeb ? false : scheme === "dark";
  const theme = useMemo(() => getTheme({ isDark }), [isDark]);
  const insets = useSafeAreaInsets();
  const safeBottomInset = typeof insets.bottom === "number" ? insets.bottom : 0;

  const tabNames = state.routes.map((r) => r.name);
  const activeTab = tabNames[state.index];

  return (
    <BottomNav
      theme={theme}
      isDark={isDark}
      activeTab={activeTab}
      onTabChange={(tab) => {
        if (tab === "Check") {
          return;
        }
        if (tab === "Profile") {
          return;
        }
        if (tab === "Requests") {
          navigation.navigate("Leave");
          return;
        }
        navigation.navigate(tab);
      }}
      bottomInset={safeBottomInset}
    />
  );
}

/* ─── Header Right: Logout (Home only) ─── */

function HomeHeaderRight({ onLogout }) {
  return (
    <View style={headerS.rightRow}>
      <TouchableOpacity
        style={[headerS.headerBtn, headerS.logoutBtn]}
        activeOpacity={0.8}
        onPress={onLogout}
      >
        <MaterialIcons name="logout" size={18} color={COLORS.primary} />
        <Text style={[headerS.headerBtnText, { color: COLORS.primary }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ─── Shared Stack Header Styles ─── */

const defaultStackScreenOptions = {
  headerStyle: {
    backgroundColor: COLORS.primary,
  },
  headerTintColor: "#fff",
  headerTitleStyle: {
    fontWeight: "900",
    fontSize: 18,
  },
  headerShadowVisible: false,
};

/* ─── Stack Navigators (one per tab) ─── */

function HomeStackScreen({ onLogout }) {
  return (
    <HomeStack.Navigator screenOptions={defaultStackScreenOptions}>
      <HomeStack.Screen
        name="HomeScreen"
        component={Home}
        options={{
          title: "Workly",
          headerRight: () => <HomeHeaderRight onLogout={onLogout} />,
        }}
      />
    </HomeStack.Navigator>
  );
}

function TimesheetStackScreen() {
  return (
    <TimesheetStack.Navigator screenOptions={defaultStackScreenOptions}>
      <TimesheetStack.Screen
        name="TimesheetScreen"
        component={Timesheet}
        options={{ title: "Correction" }}
      />
    </TimesheetStack.Navigator>
  );
}

function LeaveStackScreen() {
  return (
    <LeaveStack.Navigator screenOptions={defaultStackScreenOptions}>
      <LeaveStack.Screen
        name="LeaveScreen"
        component={Leave}
        options={{ title: "Leave" }}
      />
    </LeaveStack.Navigator>
  );
}

function OvertimeStackScreen() {
  return (
    <OvertimeStack.Navigator screenOptions={defaultStackScreenOptions}>
      <OvertimeStack.Screen
        name="OvertimeScreen"
        component={Overtime}
        options={{ title: "Overtime" }}
      />
    </OvertimeStack.Navigator>
  );
}

function ScheduleStackScreen() {
  return (
    <ScheduleStack.Navigator screenOptions={defaultStackScreenOptions}>
      <ScheduleStack.Screen
        name="ScheduleScreen"
        component={Schedule}
        options={{ title: "Schedule" }}
      />
    </ScheduleStack.Navigator>
  );
}

/* ─── Main Tabs (authenticated) ─── */

function MainTabs({ onLogout }) {
  const HomeScreenWithLogout = useCallback(
    () => <HomeStackScreen onLogout={onLogout} />,
    [onLogout]
  );

  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreenWithLogout} />
      <Tab.Screen name="Timesheet" component={TimesheetStackScreen} />
      <Tab.Screen name="Leave" component={LeaveStackScreen} />
      <Tab.Screen name="Overtime" component={OvertimeStackScreen} />
      <Tab.Screen name="Schedule" component={ScheduleStackScreen} />
    </Tab.Navigator>
  );
}

/* ─── App ─── */

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authScreen, setAuthScreen] = useState("login"); // 'login' | 'register'

  const handleLogin = useCallback((credentials) => {
    // TODO: call real auth API
    console.log("Login:", credentials.email);
    setIsLoggedIn(true);
  }, []);

  const handleRegister = useCallback((data) => {
    // TODO: call real register API
    console.log("Register:", data.email);
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setAuthScreen("login");
  }, []);

  return (
    <SafeAreaProvider>
      {isLoggedIn ? (
        <NavigationContainer>
          <MainTabs onLogout={handleLogout} />
        </NavigationContainer>
      ) : authScreen === "register" ? (
        <Register
          onRegister={handleRegister}
          onGoToLogin={() => setAuthScreen("login")}
        />
      ) : (
        <Login
          onLogin={handleLogin}
          onGoToRegister={() => setAuthScreen("register")}
        />
      )}
    </SafeAreaProvider>
  );
}

/* ─── Header button styles ─── */

const headerS = StyleSheet.create({
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 4,
  },
  headerBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    marginLeft: 8,
  },
  headerBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
    marginLeft: 5,
  },
  logoutBtn: {
    backgroundColor: "rgba(255,255,255,0.92)",
  },
});