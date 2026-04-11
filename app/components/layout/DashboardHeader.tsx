"use client"

type Props = {
  isAdmin: boolean
  onSignOut: () => Promise<void> | void
}

export default function DashboardHeader({ isAdmin, onSignOut }: Props) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #06245c 0%, #0c235f 100%)",
        color: "white",
        borderRadius: 28,
        padding: 18,
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 14px 36px rgba(15,23,42,0.14)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 12,
          alignItems: "start",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              opacity: 0.78,
              letterSpacing: 0.4,
              textTransform: "uppercase",
            }}
          >
            Club Hub
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 28,
              fontWeight: 900,
              lineHeight: 1.05,
              overflowWrap: "anywhere",
            }}
          >
            Leonard Stanley U10 Lioness
          </div>

          <div
            style={{
              marginTop: 8,
              fontSize: 14,
              lineHeight: 1.45,
              opacity: 0.9,
              maxWidth: 520,
            }}
          >
            Fixtures, training, matchday management, player feedback and season planning.
          </div>
        </div>

        <div
          style={{
            display: "grid",
            justifyItems: "end",
            gap: 8,
            minWidth: 96,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              padding: "6px 10px",
              borderRadius: 999,
              background: isAdmin ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.14)",
              whiteSpace: "nowrap",
            }}
          >
            {isAdmin ? "Admin" : "Viewer"}
          </div>

          <button
            onClick={() => void onSignOut()}
            style={{
              padding: "10px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.10)",
              color: "white",
              fontWeight: 800,
              fontSize: 14,
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
