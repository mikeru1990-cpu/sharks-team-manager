"use client"

import type { MainTab } from "../../lib/types"
import { THEME } from "../../lib/theme"
import {
  HomeIcon,
  CalendarIcon,
  FootballIcon,
  UsersIcon,
  ChartIcon,
  CapIcon,
} from "../AppIcons"

type Props = {
  tab: MainTab
  setTab: (tab: MainTab) => void
}

const items: Array<{
  key: MainTab
  label: string
  icon: React.ReactNode
}> = [
  { key: "home", label: "Home", icon: <HomeIcon /> },
  { key: "events", label: "Events", icon: <CalendarIcon /> },
  { key: "match", label: "Match", icon: <FootballIcon /> },
  { key: "players", label: "Players", icon: <UsersIcon /> },
  { key: "stats", label: "Stats", icon: <ChartIcon /> },
  { key: "coaches", label: "Coaches", icon: <CapIcon /> },
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
        borderRadius: 30,
        padding: 10,
        background: "rgba(255,255,255,0.94)",
        border: "1px solid #dbe3ef",
        boxShadow: "0 14px 32px rgba(15,23,42,0.16)",
        backdropFilter: "blur(14px)",
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
                border: active ? "none" : "1px solid transparent",
                background: active
                  ? `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.primaryDark} 100%)`
                  : "transparent",
                color: active ? "white" : "#475569",
                borderRadius: 20,
                padding: "10px 4px 9px",
                display: "grid",
                justifyItems: "center",
                gap: 4,
                minWidth: 0,
                cursor: "pointer",
                boxShadow: active ? "0 8px 18px rgba(30,58,138,0.24)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              <div
                style={{
                  lineHeight: 1,
                  transform: active ? "translateY(-1px)" : "none",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  opacity: active ? 1 : 0.94,
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
