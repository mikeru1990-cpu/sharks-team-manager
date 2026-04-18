"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 720,
          margin: "40px auto",
          padding: 20,
          borderRadius: 20,
          background: "white",
          border: "1px solid #dbe3ef",
          boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
          display: "grid",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a" }}>
          Something went wrong
        </div>

        <div style={{ color: "#475569", lineHeight: 1.6 }}>
          The app hit an error, but it did not crash into a blank screen.
        </div>

        <div
          style={{
            padding: 12,
            borderRadius: 12,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#334155",
            fontFamily: "monospace",
            fontSize: 13,
            overflowX: "auto",
          }}
        >
          {error?.message || "Unknown error"}
        </div>

        <div>
          <button
            onClick={reset}
            style={{
              border: "none",
              borderRadius: 14,
              padding: "12px 16px",
              background: "#1d4ed8",
              color: "white",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    </main>
  )
}
