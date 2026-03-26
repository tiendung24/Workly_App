import React, { useState, useContext } from "react";
import { AuthContext } from "../_utils/AuthContext";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../_styles/theme";
import { loginStyles as s } from "../_styles/pages/loginStyles";
import Toast from "react-native-toast-message";
import DatePickerInput from "../_components/shared/DatePickerInput";
import PickerInput from "../_components/shared/PickerInput";
import { metadataService } from "../_utils/metadataService";
import { useFocusEffect } from "@react-navigation/native";

export default function Register({ onGoToLogin }) {
  const { register, isLoading } = useContext(AuthContext);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [employeeCode, setEmployeeCode] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [startDate, setStartDate] = useState("");
  const [focusedField, setFocusedField] = useState(null);
  const [deptOptions, setDeptOptions] = useState([]);
  const [posOptions, setPosOptions] = useState([]);

  React.useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const depts = await metadataService.getDepartments();
      const poss = await metadataService.getPositions();
      if (depts.success) setDeptOptions(depts.data);
      if (poss.success) setPosOptions(poss.data);
    } catch (error) {
      console.log("Error loading metadata:", error);
    }
  };

  const mockTheme = { bg: "#FAFAFA", card: "#fff", text: "#1F2937", sub: "#9CA3AF", navBorder: "#E5E7EB" };

  const passwordsMatch = password === confirmPassword;
  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length >= 6 &&
    passwordsMatch;

  const handleRegister = async () => {
    if (!canSubmit) {
      if (fullName.trim().length === 0) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your full name.' });
      if (email.trim().length === 0) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your email.' });
      if (!employeeCode || employeeCode.trim().length === 0) return Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter your employee code.' });
      if (password.trim().length < 6) return Toast.show({ type: 'error', text1: 'Error', text2: 'Password must be at least 6 characters.' });
      if (!passwordsMatch) return Toast.show({ type: 'error', text1: 'Error', text2: 'Passwords do not match.' });
      return;
    }
    Keyboard.dismiss();
    const result = await register({ 
      full_name: fullName, 
      email, 
      phone, 
      password,
      employee_code: employeeCode,
      address: workLocation || "",
      department_name: department,
      position_name: position,
      start_date: startDate ? startDate.split("/").reverse().join("-") : undefined
    });
    
    if (!result.success) {
      Toast.show({ type: 'error', text1: 'Error', text2: result.message || "Registration failed" });
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ─── Top: Logo & Brand ─── */}
          <View style={[s.topSection, { paddingTop: 50, flex: 0, paddingBottom: 32 }]}>
            <View style={[s.logoWrap, { width: 70, height: 70, borderRadius: 22 }]}>
              <Text style={[s.logoText, { fontSize: 28 }]}>W</Text>
            </View>
         
          </View>

          {/* ─── Bottom: Form Card ─── */}
          <View style={[s.formCard, { flex: 1 }]}>
            <Text style={s.formTitle}>Create Account</Text>
            <Text style={s.formSubtitle}>
              Fill in the details to get started
            </Text>

            {/* Full Name */}
            <Text style={s.fieldLabel}>Full Name</Text>
            <View
              style={[
                s.inputRow,
                focusedField === "name" && s.inputRowFocused,
              ]}
            >
              <MaterialIcons
                name="person-outline"
                size={20}
                color={focusedField === "name" ? COLORS.primary : "#9CA3AF"}
              />
              <TextInput
                style={s.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Email */}
            <Text style={s.fieldLabel}>Email address</Text>
            <View
              style={[
                s.inputRow,
                focusedField === "email" && s.inputRowFocused,
              ]}
            >
              <MaterialIcons
                name="mail-outline"
                size={20}
                color={focusedField === "email" ? COLORS.primary : "#9CA3AF"}
              />
              <TextInput
                style={s.input}
                placeholder="you@company.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Employee Code */}
            <Text style={s.fieldLabel}>Employee Code</Text>
            <View style={[s.inputRow, focusedField === "empCode" && s.inputRowFocused]}>
              <MaterialIcons name="badge" size={20} color={focusedField === "empCode" ? COLORS.primary : "#9CA3AF"}/>
              <TextInput style={s.input} placeholder="e.g. EMP001" placeholderTextColor="#9CA3AF" value={employeeCode} onChangeText={setEmployeeCode} autoCapitalize="characters" onFocus={() => setFocusedField("empCode")} onBlur={() => setFocusedField(null)} />
            </View>

            {/* Phone */}
            <Text style={s.fieldLabel}>Phone number</Text>
            <View
              style={[
                s.inputRow,
                focusedField === "phone" && s.inputRowFocused,
              ]}
            >
              <MaterialIcons
                name="phone"
                size={20}
                color={focusedField === "phone" ? COLORS.primary : "#9CA3AF"}
              />
              <TextInput
                style={s.input}
                placeholder="0912 345 678"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                onFocus={() => setFocusedField("phone")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Work Location */}
            <Text style={s.fieldLabel}>Work Location</Text>
            <View style={[s.inputRow, focusedField === "workLoc" && s.inputRowFocused]}>
              <MaterialIcons name="business" size={20} color={focusedField === "workLoc" ? COLORS.primary : "#9CA3AF"}/>
              <TextInput style={s.input} placeholder="Office or Branch" placeholderTextColor="#9CA3AF" value={workLocation} onChangeText={setWorkLocation} onFocus={() => setFocusedField("workLoc")} onBlur={() => setFocusedField(null)} />
            </View>

            {/* Department */}
            <Text style={s.fieldLabel}>Department</Text>
            <PickerInput
                value={department}
                onSelect={setDepartment}
                options={deptOptions}
                placeholder="Select Department"
                theme={mockTheme}
                icon="corporate-fare"
                label="Choose Department"
            />

            {/* Position */}
            <Text style={[s.fieldLabel, { marginTop: 16 }]}>Position</Text>
            <PickerInput
                value={position}
                onSelect={setPosition}
                options={posOptions}
                placeholder="Select Position"
                theme={mockTheme}
                icon="work-outline"
                label="Choose Position"
            />

            {/* Start Date */}
            <Text style={s.fieldLabel}>Start Date</Text>
            <DatePickerInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="DD/MM/YYYY"
              theme={mockTheme}
            />

            {/* Password */}
            <Text style={s.fieldLabel}>Password</Text>
            <View
              style={[
                s.inputRow,
                focusedField === "password" && s.inputRowFocused,
              ]}
            >
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={focusedField === "password" ? COLORS.primary : "#9CA3AF"}
              />
              <TextInput
                style={s.input}
                placeholder="At least 6 characters"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={s.eyeBtn}
                activeOpacity={0.7}
                onPress={() => setShowPassword(!showPassword)}
              >
                <MaterialIcons
                  name={showPassword ? "visibility" : "visibility-off"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <Text style={s.fieldLabel}>Confirm Password</Text>
            <View
              style={[
                s.inputRow,
                focusedField === "confirm" && s.inputRowFocused,
                confirmPassword.length > 0 &&
                  !passwordsMatch && {
                    borderColor: "#EF4444",
                    backgroundColor: "#FEF2F2",
                  },
              ]}
            >
              <MaterialIcons
                name="lock-outline"
                size={20}
                color={
                  confirmPassword.length > 0 && !passwordsMatch
                    ? "#EF4444"
                    : focusedField === "confirm"
                    ? COLORS.primary
                    : "#9CA3AF"
                }
              />
              <TextInput
                style={s.input}
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                onFocus={() => setFocusedField("confirm")}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity
                style={s.eyeBtn}
                activeOpacity={0.7}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <MaterialIcons
                  name={showConfirm ? "visibility" : "visibility-off"}
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <Text style={s.errorText}>Passwords do not match</Text>
            )}

            {/* Register Button */}
            <TouchableOpacity
              style={[s.loginBtn, { marginTop: 20 }]}
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="person-add" size={20} color="#fff" />
              )}
              <Text style={s.loginBtnText}>
                {isLoading ? "Creating..." : "Create Account"}
              </Text>
            </TouchableOpacity>

            {/* Go to Login */}
            <View style={s.signupRow}>
              <Text style={s.signupText}>Already have an account?</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={onGoToLogin}>
                <Text style={s.signupLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
