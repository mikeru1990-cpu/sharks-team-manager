"use client"

import { THEME } from "../../lib/theme"

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
        borderRadius: 24,
        padding: 20,
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "0 12px 30px rgba(15,23,42,0.18)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage: `
            repeating-linear-gradient(
              135deg,
              rgba(255,255,255,0.12) 0px,
              rgba(255,255,255,0.12) 2px,
              transparent 2px,
              transparent 10px
            )
          `,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, display: "grid", gap: 14 }}>
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
            <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.82 }}>
              SHARKS FOOTBALL
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6, lineHeight: 1.1 }}>
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
              fontSize: 15,
              cursor: "pointer",
              backdropFilter: "blur(8px)",
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
              background: "rgba(255,255,255,0.14)",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {isAdmin ? "Admin Mode" : "Coach View"}
          </div>

          {typeof availablePlayersCount === "number" && typeof totalPlayersCount === "number" ? (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: "rgba(250,204,21,0.18)",
                color: "#fef08a",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              Players {availablePlayersCount}/{totalPlayersCount}
            </div>
          ) : null}
        </div>

        {(nextEventTitle || nextEventDateLabel) ? (
          <div
            style={{
              padding: 14,
              borderRadius: 18,
              background: "rgba(255,255,255,0.10)",
              display: "grid",
              gap: 4,
              backdropFilter: "blur(8px)",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.76 }}>
              NEXT EVENT
            </div>
            <div style={{ fontSize: 17, fontWeight: 900 }}>
              {nextEventTitle || "No upcoming event"}
            </div>
            <div style={{ fontSize: 14, opacity: 0.9 }}>
              {nextEventDateLabel || ""}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
