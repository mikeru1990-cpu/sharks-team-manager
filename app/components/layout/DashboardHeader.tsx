"use client"

type Props = {
  teamName: string
  isAdmin: boolean
  onSignOut: () => Promise<void> | void

  nextEventTitle?: string
  nextEventDateLabel?: string
  availablePlayersCount?: number
  totalPlayersCount?: number
}

function StatChip({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 14,
        background: "rgba(255,255,255,0.10)",
        border: "1px solid rgba(255,255,255,0.14)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          opacity: 0.78,
          textTransform: "uppercase",
          letterSpacing: 0.35,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 18,
          fontWeight: 900,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

export default function DashboardHeader({
  teamName,
  isAdmin,
  onSignOut,
  nextEventTitle = "No upcoming event",
  nextEventDateLabel = "Add an event to get started",
  availablePlayersCount,
  totalPlayersCount,
}: Props) {
  const availabilityLabel =
    typeof availablePlayersCount === "number" && typeof totalPlayersCount === "number"
      ? `${availablePlayersCount}/${totalPlayersCount}`
      : "—"

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #06245c 0%, #0c235f 100%)",
        color: "white",
        borderRadius: 26,
        padding: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 14px 36px rgba(15,23,42,0.14)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.14)",
              fontSize: 24,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            ⚽
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                opacity: 0.76,
                letterSpacing: 0.45,
                textTransform: "uppercase",
              }}
            >
              Club Hub
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 24,
                fontWeight: 900,
                lineHeight: 1.08,
                overflowWrap: "anywhere",
              }}
            >
              {teamName}
            </div>

            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                lineHeight: 1.45,
                opacity: 0.88,
              }}
            >
              Fixtures • Training • Matchday • Feedback • Seasons
            </div>
          </div>

          <div
            style={{
              display: "grid",
              justifyItems: "end",
              gap: 8,
              minWidth: 92,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "6px 10px",
                borderRadius: 999,
                background: isAdmin ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.14)",
                whiteSpace: "nowrap",
              }}
            >
              {isAdmin ? "Admin" : "Viewer"}
            </div>

            <button
              onClick={() => void onSignOut()}
              style={{
                padding: "9px 12px",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.18)",
                background: "rgba(255,255,255,0.10)",
                color: "white",
                fontWeight: 800,
                fontSize: 13,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 18,
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.14)",
            display: "grid",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              opacity: 0.78,
              textTransform: "uppercase",
              letterSpacing: 0.35,
            }}
          >
            Next Up
          </div>

          <div
            style={{
              fontSize: 18,
              fontWeight: 900,
              lineHeight: 1.2,
              overflowWrap: "anywhere",
            }}
          >
            {nextEventTitle}
          </div>

          <div
            style={{
              fontSize: 13,
              opacity: 0.86,
              lineHeight: 1.4,
            }}
          >
            {nextEventDateLabel}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 10,
          }}
        >
          <StatChip label="Squad" value={typeof totalPlayersCount === "number" ? totalPlayersCount : "—"} />
          <StatChip label="Available" value={availabilityLabel} />
          <StatChip label="Mode" value={isAdmin ? "Manage" : "View"} />
        </div>
      </div>
    </div>
  )
}
