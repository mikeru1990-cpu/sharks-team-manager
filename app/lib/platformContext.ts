import { defaultClub, defaultMembership, defaultOrganisation, defaultTeams } from "./platform"
import type { Club, Membership, Organisation, PlatformContext, Team } from "./platform"

export const ACTIVE_CLUB_STORAGE_KEY = "football-os:active-club-id"
export const ACTIVE_TEAM_STORAGE_KEY = "football-os:active-team-id"

export const availableOrganisations: Organisation[] = [defaultOrganisation]
export const availableClubs: Club[] = [defaultClub]
export const availableTeams: Team[] = defaultTeams
export const availableMemberships: Membership[] = [defaultMembership]

export function resolvePlatformContext(clubId?: string | null, teamId?: string | null): PlatformContext {
  const club = availableClubs.find((item) => item.id === clubId) ?? defaultClub
  const team = availableTeams.find((item) => item.id === teamId && item.clubId === club.id) ?? availableTeams.find((item) => item.clubId === club.id) ?? defaultTeams[0]
  const organisation = availableOrganisations.find((item) => item.id === club.organisationId) ?? defaultOrganisation
  const membership = availableMemberships.find((item) => item.clubId === club.id && item.teamIds.includes(team.id)) ?? defaultMembership

  return {
    organisation,
    club,
    team,
    membership,
  }
}

export function getTeamsForClub(clubId: string) {
  return availableTeams.filter((team) => team.clubId === clubId)
}
