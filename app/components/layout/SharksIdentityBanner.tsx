"use client"

export default function SharksIdentityBanner() {
  return (
    <div
      className="sharks-glass sharks-card-shine"
      style={{
        borderRadius: 34,
        padding: 28,
        overflow: "hidden",
        position: "relative",
        display: "grid",
        gap: 18,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top right, rgba(56,189,248,0.18), transparent 34%), radial-gradient(circle at bottom left, rgba(37,99,235,0.20), transparent 36%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          right: -30,
          top: -10,
          fontSize: 170,
          opacity: 0.06,
          transform: "rotate(-12deg)",
        }}
      >
        🦈
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(125,211,252,0.20)",
            color: "#dbeafe",
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: ".16em",
          }}
        >
          LEONARD STANLEY SHARKS
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          gap: 22,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 30,
            border: "1px solid rgba(125,211,252,0.24)",
            background:
              "linear-gradient(135deg, rgba(2,6,23,0.92), rgba(30,64,175,0.82))",
            display: "grid",
            placeItems: "center",
            boxShadow:
              "0 22px 50px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.92)",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontSize: 42,
              fontWeight: 1000,
              textShadow: "0 10px 24px rgba(56,189,248,0.32)",
            }}
          >
            🦈
          </div>
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <div
            style={{
              fontSize: 42,
              lineHeight: 1,
              fontWeight: 1000,
              letterSpacing: "-0.05em",
              color: "white",
            }}
          >
            SHARKS COMMAND
          </div>

          <div
            style={{
              color: "#cbd5e1",
              fontWeight: 600,
              lineHeight: 1.7,
              maxWidth: 720,
            }}
          >
            Premium football operations platform for Leonard Stanley Sharks Youth Football Club with live matchday control, tactical intelligence, squad management and elite coaching workflows.
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            {[
              "LIVE MATCHDAY",
              "TACTICAL CONTROL",
              "PLAYER ANALYTICS",
              "SQUAD OPS",
            ].map((tag) => (
              <div
                key={tag}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(148,163,184,0.16)",
                  color: "#e2e8f0",
                  fontWeight: 800,
                  fontSize: 12,
                  letterSpacing: ".04em",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
