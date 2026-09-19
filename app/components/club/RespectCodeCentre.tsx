"use client"

import { useEffect, useState, type CSSProperties } from "react"
import {
  acknowledgeConductPolicy,
  conductPolicies,
  hasAcknowledgedCurrentPolicy,
  type ConductAudience,
} from "../../lib/codeOfConduct"

const audiences: ConductAudience[] = ["parent", "player", "coach"]
const labels: Record<ConductAudience, string> = { parent: "Parents", player: "Players", coach: "Coaches" }

export default function RespectCodeCentre() {
  const [audience, setAudience] = useState<ConductAudience>("parent")
  const [acknowledged, setAcknowledged] = useState(false)
  const policy = conductPolicies[audience]

  useEffect(() => setAcknowledged(hasAcknowledgedCurrentPolicy(audience)), [audience])

  function acknowledge() {
    acknowledgeConductPolicy(audience)
    setAcknowledged(true)
  }

  return <section style={shell}>
    <div style={hero}>
      <small style={eyebrow}>CLUB STANDARDS · 2026/27</small>
      <h2 style={{ margin: "5px 0" }}>We only do positive.</h2>
      <p style={muted}>One clear Respect standard for everyone around the team.</p>
    </div>

    <div style={tabs}>{audiences.map(item => <button key={item} onClick={() => setAudience(item)} style={audience === item ? tabOn : tab}>{labels[item]}</button>)}</div>

    <div style={card}>
      <div style={head}>
        <div><small style={eyebrow}>PLAY YOUR PART</small><h3 style={{ margin: "4px 0 0" }}>{policy.title}</h3></div>
        <span style={acknowledged ? complete : pending}>{acknowledged ? "Acknowledged" : "Action needed"}</span>
      </div>
      <p style={muted}>{policy.subtitle}</p>

      <div style={statement}>
        <strong>This is a game. These are children.</strong>
        <span>Coaches are volunteers. Referees are human. Mistakes happen.</span>
      </div>

      <h4 style={sectionTitle}>I will</h4>
      <div style={list}>{policy.commitments.map((item, index) => <div key={item} style={row}><span style={number}>{index + 1}</span><span>{item}</span></div>)}</div>

      <details style={details}>
        <summary style={{ fontWeight: 900, cursor: "pointer" }}>If the code is not followed</summary>
        <div style={{ ...list, marginTop: 10 }}>{policy.consequences.map(item => <div key={item} style={consequence}>• {item}</div>)}</div>
      </details>

      <div style={ackBar}>
        <div><small style={eyebrow}>VERSION {policy.version}</small><strong style={{ display: "block" }}>{acknowledged ? "Current code accepted" : "Please confirm you understand the code"}</strong></div>
        <button disabled={acknowledged} onClick={acknowledge} style={{ ...button, opacity: acknowledged ? .55 : 1 }}>{acknowledged ? "✓ Done" : "I agree"}</button>
      </div>
    </div>
  </section>
}

const shell: CSSProperties = { display: "grid", gap: 12, color: "white", paddingBottom: 120 }
const hero: CSSProperties = { padding: 16, borderRadius: 22, background: "linear-gradient(145deg,#0b1b31,#10182b)", border: "1px solid #203651" }
const eyebrow: CSSProperties = { color: "#7db8ff", fontSize: 10, fontWeight: 950, letterSpacing: 1.05 }
const muted: CSSProperties = { color: "#8ea0b7", fontSize: 12, lineHeight: 1.45, margin: "4px 0" }
const tabs: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5, padding: 4, borderRadius: 16, background: "#091322", border: "1px solid #1b2c43" }
const tab: CSSProperties = { minHeight: 43, border: 0, borderRadius: 12, background: "transparent", color: "#71839a", fontWeight: 900 }
const tabOn: CSSProperties = { ...tab, background: "#173b70", color: "white" }
const card: CSSProperties = { padding: 14, borderRadius: 22, background: "#0c1728", border: "1px solid #1e3048", display: "grid", gap: 12 }
const head: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }
const complete: CSSProperties = { padding: "6px 9px", borderRadius: 99, background: "#123f32", color: "#6ee7b7", fontSize: 10, fontWeight: 950 }
const pending: CSSProperties = { ...complete, background: "#3c2b15", color: "#fbbf24" }
const statement: CSSProperties = { display: "grid", gap: 4, padding: 12, borderRadius: 16, background: "#10274b", color: "#dbeafe", lineHeight: 1.4 }
const sectionTitle: CSSProperties = { margin: "2px 0 0", fontSize: 13, textTransform: "uppercase", letterSpacing: .8, color: "#a9b8ca" }
const list: CSSProperties = { display: "grid", gap: 6 }
const row: CSSProperties = { display: "grid", gridTemplateColumns: "28px 1fr", gap: 8, alignItems: "start", padding: 9, borderRadius: 12, background: "#091322", color: "#d8e1ec", fontSize: 12, lineHeight: 1.4 }
const number: CSSProperties = { width: 25, height: 25, display: "grid", placeItems: "center", borderRadius: 99, background: "#173b70", color: "#bfdbfe", fontWeight: 950, fontSize: 10 }
const details: CSSProperties = { padding: 12, borderRadius: 14, background: "#0a1423", border: "1px solid #1c2d44", color: "#cbd5e1" }
const consequence: CSSProperties = { padding: "4px 2px", color: "#aebdce", fontSize: 12, lineHeight: 1.4 }
const ackBar: CSSProperties = { position: "sticky", bottom: 88, zIndex: 5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: 11, borderRadius: 16, background: "rgba(9,19,34,.96)", border: "1px solid #29415f", boxShadow: "0 12px 32px rgba(0,0,0,.3)", backdropFilter: "blur(12px)" }
const button: CSSProperties = { minHeight: 46, minWidth: 100, border: 0, borderRadius: 12, padding: "0 13px", background: "linear-gradient(135deg,#2563eb,#4f46e5)", color: "white", fontWeight: 950 }
