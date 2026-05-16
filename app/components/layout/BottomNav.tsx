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
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 18,
        width: "min(94vw, 760px)",
        zIndex: 100,
        borderRadius: 34,
        padding: 12,
        background: "rgba(2,6,23,0.82)",
        border: "1px solid rgba(148,163,184,0.16)",
        boxShadow:
          "0 25px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
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
                border: active
                  ? "1px solid rgba(96,165,250,0.55)"
                  : "1px solid transparent",
                background: active
                  ? `linear-gradient(135deg, ${THEME.colors.primary} 0%, #1d4ed8 100%)`
                  : "rgba(255,255,255,0.02)",
                color: active ? "white" : "#cbd5e1",
                borderRadius: 24,
                padding: "12px 4px 10px",
                display: "grid",
                justifyItems: "center",
                alignContent: "center",
                gap: 6,
                minWidth: 0,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.22s ease",
                boxShadow: active
                  ? "0 12px 30px rgba(37,99,235,0.42)"
                  : "none",
              }}
            >
              {active && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0) 100%)",
                    pointerEvents: "none",
                  }}
                />
              )}

              <div
                style={{
                  lineHeight: 1,
                  transform: active ? "translateY(-2px) scale(1.05)" : "none",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.2s ease",
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: active ? 900 : 700,
                  whiteSpace: "nowrap",
                  letterSpacing: 0.2,
                  opacity: active ? 1 : 0.86,
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
