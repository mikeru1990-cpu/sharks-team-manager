"use client"

const cards = [
  {
    title: "Session Planner",
    detail: "Build warm-ups, drills, small-sided games and match prep.",
    status: "Ready",
  },
  {
    title: "Attendance",
    detail: "Track who is available, missing or returning from injury.",
    status: "12 confirmed",
  },
  {
    title: "Drill Library",
    detail: "Passing, finishing, defending, possession, goalkeepers and fun games.",
    status: "Core library",
  },
  {
    title: "Equipment Checklist",
    detail: "Balls, bibs, cones, goals, first aid and goalkeeper gloves.",
    status: "Before training",
  },
]

export default function TrainingScreen() {
  return (
    <WorkspacePage
      eyebrow="TRAINING WORKSPACE"
      title="Training"
      subtitle="Session plans, attendance, skills focus and training history."
    >
      <div style={{ display: "grid", gap: 14 }}>
        {cards.map((card) => (
          <WorkspaceCard key={card.title} {...card} />
        ))}
      </div>
    </WorkspacePage>
  )
}

function WorkspacePage({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 132 }}>
      <div>
        <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>
          {eyebrow}
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 34, letterSpacing: -1.2 }}>{title}</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function WorkspaceCard({
  title,
  detail,
  status,
}: {
  title: string
  detail: string
  status: string
}) {
  return (
    <div
      style={{
        borderRadius: 24,
        padding: 18,
        background: "rgba(15,23,42,0.88)",
        border: "1px solid rgba(148,163,184,0.14)",
        boxShadow: "0 18px 48px rgba(2,6,23,0.32)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontSize: 21, fontWeight: 900 }}>{title}</div>
          <div style={{ marginTop: 7, color: "rgba(226,232,240,0.7)", lineHeight: 1.45 }}>{detail}</div>
        </div>
        <div
          style={{
            height: "fit-content",
            borderRadius: 999,
            padding: "7px 10px",
            background: "rgba(37,99,235,0.18)",
            color: "#bfdbfe",
            fontSize: 12,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          {status}
        </div>
      </div>
    </div>
  )
}
