"use client"

type Props = {
  teamName?: string
  isAdmin: boolean
  onSignOut: () => Promise<void>
  nextEventTitle?: string
  nextEventDateLabel?: string
  availablePlayersCount?: number
  totalPlayersCount?: number
}

export default function DashboardHeader({
  teamName = "Sharks Lioness",
  isAdmin,
  onSignOut,
  nextEventTitle,
  nextEventDateLabel,
  availablePlayersCount,
  totalPlayersCount,
}: Props) {
  const available = availablePlayersCount ?? 0
  const total = totalPlayersCount ?? 0

  return (
    <section
      className="sharks-elite-panel"
      style={{
        borderRadius: 24,
        padding: 14,
        display: "grid",
        gap: 12,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          className="sharks-app-badge"
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            flex: "0 0 auto",
            backgroundColor: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(125,211,252,0.28)",
          }}
        />

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>
            Leonard Stanley Youth FC
          </div>
          <div style={{ color: "white", fontSize: 28, fontWeight: 1000, letterSpacing: "-0.05em", lineHeight: 1 }}>
            {teamName}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 800, marginTop: 4 }}>
            {isAdmin ? "Club admin" : "Team workspace"} • {available}/{total} available
          </div>
        </div>

        <button
          onClick={() => void onSignOut()}
          style={{
            border: "1px solid rgba(248,113,113,0.35)",
            background: "rgba(127,29,29,0.22)",
            color: "#fecaca",
            borderRadius: 14,
            padding: "10px 12px",
            fontWeight: 1000,
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, alignItems: "center" }}>
        <div style={{ borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(125,211,252,0.20)", minWidth: 0 }}>
          <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>
            Next
          </div>
          <div style={{ color: "white", fontSize: 16, fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {nextEventTitle || "No upcoming event"}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 800 }}>
            {nextEventDateLabel || "Add one in Events"}
          </div>
        </div>

        <div style={{ borderRadius: 18, padding: "12px 14px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.38)", color: "#86efac", fontWeight: 1000, textAlign: "center" }}>
          {available}/{total}
          <div style={{ color: "#bbf7d0", fontSize: 10, fontWeight: 900 }}>available</div>
        </div>
      </div>
    </section>
  )
}
