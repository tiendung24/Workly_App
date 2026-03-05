import { StyleSheet } from "react-native";
import { COLORS } from "../theme";

export const overtimeStyles = StyleSheet.create({
  appRoot: { flex: 1 },
  centerWrap: { flex: 1 },

  shell: { flex: 1 },
  shellWeb: { width: "100%", minHeight: "100%" },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },

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

  // Summary card
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryValue: { fontSize: 22, fontWeight: "900" },
  summaryLabel: { fontSize: 12, fontWeight: "800", marginTop: 4 },

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

  // List / Empty
  emptyCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 13, fontWeight: "900" },
  emptyDesc: { fontSize: 12, fontWeight: "800", marginTop: 6, lineHeight: 16 },

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