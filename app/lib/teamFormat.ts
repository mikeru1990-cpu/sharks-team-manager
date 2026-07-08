export type TeamFormatId = "5v5" | "7v7" | "9v9" | "11v11"

export type PitchSlot = {
  key: string
  label: string
  x: number
  y: number
}

export type TeamFormatConfig = {
  id: TeamFormatId
  label: string
  playersOnPitch: number
  outfieldPlayers: number
  defaultFormation: string
  formations: string[]
  defaultPeriodMinutes: number
  defaultPeriods: number
  pitchSlots: PitchSlot[]
}

export const teamFormats: Record<TeamFormatId, TeamFormatConfig> = {
  "5v5": {
    id: "5v5",
    label: "5v5",
    playersOnPitch: 5,
    outfieldPlayers: 4,
    defaultFormation: "1-2-1",
    formations: ["1-2-1", "2-1-1", "1-1-2"],
    defaultPeriodMinutes: 10,
    defaultPeriods: 4,
    pitchSlots: [
      { key: "GK", label: "GK", x: 50, y: 88 },
      { key: "LDEF", label: "LDEF", x: 30, y: 63 },
      { key: "RDEF", label: "RDEF", x: 70, y: 63 },
      { key: "CM", label: "CM", x: 50, y: 39 },
      { key: "ST", label: "ST", x: 50, y: 14 },
    ],
  },
  "7v7": {
    id: "7v7",
    label: "7v7",
    playersOnPitch: 7,
    outfieldPlayers: 6,
    defaultFormation: "2-3-1",
    formations: ["2-3-1", "2-2-2", "3-2-1", "3-1-2"],
    defaultPeriodMinutes: 15,
    defaultPeriods: 4,
    pitchSlots: [
      { key: "GK", label: "GK", x: 50, y: 88 },
      { key: "LDEF", label: "LDEF", x: 31, y: 67 },
      { key: "RDEF", label: "RDEF", x: 69, y: 67 },
      { key: "CM", label: "CM", x: 50, y: 49 },
      { key: "LW", label: "LW", x: 25, y: 30 },
      { key: "RW", label: "RW", x: 75, y: 30 },
      { key: "ST", label: "ST", x: 50, y: 13 },
    ],
  },
  "9v9": {
    id: "9v9",
    label: "9v9",
    playersOnPitch: 9,
    outfieldPlayers: 8,
    defaultFormation: "3-2-3",
    formations: ["3-2-3", "3-3-2", "2-3-3", "3-4-1"],
    defaultPeriodMinutes: 17.5,
    defaultPeriods: 4,
    pitchSlots: [
      { key: "GK", label: "GK", x: 50, y: 90 },
      { key: "LDEF", label: "LDEF", x: 24, y: 70 },
      { key: "CB", label: "CB", x: 50, y: 73 },
      { key: "RDEF", label: "RDEF", x: 76, y: 70 },
      { key: "LCM", label: "CM", x: 36, y: 49 },
      { key: "RCM", label: "CM", x: 64, y: 49 },
      { key: "LW", label: "LW", x: 22, y: 25 },
      { key: "ST", label: "ST", x: 50, y: 13 },
      { key: "RW", label: "RW", x: 78, y: 25 },
    ],
  },
  "11v11": {
    id: "11v11",
    label: "11v11",
    playersOnPitch: 11,
    outfieldPlayers: 10,
    defaultFormation: "4-3-3",
    formations: ["4-3-3", "4-4-2", "4-2-3-1", "3-5-2"],
    defaultPeriodMinutes: 22.5,
    defaultPeriods: 4,
    pitchSlots: [
      { key: "GK", label: "GK", x: 50, y: 91 },
      { key: "LB", label: "LB", x: 17, y: 72 },
      { key: "LCB", label: "CB", x: 39, y: 75 },
      { key: "RCB", label: "CB", x: 61, y: 75 },
      { key: "RB", label: "RB", x: 83, y: 72 },
      { key: "DM", label: "DM", x: 50, y: 57 },
      { key: "LCM", label: "CM", x: 34, y: 43 },
      { key: "RCM", label: "CM", x: 66, y: 43 },
      { key: "LW", label: "LW", x: 20, y: 23 },
      { key: "ST", label: "ST", x: 50, y: 12 },
      { key: "RW", label: "RW", x: 80, y: 23 },
    ],
  },
}

export const teamFormatStorageKey = "football-os-team-format-v1"

export function loadTeamFormat(): TeamFormatId {
  if (typeof window === "undefined") return "7v7"
  const saved = window.localStorage.getItem(teamFormatStorageKey)
  return saved && saved in teamFormats ? saved as TeamFormatId : "7v7"
}

export function saveTeamFormat(format: TeamFormatId) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(teamFormatStorageKey, format)
  window.dispatchEvent(new CustomEvent("football-os-team-format-change", { detail: format }))
}

export function getTeamFormat(format: TeamFormatId) {
  return teamFormats[format]
}
