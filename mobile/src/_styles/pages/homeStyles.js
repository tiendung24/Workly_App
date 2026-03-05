// mobile/src/_styles/pages/homeStyles.js
import { StyleSheet } from "react-native";
import { COLORS } from "../theme";

export const homeStyles = StyleSheet.create({
  appRoot: { flex: 1 },
  centerWrap: { flex: 1 },

  shell: { flex: 1 },
  shellWeb: { width: "100%", minHeight: "100%" },


  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },

  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  userRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
    overflow: "hidden",
    backgroundColor: "rgba(179,136,255,0.15)",
    marginRight: 10,
  },
  avatar: { width: "100%", height: "100%" },
  welcomeSmall: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "600" },
  userName: { color: "#fff", fontSize: 16, fontWeight: "900" },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    position: "relative",
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  clockBlock: { alignItems: "center", marginBottom: 8 },
  dateText: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700", marginBottom: 4 },
  timeRow: { flexDirection: "row", alignItems: "flex-end" },
  timeBig: { color: "#fff", fontSize: 38, fontWeight: "900", letterSpacing: -1 },
  ampm: { color: "rgba(255,255,255,0.65)", fontSize: 16, fontWeight: "700", paddingBottom: 8, marginLeft: 6 },

  pillRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  pillText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "800" },

  segment: {
    marginTop: 10,
    borderRadius: 18,
    padding: 6,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.98)",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  segBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  segBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  segText: { fontSize: 14, marginLeft: 8, marginRight: 8 },
  segTextActive: { color: "#fff", fontWeight: "900" },
  segTextInactive: { color: "#6B7280", fontWeight: "800" },

  body: { paddingTop: 18 },

 mainContent: {
  flex: 1,          
  paddingHorizontal: 18,
  paddingTop: 12,
  paddingBottom: 12,
},

  sectionTitle: { fontSize: 16, fontWeight: "900", marginBottom: 10 },

  summaryRow: { flexDirection: "row", gap: 12, marginBottom: 10 },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  summaryValue: { fontSize: 18, fontWeight: "900" },
  summaryLabel: { fontSize: 12, fontWeight: "800", marginTop: 6 },

  // ✅ Quick actions: 3 icon / hàng, tăng khoảng cách hàng trên-dưới
  actionItem: {
    width: "31%",
    alignItems: "center",
    marginBottom: 22,
  },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  actionLabel: { marginTop: 8, fontSize: 11, fontWeight: "800" },

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingHorizontal: 18,
    borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  navBtn: { width: 64, alignItems: "center" },
  navLabel: { fontSize: 10, fontWeight: "800", marginTop: 4 },

  fabSlot: { width: 80, alignItems: "center" },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    transform: [{ translateY: -22 }],
  },
});