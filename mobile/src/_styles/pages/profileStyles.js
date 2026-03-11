import { StyleSheet } from "react-native";
import { COLORS } from "../theme";

export const profileStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },

  /* ─── Top Section ─── */
  topSection: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarFallback: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
  },
  userName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#fff",
  },

  /* ─── Info Section ─── */
  infoSection: {
    paddingHorizontal: 16,
    marginTop: -16,
  },
  infoCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 14,
  },
  infoIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 2,
  },

  /* ─── Actions ─── */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "800",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "900",
  },
});
