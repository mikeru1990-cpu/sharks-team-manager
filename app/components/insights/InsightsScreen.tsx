"use client"

import { useMatchStateStore } from "../../lib/matchStateStore"

export default function InsightsScreen() {
  const players = useMatchStateStore((state) => state.players)
  const fatigueLevels = useMatchStateStore((state) => state.fatigueLevels)
  const fatigueAlerts = Object.values(fatigueLevels).filter((value) => value > 75).length

  const insights = [
    {
      label: "Squad Size",
      value: players.length.toString(),
      note: "Active Leonard Stanley U11 Girls players",
    },
    {
      label: "Fatigue Alerts",
      value: fatigueAlerts.toString(),
      note: "Players needing workload review",
    },
    {
      label: "Rotation Fairness",
      value: "Build 21",
      note: "Next step: equal minutes and availability-aware rules",
    },
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 132 }}>
      <div>
        <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>
          INSIGHTS WORKSPACE
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 34, letterSpacing: -1.2 }}>Insights</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          Season minutes, attendance trends, rotation fairness, statistics and smart coaching alerts.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
        {insights.map((item) => (
          <div
            key={item.label}
            style={{
              borderRadius: 24,
              padding: 16,
              background: "rgba(15,23,42,0.88)",
              border: "1px solid rgba(148,163,184,0.14)",
            }}
          >
            <div style={{ color: "rgba(226,232,240,0.65)", fontSize: 12, fontWeight: 800 }}>{item.label}</div>
            <div style={{ marginTop: 8, fontSize: 28, fontWeight: 950 }}>{item.value}</div>
            <div style={{ marginTop: 6, color: "rgba(226,232,240,0.68)", fontSize: 13, lineHeight: 1.35 }}>{item.note}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          borderRadius: 28,
          padding: 20,
          background: "linear-gradient(135deg, rgba(37,99,235,0.24), rgba(124,58,237,0.18))",
          border: "1px solid rgba(147,197,253,0.22)",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 900, color: "#bfdbfe" }}>AI COACH PREVIEW</div>
        <h2 style={{ margin: "8px 0", fontSize: 23 }}>Football Intelligence Engine</h2>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.76)", lineHeight: 1.55 }}>
          This area will become the brain of the app: attendance-aware rotation, minutes fairness, development trends, match reports and proactive coach recommendations.
        </p>
      </div>
    </div>
  )
}
