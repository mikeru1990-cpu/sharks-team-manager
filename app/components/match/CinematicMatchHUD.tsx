"use client"

import { eliteTheme } from "../../lib/eliteTheme"

type Props = {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  quarter?: string
  momentum?: "up" | "down" | "neutral"
  status?: "LIVE" | "HT" | "FT"
}

export default function CinematicMatchHUD({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minute,
  quarter = "Q2",
  momentum = "neutral",
  status = "LIVE",
}: Props) {
  const momentumColor =
    momentum === "up"
      ? eliteTheme.colors.success
      : momentum === "down"
        ? eliteTheme.colors.danger
        : eliteTheme.colors.primary

  return (
    <div
      style={{
        position: "sticky",
        top: 10,
        zIndex: 999,
        marginBottom: eliteTheme.spacing.lg,
        borderRadius: eliteTheme.radius.xl,
        padding: eliteTheme.spacing.lg,
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        background: eliteTheme.gradients.card,
        border: `1px solid ${eliteTheme.colors.border}`,
        boxShadow: `${eliteTheme.shadows.large}, ${eliteTheme.shadows.glowBlue}`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.22,
          background:
            "radial-gradient(circle at top right, rgba(56,189,248,0.45), transparent 45%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: eliteTheme.spacing.md,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: eliteTheme.colors.textMuted,
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: 1.2,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: eliteTheme.colors.danger,
              boxShadow: eliteTheme.shadows.glowGreen,
            }}
          />

          {status} • {minute}' • {quarter}
        </div>

        <div
          style={{
            color: momentumColor,
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          Momentum {momentum === "up" ? "↑" : momentum === "down" ? "↓" : "→"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            color: eliteTheme.colors.text,
            fontWeight: 800,
            fontSize: 22,
          }}
        >
          {homeTeam}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 18px",
            borderRadius: eliteTheme.radius.md,
            background: "rgba(15,23,42,0.72)",
            border: `1px solid ${eliteTheme.colors.border}`,
          }}
        >
          <span
            style={{
              color: eliteTheme.colors.text,
              fontWeight: 900,
              fontSize: 38,
              lineHeight: 1,
            }}
          >
            {homeScore}
          </span>

          <span
            style={{
              color: eliteTheme.colors.textMuted,
              fontWeight: 700,
              fontSize: 18,
            }}
          >
            -
          </span>

          <span
            style={{
              color: eliteTheme.colors.text,
              fontWeight: 900,
              fontSize: 38,
              lineHeight: 1,
            }}
          >
            {awayScore}
          </span>
        </div>

        <div
          style={{
            color: eliteTheme.colors.text,
            fontWeight: 800,
            fontSize: 22,
            textAlign: "right",
          }}
        >
          {awayTeam}
        </div>
      </div>
    </div>
  )
}
