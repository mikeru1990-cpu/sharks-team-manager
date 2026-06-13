"use client"

type PeriodMode = "quarters" | "halves"

type Props = {
  periodMode?: PeriodMode
  currentPeriod?: number
  periodLength?: number
  running?: boolean
  onSetCurrentPeriod?: (period: number) => void
}

function getPeriodLabel(periodMode: PeriodMode) {
  return periodMode === "halves" ? "Half" : "Quarter"
}

function getShortLabel(periodMode: PeriodMode) {
  return periodMode === "halves" ? "H" : "Q"
}

export default function QuarterProgressPanel({
  periodMode = "quarters",
  currentPeriod = 1,
  periodLength = 10,
  running = false,
  onSetCurrentPeriod,
}: Props) {
  const periodCount = periodMode === "halves" ? 2 : 4
  const periodLabel = getPeriodLabel(periodMode)
  const shortLabel = getShortLabel(periodMode)

  return (
    <div
      className="sharks-glass sharks-card-shine"
      style={{
        borderRadius: 28,
        padding: 16,
        display: "grid",
        gap: 14,
        border: "1px solid rgba(125,211,252,0.22)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em" }}>
            MATCH PERIOD CONTROL
          </div>
          <div style={{ color: "white", fontSize: 22, fontWeight: 1000, marginTop: 4 }}>
            {periodLabel} Progress
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ color: running ? "#86efac" : "#cbd5e1", fontSize: 12, fontWeight: 1000, border: running ? "1px solid rgba(34,197,94,0.42)" : "1px solid rgba(148,163,184,0.22)", borderRadius: 999, padding: "7px 10px", background: running ? "rgba(34,197,94,0.12)" : "rgba(148,163,184,0.08)" }}>
            {running ? "● LIVE" : "READY"}
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 900, border: "1px solid rgba(148,163,184,0.22)", borderRadius: 999, padding: "7px 10px" }}>
            {periodLength}m each
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${periodCount}, minmax(0, 1fr))`, gap: 10 }}>
        {Array.from({ length: periodCount }, (_, index) => index + 1).map((period) => {
          const complete = period < currentPeriod
          const live = period === currentPeriod
          const pending = period > currentPeriod
          const colour = complete ? "#22c55e" : live ? "#38bdf8" : "#94a3b8"
          const icon = complete ? "✓" : live ? "▶" : "○"
          const status = complete ? "Complete" : live ? (running ? "Live" : "Current") : "Pending"

          return (
            <button
              key={period}
              onClick={() => onSetCurrentPeriod?.(period)}
              style={{
                border: `1px solid ${colour}55`,
                background: live
                  ? "linear-gradient(135deg, rgba(14,165,233,0.24), rgba(2,6,23,0.54))"
                  : complete
                  ? "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(2,6,23,0.48))"
                  : "rgba(2,6,23,0.42)",
                borderRadius: 22,
                padding: "14px 8px",
                cursor: onSetCurrentPeriod ? "pointer" : "default",
                display: "grid",
                gap: 7,
                justifyItems: "center",
                color: colour,
                boxShadow: live ? "0 0 26px rgba(56,189,248,0.18)" : "none",
              }}
            >
              <div style={{ fontSize: 22, lineHeight: 1, fontWeight: 1000 }}>{icon}</div>
              <div style={{ color: "white", fontSize: 14, fontWeight: 1000 }}>{shortLabel}{period}</div>
              <div style={{ fontSize: 11, fontWeight: 900, color, textTransform: "uppercase", letterSpacing: ".08em" }}>{status}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
