"use client"

type Props = {
  onGoal: () => void
  onAssist: () => void
  onSub: () => void
  onInjury: () => void
  onPause: () => void
  onResume: () => void
  running: boolean
}

function ActionButton({
  label,
  color,
  onClick,
}: {
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: `1px solid ${color}55`,
        background: `${color}18`,
        color,
        borderRadius: 22,
        padding: "18px 16px",
        fontWeight: 900,
        fontSize: 15,
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: `0 14px 34px ${color}22`,
        minHeight: 84,
      }}
    >
      {label}
    </button>
  )
}

export default function MatchControlDock({
  onGoal,
  onAssist,
  onSub,
  onInjury,
  onPause,
  onResume,
  running,
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 18,
        zIndex: 120,
        borderRadius: 32,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.97), rgba(30,41,59,0.94))",
        padding: 20,
        boxShadow: "0 28px 70px rgba(0,0,0,0.55)",
        backdropFilter: "blur(18px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 24,
              marginBottom: 4,
            }}
          >
            Match Control Dock
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Ultra-fast live touchline controls
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 14px",
            background: running
              ? "rgba(34,197,94,0.16)"
              : "rgba(239,68,68,0.16)",
            border: running
              ? "1px solid rgba(34,197,94,0.24)"
              : "1px solid rgba(239,68,68,0.24)",
            color: running ? "#bbf7d0" : "#fecaca",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          {running ? "MATCH LIVE" : "MATCH PAUSED"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 14,
        }}
      >
        <ActionButton label="⚽ Goal" color="#22c55e" onClick={onGoal} />

        <ActionButton label="🎯 Assist" color="#3b82f6" onClick={onAssist} />

        <ActionButton label="🔄 Sub" color="#f59e0b" onClick={onSub} />

        <ActionButton label="🚑 Injury" color="#ef4444" onClick={onInjury} />

        {running ? (
          <ActionButton label="⏸ Pause" color="#eab308" onClick={onPause} />
        ) : (
          <ActionButton label="▶ Resume" color="#22c55e" onClick={onResume} />
        )}
      </div>
    </div>
  )
}
