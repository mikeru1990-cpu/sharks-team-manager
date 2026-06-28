export type ClubRole =
  | "platform_owner"
  | "club_owner"
  | "chairperson"
  | "secretary"
  | "treasurer"
  | "welfare_officer"
  | "head_coach"
  | "coach"
  | "assistant_coach"
  | "parent"
  | "player"
  | "volunteer"

export type Organisation = {
  id: string
  name: string
}

export type Club = {
  id: string
  organisationId: string
  name: string
  shortName: string
  badgeUrl?: string
  primaryColour: string
  secondaryColour: string
  location?: string
}

export type Team = {
  id: string
  clubId: string
  name: string
  ageGroup: string
  gender: "girls" | "boys" | "mixed" | "women" | "men"
  season: string
}

export type Membership = {
  id: string
  userId: string
  clubId: string
  teamIds: string[]
  role: ClubRole
}

export type PlatformContext = {
  organisation: Organisation
  club: Club
  team: Team
  membership: Membership
}

export const defaultOrganisation: Organisation = {
  id: "org-leonard-stanley",
  name: "Leonard Stanley Football Club",
}

export const defaultClub: Club = {
  id: "club-leonard-stanley-fc",
  organisationId: defaultOrganisation.id,
  name: "Leonard Stanley FC",
  shortName: "Leonard Stanley",
  primaryColour: "#06245c",
  secondaryColour: "#00a6fb",
  location: "Leonard Stanley",
}

export const defaultTeams: Team[] = [
  {
    id: "team-u11-girls",
    clubId: defaultClub.id,
    name: "U11 Girls",
    ageGroup: "U11",
    gender: "girls",
    season: "2026/27",
  },
  {
    id: "team-u10-girls",
    clubId: defaultClub.id,
    name: "U10 Girls",
    ageGroup: "U10",
    gender: "girls",
    season: "2026/27",
  },
]

export const defaultMembership: Membership = {
  id: "membership-reference-coach",
  userId: "reference-user",
  clubId: defaultClub.id,
  teamIds: ["team-u11-girls"],
  role: "head_coach",
}

export const defaultPlatformContext: PlatformContext = {
  organisation: defaultOrganisation,
  club: defaultClub,
  team: defaultTeams[0],
  membership: defaultMembership,
}

export function getTeamDisplayName(team: Team) {
  return `${team.name} · ${team.season}`
}

export function getClubTeamLabel(context: PlatformContext) {
  return `${context.club.name} / ${context.team.name}`
}
