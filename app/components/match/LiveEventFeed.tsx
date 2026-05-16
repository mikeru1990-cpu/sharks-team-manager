"use client"

export type LiveFeedEvent = {
  id: string
  minute: number
  type: "goal" | "assist" | "sub" | "injury" | "note"
  text: string
}

type Props = {
  events: LiveFeedEvent[]
}

function getIcon(type: LiveFeedEvent["type"]) {
  switch (type) {
    case "goal":
      return "⚽"
    case "assist":
      return "🎯"
    case "sub":
      return "🔄"
    case "injury":
      return "🚑"
    default:
      return "📝"
  }
}

function getGlow(type: LiveFeedEvent["type"]) {
  switch (type) {
    case "goal":
      return "rgba(34,197,94,0.35)"
    case "assist":
      return "rgba(59,130,246,0.35)"
    case "sub":
      return "rgba(245,158,11,0.35)"
    case "injury":
      return "rgba(239,68,68,0.35)"
    default:
      return "rgba(148,163,184,0.28)"
  }
}

export default function LiveEventFeed({ events }: Props) {
  return (
    <div
      style={{
        display: "grid",
        gap: 14,
      }}
    >
      {events.map((event) => (
        <div
          key={event.id}
          style={{
            borderRadius: 24,
            border: "1px solid rgba(148,163,184,0.12)",
            background: "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.92))",
            padding: "18px 18px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            boxShadow: `0 18px 40px ${getGlow(event.type)}`,
            backdropFilter: "blur(14px)",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 18,
              display: "grid",
              placeItems: "center",
              fontSize: 24,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            {getIcon(event.type)}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 6,
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  color: "#f8fafc",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              >
                {event.text}
              </div>

              <div
                style={{
                  borderRadius: 999,
                  padding: "4px 10px",
                  background: "rgba(59,130,246,0.16)",
                  border: "1px solid rgba(59,130,246,0.24)",
                  color: "#bfdbfe",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {event.minute}'
              </div>
            </div>

            <div
              style={{
                color: "rgba(226,232,240,0.7)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              LIVE MATCH EVENT
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
