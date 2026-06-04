"use client";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle light / dark mode"
      style={{
        position: "fixed",
        top: 14,
        right: 16,
        zIndex: 200,
        width: 38,
        height: 38,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.18)",
        border: "1px solid rgba(255,255,255,0.28)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        fontSize: 17,
        transition: "transform 0.2s, background 0.2s",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
