"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { supabase } from "../../lib/supabase"

export default function PrivacyAccountCentre() {
  const [email, setEmail] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteText, setDeleteText] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [message, setMessage] = useState("")
  const [clearArmed, setClearArmed] = useState(false)
  const privacyUrl = process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL
  const supportUrl = process.env.NEXT_PUBLIC_SUPPORT_URL

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""))
  }, [])

  async function deleteAccount() {
    if (!supabase || deleteText !== "DELETE") return
    setDeleting(true)
    setMessage("")
    const { error } = await supabase.rpc("delete_my_account")
    if (error) {
      setMessage(`Account deletion could not be completed: ${error.message}`)
      setDeleting(false)
      return
    }
    try { localStorage.clear() } catch {}
    await supabase.auth.signOut()
    setMessage("Your Football OS account has been deleted.")
    setDeleting(false)
  }

  function clearDeviceData() {
    if (!clearArmed) {
      setClearArmed(true)
      setMessage("Tap Clear device data again to confirm.")
      return
    }
    try { localStorage.clear() } catch {}
    setClearArmed(false)
    setMessage("Local Football OS data has been cleared from this device.")
  }

  return <section style={shell}>
    <div style={hero}>
      <small style={eyebrow}>PRIVACY & ACCOUNT</small>
      <h2 style={{ margin: "5px 0" }}>Your data. Your control.</h2>
      <p style={muted}>Football OS is designed for youth football, so account and player information must stay private, purposeful and controlled.</p>
    </div>

    <div style={card}>
      <div style={head}><div><small style={eyebrow}>DATA USE</small><h3 style={title}>What the app stores</h3></div><span style={pill}>Private by default</span></div>
      <DataRow title="Account" text="Your sign-in identity and club membership when cloud access is enabled." />
      <DataRow title="Team" text="Player, fixture, training and match information needed to run the team." />
      <DataRow title="Offline" text="Matchday and preference data may be stored locally so core coaching tools can continue to work on the touchline." />
      <DataRow title="Protection" text="Club and team permissions restrict who can read or change private football data." />
      {(privacyUrl || supportUrl) && <div style={linkGrid}>
        {privacyUrl && <a href={privacyUrl} target="_blank" rel="noreferrer" style={linkButton}>Privacy policy ↗</a>}
        {supportUrl && <a href={supportUrl} target="_blank" rel="noreferrer" style={linkButton}>Support ↗</a>}
      </div>}
    </div>

    <div style={card}>
      <div><small style={eyebrow}>THIS DEVICE</small><h3 style={title}>Offline app data</h3><p style={muted}>Use this when handing the device to someone else or when you want to remove locally saved Football OS data.</p></div>
      <button type="button" onClick={clearDeviceData} style={secondary}>{clearArmed ? "Confirm clear device data" : "Clear device data"}</button>
    </div>

    <div style={{ ...card, borderColor: "rgba(248,113,113,.28)" }}>
      <div><small style={{ ...eyebrow, color: "#fca5a5" }}>ACCOUNT DELETION</small><h3 style={title}>Delete my account</h3><p style={muted}>This permanently removes your sign-in account and associated membership/profile data. Historical club match records can remain without your account identity where the club needs the record.</p></div>
      {email && <div style={identity}>{email}</div>}
      {!deleteOpen ? <button type="button" disabled={!supabase} onClick={() => setDeleteOpen(true)} style={danger}>Delete account…</button> : <div style={confirmBox}>
        <strong>Type DELETE to confirm</strong>
        <input value={deleteText} onChange={event => setDeleteText(event.target.value)} autoCapitalize="characters" autoComplete="off" style={input} aria-label="Type DELETE to confirm account deletion" />
        <div style={two}>
          <button type="button" onClick={() => { setDeleteOpen(false); setDeleteText("") }} style={secondary}>Cancel</button>
          <button type="button" disabled={deleteText !== "DELETE" || deleting} onClick={() => void deleteAccount()} style={{ ...danger, opacity: deleteText === "DELETE" && !deleting ? 1 : .45 }}>{deleting ? "Deleting…" : "Delete permanently"}</button>
        </div>
      </div>}
      {!supabase && <p style={muted}>Cloud account controls become available when secure sign-in is enabled.</p>}
    </div>

    {message && <div role="status" style={notice}>{message}</div>}
  </section>
}

function DataRow({ title, text }: { title: string; text: string }) {
  return <div style={row}><strong>{title}</strong><span>{text}</span></div>
}

const shell: CSSProperties = { display: "grid", gap: 12, color: "white", paddingBottom: 120 }
const hero: CSSProperties = { padding: 16, borderRadius: 22, background: "linear-gradient(145deg,#0b1b31,#10182b)", border: "1px solid #203651" }
const card: CSSProperties = { padding: 14, borderRadius: 22, background: "#0c1728", border: "1px solid #1e3048", display: "grid", gap: 10 }
const head: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }
const eyebrow: CSSProperties = { color: "#7db8ff", fontSize: 10, fontWeight: 950, letterSpacing: 1.05 }
const title: CSSProperties = { margin: "4px 0 0", fontSize: 19 }
const muted: CSSProperties = { color: "#8ea0b7", fontSize: 12, lineHeight: 1.5, margin: "4px 0" }
const pill: CSSProperties = { borderRadius: 99, padding: "6px 9px", background: "#123f32", color: "#6ee7b7", fontSize: 10, fontWeight: 950, whiteSpace: "nowrap" }
const row: CSSProperties = { padding: 11, borderRadius: 14, background: "#091322", display: "grid", gap: 3, color: "#dbe5f0", fontSize: 12, lineHeight: 1.45 }
const linkGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 }
const linkButton: CSSProperties = { minHeight: 44, borderRadius: 12, background: "#10274b", color: "#dbeafe", display: "grid", placeItems: "center", textDecoration: "none", fontWeight: 900, fontSize: 12 }
const secondary: CSSProperties = { minHeight: 46, border: "1px solid #2b3f58", borderRadius: 12, background: "#132238", color: "white", fontWeight: 900, padding: "0 12px" }
const danger: CSSProperties = { minHeight: 46, border: "1px solid rgba(248,113,113,.28)", borderRadius: 12, background: "#6f1d2a", color: "white", fontWeight: 950, padding: "0 12px" }
const identity: CSSProperties = { padding: 10, borderRadius: 12, background: "#091322", color: "#cbd5e1", fontSize: 12, wordBreak: "break-all" }
const confirmBox: CSSProperties = { padding: 12, borderRadius: 15, background: "#160f17", border: "1px solid rgba(248,113,113,.22)", display: "grid", gap: 9 }
const input: CSSProperties = { width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 11, border: "1px solid #48566a", background: "#080d15", color: "white", padding: "0 12px", fontSize: 16, fontWeight: 900 }
const two: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }
const notice: CSSProperties = { padding: 12, borderRadius: 14, background: "#10274b", color: "#dbeafe", fontSize: 12, fontWeight: 800 }
