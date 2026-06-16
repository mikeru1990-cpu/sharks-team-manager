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
        border: "1px solid rgba(125,211,252,0.28)",
        background:
          "radial-gradient(circle at 12% 0%, rgba(56,189,248,0.22), transparent 30%), radial-gradient(circle at 94% 18%, rgba(250,204,21,0.10), transparent 24%), linear-gradient(135deg, rgba(15,23,42,0.92), rgba(2,6,23,0.78))",
      }}
    >
      <div style={{ position: "absolute", top: -100, right: -60, width: 280, height: 280, borderRadius: "50%", background: "rgba(56,189,248,0.14)", filter: "blur(10px)" }} />
      <div style={{ position: "absolute", left: -70, bottom: -110, width: 240, height: 240, borderRadius: "50%", background: "rgba(29,78,216,0.12)", filter: "blur(14px)" }} />
      <div style={{ position: "absolute", right: -28, bottom: -80, width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(125,211,252,0.10)", opacity: 0.25 }} />
      <div className="sharks-hero-watermark" />

      <div style={{ position: "relative", zIndex: 2, display: "grid", gap: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#dbeafe", fontWeight: 900, fontSize: 11, letterSpacing: ".16em" }}>
                LEONARD STANLEY YOUTH FC
              </div>
              <Badge tone="blue">{isAdmin ? "CLUB ADMIN" : "TEAM WORKSPACE"}</Badge>
            </div>

            <div>
              <div style={{ fontSize: "clamp(34px, 6vw, 58px)", lineHeight: 0.95, fontWeight: 1000, letterSpacing: "-0.065em", color: "white", textShadow: "0 12px 34px rgba(56,189,248,0.28)" }}>
                {teamName}
              </div>
              <div style={{ marginTop: 12, maxWidth: 720, color: "#dbeafe", fontSize: 15, lineHeight: 1.6, fontWeight: 700 }}>
                Club-ready football operations with team switching, matchday control, player development, attendance and performance insights.
              </div>
            </div>
          </div>

          <button onClick={() => void onSignOut()} className="sharks-premium-button" style={{ padding: "14px 20px", fontWeight: 900, cursor: "pointer" }}>
            Sign Out
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
          <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 22, display: "grid", gap: 10, border: "1px solid rgba(125,211,252,0.26)" }}>
            <div style={{ fontSize: 11, letterSpacing: ".16em", fontWeight: 900, color: "#7dd3fc" }}>NEXT EVENT</div>
            <div style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 1000, color: "white" }}>{nextEventTitle || "No upcoming event"}</div>
            <div style={{ color: "#cbd5e1", fontWeight: 700, fontSize: 14 }}>{nextEventDateLabel || "Add a fixture or training event"}</div>
          </div>

          <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 22, display: "grid", gap: 12, border: `1px solid ${readinessColor}66` }}>
            <div style={{ fontSize: 11, letterSpacing: ".16em", fontWeight: 900, color: "#7dd3fc" }}>SQUAD READINESS</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
              <div style={{ fontSize: 48, fontWeight: 1000, color: readinessColor, lineHeight: 1 }}>{readiness ?? 0}%</div>
              <div style={{ color: "#cbd5e1", fontWeight: 800 }}>ready</div>
            </div>
            <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 14 }}>{availablePlayersCount ?? 0} available from {totalPlayersCount ?? 0} players</div>
            <div style={{ height: 11, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: `${readiness ?? 0}%`, height: "100%", borderRadius: 999, background: readinessColor, boxShadow: `0 0 24px ${readinessColor}` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
