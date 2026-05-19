"use client"

import { Database, RefreshCcw, ShieldCheck } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

export default function MatchRecoveryPanel() {
  return (
    <OperationalCard
      title="Match Recovery"
      subtitle="Persistence and recovery status"
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 14,
            borderRadius: 16,
            background: "rgba(15,23,42,0.62)",
            border: `1px solid ${eliteTheme.colors.border}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Database size={18} />
            <div>
              <div style={{ fontWeight: 800 }}>
                Auto Save Active
              </div>
              <div style={{ fontSize: 12, opacity: 0.72 }}>
                Last sync 14 seconds ago
              </div>
            </div>
          </div>

          <ShieldCheck size={18} color="#22c55e" />
        </div>

        <button
          style={{
            border: "none",
            borderRadius: eliteTheme.radius.full,
            background: eliteTheme.gradients.primary,
            color: eliteTheme.colors.text,
            padding: "12px 14px",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: "pointer",
            boxShadow: eliteTheme.shadows.glowBlue,
          }}
        >
          <RefreshCcw size={16} />
          Recover Previous Match State
        </button>
      </div>
    </OperationalCard>
  )
}
