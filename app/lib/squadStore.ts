import { getPlayersForTeam } from "./realTeamData"

export const squadStorageKey = "football-os-u11-squad-v2"
export const squadChangeEvent = "football-os-squad-change"

const basePlayers = getPlayersForTeam("U11 Girls")

export type SquadAvailability = "Available" | "Doubtful" | "Injured" | "Unavailable"

export type SquadStorePlayer = {
  id: string
  name: string
  knownAs?: string
  primaryPosition: string
  secondaryPositions: string[]
  responsibilities: string[]
  availability: SquadAvailability
  shirtNumber: string
  parentContact: string
  medicalNotes: string
  developmentNotes: string
}

const roleSeed: Record<string, Pick<SquadStorePlayer, "primaryPosition" | "secondaryPositions" | "responsibilities">> = {
  "darcy-rae-russell": { primaryPosition: "GK", secondaryPositions: ["CB"], responsibilities: ["Main Goalkeeper"] },
  "betsy-rowland": { primaryPosition: "CB", secondaryPositions: ["LDEF", "RDEF"], responsibilities: ["Squad Player"] },
  "poppy-bennett": { primaryPosition: "ST", secondaryPositions: ["RW", "LW"], responsibilities: ["Squad Player"] },
  "martha-scrivens": { primaryPosition: "ST", secondaryPositions: ["AM"], responsibilities: ["Squad Player"] },
  "isabella-ogden": { primaryPosition: "CM", secondaryPositions: ["AM", "RM"], responsibilities: ["Squad Player"] },
  "olivia-hassall": { primaryPosition: "CM", secondaryPositions: ["DM"], responsibilities: ["Squad Player"] },
  "ella-wilson": { primaryPosition: "RW", secondaryPositions: ["LW", "ST"], responsibilities: ["Squad Player"] },
  "bella-bainbridge": { primaryPosition: "CB", secondaryPositions: ["DM"], responsibilities: ["Squad Player"] },
  "ruby-salter": { primaryPosition: "CM", secondaryPositions: ["RW"], responsibilities: ["Squad Player"] },
  "connie-luff": { primaryPosition: "CB", secondaryPositions: ["CM"], responsibilities: ["Squad Player"] },
}

function uniqueStrings(value: unknown) {
  if (!Array.isArray(value)) return []
  return Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)))
}

function validAvailability(value: unknown): SquadAvailability {
  return value === "Doubtful" || value === "Injured" || value === "Unavailable" ? value : "Available"
}

export function getDefaultSquadPlayers(): SquadStorePlayer[] {
  return basePlayers.map((player, index) => {
    const seeded = roleSeed[player.id]
    return {
      id: player.id,
      name: player.name,
      knownAs: player.knownAs,
      primaryPosition: seeded?.primaryPosition ?? "TBC",
      secondaryPositions: seeded?.secondaryPositions ?? [],
      responsibilities: seeded?.responsibilities ?? ["Squad Player"],
      availability: "Available",
      shirtNumber: `${index + 1}`,
      parentContact: "",
      medicalNotes: "",
      developmentNotes: player.notes ?? "",
    }
  })
}

function normalisePlayer(value: unknown, fallback?: SquadStorePlayer): SquadStorePlayer | null {
  if (!value || typeof value !== "object") return fallback ?? null
  const candidate = value as Partial<SquadStorePlayer>
  const id = typeof candidate.id === "string" && candidate.id.trim() ? candidate.id : fallback?.id
  const name = typeof candidate.name === "string" && candidate.name.trim() ? candidate.name : fallback?.name
  if (!id || !name) return null

  const responsibilities = uniqueStrings(candidate.responsibilities)
  return {
    id,
    name,
    knownAs: typeof candidate.knownAs === "string" ? candidate.knownAs : fallback?.knownAs,
    primaryPosition:
      typeof candidate.primaryPosition === "string" && candidate.primaryPosition.trim()
        ? candidate.primaryPosition
        : fallback?.primaryPosition ?? "TBC",
    secondaryPositions: uniqueStrings(candidate.secondaryPositions),
    responsibilities: responsibilities.length ? responsibilities : fallback?.responsibilities ?? ["Squad Player"],
    availability: validAvailability(candidate.availability),
    shirtNumber: typeof candidate.shirtNumber === "string" ? candidate.shirtNumber : fallback?.shirtNumber ?? "",
    parentContact: typeof candidate.parentContact === "string" ? candidate.parentContact : "",
    medicalNotes: typeof candidate.medicalNotes === "string" ? candidate.medicalNotes : "",
    developmentNotes:
      typeof candidate.developmentNotes === "string"
        ? candidate.developmentNotes
        : fallback?.developmentNotes ?? "",
  }
}

function normaliseSquad(value: unknown): SquadStorePlayer[] {
  if (!Array.isArray(value)) return getDefaultSquadPlayers()
  const defaults = new Map(getDefaultSquadPlayers().map((player) => [player.id, player]))
  const seen = new Set<string>()
  const next: SquadStorePlayer[] = []

  for (const item of value) {
    const candidateId =
      item && typeof item === "object" && typeof (item as Partial<SquadStorePlayer>).id === "string"
        ? (item as Partial<SquadStorePlayer>).id
        : undefined
    const player = normalisePlayer(item, candidateId ? defaults.get(candidateId) : undefined)
    if (!player || seen.has(player.id)) continue
    seen.add(player.id)
    next.push(player)
  }

  return next.length ? next : getDefaultSquadPlayers()
}

export function loadSquadPlayers(): SquadStorePlayer[] {
  if (typeof window === "undefined") return getDefaultSquadPlayers()
  try {
    const raw = window.localStorage.getItem(squadStorageKey)
    if (!raw) return getDefaultSquadPlayers()
    return normaliseSquad(JSON.parse(raw))
  } catch {
    return getDefaultSquadPlayers()
  }
}

export function saveSquadPlayers(players: SquadStorePlayer[]) {
  if (typeof window === "undefined") return
  const safe = normaliseSquad(players)
  window.localStorage.setItem(squadStorageKey, JSON.stringify(safe))
  window.dispatchEvent(new CustomEvent(squadChangeEvent, { detail: safe }))
}

export function createSquadPlayer(): SquadStorePlayer {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `player-${crypto.randomUUID()}`
      : `player-${Date.now()}`

  return {
    id,
    name: "New Player",
    knownAs: "",
    primaryPosition: "TBC",
    secondaryPositions: [],
    responsibilities: ["Squad Player"],
    availability: "Available",
    shirtNumber: "",
    parentContact: "",
    medicalNotes: "",
    developmentNotes: "",
  }
}

export function subscribeSquadPlayers(listener: (players: SquadStorePlayer[]) => void) {
  if (typeof window === "undefined") return () => {}

  const handleChange = (event: Event) => {
    const custom = event as CustomEvent<SquadStorePlayer[]>
    listener(Array.isArray(custom.detail) ? normaliseSquad(custom.detail) : loadSquadPlayers())
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === squadStorageKey) listener(loadSquadPlayers())
  }

  window.addEventListener(squadChangeEvent, handleChange)
  window.addEventListener("storage", handleStorage)
  return () => {
    window.removeEventListener(squadChangeEvent, handleChange)
    window.removeEventListener("storage", handleStorage)
  }
}

export function positionLine(player: Pick<SquadStorePlayer, "primaryPosition" | "secondaryPositions">) {
  const secondary = player.secondaryPositions.filter(Boolean)
  return secondary.length ? `${player.primaryPosition} / ${secondary.join(" / ")}` : player.primaryPosition
}

export function isMainGoalkeeper(player: Pick<SquadStorePlayer, "primaryPosition" | "responsibilities">) {
  return player.primaryPosition === "GK" || player.responsibilities.includes("Main Goalkeeper")
}

export function isMatchdayEligible(player: Pick<SquadStorePlayer, "availability">) {
  return player.availability === "Available" || player.availability === "Doubtful"
}
