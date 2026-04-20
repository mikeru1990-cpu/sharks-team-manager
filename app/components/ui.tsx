"use client"

import { THEME } from "../lib/theme"

type Tone =
  | "default"
  | "blue"
  | "green"
  | "yellow"
  | "red"
  | "softBlue"
  | "softGreen"
  | "softYellow"

/* =========================
   PAGE CARD
========================= */
export function PageCard({
  children,
  tone = "default",
}: {
  children: React.ReactNode
  tone?: Tone
}) {
  const toneStyle =
    tone === "blue"
      ? {
          background: `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.primaryDark} 100%)`,
          color: "white",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "0 18px 40px rgba(15,23,42,0.18)",
        }
      : tone === "softBlue"
      ? {
          background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
          color: THEME.colors.textPrimary,
          border: "1px solid #bfdbfe",
          boxShadow: "0 10px 24px rgba(30,64,175,0.06)",
        }
      : tone === "softGreen"
      ? {
          background: "linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)",
          color: THEME.colors.textPrimary,
          border: "1px solid #bbf7d0",
          boxShadow: "0 10px 24px rgba(22,101,52,0.05)",
        }
      : tone === "softYellow"
      ? {
          background: "linear-gradient(135deg, #fefce8 0%, #ffffff 100%)",
          color: THEME.colors.textPrimary,
          border: "1px solid #fde68a",
          boxShadow: "0 10px 24px rgba(146,64,14,0.05)",
        }
      : {
          background: THEME.colors.surface,
          color: THEME.colors.textPrimary,
          border: `1px solid ${THEME.colors.border}`,
          boxShadow: "0 10px 28px rgba(15,23,42,0.05)",
        }

  return (
    <div
      style={{
        ...toneStyle,
        borderRadius: 24,
        padding: 16,
      }}
    >
      {children}
    </div>
  )
}

/* =========================
   SECTION TITLE
========================= */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 20,
        fontWeight: 900,
        color: THEME.colors.textPrimary,
        marginBottom: 8,
        lineHeight: 1.15,
      }}
    >
      {children}
    </div>
  )
}

/* =========================
   SECTION HEADER
========================= */
export function SectionHeader({
  title,
  subtitle,
  action,
  light = false,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  light?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: subtitle ? "flex-start" : "center",
        gap: 12,
        marginBottom: 14,
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 21,
            fontWeight: 900,
            color: light ? "white" : THEME.colors.textPrimary,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              marginTop: 5,
              color: light ? "rgba(255,255,255,0.84)" : THEME.colors.textSecondary,
              fontSize: 14,
              lineHeight: 1.45,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {action ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          {action}
        </div>
      ) : null}
    </div>
  )
}

/* =========================
   BUTTON BASE
========================= */
function baseButtonStyle(disabled: boolean) {
  return {
    padding: "12px 16px",
    borderRadius: 16,
    fontWeight: 800,
    fontSize: 15,
    cursor: disabled ? "not-allowed" : "pointer",
    width: "100%",
    transition: "all 0.2s ease",
    boxSizing: "border-box" as const,
  }
}

/* =========================
   BUTTONS
========================= */
export function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseButtonStyle(disabled),
        background: disabled
          ? "#94a3b8"
          : `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.primaryDark} 100%)`,
        color: "white",
        border: "none",
        boxShadow: disabled ? "none" : "0 10px 20px rgba(30,58,138,0.18)",
      }}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseButtonStyle(disabled),
        background: disabled ? "#e2e8f0" : "white",
        color: disabled ? "#94a3b8" : THEME.colors.textPrimary,
        border: "1px solid #cbd5e1",
        boxShadow: disabled ? "none" : "0 6px 14px rgba(15,23,42,0.05)",
      }}
    >
      {children}
    </button>
  )
}

export function DangerButton({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...baseButtonStyle(disabled),
        background: disabled ? "#e2e8f0" : "#fff1f2",
        color: disabled ? "#94a3b8" : "#b91c1c",
        border: disabled ? "1px solid #cbd5e1" : "1px solid #fecaca",
        boxShadow: disabled ? "none" : "0 6px 14px rgba(185,28,28,0.06)",
      }}
    >
      {children}
    </button>
  )
}

/* =========================
   BADGE
========================= */
export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode
  tone?: "default" | "blue" | "green" | "yellow" | "red"
}) {
  const style =
    tone === "blue"
      ? {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        }
      : tone === "green"
      ? {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        }
      : tone === "yellow"
      ? {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        }
      : tone === "red"
      ? {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        }
      : {
          background: "#f8fafc",
          color: "#334155",
          border: "1px solid #e2e8f0",
        }

  return (
    <span
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "5px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  )
}
