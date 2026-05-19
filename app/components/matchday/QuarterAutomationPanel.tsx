"use client"

import { Clock3, Flag, PlayCircle } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

export default function QuarterAutomationPanel() {
  return (
    <OperationalCard
      title="Quarter Automation"
      subtitle="Automated match progression controls"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "rgba(15,23,42,0.62)",
              border: `1px solid ${eliteTheme.colors.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock3 size={18} />
              <span style={{ fontWeight: 800 }}>Quarter Length</span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              15m
            </div>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "rgba(15,23,42,0.62)",
              border: `1px solid ${eliteTheme.colors.border}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Flag size={18} />
              <span style={{ fontWeight: 800 }}>Current Quarter</span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              Q3
            </div>
          </div>
        </div>

        <button
          style={{
            border: "none",
            borderRadius: eliteTheme.radius.full,
            background: eliteTheme.gradients.primary,
            color: eliteTheme.colors.text,
            padding: "14px 16px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            boxShadow: eliteTheme.shadows.glowBlue,
          }}
        >
          <PlayCircle size={18} />
          Auto Advance To Next Quarter
        </button>
      </div>
    </OperationalCard>
  )
}
