"use client"

import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import { eliteTheme } from "../../lib/eliteTheme"

type Props = {
  title: string
  subtitle?: string
  action?: ReactNode
  compact?: boolean
}

export default function OperationalScreenHeader({
  title,
  subtitle,
  action,
  compact = false,
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 120,
        padding: compact ? "14px 18px" : "18px 20px",
        background: "rgba(2,6,23,0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${eliteTheme.colors.border}`,
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
        <div
          style={{
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: subtitle ? 4 : 0,
            }}
          >
            <h1
              style={{
                margin: 0,
                color: eliteTheme.colors.text,
                fontSize: compact ? 22 : 28,
                fontWeight: 900,
                letterSpacing: -0.8,
                lineHeight: 1,
              }}
            >
              {title}
            </h1>

            <ChevronRight
              size={16}
              color={eliteTheme.colors.textMuted}
              style={{ opacity: 0.45 }}
            />
          </div>

          {subtitle && (
            <div
              style={{
                color: eliteTheme.colors.textMuted,
                fontSize: 13,
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {action && (
          <div
            style={{
              flexShrink: 0,
            }}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  )
}
