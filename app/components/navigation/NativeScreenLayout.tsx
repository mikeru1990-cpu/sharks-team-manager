"use client"

import type { ReactNode } from "react"
import { eliteTheme } from "../../lib/eliteTheme"

type Props = {
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
  children: ReactNode
}

export default function NativeScreenLayout({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        paddingBottom: 120,
        background:
          "radial-gradient(circle at top, rgba(56,189,248,0.12), transparent 30%), #020617",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          background: "rgba(2,6,23,0.82)",
          borderBottom: `1px solid ${eliteTheme.colors.border}`,
          padding: `${eliteTheme.spacing.lg}px ${eliteTheme.spacing.lg}px ${eliteTheme.spacing.md}px`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <div
              style={{
                color: eliteTheme.colors.text,
                fontSize: 28,
                fontWeight: 900,
                lineHeight: 1,
                marginBottom: 4,
                letterSpacing: -0.8,
              }}
            >
              {title}
            </div>

            {subtitle && (
              <div
                style={{
                  color: eliteTheme.colors.textMuted,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          {actionLabel && (
            <button
              onClick={onAction}
              style={{
                border: `1px solid ${eliteTheme.colors.border}`,
                background: eliteTheme.gradients.primary,
                color: eliteTheme.colors.text,
                borderRadius: eliteTheme.radius.full,
                padding: "10px 16px",
                fontWeight: 800,
                fontSize: 13,
                boxShadow: eliteTheme.shadows.glowBlue,
                cursor: "pointer",
              }}
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: eliteTheme.spacing.md,
          padding: eliteTheme.spacing.lg,
        }}
      >
        {children}
      </div>
    </div>
  )
}
