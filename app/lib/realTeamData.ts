export type RealPlayer = {
  id: string
  name: string
  knownAs?: string
  team: "U10 Girls" | "U11 Girls" | "Pending"
  status: "active" | "pending" | "unknown"
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
  { id: "bailee-dowler-rowles", name: "Bailee Dowler-Rowles", team: "U10 Girls", status: "unknown" },
  { id: "bella-bainbridge", name: "Bella Bainbridge", knownAs: "Bella B", team: "U11 Girls", status: "active" },
  { id: "betsy-rowland", name: "Betsy Rowland", team: "U10 Girls", status: "unknown" },
  { id: "connie-luff", name: "Connie Luff", team: "U11 Girls", status: "active" },
  { id: "darcy-rae-russell", name: "Darcy-Rae Russell", team: "U11 Girls", status: "active", notes: "Confirmed continuing with U11s." },
  { id: "ella-wilson", name: "Ella Wilson", team: "U11 Girls", status: "active" },
  { id: "elsy-harmer", name: "Elsy Harmer", team: "U10 Girls", status: "unknown" },
  { id: "evelyn-evans", name: "Evelyn Evans", team: "U10 Girls", status: "unknown" },
  { id: "isabella-ogden", name: "Isabella Ogden", knownAs: "Bella O", team: "U11 Girls", status: "active", notes: "Known as Bella O, not Bella Bainbridge." },
  { id: "lyra-twinning", name: "Lyra Twinning", team: "Pending", status: "pending", notes: "Could play up an age group." },
  { id: "martha-scrivens", name: "Martha Scrivens", team: "U11 Girls", status: "active" },
  { id: "olivia-hassall", name: "Olivia Hassall", team: "U11 Girls", status: "active" },
  { id: "poppy-bennett", name: "Poppy Bennett", team: "U10 Girls", status: "unknown" },
  { id: "ruby-salter", name: "Ruby Salter", team: "U11 Girls", status: "active" },
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
  return leonardStanleyPlayers.filter((player) => player.team === "U11 Girls" && player.status === "active")
}

export function getAllKnownPlayers() {
  return leonardStanleyPlayers
}

export function getPlayersByStatus(status: RealPlayer["status"]) {
  return leonardStanleyPlayers.filter((player) => player.status === status)
}
