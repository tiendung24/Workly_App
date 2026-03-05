import React, { useMemo } from "react";
import { View, Platform, useColorScheme, useWindowDimensions, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getTheme } from "../../_styles/theme";

/**
 * Shared Layout wrapper for all pages.
 * Provides theme, insets, and common background.
 * Uses render-prop pattern: children receives { theme, isDark, insets, isWeb, webPadding }.
 */
export default function Layout({ children }) {
  const scheme = useColorScheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isWeb = Platform.OS === "web";
  const isDark = isWeb ? false : scheme === "dark";
  const theme = useMemo(() => getTheme({ isDark }), [isDark]);

  const webPadding = isWeb ? Math.max(18, Math.min(56, width * 0.05)) : 0;
  const safeInsetsTop = typeof insets.top === "number" ? insets.top : 0;
  const safeInsetsBottom = typeof insets.bottom === "number" ? insets.bottom : 0;

  const layoutProps = {
    theme,
    isDark,
    insets: { top: safeInsetsTop, bottom: safeInsetsBottom },
    isWeb,
    webPadding,
  };

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      {typeof children === "function" ? children(layoutProps) : children}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
});
