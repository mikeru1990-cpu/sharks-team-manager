"use client"

import type { MainTab } from "../../lib/types"
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
  function changeTab(nextTab: MainTab) {
    setTab(nextTab)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" })
    })
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 16,
        width: "min(94vw, 780px)",
        zIndex: 100,
        borderRadius: 36,
        padding: 10,
        background:
          "linear-gradient(135deg, rgba(2,6,23,0.90), rgba(15,23,42,0.82))",
        border: "1px solid rgba(125,211,252,0.20)",
        boxShadow:
          "0 26px 60px rgba(0,0,0,0.55), 0 0 40px rgba(14,165,233,0.10), inset 0 1px 0 rgba(255,255,255,0.08)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 7,
          alignItems: "stretch",
        }}
      >
        {items.map((item) => {
          const active = tab === item.key

          return (
            <button
              key={item.key}
              onClick={() => changeTab(item.key)}
              style={{
                border: active
                  ? "1px solid rgba(125,211,252,0.55)"
                  : "1px solid rgba(148,163,184,0.08)",
                background: active
                  ? "linear-gradient(135deg, #1d4ed8 0%, #0284c7 56%, #0f172a 100%)"
                  : "rgba(255,255,255,0.035)",
                color: active ? "white" : "#cbd5e1",
                borderRadius: 26,
                padding: "12px 4px 10px",
                display: "grid",
                justifyItems: "center",
                alignContent: "center",
                gap: 6,
                minWidth: 0,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.2s ease",
                boxShadow: active
                  ? "0 14px 34px rgba(37,99,235,0.42), inset 0 1px 0 rgba(255,255,255,0.18)"
                  : "inset 0 1px 0 rgba(255,255,255,0.04)",
              }}
            >
              {active ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)",
                      pointerEvents: "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 3,
                      width: 24,
                      height: 3,
                      borderRadius: 999,
                      background: "#7dd3fc",
                      transform: "translateX(-50%)",
                      boxShadow: "0 0 16px rgba(125,211,252,0.95)",
                    }}
                  />
                </>
              ) : null}

              <div
                style={{
                  lineHeight: 1,
                  transform: active ? "translateY(-2px) scale(1.08)" : "none",
                  display: "grid",
                  placeItems: "center",
                  transition: "all 0.2s ease",
                  position: "relative",
                  zIndex: 1,
                  filter: active
                    ? "drop-shadow(0 8px 14px rgba(125,211,252,0.28))"
                    : "none",
                }}
              >
                {item.icon}
              </div>

              <div
                style={{
                  fontSize: 11,
                  fontWeight: active ? 1000 : 800,
                  whiteSpace: "nowrap",
                  letterSpacing: 0.2,
                  opacity: active ? 1 : 0.78,
                  position: "relative",
                  zIndex: 1,
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
