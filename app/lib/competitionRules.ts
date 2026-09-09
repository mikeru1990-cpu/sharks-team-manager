export type MatchFormat = "3v3" | "5v5" | "7v7" | "9v9" | "11v11"

export type AgeGroup =
  | "U7" | "U8" | "U9" | "U10" | "U11" | "U12" | "U13"
  | "U14" | "U15" | "U16" | "U17" | "U18"

export type CompetitionRule = {
  ageGroup: AgeGroup
  format: MatchFormat
  minimumPlayersToStart: number
  maximumMatchdaySquad?: number
  minimumHalfMinutes?: number
  maximumHalfMinutes?: number
  minimumQuarterMinutes?: number
  maximumQuarterMinutes?: number
  maximumOrganisedMinutesPerDay: number
  maximumTournamentMinutesPerDay: number
  returnSubstitutes: boolean
  resultPrivacy: "private" | "publishable"
  ballSize: 3 | 4 | 5
}

/**
 * Gloucester County Girls Football League 2026-27.
 * Matchday-facing rules only. This is deliberately kept as data so another
 * competition can supply a different rules profile without changing UI code.
 */
export const GCGFL_2026_27: Record<AgeGroup, CompetitionRule> = {
  U7: {ageGroup:"U7",format:"3v3",minimumPlayersToStart:2,maximumMatchdaySquad:3,maximumOrganisedMinutesPerDay:40,maximumTournamentMinutesPerDay:60,returnSubstitutes:false,resultPrivacy:"private",ballSize:3},
  U8: {ageGroup:"U8",format:"5v5",minimumPlayersToStart:4,maximumMatchdaySquad:10,minimumHalfMinutes:10,maximumHalfMinutes:20,minimumQuarterMinutes:5,maximumQuarterMinutes:10,maximumOrganisedMinutesPerDay:40,maximumTournamentMinutesPerDay:60,returnSubstitutes:true,resultPrivacy:"private",ballSize:3},
  U9: {ageGroup:"U9",format:"5v5",minimumPlayersToStart:4,maximumMatchdaySquad:10,minimumHalfMinutes:10,maximumHalfMinutes:20,minimumQuarterMinutes:5,maximumQuarterMinutes:10,maximumOrganisedMinutesPerDay:40,maximumTournamentMinutesPerDay:60,returnSubstitutes:true,resultPrivacy:"private",ballSize:3},
  U10:{ageGroup:"U10",format:"7v7",minimumPlayersToStart:5,maximumMatchdaySquad:14,minimumHalfMinutes:20,maximumHalfMinutes:25,minimumQuarterMinutes:10,maximumQuarterMinutes:12.5,maximumOrganisedMinutesPerDay:60,maximumTournamentMinutesPerDay:90,returnSubstitutes:true,resultPrivacy:"private",ballSize:3},
  U11:{ageGroup:"U11",format:"7v7",minimumPlayersToStart:5,maximumMatchdaySquad:14,minimumHalfMinutes:20,maximumHalfMinutes:25,minimumQuarterMinutes:10,maximumQuarterMinutes:12.5,maximumOrganisedMinutesPerDay:60,maximumTournamentMinutesPerDay:90,returnSubstitutes:true,resultPrivacy:"private",ballSize:3},
  U12:{ageGroup:"U12",format:"9v9",minimumPlayersToStart:6,maximumMatchdaySquad:18,minimumHalfMinutes:20,maximumHalfMinutes:30,maximumOrganisedMinutesPerDay:80,maximumTournamentMinutesPerDay:120,returnSubstitutes:true,resultPrivacy:"publishable",ballSize:4},
  U13:{ageGroup:"U13",format:"9v9",minimumPlayersToStart:6,maximumMatchdaySquad:18,minimumHalfMinutes:20,maximumHalfMinutes:30,maximumOrganisedMinutesPerDay:80,maximumTournamentMinutesPerDay:120,returnSubstitutes:true,resultPrivacy:"publishable",ballSize:4},
  U14:{ageGroup:"U14",format:"11v11",minimumPlayersToStart:7,maximumMatchdaySquad:22,minimumHalfMinutes:25,maximumHalfMinutes:35,maximumOrganisedMinutesPerDay:100,maximumTournamentMinutesPerDay:150,returnSubstitutes:true,resultPrivacy:"publishable",ballSize:5},
  U15:{ageGroup:"U15",format:"11v11",minimumPlayersToStart:7,maximumMatchdaySquad:22,minimumHalfMinutes:25,maximumHalfMinutes:35,maximumOrganisedMinutesPerDay:100,maximumTournamentMinutesPerDay:150,returnSubstitutes:true,resultPrivacy:"publishable",ballSize:5},
  U16:{ageGroup:"U16",format:"11v11",minimumPlayersToStart:7,maximumMatchdaySquad:22,minimumHalfMinutes:25,maximumHalfMinutes:40,maximumOrganisedMinutesPerDay:100,maximumTournamentMinutesPerDay:150,returnSubstitutes:true,resultPrivacy:"publishable",ballSize:5},
  U17:{ageGroup:"U17",format:"11v11",minimumPlayersToStart:7,maximumMatchdaySquad:22,minimumHalfMinutes:25,maximumHalfMinutes:45,maximumOrganisedMinutesPerDay:120,maximumTournamentMinutesPerDay:180,returnSubstitutes:true,resultPrivacy:"publishable",ballSize:5},
  U18:{ageGroup:"U18",format:"11v11",minimumPlayersToStart:7,maximumMatchdaySquad:22,minimumHalfMinutes:25,maximumHalfMinutes:45,maximumOrganisedMinutesPerDay:120,maximumTournamentMinutesPerDay:180,returnSubstitutes:true,resultPrivacy:"publishable",ballSize:5},
}

export const ACTIVE_COMPETITION = {
  id: "gcgfl-2026-27",
  name: "Gloucester County Girls Football League",
  season: "2026-27",
  rules: GCGFL_2026_27,
} as const

export function getCompetitionRule(ageGroup: AgeGroup): CompetitionRule {
  return ACTIVE_COMPETITION.rules[ageGroup]
}

export function validateMatchdaySquad(ageGroup: AgeGroup, squadSize: number) {
  const rule = getCompetitionRule(ageGroup)
  if (squadSize < rule.minimumPlayersToStart) {
    return {ok:false,level:"error" as const,message:`At least ${rule.minimumPlayersToStart} players are required to start a ${rule.format} match.`}
  }
  if (rule.maximumMatchdaySquad && squadSize > rule.maximumMatchdaySquad) {
    return {ok:false,level:"error" as const,message:`Matchday squad limit is ${rule.maximumMatchdaySquad} for ${rule.format}.`}
  }
  return {ok:true,level:"ok" as const,message:`Squad is valid for ${ageGroup} ${rule.format}.`}
}

export function canPublishResult(ageGroup: AgeGroup, isTrophyEvent = false) {
  return isTrophyEvent || getCompetitionRule(ageGroup).resultPrivacy === "publishable"
}
