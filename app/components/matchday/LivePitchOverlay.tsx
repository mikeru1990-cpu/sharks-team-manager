"use client"

const players = [
  { name: "GK", x: "50%", y: "88%" },
  { name: "CB", x: "35%", y: "68%" },
  { name: "CB", x: "65%", y: "68%" },
  { name: "CM", x: "50%", y: "50%" },
  { name: "LW", x: "28%", y: "30%" },
  { name: "RW", x: "72%", y: "30%" },
  { name: "ST", x: "50%", y: "18%" },
]

const overlays = [
  {
    label: "Overload Risk",
    x: "18%",
    y: "36%",
    color: "#ef4444",
  },
  {
    label: "Transition Lane",
    x: "76%",
    y: "42%",
    color: "#22c55e",
  },
]

export default function LivePitchOverlay() {
  return (
    <div
      style={{
        position: "relative",
        height: 420,
        borderRadius: 30,
        overflow: "hidden",
        background:
          "linear-gradient(180deg,#14532d 0%,#166534 50%,#14532d 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 18,
          border: "2px solid rgba(255,255,255,0.24)",
          borderRadius: 20,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: 18,
          right: 18,
          height: 2,
          background: "rgba(255,255,255,0.24)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 90,
          height: 90,
          transform: "translate(-50%,-50%)",
          borderRadius: "50%",
          border: "2px solid rgba(255,255,255,0.24)",
        }}
      />

      {players.map((player) => (
        <div
          key={player.name + player.x}
          style={{
            position: "absolute",
            left: player.x,
            top: player.y,
            transform: "translate(-50%,-50%)",
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
            border: "2px solid rgba(255,255,255,0.24)",
          }}
        >
          {player.name}
        </div>
      ))}

      {overlays.map((overlay) => (
        <div
          key={overlay.label}
          style={{
            position: "absolute",
            left: overlay.x,
            top: overlay.y,
            transform: "translate(-50%,-50%)",
            padding: "10px 14px",
            borderRadius: 999,
            background: `${overlay.color}22`,
            border: `1px solid ${overlay.color}88`,
            color: "white",
            fontWeight: 800,
            backdropFilter: "blur(12px)",
          }}
        >
          {overlay.label}
        </div>
      ))}
    </div>
  )
}
