"use client"

import { defaultPlatformContext } from "../../lib/platform"

type Props = {
  section: string
  detail?: string
}

export default function TeamScopeBanner({ section, detail }: Props) {
  const context = defaultPlatformContext

  return (
    <section style={{ borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)", color: "white" }}>
      <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>TEAM CONTEXT</div>
      <h1 style={{ margin: "6px 0 4px", fontSize: 30 }}>{section}</h1>
      <div style={{ color: "#bfdbfe", fontWeight: 900 }}>{context.club.name} · {context.team.name} · {context.team.season}</div>
      {detail && <p style={{ margin: "8px 0 0", color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>{detail}</p>}
    </section>
  )
}
