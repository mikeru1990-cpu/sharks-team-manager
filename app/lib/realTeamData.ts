export type RealPlayer = {
  id: string
  name: string
  knownAs?: string
  team: "U10 Girls" | "U11 Girls" | "Team TBC"
  status: "confirmed" | "continuing_tbc" | "unknown"
  notes?: string
}

export type RealCoach = {
  id: string
  name: string
  role: string
  team: "U10 Girls" | "U11 Girls" | "Club"
  notes?: string
}

export type RealEvent = {
  id: string
  title: string
  type: "training" | "match" | "tournament" | "admin"
  dateLabel: string
  timeLabel?: string
  location?: string
  notes?: string
}

export const leonardStanleyPlayers: RealPlayer[] = [
  { id: "darcy-rae-russell", name: "Darcy-Rae Russell", team: "U11 Girls", status: "confirmed", notes: "Confirmed U11 Lioness." },
  { id: "betsy-rowland", name: "Betsy Rowland", team: "U11 Girls", status: "confirmed", notes: "Confirmed U11 Lioness." },
  { id: "poppy-bennett", name: "Poppy Bennett", team: "U11 Girls", status: "confirmed", notes: "Confirmed U11 Lioness." },
  { id: "martha-scrivens", name: "Martha Scrivens", team: "U11 Girls", status: "confirmed", notes: "Confirmed U11 Lioness." },
  { id: "isabella-ogden", name: "Isabella Ogden", knownAs: "Bella O", team: "U11 Girls", status: "confirmed", notes: "Known as Bella O, not Bella Bainbridge." },
  { id: "olivia-hassall", name: "Olivia Hassall", team: "U11 Girls", status: "confirmed", notes: "Confirmed U11 Lioness." },
  { id: "ella-wilson", name: "Ella Wilson", team: "U11 Girls", status: "confirmed", notes: "Confirmed U11 Lioness." },
  { id: "bella-bainbridge", name: "Bella Bainbridge", knownAs: "Bella B", team: "U11 Girls", status: "confirmed", notes: "Known as Bella B." },
  { id: "ruby-salter", name: "Ruby Salter", team: "U11 Girls", status: "confirmed", notes: "Confirmed U11 Lioness." },
  { id: "connie-luff", name: "Connie Luff", team: "U11 Girls", status: "confirmed", notes: "Confirmed U11 Lioness." },
  { id: "lyra-twinning", name: "Lyra Twinning", team: "Team TBC", status: "continuing_tbc", notes: "Continuing. Training arrangements will determine whether she joins U10, U11 or both." },
]

export const leonardStanleyCoaches: RealCoach[] = [
  { id: "mike-russell", name: "Mike Russell", role: "Coach", team: "U11 Girls" },
  { id: "ryan-elsy-dad", name: "Ryan Elsy's dad", role: "Coach", team: "U10 Girls" },
  { id: "ben-bailee-dad", name: "Ben - Bailee's dad", role: "Coach", team: "U10 Girls" },
]

export const leonardStanleyEvents: RealEvent[] = [
  { id: "training-restart-2026-07-08", title: "Training restarts", type: "training", dateLabel: "8 July 2026", timeLabel: "17:45", location: "Leonard Stanley pitch", notes: "Training restart after pitch maintenance break." },
  { id: "dursley-town-tournament-2026-06-14", title: "Dursley Town Girls FC Tournament", type: "tournament", dateLabel: "14 June 2026", location: "Rednock School, Kingshill Road, Dursley GL11 4BY", notes: "U10 competition, 6-a-side plus 4 subs, 10 player squad limit." },
]

export function getPlayersForTeam(team: RealPlayer["team"]) {
  return leonardStanleyPlayers.filter((player) => player.team === team)
}

export function getActiveU11Players() {
  return leonardStanleyPlayers.filter((player) => player.team === "U11 Girls" && player.status === "confirmed")
}

export function getConfirmedU11Players() {
  return getActiveU11Players()
}

export function getContinuingTeamTbcPlayers() {
  return leonardStanleyPlayers.filter((player) => player.status === "continuing_tbc")
}

export function getAllKnownPlayers() {
  return leonardStanleyPlayers
}

export function getPlayersByStatus(status: RealPlayer["status"]) {
  return leonardStanleyPlayers.filter((player) => player.status === status)
}
