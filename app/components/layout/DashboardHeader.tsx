"use client"

import { TEAM, buttonSecondary, cardStyle } from "../../lib/types"

type Props = {
  isAdmin: boolean
  onSignOut: () => Promise<void>
}

export default function DashboardHeader({ isAdmin, onSignOut }: Props) {
  return (
    <div style={cardStyle()}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{TEAM.name}</div>
          <div style={{ color: "#475569", marginTop: 4 }}>
            Club Hub • {isAdmin ? "Admin" : "Viewer"}
          </div>
        </div>

        <button onClick={() => void onSignOut()} style={buttonSecondary()}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
