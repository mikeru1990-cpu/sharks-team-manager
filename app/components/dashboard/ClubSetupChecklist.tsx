"use client"

type Props = {
  hasTeams?: boolean
  hasPlayers?: boolean
  hasEvents?: boolean
  hasCoaches?: boolean
  hasBranding?: boolean
  onOpenTeams?: () => void
  onOpenPlayers?: () => void
  onOpenEvents?: () => void
}

export default function ClubSetupChecklist({
  hasTeams = false,
  hasPlayers = false,
  hasEvents = false,
  hasCoaches = false,
  hasBranding = false,
  onOpenTeams,
  onOpenPlayers,
  onOpenEvents,
}: Props) {
  const items = [
    { label: "Create club teams", done: hasTeams, action: onOpenTeams },
    { label: "Add players", done: hasPlayers, action: onOpenPlayers },
    { label: "Add coaches", done: hasCoaches, action: onOpenTeams },
    { label: "Add fixtures or training", done: hasEvents, action: onOpenEvents },
    { label: "Set badge and wallpaper", done: hasBranding, action: onOpenTeams },
  ]
  const complete = items.filter((item) => item.done).length

  return (
    <section className="sharks-glass sharks-card-shine" style={{ borderRadius: 28, padding: 18, display: "grid", gap: 14, border: "1px solid rgba(125,211,252,0.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
            Next Setup
          </div>
          <div style={{ color: "white", fontSize: 24, fontWeight: 1000, marginTop: 5 }}>
            Club launch checklist
          </div>
        </div>
        <div style={{ borderRadius: 999, padding: "8px 12px", background: "rgba(14,165,233,0.14)", border: "1px solid rgba(125,211,252,0.28)", color: "#bae6fd", fontWeight: 1000 }}>
          {complete}/{items.length} ready
        </div>
      </div>

      <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ width: `${(complete / items.length) * 100}%`, height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #22c55e, #38bdf8)" }} />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            style={{
              border: item.done ? "1px solid rgba(34,197,94,0.38)" : "1px solid rgba(148,163,184,0.18)",
              background: item.done ? "rgba(34,197,94,0.12)" : "rgba(15,23,42,0.62)",
              color: "white",
              borderRadius: 16,
              padding: 12,
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
              textAlign: "left",
              fontWeight: 900,
            }}
          >
            <span>{item.label}</span>
            <span style={{ color: item.done ? "#86efac" : "#94a3b8" }}>{item.done ? "Done" : "Setup"}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
