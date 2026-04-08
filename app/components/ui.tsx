"use client"

import type { ReactNode } from "react"

export function PageCard({
  children,
  tone = "default",
}: {
  children: ReactNode
  tone?: "default" | "blue" | "softBlue" | "softYellow"
}) {
  const backgrounds = {
    default: "white",
    blue: "linear-gradient(135deg, #0f2c73 0%, #0c235f 100%)",
    softBlue: "#eff6ff",
    softYellow: "#fefce8",
  }

  const borders = {
    default: "1px solid #e2e8f0",
    blue: "1px solid rgba(255,255,255,0.12)",
    softBlue: "1px solid #bfdbfe",
    softYellow: "1px solid #fde68a",
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 20,
        background: backgrounds[tone],
        border: borders[tone],
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
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
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              marginTop: 4,
              color: light ? "rgba(255,255,255,0.85)" : "#64748b",
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
