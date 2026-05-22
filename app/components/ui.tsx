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

function premiumGlassStyle() {
  return {
    background:
      "linear-gradient(135deg, rgba(15,23,42,0.86), rgba(30,41,59,0.72))",
    color: "#e5eefc",
    border: "1px solid rgba(148,163,184,0.18)",
    boxShadow:
      "0 22px 55px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06)",
    backdropFilter: "blur(18px)",
  }
}

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
          background:
            "linear-gradient(135deg, rgba(2,6,23,0.96), rgba(30,64,175,0.82))",
          color: "white",
          border: "1px solid rgba(125,211,252,0.24)",
          boxShadow:
            "0 24px 60px rgba(2,6,23,0.42), inset 0 1px 0 rgba(255,255,255,0.08)",
        }
      : tone === "softBlue"
      ? {
          background:
            "linear-gradient(135deg, rgba(14,165,233,0.14), rgba(15,23,42,0.78))",
          color: "#e5eefc",
          border: "1px solid rgba(125,211,252,0.24)",
          boxShadow: "0 18px 46px rgba(14,165,233,0.10)",
        }
      : tone === "softGreen"
      ? {
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(15,23,42,0.78))",
          color: "#e5eefc",
          border: "1px solid rgba(134,239,172,0.22)",
          boxShadow: "0 18px 46px rgba(34,197,94,0.08)",
        }
      : tone === "softYellow"
      ? {
          background:
            "linear-gradient(135deg, rgba(250,204,21,0.13), rgba(15,23,42,0.78))",
          color: "#e5eefc",
          border: "1px solid rgba(250,204,21,0.24)",
          boxShadow: "0 18px 46px rgba(250,204,21,0.08)",
        }
      : premiumGlassStyle()

  return (
    <div
      className="sharks-card-shine"
      style={{
        ...toneStyle,
        borderRadius: 28,
        padding: 18,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 21,
        fontWeight: 1000,
        color: "#f8fafc",
        marginBottom: 8,
        lineHeight: 1.15,
        letterSpacing: "-0.03em",
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
        marginBottom: 16,
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 1000,
            color: light ? "white" : "#f8fafc",
            lineHeight: 1.15,
            letterSpacing: "-0.035em",
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              marginTop: 6,
              color: light ? "rgba(255,255,255,0.84)" : "#aebed4",
              fontSize: 14,
              lineHeight: 1.5,
              fontWeight: 600,
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

function baseButtonStyle(disabled: boolean) {
  return {
    padding: "13px 16px",
    borderRadius: 18,
    fontWeight: 900,
    fontSize: 15,
    cursor: disabled ? "not-allowed" : "pointer",
    width: "100%",
    transition: "all 0.18s ease",
    boxSizing: "border-box" as const,
  }
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
      className="sharks-premium-button"
      style={{
        ...baseButtonStyle(disabled),
        opacity: disabled ? 0.55 : 1,
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
        background: disabled
          ? "rgba(148,163,184,0.18)"
          : "linear-gradient(135deg, rgba(255,255,255,0.13), rgba(15,23,42,0.58))",
        color: disabled ? "#94a3b8" : "#e5eefc",
        border: "1px solid rgba(148,163,184,0.24)",
        boxShadow: disabled
          ? "none"
          : "0 12px 28px rgba(2,6,23,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
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
        background: disabled
          ? "rgba(148,163,184,0.18)"
          : "linear-gradient(135deg, rgba(239,68,68,0.24), rgba(127,29,29,0.70))",
        color: disabled ? "#94a3b8" : "#fee2e2",
        border: disabled
          ? "1px solid rgba(148,163,184,0.22)"
          : "1px solid rgba(252,165,165,0.30)",
        boxShadow: disabled ? "none" : "0 12px 28px rgba(127,29,29,0.22)",
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
          background: "rgba(37,99,235,0.22)",
          color: "#bfdbfe",
          border: "1px solid rgba(147,197,253,0.32)",
        }
      : tone === "green"
      ? {
          background: "rgba(34,197,94,0.18)",
          color: "#bbf7d0",
          border: "1px solid rgba(134,239,172,0.28)",
        }
      : tone === "yellow"
      ? {
          background: "rgba(250,204,21,0.18)",
          color: "#fde68a",
          border: "1px solid rgba(253,230,138,0.30)",
        }
      : tone === "red"
      ? {
          background: "rgba(239,68,68,0.18)",
          color: "#fecaca",
          border: "1px solid rgba(252,165,165,0.30)",
        }
      : {
          background: "rgba(148,163,184,0.16)",
          color: "#e2e8f0",
          border: "1px solid rgba(148,163,184,0.24)",
        }

  return (
    <span
      style={{
        ...style,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: "nowrap",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </span>
  )
}
