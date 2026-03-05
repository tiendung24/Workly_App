
export function menuToneBg(tone, isDark) {
  const map = {
    orange: isDark ? "rgba(234,88,12,0.25)" : "#FFEDD5",
    blue: isDark ? "rgba(37,99,235,0.25)" : "#DBEAFE",
    green: isDark ? "rgba(22,163,74,0.25)" : "#DCFCE7",
    purple: isDark ? "rgba(124,77,255,0.25)" : "#EDE9FE",
    pink: isDark ? "rgba(236,72,153,0.25)" : "#FCE7F3",
    teal: isDark ? "rgba(13,148,136,0.25)" : "#CCFBF1",
    indigo: isDark ? "rgba(79,70,229,0.25)" : "#E0E7FF",
    gray: isDark ? "rgba(75,85,99,0.25)" : "#F3F4F6",
  };
  return map[tone] ?? (isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6");
}

export function menuToneIcon(tone, isDark, primary = "#6200EA") {
  const map = {
    orange: isDark ? "#FDBA74" : "#EA580C",
    blue: isDark ? "#93C5FD" : "#2563EB",
    green: isDark ? "#86EFAC" : "#16A34A",
    purple: isDark ? "#C4B5FD" : primary,
    pink: isDark ? "#F9A8D4" : "#EC4899",
    teal: isDark ? "#5EEAD4" : "#0D9488",
    indigo: isDark ? "#A5B4FC" : "#4F46E5",
    gray: isDark ? "#D1D5DB" : "#4B5563",
  };
  return map[tone] ?? (isDark ? "#D1D5DB" : "#4B5563");
}

export function activityBg(color, isDark) {
  const map = {
    green: isDark ? "rgba(22,163,74,0.25)" : "#DCFCE7",
    red: isDark ? "rgba(220,38,38,0.25)" : "#FEE2E2",
  };
  return map[color] ?? (isDark ? "rgba(255,255,255,0.06)" : "#F3F4F6");
}

export function activityIcon(color, isDark) {
  const map = {
    green: isDark ? "#86EFAC" : "#16A34A",
    red: isDark ? "#FCA5A5" : "#DC2626",
  };
  return map[color] ?? (isDark ? "#D1D5DB" : "#4B5563");
}