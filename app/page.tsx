"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState("")

  useEffect(() => {
    setMounted(true)
    setNow(new Date().toLocaleString("en-GB"))
  }, [])

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        color: "white",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          display: "grid",
          gap: 16,
        }}
      >
        <div
          style={{
            padding: 20,
            borderRadius: 20,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
          }}
        >
          <div style={{ fontSize: 28, fontWeight: 900 }}>
            App debug screen
          </div>

          <div style={{ marginTop: 10, color: "rgba(255,255,255,0.82)", lineHeight: 1.6 }}>
            If you can see this page, the black screen is not coming from Next.js build.
            It is coming from one of your app components such as AuthGate,
            DashboardShell, DashboardHeader, BottomNav, or a child tab component.
          </div>
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            display: "grid",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 800 }}>Checks</div>

          <div>
            Mounted:{" "}
            <strong>{mounted ? "yes" : "no"}</strong>
          </div>

          <div>
            Time:{" "}
            <strong>{now || "loading..."}</strong>
          </div>

          <div>
            Env URL present:{" "}
            <strong>
              {process.env.NEXT_PUBLIC_SUPABASE_URL ? "yes" : "no"}
            </strong>
          </div>

          <div>
            Env anon key present:{" "}
            <strong>
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "yes" : "no"}
            </strong>
          </div>
        </div>

        <div
          style={{
            padding: 18,
            borderRadius: 18,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.1)",
            lineHeight: 1.7,
            color: "rgba(255,255,255,0.86)",
          }}
        >
          Next step: if this page shows properly, send me your full
          <strong> `app/components/AuthGate.tsx` </strong>
          and I’ll give you the exact full replacement.
        </div>
      </div>
    </main>
  )
}
