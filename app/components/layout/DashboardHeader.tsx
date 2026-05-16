"use client"

import { THEME } from "../../lib/theme"
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
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 34,
        padding: 28,
        background:
          "linear-gradient(135deg, rgba(15,23,42,0.96) 0%, rgba(30,41,59,0.96) 50%, rgba(30,64,175,0.88) 100%)",
        border: "1px solid rgba(148,163,184,0.14)",
        boxShadow:
          "0 30px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(96,165,250,0.9) 0%, transparent 30%), radial-gradient(circle at 80% 30%, rgba(59,130,246,0.6) 0%, transparent 30%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 260,
          height: 260,
          borderRadius: "50%",
          background: "rgba(59,130,246,0.16)",
          filter: "blur(10px)",
          pointerEvents: "none",
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
            alignItems: "flex-start",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0, display: "grid", gap: 12 }}>
            <div
              style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#dbeafe",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: "0.12em",
                }}
              >
                SHARKS COACHING CONSOLE
              </div>

              <Badge tone="blue">
                {isAdmin ? "ADMIN MODE" : "COACH VIEW"}
              </Badge>
            </div>

            <div>
              <div
                style={{
                  fontSize: 38,
                  fontWeight: 900,
                  color: "white",
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                {teamName}
              </div>

              <div
                style={{
                  marginTop: 10,
                  color: "#cbd5e1",
                  fontSize: 15,
                  fontWeight: 600,
                  maxWidth: 620,
                  lineHeight: 1.5,
                }}
              >
                Operational coaching dashboard with live squad readiness,
                matchday intelligence, player analytics and rotation control.
              </div>
            </div>
          </div>

          <button
            onClick={() => void onSignOut()}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 18,
              padding: "14px 18px",
              background: "rgba(255,255,255,0.08)",
              color: "white",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              backdropFilter: "blur(12px)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
            }}
          >
            Sign Out
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
          }}
        >
          <div
            style={{
              borderRadius: 24,
              padding: 20,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(10px)",
              display: "grid",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                fontWeight: 900,
                color: "#93c5fd",
              }}
            >
              NEXT EVENT
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "white",
                lineHeight: 1.15,
              }}
            >
              {nextEventTitle || "No upcoming event"}
            </div>

            <div
              style={{
                color: "#cbd5e1",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {nextEventDateLabel || "Select a fixture or training session"}
            </div>
          </div>

          <div
            style={{
              borderRadius: 24,
              padding: 20,
              background: "rgba(255,255,255,0.08)",
              border: `1px solid ${readinessColor}44`,
              backdropFilter: "blur(10px)",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.1em",
                fontWeight: 900,
                color: "#93c5fd",
              }}
            >
              SQUAD READINESS
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 40,
                  fontWeight: 900,
                  color: readinessColor,
                  lineHeight: 1,
                }}
              >
                {readiness ?? 0}%
              </div>

              <div
                style={{
                  color: "#cbd5e1",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                match ready
              </div>
            </div>

            <div
              style={{
                color: "#e2e8f0",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              {availablePlayersCount ?? 0} available from {totalPlayersCount ?? 0} players
            </div>

            <div
              style={{
                height: 8,
                borderRadius: 999,
                overflow: "hidden",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  width: `${readiness ?? 0}%`,
                  height: "100%",
                  background: readinessColor,
                  borderRadius: 999,
                  boxShadow: `0 0 18px ${readinessColor}`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
