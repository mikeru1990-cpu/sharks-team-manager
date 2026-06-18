"use client"

function EnvPill({ name }: { name: string }) {
  return (
    <div style={{ borderRadius: 14, padding: "11px 12px", background: "rgba(2,6,23,0.60)", border: "1px solid rgba(125,211,252,0.22)", color: "#e0f2fe", fontSize: 13, fontWeight: 1000, overflowWrap: "anywhere" }}>
      {name}
    </div>
  )
}

function Step({ number, title, detail }: { number: number; title: string; detail: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "34px minmax(0,1fr)", gap: 12, alignItems: "start" }}>
      <div style={{ width: 34, height: 34, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(14,165,233,0.16)", border: "1px solid rgba(56,189,248,0.38)", color: "#7dd3fc", fontWeight: 1000 }}>
        {number}
      </div>
      <div>
        <div style={{ color: "white", fontWeight: 1000, fontSize: 15 }}>{title}</div>
        <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 750, lineHeight: 1.45, marginTop: 3 }}>{detail}</div>
      </div>
    </div>
  )
}

export default function SupabaseSetupRequired() {
  return (
    <main style={{ minHeight: "100vh", padding: 18, background: "radial-gradient(circle at top, rgba(37,99,235,0.24), transparent 34%), linear-gradient(180deg, #020617 0%, #07111f 52%, #020617 100%)", color: "white" }}>
      <div style={{ maxWidth: 560, margin: "34px auto", display: "grid", gap: 16 }}>
        <div style={{ borderRadius: 30, padding: 20, background: "linear-gradient(135deg, rgba(15,23,42,0.92), rgba(2,6,23,0.78))", border: "1px solid rgba(125,211,252,0.24)", boxShadow: "0 24px 70px rgba(0,0,0,0.42)", display: "grid", gap: 14 }}>
          <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
            <div className="sharks-app-badge" style={{ width: 58, height: 58, borderRadius: 18, backgroundColor: "white", border: "1px solid rgba(125,211,252,0.30)" }} />
            <div>
              <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em", textTransform: "uppercase" }}>Setup Required</div>
              <div style={{ fontSize: 28, fontWeight: 1000, letterSpacing: "-0.045em" }}>Connect Supabase</div>
            </div>
          </div>

          <div style={{ color: "#cbd5e1", fontWeight: 750, lineHeight: 1.55 }}>
            This deployment is live, but secure sign-in cannot start until the Supabase settings are added to this Vercel project.
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <EnvPill name="NEXT_PUBLIC_SUPABASE_URL" />
            <EnvPill name="NEXT_PUBLIC_SUPABASE_ANON_KEY" />
          </div>
        </div>

        <div style={{ borderRadius: 26, padding: 18, background: "rgba(15,23,42,0.76)", border: "1px solid rgba(125,211,252,0.18)", display: "grid", gap: 14 }}>
          <Step number={1} title="Open Vercel settings" detail="Open this project in Vercel, then go to Settings and Environment Variables." />
          <Step number={2} title="Copy from Supabase" detail="Open Supabase Project Settings and API, then copy the Project URL and public anon key." />
          <Step number={3} title="Redeploy" detail="Add both values for Production and Preview, then redeploy the latest version." />
        </div>
      </div>
    </main>
  )
}
