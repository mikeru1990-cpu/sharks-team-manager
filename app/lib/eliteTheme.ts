export const eliteTheme = {
  colors: {
    background: "#020617",
    surface: "rgba(15,23,42,0.78)",
    surfaceLight: "rgba(30,41,59,0.72)",
    border: "rgba(148,163,184,0.12)",

    primary: "#38bdf8",
    primaryGlow: "rgba(56,189,248,0.32)",

    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",

    text: "#f8fafc",
    textMuted: "rgba(226,232,240,0.72)",
  },

  gradients: {
    app: "linear-gradient(180deg,#020617 0%,#0f172a 100%)",

    card:
      "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.76))",

    live:
      "linear-gradient(135deg, rgba(34,197,94,0.24), rgba(34,197,94,0.08))",

    danger:
      "linear-gradient(135deg, rgba(239,68,68,0.22), rgba(239,68,68,0.08))",

    primary:
      "linear-gradient(135deg, rgba(56,189,248,1) 0%, rgba(14,165,233,1) 100%)",
  },

  shadows: {
    soft: "0 10px 30px rgba(0,0,0,0.22)",

    medium: "0 18px 40px rgba(0,0,0,0.34)",

    large: "0 28px 70px rgba(0,0,0,0.55)",

    glowBlue: "0 0 30px rgba(56,189,248,0.32)",

    glowGreen: "0 0 28px rgba(34,197,94,0.28)",
  },

  radius: {
    sm: 14,
    md: 22,
    lg: 32,
    xl: 40,
    full: 999,
  },

  typography: {
    hero: {
      fontSize: 34,
      fontWeight: 900,
      letterSpacing: -1.4,
    },

    title: {
      fontSize: 24,
      fontWeight: 800,
      letterSpacing: -0.8,
    },

    section: {
      fontSize: 18,
      fontWeight: 700,
    },

    body: {
      fontSize: 15,
      fontWeight: 500,
    },

    caption: {
      fontSize: 13,
      fontWeight: 600,
    },
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 36,
  },

  animation: {
    fast: "all 0.18s ease",
    normal: "all 0.28s ease",
    slow: "all 0.42s ease",
  },
}
