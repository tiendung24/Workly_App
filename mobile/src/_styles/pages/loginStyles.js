import { StyleSheet } from "react-native";
import { COLORS } from "../theme";

export const loginStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  gradient: {
    flex: 1,
  },

  /* ─── Top visual ─── */
  topSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingTop: 40,
  },
  logoWrap: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  logoText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: -1,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "900",
    color: "#fff",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    marginTop: 8,
    textAlign: "center",
  },

  /* ─── Form card ─── */
  formCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 32,
    paddingHorizontal: 24,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: -10 },
    elevation: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
    marginBottom: 24,
  },

  /* ─── Fields ─── */
  fieldLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#6B7280",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 10,
  },
  inputRowFocused: {
    borderColor: COLORS.primary,
    backgroundColor: "#F5F0FF",
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 14,
  },
  eyeBtn: {
    padding: 4,
  },

  /* ─── Forgot ─── */
  forgotRow: {
    alignItems: "flex-end",
    marginBottom: 22,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.primary,
  },

  /* ─── Error ─── */
  errorText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
    marginTop: -10,
    marginBottom: 8,
    marginLeft: 4,
  },

  /* ─── Login Button ─── */
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#fff",
  },

  /* ─── Sign up ─── */
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    gap: 4,
  },
  signupText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  signupLink: {
    fontSize: 13,
    fontWeight: "900",
    color: COLORS.primary,
  },
});
