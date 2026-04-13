"use client"

import DashboardHeader from "./layout/DashboardHeader"
import BottomNav from "./layout/BottomNav"
import { TEAM, cardStyle, type MainTab } from "../lib/types"

type Props = any

export default function DashboardShell(props: Props) {
  const { loading, tab, isAdmin, signOut } = props

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 840, margin: "0 auto" }}>
          Loading club data...
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        paddingBottom: 120,
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gap: 16,
          minWidth: 0,
        }}
      >
        <DashboardHeader
          teamName={TEAM.name}
          isAdmin={isAdmin}
          onSignOut={signOut}
          nextEventTitle="Debug mode"
          nextEventDateLabel="Shell is working"
          availablePlayersCount={0}
          totalPlayersCount={Array.isArray(props.players) ? props.players.length : 0}
        />

        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
            Debug Mode
          </div>
          <div style={{ color: "#475569", lineHeight: 1.5 }}>
            The app shell is loading correctly.
          </div>
          <div style={{ color: "#64748b", marginTop: 12 }}>
            Current tab: {String(tab || "unknown")}
          </div>
        </div>
      </div>

      <BottomNav tab={(props.tab as MainTab) || "home"} setTab={props.setTab} />
    </main>
  )
}
