"use client"

import type { ReactNode } from "react"
import {
  Home,
  CalendarDays,
  Shield,
  BarChart3,
  PlayCircle,
} from "lucide-react"
import { eliteTheme } from "../../lib/eliteTheme"

type TabKey =
  | "home"
  | "matchday"
  | "events"
  | "players"
  | "stats"

const tabs: {
  key: TabKey
  label: string
  icon: any
}[] = [
  {
    key: "home",
    label: "Home",
    icon: Home,
  },
  {
    key: "matchday",
    label: "Match",
    icon: PlayCircle,
  },
  {
    key: "events",
    label: "Events",
    icon: CalendarDays,
  },
  {
    key: "players",
    label: "Players",
    icon: Shield,
  },
  {
    key: "stats",
    label: "Stats",
    icon: BarChart3,
  },
]

type Props = {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
  children: ReactNode
}

export default function PremiumAppShell({
  activeTab,
  onTabChange,
  children,
}: Props) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: eliteTheme.gradients.app,
        color: eliteTheme.colors.text,
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          paddingBottom: 110,
        }}
      >
        {children}
      </div>

      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
          padding: "12px 16px 20px",
          background:
            "linear-gradient(180deg, rgba(2,6,23,0), rgba(2,6,23,0.94))",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            borderRadius: 28,
            border: `1px solid ${eliteTheme.colors.border}`,
            background: "rgba(15,23,42,0.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            boxShadow: eliteTheme.shadows.large,
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.key

            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                style={{
                  border: "none",
                  background: active
                    ? eliteTheme.gradients.primary
                    : "transparent",
                  color: eliteTheme.colors.text,
                  borderRadius: 18,
                  padding: "10px 14px",
                  minWidth: 62,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  transition: eliteTheme.animation.normal,
                  boxShadow: active
                    ? eliteTheme.shadows.glowBlue
                    : "none",
                  cursor: "pointer",
                }}
              >
                <Icon size={20} />

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: active ? 800 : 600,
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
