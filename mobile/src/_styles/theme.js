
export const COLORS = {
  primary: "#6200EA",
  primaryLight: "#B388FF",

  bgLight: "#F3F4F6",
  bgDark: "#121212",

  cardLight: "#FFFFFF",
  cardDark: "#1E1E1E",

  textLight: "#111827",
  textDark: "#F9FAFB",

  subLight: "#6B7280",
  subDark: "#9CA3AF",
};

export function getTheme({ isDark }) {
  return {
    bg: isDark ? COLORS.bgDark : COLORS.bgLight,
    card: isDark ? COLORS.cardDark : COLORS.cardLight,
    text: isDark ? COLORS.textDark : COLORS.textLight,
    sub: isDark ? COLORS.subDark : COLORS.subLight,
    navGlass: isDark ? "rgba(30,30,30,0.92)" : "rgba(255,255,255,0.92)",
    navBorder: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
  };
}