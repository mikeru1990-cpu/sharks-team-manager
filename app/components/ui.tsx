"use client"

import type { ReactNode } from "react"

export function PageCard({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: "default" | "blue" | "softBlue" | "softYellow" | "softGreen"
}) {
  const backgrounds = {
    default: "white",
    blue: "linear-gradient(135deg, #0f2c73 0%, #0c235f 100%)",
    softBlue: "#eff6ff",
    softYellow: "#fefce8",
    softGreen: "#ecfdf5",
  }

  const borders = {
    default: "1px solid #e2e8f0",
    blue: "1px solid rgba(255,255,255,0.12)",
    softBlue: "1px solid #bfdbfe",
    softYellow: "1px solid #fde68a",
    softGreen: "1px solid #a7f3d0",
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 22,
        background: backgrounds[tone],
        border: borders[tone],
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.05)",
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
  action?: ReactNode
  light?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 12,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: light ? "white" : "#0f172a",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 4,
              color: light ? "rgba(255,255,255,0.82)" : "#64748b",
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        border: "none",
        background: disabled ? "#94a3b8" : "#0f2c73",
        color: "white",
        borderRadius: 14,
        padding: "12px 14px",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        boxShadow: disabled ? "none" : "0 6px 14px rgba(15, 44, 115, 0.18)",
      }}
    >
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid #cbd5e1",
        background: "white",
        color: "#0f172a",
        borderRadius: 14,
        padding: "12px 14px",
        fontWeight: 800,
      }}
    >
      {children}
    </button>
  )
}

export function DangerButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid #fecaca",
        background: "#fff1f2",
        color: "#b91c1c",
        borderRadius: 14,
        padding: "12px 14px",
        fontWeight: 800,
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
  children: ReactNode
  tone?: "default" | "blue" | "green" | "yellow" | "red"
}) {
  const styles = {
    default: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      color: "#475569",
    },
    blue: {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      color: "#1e3a8a",
    },
    green: {
      background: "#ecfdf5",
      border: "1px solid #a7f3d0",
      color: "#065f46",
    },
    yellow: {
      background: "#fef3c7",
      border: "1px solid #fcd34d",
      color: "#92400e",
    },
    red: {
      background: "#fee2e2",
      border: "1px solid #fecaca",
      color: "#991b1b",
    },
  }

  return (
    <span
      style={{
        ...styles[tone],
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  )
}
