export type PlayerRoleInfo = {
  primary: string
  secondary?: string
  matchRole: string
  positionGroup: "Goalkeeper" | "Defender" | "Midfielder" | "Forward" | "TBC"
  isGoalkeeper?: boolean
}

export const playerRoleMap: Record<string, PlayerRoleInfo> = {
  "darcy-rae-russell": { primary: "Goalkeeper", secondary: "Defence", matchRole: "GK", positionGroup: "Goalkeeper", isGoalkeeper: true },
  "betsy-rowland": { primary: "Defender", secondary: "Wide defence", matchRole: "DEF", positionGroup: "Defender" },
  "poppy-bennett": { primary: "Forward", secondary: "Wide attack", matchRole: "FWD", positionGroup: "Forward" },
  "martha-scrivens": { primary: "Forward", secondary: "Central striker", matchRole: "ST", positionGroup: "Forward" },
  "isabella-ogden": { primary: "Midfielder", secondary: "Wide midfield", matchRole: "MID", positionGroup: "Midfielder" },
  "olivia-hassall": { primary: "Midfielder", secondary: "Central midfield", matchRole: "CM", positionGroup: "Midfielder" },
  "ella-wilson": { primary: "Winger", secondary: "Forward", matchRole: "WING", positionGroup: "Forward" },
  "bella-bainbridge": { primary: "Defender", secondary: "Midfield", matchRole: "DEF", positionGroup: "Defender" },
  "ruby-salter": { primary: "Midfielder", secondary: "Forward", matchRole: "MID", positionGroup: "Midfielder" },
  "connie-luff": { primary: "Defender", secondary: "Midfield", matchRole: "DEF", positionGroup: "Defender" },
  "lyra-twinning": { primary: "Team TBC", secondary: "Role TBC", matchRole: "TBC", positionGroup: "TBC" },
}

export function getPlayerRole(playerId: string): PlayerRoleInfo {
  return playerRoleMap[playerId] ?? { primary: "Role TBC", matchRole: "TBC", positionGroup: "TBC" }
}

export function getPlayerRoleLabel(playerId: string) {
  const role = getPlayerRole(playerId)
  return role.secondary ? `${role.primary} / ${role.secondary}` : role.primary
}
