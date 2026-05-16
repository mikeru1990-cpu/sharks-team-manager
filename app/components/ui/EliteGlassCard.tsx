"use client"

import { eliteTheme } from "@/app/lib/eliteTheme"
import type { ReactNode } from "react"

type Props = {
  title?: string
  subtitle?: string
  children: ReactNode
  glow?: "blue" | "green" | "none"
}

export default function EliteGlassCard({
  title,
  subtitle,
  children,
  glow = "blue",
}: Props) {
  const glowShadow =
    glow === "green"
      ? eliteTheme.shadows.glowGreen
      : glow === "blue"
        ? eliteTheme.shadows.glowBlue
        : "none"

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: eliteTheme.radius.lg,
        border: `1px solid ${eliteTheme.colors.border}`,
        background: eliteTheme.gradients.card,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        padding: eliteTheme.spacing.lg,
        boxShadow: `${eliteTheme.shadows.large}, ${glowShadow}`,
        transition: eliteTheme.animation.normal,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0))",
          pointerEvents: "none",
        }}
      />

      {(title || subtitle) && (
        <div style={{ marginBottom: eliteTheme.spacing.md }}>
          {title && (
            <div
              style={{
                ...eliteTheme.typography.title,
                color: eliteTheme.colors.text,
                marginBottom: 4,
              }}
            >
              {title}
            </div>
          )}

          {subtitle && (
            <div
              style={{
                ...eliteTheme.typography.caption,
                color: eliteTheme.colors.textMuted,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  )
}
