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
  return (
    <div
      style={{
        background: `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.primaryDark} 100%)`,
        color: "white",
        borderRadius: 28,
        padding: 20,
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 18px 42px rgba(15,23,42,0.20)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.16,
          backgroundImage: `
            repeating-linear-gradient(
              135deg,
              rgba(255,255,255,0.12) 0px,
              rgba(255,255,255,0.12) 2px,
              transparent 2px,
              transparent 10px
            )
          `,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: -40,
          top: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: -20,
          bottom: -55,
          width: 140,
          height: 140,
          borderRadius: "50%",
          background: "rgba(250,204,21,0.12)",
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2, display: "grid", gap: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                opacity: 0.82,
                letterSpacing: "0.08em",
              }}
            >
              SHARKS FOOTBALL
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 900,
                marginTop: 6,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {teamName}
            </div>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              <Badge tone="blue">{isAdmin ? "Admin Mode" : "Coach View"}</Badge>

              {typeof availablePlayersCount === "number" &&
              typeof totalPlayersCount === "number" ? (
                <Badge tone="yellow">
                  Players {availablePlayersCount}/{totalPlayersCount}
                </Badge>
              ) : null}
            </div>
          </div>

          <button
            onClick={() => void onSignOut()}
            style={{
              border: "1px solid rgba(255,255,255,0.18)",
              borderRadius: 16,
              padding: "12px 16px",
              background: "rgba(255,255,255,0.14)",
              color: "white",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              backdropFilter: "blur(8px)",
              boxShadow: "0 8px 18px rgba(15,23,42,0.10)",
            }}
          >
            Sign Out
          </button>
        </div>

        {(nextEventTitle || nextEventDateLabel) ? (
          <div
            style={{
              padding: 16,
              borderRadius: 20,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.10)",
              display: "grid",
              gap: 5,
              backdropFilter: "blur(8px)",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                opacity: 0.76,
                letterSpacing: "0.07em",
              }}
            >
              NEXT EVENT
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>
              {nextEventTitle || "No upcoming event"}
            </div>
            <div style={{ fontSize: 14, opacity: 0.92 }}>
              {nextEventDateLabel || ""}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
