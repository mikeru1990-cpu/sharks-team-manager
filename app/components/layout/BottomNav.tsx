"use client"

import type { MainTab } from "../../lib/types"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const items: Array<{ key: MainTab; label: string; icon: string }> = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "events", label: "Events", icon: "📅" },
  { key: "match", label: "Match", icon: "⚽" },
  { key: "players", label: "Players", icon: "👥" },
  { key: "stats", label: "Stats", icon: "📊" },
  { key: "coaches", label: "Coaches", icon: "🧢" },
]

export default function BottomNav({ tab, setTab }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        zIndex: 100,
        borderRadius: 28,
        padding: 10,
        background: "rgba(255,255,255,0.96)",
        border: "1px solid #dbe3ef",
        boxShadow: "0 10px 30px rgba(15,23,42,0.16)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 6,
          alignItems: "stretch",
        }}
      >
        {items.map((item) => {
          const active = tab === item.key

          return (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              style={{
                border: "none",
                background: active ? "#e8f0ff" : "transparent",
                color: active ? "#123a9b" : "#475569",
                borderRadius: 18,
                padding: "10px 4px",
                display: "grid",
                justifyItems: "center",
                gap: 4,
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: 24, lineHeight: 1 }}>{item.icon}</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                }}
              >
                {item.label}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
