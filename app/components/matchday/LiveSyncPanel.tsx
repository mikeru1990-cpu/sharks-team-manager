"use client"

import { Cloud, RefreshCw, Wifi } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

export default function LiveSyncPanel() {
  return (
    <OperationalCard
      title="Live Match Sync"
      subtitle="Operational connectivity and synchronization"
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
              <Wifi size={18} />
              <span style={{ fontWeight: 800 }}>Connection</span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 900,
                color: "#22c55e",
              }}
            >
              Stable
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
              <Cloud size={18} />
              <span style={{ fontWeight: 800 }}>Cloud Sync</span>
            </div>

            <div
              style={{
                marginTop: 10,
                fontSize: 24,
                fontWeight: 900,
                color: "#3b82f6",
              }}
            >
              Active
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
          <RefreshCw size={18} />
          Force Tactical Sync
        </button>
      </div>
    </OperationalCard>
  )
}
