"use client"

export default function EventsScreen() {
  const events = [
    {
      title: "Wednesday Training",
      time: "17:45",
      attendance: "12 Confirmed",
      type: "Training",
    },
    {
      title: "vs Brockworth",
      time: "Saturday 10:00",
      attendance: "Matchday Squad Pending",
      type: "Fixture",
    },
  ]

  return (
    <div
      style={{
        padding: 16,
        paddingBottom: 140,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        color: "white",
      }}
    >
      <div>
        <div style={{ opacity: 0.7, fontSize: 12 }}>
          OPERATIONAL EVENT CENTER
        </div>

        <h1 style={{ margin: "6px 0 0", fontSize: 32 }}>
          Events
        </h1>
      </div>

      {events.map((event) => (
        <div
          key={event.title}
          style={{
            borderRadius: 24,
            padding: 18,
            background: "rgba(15,23,42,0.88)",
            border: "1px solid rgba(148,163,184,0.12)",
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900 }}>
            {event.title}
          </div>

          <div style={{ marginTop: 6, opacity: 0.72 }}>
            {event.time}
          </div>

          <div
            style={{
              marginTop: 12,
              borderRadius: 16,
              padding: 12,
              background: "rgba(2,6,23,0.7)",
            }}
          >
            {event.attendance}
          </div>
        </div>
      ))}
    </div>
  )
}
