export type ConductAudience = "parent" | "player" | "coach"

export type ConductPolicy = {
  id: string
  audience: ConductAudience
  title: string
  subtitle: string
  version: string
  effectiveSeason: string
  commitments: string[]
  consequences: string[]
}

export const conductPolicies: Record<ConductAudience, ConductPolicy> = {
  parent: {
    id: "respect-parent-2026-27",
    audience: "parent",
    title: "Spectators and Parents/Carers",
    subtitle: "Play your part and support the FA’s Code of Respect",
    version: "2026-27",
    effectiveSeason: "2026/27",
    commitments: [
      "Have fun! It’s what we’re all here for",
      "Celebrate effort and good play from all sides",
      "Always respect the Referee and coaches and encourage players to do the same",
      "Stay behind the touchline and within the Designated Spectator’s Area where provided",
      "When players make mistakes, offer them encouragement to try again next time",
      "Never engage in, or tolerate offensive, insulting or abusive language or behaviour",
      "Make myself familiar with safeguarding practices and relevant guidance on physical contact and acceptable behaviours when working with young people",
    ],
    consequences: [
      "A verbal warning or being asked to leave",
      "A meeting with the club committee, league or CFA Welfare Officer",
      "An FA education course",
      "Being asked not to attend future games, suspension or removal of membership",
      "Being required to leave the club with dependants and/or receiving a fine",
    ],
  },
  player: {
    id: "respect-player-2026-27",
    audience: "player",
    title: "Young Players",
    subtitle: "Play your part and support the FA’s Code of Respect",
    version: "2026-27",
    effectiveSeason: "2026/27",
    commitments: [
      "Always play my best for the benefit of the team",
      "Play fairly and be friendly",
      "Play by the rules and respect the Referee",
      "Shake hands with the other team – win or lose",
      "Listen carefully to what my coach tells me",
      "Understand that a coach has to do what’s best for the team",
      "Talk to someone I trust or the club welfare officer if I’m unhappy about anything at my club",
      "Encourage my team mates",
      "Respect the facilities home and away",
    ],
    consequences: [
      "Being asked to apologise to whoever I’ve upset",
      "Receiving a formal warning",
      "Being dropped, substituted or suspended from training",
    ],
  },
  coach: {
    id: "respect-coach-2026-27",
    audience: "coach",
    title: "Coaches, Team Managers and Club Officials",
    subtitle: "Play your part and support the FA’s Code of Respect",
    version: "2026-27",
    effectiveSeason: "2026/27",
    commitments: [
      "Always show respect to everyone involved in the game",
      "Stick to the rules and celebrate the spirit of the game",
      "Encourage fair play and high standards of behaviour",
      "Always respect the Referee and encourage players to do the same",
      "Never enter the field of play without the Referee’s permission",
      "Never engage in, or tolerate offensive, insulting or abusive behaviour",
      "Be aware of the potential impact of bad language on others",
      "Be gracious in victory and defeat",
      "Respect the facilities home and away",
      "Place the well-being, safety and enjoyment of each player above everything",
      "Never tolerate any form of bullying",
      "Ensure all activities are suited for the player’s ability and age",
      "Work with others for each player’s best interests",
      "Make myself familiar with safeguarding practices and relevant guidance on physical contact and acceptable behaviours when working with young people",
    ],
    consequences: [
      "A meeting with the club committee, league or CFA Welfare Officer",
      "Suspension by the club from attending matches",
      "Suspension or a fine by the County FA",
      "Being required to leave, losing my position and/or having my licence withdrawn",
    ],
  },
}

export type ConductAcknowledgement = {
  policyId: string
  audience: ConductAudience
  acknowledgedAt: string
  version: string
}

const acknowledgementKey = "football-os-conduct-acknowledgements-v1"

export function readConductAcknowledgements(): ConductAcknowledgement[] {
  if (typeof window === "undefined") return []
  try { return JSON.parse(localStorage.getItem(acknowledgementKey) ?? "[]") } catch { return [] }
}

export function acknowledgeConductPolicy(audience: ConductAudience): ConductAcknowledgement {
  const policy = conductPolicies[audience]
  const acknowledgement: ConductAcknowledgement = {
    policyId: policy.id,
    audience,
    acknowledgedAt: new Date().toISOString(),
    version: policy.version,
  }
  if (typeof window !== "undefined") {
    const existing = readConductAcknowledgements().filter(item => item.policyId !== policy.id)
    localStorage.setItem(acknowledgementKey, JSON.stringify([...existing, acknowledgement]))
  }
  return acknowledgement
}

export function hasAcknowledgedCurrentPolicy(audience: ConductAudience) {
  const policy = conductPolicies[audience]
  return readConductAcknowledgements().some(item => item.policyId === policy.id && item.version === policy.version)
}
