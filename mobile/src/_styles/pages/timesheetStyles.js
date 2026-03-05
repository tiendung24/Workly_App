import { StyleSheet } from "react-native";
import { COLORS } from "../theme";

export const timesheetStyles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  /* ─── Summary Banner ─── */
  banner: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  bannerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  bannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#fff",
  },
  bannerSub: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    marginTop: 3,
  },

  /* ─── Status Tabs ─── */
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "900",
  },

  /* ─── Request Card ─── */
  requestCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  requestDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  requestDateBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  requestDateDay: {
    fontSize: 15,
    fontWeight: "900",
  },
  requestDateMonth: {
    fontSize: 9,
    fontWeight: "800",
  },
  requestType: {
    fontSize: 14,
    fontWeight: "900",
  },
  requestReason: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },
  requestDetailRow: {
    flexDirection: "row",
    gap: 10,
  },
  requestDetailItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  requestDetailLabel: {
    fontSize: 10,
    fontWeight: "700",
  },
  requestDetailValue: {
    fontSize: 12,
    fontWeight: "900",
  },

  /* ─── Empty ─── */
  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 30,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    textAlign: "center",
  },

  /* ─── FAB ─── */
  fab: {
    position: "absolute",
    right: 18,
    bottom: 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});