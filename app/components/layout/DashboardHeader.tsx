"use client"

import { Badge } from "../ui"

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
  const readiness =
    typeof availablePlayersCount === "number" &&
    typeof totalPlayersCount === "number" &&
    totalPlayersCount > 0
      ? Math.round((availablePlayersCount / totalPlayersCount) * 100)
      : null

  const readinessColor =
    readiness === null
      ? "#94a3b8"
      : readiness >= 75
      ? "#22c55e"
      : readiness >= 50
      ? "#f59e0b"
      : "#ef4444"

  return (
    <div
      className="sharks-glass sharks-card-shine"
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 38,
        padding: 30,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -100,
          right: -60,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(56,189,248,0.14)",
          filter: "blur(10px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: 20,
          bottom: -54,
          width: 240,
          height: 270,
          opacity: 0.075,
          backgroundImage: "url('/sharks-official-badge.svg')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          backgroundPosition: "center",
          transform: "rotate(-8deg)",
          filter: "drop-shadow(0 28px 60px rgba(56,189,248,0.25))",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "auto 1fr",
              alignItems: "center",
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 82,
                height: 92,
                borderRadius: 24,
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(125,211,252,0.24)",
                backgroundImage: "url('/sharks-official-badge.svg')",
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                boxShadow:
                  "0 18px 40px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}
            />

            <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    padding: "7px 14px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "#dbeafe",
                    fontWeight: 900,
                    fontSize: 11,
                    letterSpacing: ".16em",
                  }}
                >
                  LEONARD STANLEY SHARKS
                </div>

                <Badge tone="blue">
                  {isAdmin ? "ADMIN MODE" : "COACH VIEW"}
                </Badge>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 42,
                    lineHeight: 1,
                    fontWeight: 1000,
                    letterSpacing: "-0.05em",
                    color: "white",
                    textShadow: "0 10px 30px rgba(56,189,248,0.25)",
                  }}
                >
                  {teamName}
                </div>

                <div
                  style={{
                    marginTop: 12,
                    maxWidth: 680,
                    color: "#cbd5e1",
                    fontSize: 15,
                    lineHeight: 1.6,
                    fontWeight: 600,
                  }}
                >
                  Elite football operations console with tactical matchday control,
                  live squad readiness, analytics and intelligent player management.
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => void onSignOut()}
            className="sharks-premium-button"
            style={{
              padding: "14px 20px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Sign Out
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          <div
            className="sharks-glass sharks-card-shine"
            style={{
              borderRadius: 24,
              padding: 22,
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".16em",
                fontWeight: 900,
                color: "#7dd3fc",
              }}
            >
              NEXT FIXTURE
            </div>

            <div
              style={{
                fontSize: 26,
                lineHeight: 1.1,
                fontWeight: 1000,
                color: "white",
              }}
            >
              {nextEventTitle || "No upcoming fixture"}
            </div>

            <div
              style={{
                color: "#cbd5e1",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {nextEventDateLabel || "Add a fixture or training event"}
            </div>
          </div>

          <div
            className="sharks-glass sharks-card-shine"
            style={{
              borderRadius: 24,
              padding: 22,
              display: "grid",
              gap: 12,
              border: `1px solid ${readinessColor}55`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: ".16em",
                fontWeight: 900,
                color: "#7dd3fc",
              }}
            >
              SQUAD READINESS
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 1000,
                  color: readinessColor,
                  lineHeight: 1,
                }}
              >
                {readiness ?? 0}%
              </div>

              <div
                style={{
                  color: "#cbd5e1",
                  fontWeight: 700,
                }}
              >
                match ready
              </div>
            </div>

            <div
              style={{
                color: "#e2e8f0",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {availablePlayersCount ?? 0} available from {totalPlayersCount ?? 0} players
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                background: "rgba(255,255,255,0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${readiness ?? 0}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: readinessColor,
                  boxShadow: `0 0 24px ${readinessColor}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
