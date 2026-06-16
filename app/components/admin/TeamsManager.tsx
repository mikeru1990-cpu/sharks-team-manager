"use client"

import { useMemo, useState } from "react"
import type { TeamIdentity, TeamSection } from "../../lib/teamAccess"
import { getTeamDisplayName } from "../../lib/teamAccess"
import TeamBrandPreview from "../layout/TeamBrandPreview"

type Props = {
  teams?: TeamIdentity[]
  onSaveTeams?: (teams: TeamIdentity[]) => void | Promise<void>
}

const sections: TeamSection[] = ["boys", "girls", "mixed", "senior", "veterans"]

function makeTeamId(ageGroup: string, section: string, squadName: string) {
  return [ageGroup, section, squadName || "team"]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export default function TeamsManager({ teams = [], onSaveTeams }: Props) {
  const [draftTeams, setDraftTeams] = useState<TeamIdentity[]>(teams)
  const [ageGroup, setAgeGroup] = useState("U10")
  const [section, setSection] = useState<TeamSection>("girls")
  const [squadName, setSquadName] = useState("Sharks")
  const [primaryColour, setPrimaryColour] = useState("#0ea5e9")
  const [secondaryColour, setSecondaryColour] = useState("#ffffff")
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0]?.id || "")

  const selectedTeam = useMemo(
    () => draftTeams.find((team) => team.id === selectedTeamId) || draftTeams[0] || null,
    [draftTeams, selectedTeamId]
  )

  function addTeam() {
    const cleanAge = ageGroup.trim() || "U10"
    const cleanSquad = squadName.trim()
    const id = makeTeamId(cleanAge, section, cleanSquad)
    const displayName = [cleanAge, section.charAt(0).toUpperCase() + section.slice(1), cleanSquad].filter(Boolean).join(" ")

    const nextTeam: TeamIdentity = {
      id,
      name: displayName,
      ageGroup: cleanAge,
      section,
      squadName: cleanSquad,
      displayName,
      primaryColour,
      secondaryColour,
    }

    const next = [...draftTeams.filter((team) => team.id !== id), nextTeam]
    setDraftTeams(next)
    setSelectedTeamId(id)
    void onSaveTeams?.(next)
  }

  function removeTeam(teamId: string) {
    const next = draftTeams.filter((team) => team.id !== teamId)
    setDraftTeams(next)
    if (selectedTeamId === teamId) setSelectedTeamId(next[0]?.id || "")
    void onSaveTeams?.(next)
  }

  return (
    <section style={{ display: "grid", gap: 16 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18, display: "grid", gap: 8 }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Club Admin
        </div>
        <div style={{ color: "white", fontSize: 30, fontWeight: 1000, letterSpacing: "-0.045em" }}>
          Teams Manager
        </div>
        <div style={{ color: "#cbd5e1", fontWeight: 750 }}>
          Add and manage boys, girls, mixed, senior and veterans teams. Multiple squads can exist in the same age group.
        </div>
      </div>

      {selectedTeam ? <TeamBrandPreview team={selectedTeam} compact /> : null}

      <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 12, border: "1px solid rgba(125,211,252,0.22)" }}>
        <div style={{ color: "white", fontSize: 18, fontWeight: 1000 }}>Add Team</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          <Field label="Age Group" value={ageGroup} onChange={setAgeGroup} />
          <label style={{ display: "grid", gap: 6 }}>
            <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>Section</span>
            <select value={section} onChange={(event) => setSection(event.target.value as TeamSection)} style={inputStyle()}>
              {sections.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <Field label="Squad Name" value={squadName} onChange={setSquadName} />
          <Colour label="Primary" value={primaryColour} onChange={setPrimaryColour} />
          <Colour label="Secondary" value={secondaryColour} onChange={setSecondaryColour} />
        </div>
        <button onClick={addTeam} style={{ border: "1px solid rgba(34,197,94,0.45)", background: "rgba(34,197,94,0.14)", color: "#bbf7d0", borderRadius: 16, padding: "11px 14px", fontWeight: 1000 }}>
          Add Team
        </button>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {draftTeams.map((team) => (
          <div key={team.id} className="sharks-glass" style={{ borderRadius: 20, padding: 12, display: "grid", gap: 10, border: `1px solid ${(team.primaryColour || "#38bdf8")}55` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <button onClick={() => setSelectedTeamId(team.id)} style={{ border: 0, background: "transparent", color: "white", fontWeight: 1000, fontSize: 16, textAlign: "left", cursor: "pointer" }}>
                {getTeamDisplayName(team)}
              </button>
              <button onClick={() => removeTeam(team.id)} style={{ border: "1px solid rgba(251,113,133,0.45)", background: "rgba(251,113,133,0.12)", color: "#fecdd3", borderRadius: 14, padding: "9px 11px", fontWeight: 1000 }}>
                Remove
              </button>
            </div>
            <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850 }}>
              {team.ageGroup || "No age"} • {team.section || "No section"} • {team.squadName || "No squad name"}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} style={inputStyle()} />
    </label>
  )
}

function Colour({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>{label}</span>
      <input type="color" value={value} onChange={(event) => onChange(event.target.value)} style={{ ...inputStyle(), height: 44, padding: 5 }} />
    </label>
  )
}

function inputStyle(): React.CSSProperties {
  return {
    border: "1px solid rgba(125,211,252,0.24)",
    background: "rgba(15,23,42,0.92)",
    color: "white",
    borderRadius: 14,
    padding: 12,
    fontWeight: 850,
  }
}
