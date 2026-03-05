import { StyleSheet } from "react-native";
import { COLORS } from "../theme";

export const scheduleStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
  },

  /* ─── Month Header ─── */
  monthHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "900",
  },
  monthNav: {
    flexDirection: "row",
    gap: 6,
  },
  monthNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ─── Filters ─── */
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: {
    fontSize: 12,
    fontWeight: "800",
  },

  /* ─── Week Header ─── */
  weekHeaderRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  weekHeaderCell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 6,
  },
  weekHeaderText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* ─── Calendar Grid ─── */
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    minHeight: 72,
    padding: 3,
  },
  dayCellInner: {
    flex: 1,
    borderRadius: 10,
    padding: 4,
    alignItems: "center",
    borderWidth: 1,
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 1,
  },
  dayTimeText: {
    fontSize: 8,
    fontWeight: "700",
    marginTop: 1,
  },
  dayOtBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
  },
  dayOtText: {
    fontSize: 7,
    fontWeight: "900",
  },
  dayCheck: {
    marginTop: 2,
  },
  dayLeaveText: {
    fontSize: 7,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 1,
  },
  dayOffText: {
    fontSize: 9,
    fontWeight: "800",
    marginTop: 4,
  },

  /* ─── Legend ─── */
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 4,
    marginTop: 10,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    fontWeight: "700",
  },

  /* ─── Detail Sheet ─── */
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 14,
  },
  sheetDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetDate: {
    fontSize: 18,
    fontWeight: "900",
  },
  sheetStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  sheetStatusText: {
    fontSize: 12,
    fontWeight: "900",
  },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sheetRowIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetRowLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
  sheetRowValue: {
    fontSize: 15,
    fontWeight: "900",
  },
});
