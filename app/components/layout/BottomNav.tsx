"use client"

import type { MainTab } from "../../lib/types"
import { TEAM } from "../../lib/types"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const items: Array<{
  key: MainTab
  label: string
  icon: string
}> = [
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
        position: "sticky",
        bottom: 12,
        zIndex: 50,
        paddingTop: 4,
      }}
    >
      <div
        style={{
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 28,
          padding: 10,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(203,213,225,0.9)",
          boxShadow: "0 10px 30px rgba(15,23,42,0.10)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
            gap: 8,
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
                  minWidth: 0,
                  border: active ? "1px solid #bfdbfe" : "1px solid transparent",
                  background: active ? "linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)" : "transparent",
                  color: active ? TEAM.primary : "#475569",
                  borderRadius: 20,
                  padding: "12px 6px",
                  display: "grid",
                  gap: 4,
                  justifyItems: "center",
                  alignContent: "center",
                  fontWeight: 800,
                  boxShadow: active ? "0 6px 18px rgba(29,78,216,0.12)" : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    lineHeight: 1,
                  }}
                >
                  {item.icon}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    lineHeight: 1.1,
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
    </div>
  )
}
