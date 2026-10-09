"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import styles from "../system/CoachRecords.module.css"

const positions = { defence: "Defence", centre_mid: "Centre midfield", wide: "Wide", striker: "Striker", goalkeeper: "Goalkeeper" } as const
type Position = keyof typeof positions
type Profile = Record<Position, number | null> & { all_rounder: boolean; notes: string; version: number }
type Player = { id: string; first_name: string; last_name: string }
const blank: Profile = { defence: null, centre_mid: null, wide: null, striker: null, goalkeeper: null, all_rounder: false, notes: "", version: 0 }
const scale = ["Avoid / not suitable", "Beginner / emergency", "Developing / cover", "Competent", "Strong / preferred", "Advanced / very strong"]
const message = (error: unknown) => error && typeof error === "object" && "message" in error ? String(error.message) : "Connection failed. Please try again."

export default function PositionProfiles({ teamId }: { teamId: string }) {
  const [players, setPlayers] = useState<Player[]>([])
  const [selected, setSelected] = useState("")
  const [error, setError] = useState("")
  useEffect(() => {
    let active = true
    supabase.from("players").select("id,first_name,last_name").eq("team_id", teamId).order("first_name")
      .then(({ data, error }) => { if (!active) return; if (error) setError(error.message); else { setPlayers(data ?? []); setSelected(data?.[0]?.id ?? "") } })
    return () => { active = false }
  }, [teamId])
  return <section className={styles.panel}>
    <h2>Position ratings</h2><p>Coach-only · saved securely with your team.</p>
    {error && <p role="alert">{error}</p>}
    <label>Player<select value={selected} onChange={event => {
      if (window.confirm("Switch player? Any unsaved rating changes will be lost.")) setSelected(event.target.value)
    }}><option value="" disabled>Select a player</option>{players.map(player => <option key={player.id} value={player.id}>{player.first_name} {player.last_name}</option>)}</select></label>
    {selected && <ProfileEditor key={selected} playerId={selected} teamId={teamId} />}
  </section>
}

function ProfileEditor({ playerId, teamId }: { playerId: string; teamId: string }) {
  const [profile, setProfile] = useState<Profile>(blank)
  const [busy, setBusy] = useState(true)
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState("")
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    setBusy(true); setReady(false)
    supabase.from("player_position_profiles").select("*").eq("team_id", teamId).eq("player_id", playerId).maybeSingle()
      .then(({ data, error }) => { if (!active) return; setBusy(false); if (error) setStatus(error.message); else { setProfile(data ?? blank); setReady(true); setStatus(data ? "Loaded from cloud." : "No ratings recorded yet.") } })
    return () => { active = false }
  }, [playerId, teamId, reload])
  async function save() {
    setBusy(true); setStatus("Saving…")
    try {
      const { data, error } = await supabase.rpc("save_position_profile", { target_player: playerId, expected_version: profile.version, profile })
      if (error) throw error
      if (!data) throw new Error("Save could not be confirmed. Reload before trying again.")
      setProfile(data as Profile); setStatus("Saved to cloud.")
    } catch (error) { setStatus(message(error)) } finally { setBusy(false) }
  }
  return <form onSubmit={event => { event.preventDefault(); void save() }}>
    <fieldset disabled={busy || !ready}>
      <legend>Ability by position</legend>
      <div className={styles.grid}>{(Object.keys(positions) as Position[]).map(position => <label key={position}>{positions[position]}<select value={profile[position] ?? ""} onChange={event => { setProfile({ ...profile, [position]: event.target.value === "" ? null : Number(event.target.value) }); setStatus("Unsaved changes.") }}><option value="">Not yet tried</option>{scale.map((label, score) => <option value={score} key={score}>{score} — {label}</option>)}</select></label>)}</div>
      <label className={styles.check}><input type="checkbox" checked={profile.all_rounder} onChange={event => { setProfile({ ...profile, all_rounder: event.target.checked }); setStatus("Unsaved changes.") }} />All-rounder</label>
      <label>Coach notes<textarea maxLength={4000} value={profile.notes} onChange={event => { setProfile({ ...profile, notes: event.target.value }); setStatus("Unsaved changes.") }} /></label>
      <button type="submit">Save ratings to cloud</button>
    </fieldset>
    <p role="status">{status || "Loading ratings…"}</p>
    <button type="button" disabled={busy} onClick={() => { if (window.confirm("Reload cloud ratings and discard unsaved changes?")) setReload(value => value + 1) }}>Reload saved ratings</button>
  </form>
}
