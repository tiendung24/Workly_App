import "react-native-gesture-handler";
import { enableScreens } from "react-native-screens";
enableScreens(false);
import React, { useMemo, useCallback, useContext } from "react";
import {
  Platform,
  useColorScheme,
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  LogBox
} from "react-native";

// Ignore third-party deprecation warnings on Web
LogBox.ignoreLogs([
  "props.pointerEvents is deprecated",
  "Warning: props.pointerEvents is deprecated"
]);

import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

// Auth Context
import { AuthProvider, AuthContext } from "./src/_utils/AuthContext";
import Toast from "react-native-toast-message";

import Login from "./src/pages/Login";
import Register from "./src/pages/Register";
import Home from "./src/pages/Home";
import Timesheet from "./src/pages/Timesheet";
import Leave from "./src/pages/Leave";
import Overtime from "./src/pages/Overtime";
import Schedule from "./src/pages/Schedule";
import Profile from "./src/pages/Profile";
import Approval from "./src/pages/Approval";
import AdminDashboard from "./src/pages/admin/AdminDashboard";
import AdminUsers from "./src/pages/admin/AdminUsers";
import AdminConfig from "./src/pages/admin/AdminConfig";
import AdminTimesheet from "./src/pages/admin/AdminTimesheet";

import BottomNav from "./src/_components/layout/BottomNav";
import AdminBottomNav from "./src/_components/layout/AdminBottomNav";
import { getTheme, COLORS } from "./src/_styles/theme";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const TimesheetStack = createNativeStackNavigator();
const LeaveStack = createNativeStackNavigator();
const OvertimeStack = createNativeStackNavigator();
const ScheduleStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const ApprovalStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();

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
          navigation.navigate("Profile");
          return;
        }
        if (tab === "Requests") {
          navigation.navigate("Leave");
          return;
        }
        if (tab === "Approval") {
          navigation.navigate("Approval");
          return;
        }
        navigation.navigate(tab);
      }}
      bottomInset={safeBottomInset}
      userRole={state.routes.find(r => r.name === 'Admin') ? 'Admin' : state.routes.find(r => r.name === 'Approval') ? 'Manager' : 'Employee'} // Hacky but works for BottomNav
    />
  );
}

/* ─── Custom Tab Bar for Admin ─── */

function AdminTabBar({ state, navigation }) {
  const scheme = useColorScheme();
  const isWeb = Platform.OS === "web";
  const isDark = isWeb ? false : scheme === "dark";
  const theme = useMemo(() => getTheme({ isDark }), [isDark]);
  const insets = useSafeAreaInsets();
  const safeBottomInset = typeof insets.bottom === "number" ? insets.bottom : 0;

  const tabNames = state.routes.map((r) => r.name);
  const activeTab = tabNames[state.index];

  return (
    <AdminBottomNav
      theme={theme}
      isDark={isDark}
      activeTab={activeTab}
      onTabChange={(tab) => {
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

function ProfileStackScreen({ onLogout }) {
  const ProfileWithLogout = React.useCallback(
    () => <Profile onLogout={onLogout} />,
    [onLogout]
  );
  return (
    <ProfileStack.Navigator screenOptions={defaultStackScreenOptions}>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileWithLogout}
        options={{ title: "Profile" }}
      />
    </ProfileStack.Navigator>
  );
}

function ApprovalStackScreen() {
  return (
    <ApprovalStack.Navigator screenOptions={defaultStackScreenOptions}>
      <ApprovalStack.Screen
        name="ApprovalScreen"
        component={Approval}
        options={{ title: "Approvals" }}
      />
    </ApprovalStack.Navigator>
  );
}

function AdminStackScreen() {
  return (
    <AdminStack.Navigator screenOptions={defaultStackScreenOptions}>
      <AdminStack.Screen
        name="AdminDashboardScreen"
        component={AdminDashboard}
        options={{ title: "Admin Portal" }}
      />
      <AdminStack.Screen
        name="AdminUsersScreen"
        component={AdminUsers}
        options={{ title: "Users" }}
      />
      <AdminStack.Screen
        name="AdminConfigScreen"
        component={AdminConfig}
        options={{ title: "Config" }}
      />
      <AdminStack.Screen
        name="AdminTimesheetScreen"
        component={AdminTimesheet}
        options={{ title: "Timesheet" }}
      />
    </AdminStack.Navigator>
  );
}

/* ─── Main Tabs (authenticated) ─── */

function MainTabs({ onLogout, role }) {
  const HomeScreenWithLogout = useCallback(
    () => <HomeStackScreen onLogout={onLogout} />,
    [onLogout]
  );
  const ProfileScreenWithLogout = useCallback(
    () => <ProfileStackScreen onLogout={onLogout} />,
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
      <Tab.Screen name="Profile" component={ProfileScreenWithLogout} />
      {(role === 'Manager') && (
        <Tab.Screen name="Approval" component={ApprovalStackScreen} />
      )}
    </Tab.Navigator>
  );
}

function AdminTabs({ onLogout }) {
  const ProfileScreenWithLogout = useCallback(
    () => <ProfileStackScreen onLogout={onLogout} />,
    [onLogout]
  );
  return (
    <Tab.Navigator
      tabBar={(props) => <AdminTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Admin" component={AdminStackScreen} />
      <Tab.Screen name="Profile" component={ProfileScreenWithLogout} />
    </Tab.Navigator>
  );
}

/* ─── Navigation Wrapper ─── */
function RootNavigation() {
  const { userToken, userInfo, logout } = useContext(AuthContext);
  const [authScreen, setAuthScreen] = React.useState("login");

  return (
    <NavigationContainer>
      {userToken ? (
        userInfo?.role === 'Admin' || userInfo?.role?.name === 'Admin' ? (
           <AdminTabs onLogout={logout} />
        ) : (
           <MainTabs onLogout={logout} role={userInfo?.role?.name || userInfo?.role} />
        )
      ) : (
        authScreen === "register" ? (
          <Register onGoToLogin={() => setAuthScreen("login")} />
        ) : (
          <Login onGoToRegister={() => setAuthScreen("register")} />
        )
      )}
    </NavigationContainer>
  );
}


/* ─── App ─── */

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigation />
        <Toast />
      </AuthProvider>
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