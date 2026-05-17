"use client"

import type { ReactNode } from "react"
import { eliteTheme } from "../../lib/eliteTheme"

type Props = {
  title?: string
  subtitle?: string
  rightSlot?: ReactNode
  children: ReactNode
  compact?: boolean
  onClick?: () => void
}

export default function OperationalCard({
  title,
  subtitle,
  rightSlot,
  children,
  compact = false,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: eliteTheme.radius.md,
        border: `1px solid ${eliteTheme.colors.border}`,
        background: eliteTheme.gradients.card,
        boxShadow: eliteTheme.shadows.soft,
        padding: compact
          ? eliteTheme.spacing.md
          : eliteTheme.spacing.lg,
        display: "flex",
        flexDirection: "column",
        gap: eliteTheme.spacing.md,
        transition: eliteTheme.animation.normal,
        cursor: onClick ? "pointer" : "default",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
          pointerEvents: "none",
        }}
      />

      {(title || subtitle || rightSlot) && (
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            {title && (
              <div
                style={{
                  color: eliteTheme.colors.text,
                  fontSize: compact ? 16 : 18,
                  fontWeight: 800,
                  letterSpacing: -0.4,
                  marginBottom: subtitle ? 4 : 0,
                }}
              >
                {title}
              </div>
            )}

            {subtitle && (
              <div
                style={{
                  color: eliteTheme.colors.textMuted,
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>

          {rightSlot && (
            <div
              style={{
                flexShrink: 0,
              }}
            >
              {rightSlot}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: compact ? 10 : 14,
        }}
      >
        {children}
      </div>
    </div>
  )
}
