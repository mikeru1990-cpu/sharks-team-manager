"use client"

type Props = {
  onOpenPlayers?: () => void
  onOpenEvents?: () => void
  onOpenMatchday?: () => void
  onOpenAdmin?: () => void
  isAdmin?: boolean
}

export default function ExperienceUpgradePanel({
  onOpenPlayers,
  onOpenEvents,
  onOpenMatchday,
  onOpenAdmin,
  isAdmin = false,
}: Props) {
  const actions = [
    { label: "Players", detail: "Squad, positions and development", onClick: onOpenPlayers, colour: "#22c55e" },
    { label: "Events", detail: "Training, fixtures and availability", onClick: onOpenEvents, colour: "#38bdf8" },
    { label: "Matchday", detail: "Live scores, subs and notes", onClick: onOpenMatchday, colour: "#facc15" },
    { label: isAdmin ? "Club Admin" : "Coaches", detail: isAdmin ? "Teams, approvals and setup" : "Coach tools", onClick: onOpenAdmin, colour: "#a78bfa" },
  ]

  return (
    <section className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 30, padding: 18, display: "grid", gap: 16 }}>
      <div>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Quick Control
        </div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 1000, marginTop: 6, letterSpacing: "-0.04em" }}>
          What do you want to do next?
        </div>
        <div style={{ color: "#cbd5e1", fontWeight: 750, marginTop: 6 }}>
          A cleaner command panel so the most used areas are one tap away.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10 }}>
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            style={{
              border: `1px solid ${action.colour}55`,
              background: `linear-gradient(135deg, ${action.colour}18, rgba(2,6,23,0.58))`,
              borderRadius: 22,
              padding: 14,
              color: "white",
              textAlign: "left",
              cursor: "pointer",
              display: "grid",
              gap: 6,
              boxShadow: `0 16px 34px ${action.colour}12`,
            }}
          >
            <span style={{ color: action.colour, fontSize: 12, fontWeight: 1000, letterSpacing: ".10em", textTransform: "uppercase" }}>
              Open
            </span>
            <span style={{ fontSize: 20, fontWeight: 1000 }}>{action.label}</span>
            <span style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 750, lineHeight: 1.35 }}>{action.detail}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
