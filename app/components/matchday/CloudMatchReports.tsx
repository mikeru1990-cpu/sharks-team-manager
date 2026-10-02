"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import styles from "../system/CoachRecords.module.css"

type Match = { id: string; title: string; starts_at: string }
type Player = { id: string; first_name: string; last_name: string }
type Outcome = "win" | "draw" | "loss"
type Report = { goals_for: number | null; goals_against: number | null; outcome: Outcome; notes: string; version: number }
const categories = { players: "Players’ Player", spectators: "Spectators’ Player", opponents: "Opponents’ Player" } as const
type Category = keyof typeof categories
type Award = { player_id: string; category: Category }
const errorMessage = (error: unknown) => error && typeof error === "object" && "message" in error ? String(error.message) : "Connection failed. Reload to check whether your changes saved."

export default function CloudMatchReports({ teamId, initialEventId }: { teamId: string; initialEventId?: string }) {
  const [matches, setMatches] = useState<Match[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [selected, setSelected] = useState("")
  const [status, setStatus] = useState("Loading matches…")
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from("team_events").select("id,title,starts_at").eq("team_id", teamId).eq("event_type", "match").neq("status", "cancelled").order("starts_at", { ascending: false }),
      supabase.from("players").select("id,first_name,last_name").eq("team_id", teamId).order("first_name"),
    ]).then(([events, squad]) => {
      if (!active) return
      if (events.error || squad.error) { setStatus((events.error || squad.error)!.message); return }
      const list = (events.data ?? []) as Match[]
      setMatches(list); setPlayers(squad.data ?? [])
      setSelected(list.find(match => match.id === initialEventId)?.id ?? list.find(match => Date.parse(match.starts_at) <= Date.now())?.id ?? list[0]?.id ?? "")
      setStatus(list.length ? "" : "Add a match in Schedule first.")
    }).catch(error => { if (active) setStatus(errorMessage(error)) })
    return () => { active = false }
  }, [teamId, initialEventId, reload])
  return <section className={styles.panel}>
    <h2>Cloud results & awards</h2>
    <p>Coach-only records. Scores are private. For U10/U11 public posts, use win, draw or loss only.</p>
    {status && <p role="status">{status}</p>}
    {!matches.length && <button type="button" onClick={() => setReload(value => value + 1)}>Retry loading matches</button>}
    {matches.length > 0 && <label>Match<select value={selected} onChange={event => { if (window.confirm("Switch match? Any unsaved report changes will be lost.")) setSelected(event.target.value) }}>{matches.map(match => <option key={match.id} value={match.id}>{new Date(match.starts_at).toLocaleDateString("en-GB")} · {match.title}</option>)}</select></label>}
    {selected && <ReportEditor key={selected} teamId={teamId} match={matches.find(match => match.id === selected)!} players={players} />}
  </section>
}

function ReportEditor({ teamId, match, players }: { teamId: string; match: Match; players: Player[] }) {
  const [goalsFor, setGoalsFor] = useState("")
  const [goalsAgainst, setGoalsAgainst] = useState("")
  const [outcome, setOutcome] = useState<Outcome | "">("")
  const [notes, setNotes] = useState("")
  const [version, setVersion] = useState(0)
  const [awards, setAwards] = useState<Award[]>([])
  const [busy, setBusy] = useState(true)
  const [ready, setReady] = useState(false)
  const [status, setStatus] = useState("Loading saved report…")
  const [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    setBusy(true); setReady(false)
    Promise.all([
      supabase.from("team_match_reports").select("*").eq("team_id", teamId).eq("event_id", match.id).maybeSingle(),
      supabase.from("team_match_awards").select("player_id,category").eq("team_id", teamId).eq("event_id", match.id),
    ]).then(([report, winners]) => {
      if (!active) return
      if (report.error || winners.error) throw report.error || winners.error
      const saved = report.data as Report | null
      setGoalsFor(saved?.goals_for?.toString() ?? ""); setGoalsAgainst(saved?.goals_against?.toString() ?? "")
      setOutcome(saved?.outcome ?? ""); setNotes(saved?.notes ?? ""); setVersion(saved?.version ?? 0)
      setAwards((winners.data ?? []) as Award[]); setReady(true)
      setStatus(saved ? "Loaded from cloud." : "No result recorded yet.")
    }).catch(error => { if (active) setStatus(errorMessage(error)) }).finally(() => { if (active) setBusy(false) })
    return () => { active = false }
  }, [teamId, match.id, reload])
  const derivedOutcome: Outcome | "" = goalsFor !== "" && goalsAgainst !== "" ? Number(goalsFor) > Number(goalsAgainst) ? "win" : Number(goalsFor) < Number(goalsAgainst) ? "loss" : "draw" : outcome
  async function save() {
    if ((goalsFor === "") !== (goalsAgainst === "")) { setStatus("Enter both scores, or leave both blank."); return }
    if (!derivedOutcome) { setStatus("Choose win, draw or loss."); return }
    if (Date.parse(match.starts_at) > Date.now()) { setStatus("This match has not started yet. Save its result after it has been played."); return }
    if (!window.confirm("Save this final result and awards, and mark the match completed?")) return
    setBusy(true); setStatus("Saving…")
    try {
      const { data, error } = await supabase.rpc("save_team_match_report", {
        target_event: match.id, expected_version: version,
        report: { goals_for: goalsFor === "" ? null : Number(goalsFor), goals_against: goalsAgainst === "" ? null : Number(goalsAgainst), outcome: derivedOutcome, notes }, awards,
      })
      if (error) throw error
      if (!data) throw new Error("Save could not be confirmed. Reload before trying again.")
      setVersion((data as Report).version); setOutcome(derivedOutcome); setStatus("Result and awards saved to cloud. Match marked completed.")
    } catch (error) { setStatus(errorMessage(error)) } finally { setBusy(false) }
  }
  function toggle(playerId: string, category: Category) {
    setAwards(current => current.some(award => award.player_id === playerId && award.category === category)
      ? current.filter(award => !(award.player_id === playerId && award.category === category)) : [...current, { player_id: playerId, category }])
  }
  return <form onSubmit={event => { event.preventDefault(); void save() }} onChange={() => setStatus("Unsaved changes.")}>
    <fieldset disabled={busy || !ready}>
      <legend>Final result</legend>
      <p>Enter scores from your team’s point of view. This does not read the device-only live scoreboard.</p>
      <div className={styles.grid}>
        <label>Our goals (optional)<input type="number" min="0" max="99" step="1" inputMode="numeric" value={goalsFor} onChange={event => setGoalsFor(event.target.value)} /></label>
        <label>Opponent goals (optional)<input type="number" min="0" max="99" step="1" inputMode="numeric" value={goalsAgainst} onChange={event => setGoalsAgainst(event.target.value)} /></label>
      </div>
      <label>Result<select required value={derivedOutcome} disabled={goalsFor !== "" && goalsAgainst !== ""} onChange={event => setOutcome(event.target.value as Outcome)}><option value="">Select result</option><option value="win">Win</option><option value="draw">Draw</option><option value="loss">Loss</option></select></label>
      <label>Coach report<textarea maxLength={4000} value={notes} onChange={event => setNotes(event.target.value)} /></label>
      <p>Select all tied winners. Leave an award empty if it has not been decided.</p>
      {(Object.keys(categories) as Category[]).map(category => <fieldset key={category}><legend>{categories[category]}</legend>{players.map(player => <label className={styles.check} key={player.id}><input type="checkbox" checked={awards.some(award => award.category === category && award.player_id === player.id)} onChange={() => toggle(player.id, category)} />{player.first_name} {player.last_name}</label>)}</fieldset>)}
      <button type="submit">Save final result & awards</button>
    </fieldset>
    <p role="status">{status}</p>
    <button type="button" disabled={busy} onClick={() => { if (window.confirm("Reload cloud report and discard unsaved changes?")) setReload(value => value + 1) }}>Reload saved report</button>
  </form>
}
