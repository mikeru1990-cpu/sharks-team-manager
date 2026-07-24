"use client"

import type { ReactNode } from "react"

type Props = {
  eyebrow: string
  title: string
  description: string
  badge?: string
  meta?: string
  action?: ReactNode
}

export default function PremiumWorkspaceHeader({ eyebrow, title, description, badge, meta, action }: Props) {
  return (
    <section style={hero}>
      <div style={{ minWidth: 0 }}>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <h1 style={titleStyle}>{title}</h1>
        <p style={descriptionStyle}>{description}</p>
        {meta ? <div style={metaStyle}>{meta}</div> : null}
      </div>
      <div style={rightRail}>
        {badge ? <div style={badgeStyle}>{badge}</div> : null}
        {action}
      </div>
    </section>
  )
}

const hero = {
  borderRadius: 30,
  padding: 18,
  background: "radial-gradient(circle at top right,rgba(124,58,237,.3),transparent 40%),radial-gradient(circle at bottom left,rgba(37,99,235,.42),transparent 44%),rgba(15,23,42,.96)",
  border: "1px solid rgba(147,197,253,.2)",
  boxShadow: "0 24px 54px rgba(0,0,0,.24)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  color: "white",
}

const eyebrowStyle = { fontSize: 11, fontWeight: 950, letterSpacing: 1.1, color: "#bfdbfe" }
const titleStyle = { margin: "7px 0 0", fontSize: 32, lineHeight: 1, letterSpacing: -1.1 }
const descriptionStyle = { margin: "8px 0 0", color: "rgba(226,232,240,.72)", lineHeight: 1.45, fontWeight: 700, maxWidth: 640 }
const metaStyle = { marginTop: 11, color: "rgba(191,219,254,.82)", fontSize: 12, fontWeight: 900 }
const rightRail = { display: "grid", justifyItems: "end", gap: 10, flex: "0 0 auto" }
const badgeStyle = { borderRadius: 999, padding: "8px 11px", background: "rgba(37,99,235,.2)", border: "1px solid rgba(147,197,253,.18)", color: "#dbeafe", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" as const }
