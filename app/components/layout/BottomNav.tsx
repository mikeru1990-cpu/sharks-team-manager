"use client"

import { TEAM, type MainTab } from "../../lib/types"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const NAV = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "players", label: "Players", icon: "👥" },
  { key: "events", label: "Events", icon: "📅" },
  { key: "coaches", label: "Coaches", icon: "🧑‍🏫" },
  { key: "match", label: "Match", icon: "⚽" },
  { key: "stats", label: "Stats", icon: "📊" },
] as const

export default function BottomNav({ tab, setTab }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: 20,
        padding: 8,
        display: "grid",
        gridTemplateColumns: "repeat(6, 1fr)",
        gap: 6,
        border: "1px solid #e2e8f0",
        zIndex: 50,
      }}
    >
      {NAV.map((item) => (
        <button
          key={item.key}
          onClick={() => setTab(item.key)}
          style={{
            border: "none",
            borderRadius: 14,
            padding: "10px 6px",
            background: tab === item.key ? TEAM.primary : "transparent",
            color: tab === item.key ? "white" : "#475569",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          <div style={{ fontSize: 16 }}>{item.icon}</div>
          <div>{item.label}</div>
        </button>
      ))}
    </div>
  )
}
