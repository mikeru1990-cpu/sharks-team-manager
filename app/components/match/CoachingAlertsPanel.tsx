"use client"

type AlertItem = {
  id: string
  title: string
  description: string
  severity: "high" | "medium" | "low"
}

type Props = {
  alerts: AlertItem[]
}

function getAccent(severity: AlertItem["severity"]) {
  switch (severity) {
    case "high":
      return {
        border: "rgba(239,68,68,0.34)",
        glow: "rgba(239,68,68,0.28)",
        badge: "#fecaca",
        background: "rgba(239,68,68,0.12)",
        label: "HIGH",
      }

    case "medium":
      return {
        border: "rgba(245,158,11,0.34)",
        glow: "rgba(245,158,11,0.24)",
        badge: "#fde68a",
        background: "rgba(245,158,11,0.12)",
        label: "MEDIUM",
      }

    default:
      return {
        border: "rgba(59,130,246,0.30)",
        glow: "rgba(59,130,246,0.22)",
        badge: "#bfdbfe",
        background: "rgba(59,130,246,0.12)",
        label: "INFO",
      }
  }
}

export default function CoachingAlertsPanel({ alerts }: Props) {
  return (
    <div
      style={{
        borderRadius: 30,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        padding: 22,
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
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 22,
              marginBottom: 4,
            }}
          >
            Coaching Intelligence
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Live tactical alerts and fairness warnings
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 14px",
            background: "rgba(59,130,246,0.16)",
            border: "1px solid rgba(59,130,246,0.22)",
            color: "#bfdbfe",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          LIVE ANALYSIS
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 14,
        }}
      >
        {alerts.map((alert) => {
          const accent = getAccent(alert.severity)

          return (
            <div
              key={alert.id}
              style={{
                borderRadius: 24,
                border: `1px solid ${accent.border}`,
                background: accent.background,
                padding: 18,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                boxShadow: `0 16px 40px ${accent.glow}`,
              }}
            >
              <div>
                <div
                  style={{
                    color: "white",
                    fontWeight: 900,
                    fontSize: 17,
                    marginBottom: 6,
                  }}
                >
                  {alert.title}
                </div>

                <div
                  style={{
                    color: "rgba(226,232,240,0.76)",
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {alert.description}
                </div>
              </div>

              <div
                style={{
                  flexShrink: 0,
                  borderRadius: 999,
                  padding: "6px 12px",
                  background: "rgba(255,255,255,0.08)",
                  color: accent.badge,
                  fontWeight: 900,
                  fontSize: 12,
                  letterSpacing: "0.08em",
                }}
              >
                {accent.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
