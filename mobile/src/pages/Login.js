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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS } from "../_styles/theme";
import { loginStyles as s } from "../_styles/pages/loginStyles";
export default function Login({ onGoToRegister }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit) {
      if (email.trim().length === 0) return alert("Please enter your email.");
      if (password.trim().length === 0) return alert("Please enter your password.");
      return;
    }
    Keyboard.dismiss();
    const result = await login(email, password);
    if (!result.success) {
      alert(result.message || "Login failed");
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
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={s.loginBtn}
              activeOpacity={0.85}
              onPress={handleLogin}
            >
              <MaterialIcons name="login" size={20} color="#fff" />
              <Text style={s.loginBtnText}>Sign In</Text>
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
    </View>
  );
}
