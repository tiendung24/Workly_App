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
  Modal,
} from "react-native";
import { authService } from "../_utils/authService";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../_styles/theme";
import { loginStyles as s } from "../_styles/pages/loginStyles";
import Toast from "react-native-toast-message";

export default function Login({ onGoToRegister }) {
  const { login, isLoading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  // Forgot password logic
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const mockTheme = { bg: "#FAFAFA", card: "#fff", text: "#1F2937", sub: "#9CA3AF", navBorder: "#E5E7EB" };

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit) {
      if (email.trim().length === 0) return Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Please enter your email.' });
      if (password.trim().length === 0) return Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Please enter your password.' });
      return;
    }
    Keyboard.dismiss();
    const result = await login(email, password);
    if (!result.success) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: result.message || "Login failed" });
    }
  };

  const handleForgotPassword = async () => {
    if (forgotEmail.trim().length === 0) {
      return Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Vui lòng nhập email của bạn.' });
    }
    Keyboard.dismiss();
    setIsForgotLoading(true);
    try {
      const res = await authService.forgotPassword(forgotEmail);
      Toast.show({ type: 'success', text1: 'Thành công', text2: res.message || "Đã gửi yêu cầu cấp lại mật khẩu" });
      setShowForgotModal(false);
      setForgotEmail("");
    } catch (err) {
      console.log("Forgot password err:", err);
      const msg = err.response?.data?.message || "Không thể yêu cầu lấy lại mật khẩu";
      Toast.show({ type: 'error', text1: 'Lỗi', text2: msg });
    } finally {
      setIsForgotLoading(false);
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
          <View style={s.topSection}>
            <View style={s.logoWrap}>
              <Text style={s.logoText}>W</Text>
            </View>
            <Text style={s.brandName}>Workly</Text>
            <Text style={s.tagline}>Smart Workforce Management</Text>
          </View>

          {/* ─── Bottom: Form Card ─── */}
          <View style={s.formCard}>
            <Text style={s.formTitle}>Welcome back</Text>
            <Text style={s.formSubtitle}>
              Sign in to continue to your dashboard
            </Text>

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
                placeholder="Enter your password"
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

            {/* Forgot password */}
            <View style={s.forgotRow}>
              <TouchableOpacity activeOpacity={0.8} onPress={() => setShowForgotModal(true)}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={s.loginBtn}
              activeOpacity={0.85}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <MaterialIcons name="login" size={20} color="#fff" />
              )}
              <Text style={s.loginBtnText}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Text>
            </TouchableOpacity>

            {/* Sign Up */}
            <View style={s.signupRow}>
              <Text style={s.signupText}>Don't have an account?</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={onGoToRegister}>
                <Text style={s.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ─── Forgot Password Modal ─── */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}>
          <View style={{ width: "85%", backgroundColor: mockTheme.card, borderRadius: 16, padding: 24, elevation: 5 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: mockTheme.text, marginBottom: 8 }}>Quên mật khẩu</Text>
            <Text style={{ fontSize: 14, color: mockTheme.sub, marginBottom: 16 }}>Nhập email dùng để đăng ký tài khoản. Hệ thống sẽ cấp lại một mật khẩu mặc định cho bạn.</Text>
            
            <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: mockTheme.navBorder, borderRadius: 10, paddingHorizontal: 12, marginBottom: 24 }}>
              <MaterialIcons name="mail-outline" size={18} color={mockTheme.sub} />
              <TextInput
                style={{ flex: 1, paddingVertical: 10, paddingHorizontal: 8, color: mockTheme.text, fontSize: 14 }}
                value={forgotEmail}
                onChangeText={setForgotEmail}
                placeholder="Nhập email của bạn"
                placeholderTextColor={mockTheme.sub}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: mockTheme.navBorder, alignItems: "center" }}
                onPress={() => setShowForgotModal(false)}
              >
                <Text style={{ fontWeight: "600", color: mockTheme.text }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: COLORS.primary, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6 }}
                onPress={handleForgotPassword}
                disabled={isForgotLoading}
              >
                {isForgotLoading && <ActivityIndicator size="small" color="#fff" />}
                <Text style={{ fontWeight: "600", color: "#fff" }}>Lấy lại MK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
