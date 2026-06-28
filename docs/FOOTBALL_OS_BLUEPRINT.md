# Football OS Platform Blueprint

## Product Vision

Football OS is a grassroots football operating system for clubs, coaches, parents, players, volunteers and administrators.

Leonard Stanley FC is the first reference club, but the platform must be built so any club can onboard, create teams, invite users, manage players and run their football operations without code changes.

## Core Rule

Nothing already built should be deleted or replaced by placeholders. Existing working features must be restored, wrapped and modularised into the new Football OS structure.

## Platform Hierarchy

```text
Platform
  Organisation
    Club
      Teams
        Players
        Coaches
        Parents
        Training
        Matches
        Statistics
      Club Admin
      Volunteers
      Finance
      Documents
      Facilities
      Communications
      AI Assistant
```

## Primary Workspaces

### Home
The daily operating dashboard.

Must include:
- Club and team context
- Today and upcoming events
- Quick actions
- Availability summary
- AI coach alerts
- Recent activity
- Outstanding tasks

### Matchday
The touchline workspace.

Must include all existing match work:
- Match centre
- Squad selection
- Lineups
- Quarter planner
- Live timeline
- Substitutions
- Goals and assists
- Player ratings
- Match reports
- Minutes tracking

### Training
The coaching workspace.

Must include all existing training work:
- Events
- Attendance
- Training plans
- Drill library
- Session history
- Session notes
- Equipment checklist

### Players
The player management workspace.

Must include:
- Full player list
- Player profiles
- Positions
- Availability
- Attendance
- Match ratings
- Minutes
- Development notes
- Awards
- Parent contact
- Medical notes where appropriate

### Insights
The intelligence and reports workspace.

Must include:
- Player statistics
- Team statistics
- Attendance trends
- Rotation fairness
- Match reports
- Development graphs
- AI insights

### Club
The administration workspace.

Must include:
- Teams
- Coaches
- Parents
- Registrations
- Fixtures
- Competitions
- Documents
- Volunteers
- Finance
- Facilities
- Club settings

## User Roles

- Platform Owner
- Club Owner
- Chairperson
- Secretary
- Treasurer
- Welfare / Safeguarding Officer
- Head Coach
- Coach
- Assistant Coach
- Parent
- Player
- Volunteer

## Permission Principles

- Platform owners can manage all clubs.
- Club owners and committee roles can manage their club.
- Coaches can manage assigned teams.
- Parents can only view their children and relevant team information.
- Players can only view their own profile and relevant team information.

## Commercial Principles

The product must support:
- Multi-club onboarding
- Club branding
- Club colours and badge
- Multiple teams per club
- Multiple roles per user
- Subscription tiers
- White-label potential
- Safe data separation between clubs

## Build 22 Mission

Stabilise and restore.

Before any more feature building:
- Remove duplicate navigation concepts.
- Restore all existing modules into the six-workspace shell.
- Make every tab and quick action functional.
- Ensure every screen scrolls to top on navigation.
- Ensure npm run build passes.
- Create an audit of every feature and its destination workspace.

## Build 23 Mission

Introduce multi-club foundations.

- Club model
- Team model
- Active club selector
- Active team selector
- Role model
- Membership model
- Data ownership rules

## Build 24 Mission

Parent portal foundation.

- Parent login view
- Child profile view
- Availability replies
- Fixtures
- Messages
- Medical update request flow

## Build 25 Mission

Live match engine 2.0.

- Clock
- Timeline
- Substitutions
- Quarter planner
- Ratings
- Reports
- Minutes calculation

## Build 26 Mission

AI Coach and Club Intelligence.

- Rotation suggestions
- Attendance insights
- Development trends
- Club admin alerts
- Fixture readiness alerts
