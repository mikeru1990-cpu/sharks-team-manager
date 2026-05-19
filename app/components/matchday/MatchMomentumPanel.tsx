"use client"

import { Activity, Flame, Shield } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

export default function MatchMomentumPanel() {
  return (
    <OperationalCard
      title="Momentum"
      subtitle="Live match pressure and control"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "rgba(37,99,235,0.18)",
            border: `1px solid ${eliteTheme.colors.border}`,
          }}
        >
          <Flame size={18} />
          <div style={{ marginTop: 8, fontWeight: 800 }}>
            High Press
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "rgba(16,185,129,0.18)",
            border: `1px solid ${eliteTheme.colors.border}`,
          }}
        >
          <Activity size={18} />
          <div style={{ marginTop: 8, fontWeight: 800 }}>
            62% Control
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "rgba(245,158,11,0.18)",
            border: `1px solid ${eliteTheme.colors.border}`,
          }}
        >
          <Shield size={18} />
          <div style={{ marginTop: 8, fontWeight: 800 }}>
            Stable Shape
          </div>
        </div>
      </div>
    </OperationalCard>
  )
}
