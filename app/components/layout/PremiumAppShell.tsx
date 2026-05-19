"use client"

import type { ReactNode } from "react"
import type { MainTab } from "../../lib/types"

type Props = {
  children: ReactNode
  activeTab: MainTab
  onTabChange: (tab: MainTab) => void
  isAdmin?: boolean
  signOut?: () => Promise<void>
}

export default function PremiumAppShell({
  children,
  activeTab,
  onTabChange,
}: Props) {
  const tabs: MainTab[] = [
    "home",
    "match",
    "players",
    "events",
  ]

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main style={{ flex: 1, padding: 16 }}>
        {children}
      </main>

      <nav
        style={{
          position: "sticky",
          bottom: 0,
          display: "flex",
          justifyContent: "space-around",
          padding: 12,
          borderTop: "1px solid #1e293b",
          background: "#0f172a",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              background: activeTab === tab ? "#2563eb" : "transparent",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "10px 14px",
              textTransform: "capitalize",
              cursor: "pointer",
            }}
          >
            {tab}
          </button>
        ))}
      </nav>
    </div>
  )
}
