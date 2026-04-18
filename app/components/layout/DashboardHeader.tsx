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
  return (
    <div
      style={{
        borderRadius: 24,
        padding: 18,
        background: "linear-gradient(135deg, #0f2c73 0%, #123a9b 100%)",
        color: "white",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 10px 24px rgba(15,23,42,0.18)",
        display: "grid",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 16, opacity: 0.85, fontWeight: 700 }}>
            Club Hub
          </div>
          <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.1, marginTop: 4 }}>
            {teamName}
          </div>
        </div>

        <button
          onClick={() => void onSignOut()}
          style={{
            border: "none",
            borderRadius: 16,
            padding: "12px 16px",
            background: "rgba(255,255,255,0.14)",
            color: "white",
            fontWeight: 800,
            fontSize: 16,
          }}
        >
          Sign Out
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.16)",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          {isAdmin ? "Admin Mode" : "Coach View"}
        </div>

        {typeof availablePlayersCount === "number" && typeof totalPlayersCount === "number" ? (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            Players {availablePlayersCount}/{totalPlayersCount}
          </div>
        ) : null}
      </div>

      {(nextEventTitle || nextEventDateLabel) ? (
        <div
          style={{
            padding: 12,
            borderRadius: 16,
            background: "rgba(255,255,255,0.10)",
            display: "grid",
            gap: 4,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.8 }}>
            NEXT EVENT
          </div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>
            {nextEventTitle || "No upcoming event"}
          </div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>
            {nextEventDateLabel || ""}
          </div>
        </div>
      ) : null}
    </div>
  )
}
