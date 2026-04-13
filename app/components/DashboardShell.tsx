"use client"

import { cardStyle } from "../lib/types"

type Props = any

export default function DashboardShell(props: Props) {
  if (props.loading) {
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
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <div style={cardStyle()}>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Debug Safe Shell</div>
          <div style={{ marginTop: 8, color: "#475569" }}>
            If you can see this, the crash is in DashboardHeader, BottomNav, or earlier page/auth code.
          </div>
        </div>
      </div>
    </main>
  )
}
