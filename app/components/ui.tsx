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
        }
      : tone === "softBlue"
      ? {
          background: "#eff6ff",
          color: THEME.colors.textPrimary,
          border: "1px solid #bfdbfe",
        }
      : tone === "softGreen"
      ? {
          background: "#ecfdf5",
          color: THEME.colors.textPrimary,
          border: "1px solid #bbf7d0",
        }
      : tone === "softYellow"
      ? {
          background: "#fefce8",
          color: THEME.colors.textPrimary,
          border: "1px solid #fde68a",
        }
      : {
          background: THEME.colors.surface,
          color: THEME.colors.textPrimary,
          border: `1px solid ${THEME.colors.border}`,
        }

  return (
    <div
      style={{
        ...toneStyle,
        borderRadius: THEME.radius.card,
        padding: 16,
        boxShadow: THEME.shadow.card,
      }}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 20,
        fontWeight: 800,
        color: THEME.colors.textPrimary,
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  )
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: subtitle ? "flex-start" : "center",
        gap: 12,
        marginBottom: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: THEME.colors.textPrimary,
            lineHeight: 1.2,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 4,
              color: THEME.colors.textSecondary,
              fontSize: 14,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>

      {action ? <div>{action}</div> : null}
    </div>
  )
}

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
        background: disabled ? "#94a3b8" : THEME.colors.primary,
        color: "white",
        border: "none",
        padding: "12px 16px",
        borderRadius: THEME.radius.button,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
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
        background: disabled ? "#e2e8f0" : THEME.colors.secondary,
        color: "#111827",
        border: "none",
        padding: "12px 16px",
        borderRadius: THEME.radius.button,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
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
        background: disabled ? "#e2e8f0" : "#fee2e2",
        color: disabled ? "#94a3b8" : "#b91c1c",
        border: disabled ? "1px solid #cbd5e1" : "1px solid #fecaca",
        padding: "12px 16px",
        borderRadius: THEME.radius.button,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
      }}
    >
      {children}
    </button>
  )
}

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
        padding: "4px 8px",
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
