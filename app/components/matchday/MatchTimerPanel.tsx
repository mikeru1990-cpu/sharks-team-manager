"use client"

import { Pause, Play, RotateCcw, Timer } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

export default function MatchTimerPanel() {
  return (
    <OperationalCard
      title="Match Timer"
      subtitle="Live operational time control"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              54:12
            </div>

            <div
              style={{
                opacity: 0.72,
                marginTop: 6,
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              Quarter 3 Active
            </div>
          </div>

          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 999,
              background: "rgba(37,99,235,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Timer size={28} />
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
          }}
        >
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
              gap: 8,
              cursor: "pointer",
            }}
          >
            <Pause size={16} />
            Pause
          </button>

          <button
            style={{
              border: "none",
              borderRadius: eliteTheme.radius.full,
              background: "rgba(16,185,129,0.22)",
              color: eliteTheme.colors.text,
              padding: "12px 14px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <Play size={16} />
            Resume
          </button>

          <button
            style={{
              border: "none",
              borderRadius: eliteTheme.radius.full,
              background: "rgba(245,158,11,0.22)",
              color: eliteTheme.colors.text,
              padding: "12px 14px",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </OperationalCard>
  )
}
