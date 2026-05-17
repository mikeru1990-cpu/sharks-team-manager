"use client"

import { Activity, Timer, Trophy } from "lucide-react"
import { eliteTheme } from "../../lib/eliteTheme"

type Props = {
  homeScore?: number
  awayScore?: number
  minute?: number
  period?: string
  status?: string
}

export default function LiveMatchHud({
  homeScore = 3,
  awayScore = 1,
  minute = 54,
  period = "Quarter 3",
  status = "High Pressure",
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        padding: "14px 18px",
        background: "rgba(2,6,23,0.82)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: `1px solid ${eliteTheme.colors.border}`,
      }}
    >
      <div
        style={{
          borderRadius: eliteTheme.radius.lg,
          background: eliteTheme.gradients.card,
          border: `1px solid ${eliteTheme.colors.border}`,
          padding: "16px 18px",
          boxShadow: eliteTheme.shadows.medium,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 6,
            }}
          >
            <Trophy size={18} color={eliteTheme.colors.primary} />

            <div
              style={{
                fontSize: 32,
                fontWeight: 900,
                letterSpacing: -1.4,
                color: eliteTheme.colors.text,
                lineHeight: 1,
              }}
            >
              {homeScore}-{awayScore}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: eliteTheme.colors.textMuted,
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Timer size={14} />
              {minute}'
            </div>

            <span>{period}</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 14px",
            borderRadius: eliteTheme.radius.full,
            background: "rgba(34,197,94,0.14)",
            border: "1px solid rgba(34,197,94,0.24)",
            color: eliteTheme.colors.text,
            fontWeight: 800,
            fontSize: 13,
            boxShadow: eliteTheme.shadows.glowGreen,
            whiteSpace: "nowrap",
          }}
        >
          <Activity size={14} />
          {status}
        </div>
      </div>
    </div>
  )
}
