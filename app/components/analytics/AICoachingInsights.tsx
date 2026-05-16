"use client"

export type CoachingInsight = {
  id: string
  level: "info" | "warning" | "critical" | "success"
  title: string
  description: string
}

type Props = {
  insights: CoachingInsight[]
}

function colors(level: CoachingInsight["level"]) {
  if (level === "critical") {
    return {
      bg: "rgba(239,68,68,0.14)",
      border: "rgba(239,68,68,0.28)",
      text: "#fecaca",
      glow: "rgba(239,68,68,0.3)",
    }
  }

  if (level === "warning") {
    return {
      bg: "rgba(245,158,11,0.14)",
      border: "rgba(245,158,11,0.28)",
      text: "#fde68a",
      glow: "rgba(245,158,11,0.3)",
    }
  }

  if (level === "success") {
    return {
      bg: "rgba(34,197,94,0.14)",
      border: "rgba(34,197,94,0.28)",
      text: "#bbf7d0",
      glow: "rgba(34,197,94,0.3)",
    }
  }

  return {
    bg: "rgba(59,130,246,0.14)",
    border: "rgba(59,130,246,0.28)",
    text: "#bfdbfe",
    glow: "rgba(59,130,246,0.3)",
  }
}

export default function AICoachingInsights({ insights }: Props) {
  return (
    <div
      style={{
        borderRadius: 30,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        padding: 24,
        boxShadow: "0 26px 60px rgba(0,0,0,0.45)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
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
            AI Coaching Insights
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Live tactical intelligence and coaching recommendations
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 14px",
            background: "rgba(168,85,247,0.16)",
            border: "1px solid rgba(168,85,247,0.24)",
            color: "#e9d5ff",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          AI MATCH ENGINE
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 16,
        }}
      >
        {insights.map((insight) => {
          const style = colors(insight.level)

          return (
            <div
              key={insight.id}
              style={{
                borderRadius: 24,
                padding: 20,
                background: style.bg,
                border: `1px solid ${style.border}`,
                boxShadow: `0 16px 40px ${style.glow}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontWeight: 900,
                    fontSize: 18,
                  }}
                >
                  {insight.title}
                </div>

                <div
                  style={{
                    borderRadius: 999,
                    padding: "6px 12px",
                    background: "rgba(15,23,42,0.55)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: style.text,
                    fontWeight: 800,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {insight.level}
                </div>
              </div>

              <div
                style={{
                  color: "rgba(226,232,240,0.9)",
                  fontWeight: 600,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                {insight.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
