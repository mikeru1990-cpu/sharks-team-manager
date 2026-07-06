import { getPlayersForTeam } from "./realTeamData"
import { getPlayerRole } from "./playerRoles"

export const squadStorageKey = "football-os-u11-squad-v2"
const basePlayers = getPlayersForTeam("U11 Girls")

export type SquadStorePlayer = {
  id: string
  name: string
  knownAs?: string
  primaryPosition: string
  secondaryPositions: string[]
  responsibilities: string[]
  availability: "Available" | "Doubtful" | "Injured" | "Unavailable"
  shirtNumber: string
  parentContact: string
  medicalNotes: string
  developmentNotes: string
}

export function getDefaultSquadPlayers(): SquadStorePlayer[] {
  return basePlayers.map((player, index) => {
    const role = getPlayerRole(player.id)
    return {
      id: player.id,
      name: player.name,
      knownAs: player.knownAs,
      primaryPosition: role.matchRole || "TBC",
      secondaryPositions: role.secondary ? [role.secondary] : [],
      responsibilities: role.isGoalkeeper ? ["Main Goalkeeper"] : ["Squad Player"],
      availability: "Available",
      shirtNumber: `${index + 1}`,
      parentContact: "",
      medicalNotes: "",
      developmentNotes: player.notes ?? "",
    }
  })
}

export function loadSquadPlayers(): SquadStorePlayer[] {
  if (typeof window === "undefined") return getDefaultSquadPlayers()
  try {
    const raw = window.localStorage.getItem(squadStorageKey)
    if (!raw) return getDefaultSquadPlayers()
    const saved = JSON.parse(raw) as SquadStorePlayer[]
    return Array.isArray(saved) && saved.length ? saved : getDefaultSquadPlayers()
  } catch {
    return getDefaultSquadPlayers()
  }
}

export function saveSquadPlayers(players: SquadStorePlayer[]) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(squadStorageKey, JSON.stringify(players))
}

export function positionLine(player: Pick<SquadStorePlayer, "primaryPosition" | "secondaryPositions">) {
  const secondary = player.secondaryPositions.filter(Boolean)
  return secondary.length ? `${player.primaryPosition} / ${secondary.join(" / ")}` : player.primaryPosition
}

export function isMainGoalkeeper(player: Pick<SquadStorePlayer, "primaryPosition" | "responsibilities">) {
  return player.primaryPosition === "GK" || player.responsibilities.includes("Main Goalkeeper")
}
