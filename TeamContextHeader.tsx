Create app/components/layout/TeamContextHeader.tsx.

It should show:
- club name
- active team name using getTeamDisplayName from app/lib/teamAccess.ts
- user role
- current page/section
- whether this is Club-wide view or Team workspace
- next event label

Props:
clubName?: string
activeTeam?: TeamIdentity | null
role?: ClubRole
currentSection?: string
allTeamsMode?: boolean
nextEventLabel?: string

Style it to match the existing Sharks glass/elite card design.
