import { StyleSheet } from "react-native";
import { COLORS } from "../theme";

export const leaveStyles = StyleSheet.create({
  appRoot: { flex: 1 },
  centerWrap: { flex: 1 },

  shell: { flex: 1 },
  shellWeb: { width: "100%", minHeight: "100%" },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },

  // Top bar (sticky)
  topBar: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  topBarLeft: { flexDirection: "row", alignItems: "center" },
  topTitle: { fontSize: 18, fontWeight: "900", marginLeft: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  content: { paddingHorizontal: 18, paddingTop: 14 },

  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: "900" },

  // Balance cards
  balanceRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  balanceCard: {
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
  balanceIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  balanceValue: { fontSize: 18, fontWeight: "900" },
  balanceLabel: { fontSize: 11, fontWeight: "800", marginTop: 3 },

  // Tabs
  tabsRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  tabText: { fontSize: 12, fontWeight: "900" },

  // List
  card: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flexDirection: "row", alignItems: "center" },

  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  dateMonth: { fontSize: 10, fontWeight: "900" },
  dateDay: { fontSize: 16, fontWeight: "900", marginTop: 2 },

  title: { fontSize: 13, fontWeight: "900" },
  sub: { fontSize: 12, fontWeight: "800", marginTop: 4 },

  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  pillText: { fontSize: 10, fontWeight: "900", letterSpacing: 0.8 },

  emptyCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 13, fontWeight: "900" },
  emptyDesc: { fontSize: 12, fontWeight: "800", marginTop: 6, lineHeight: 16 },

  // History Card styles
  historyCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  historyType: {
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 4,
  },
  historyDates: {
    fontSize: 12,
    fontWeight: "700",
  },
  historyStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 4,
  },
  historyStatusText: {
    fontSize: 11,
    fontWeight: "900",
  },
  historyReason: {
    fontSize: 13,
    fontWeight: "600",
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 18,
  },
  managerCommentBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },
  managerCommentText: {
    fontSize: 12,
    fontWeight: "700",
    flexShrink: 1,
  },

  // FAB
  fabWrap: { position: "absolute", right: 18, zIndex: 50 },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
});