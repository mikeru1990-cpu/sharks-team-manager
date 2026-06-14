# Multi-team permissions plan

This is the next foundation for turning the app into a club-wide system.

## Access levels

- Club Admin: can view and edit every team.
- Team Admin: can view and edit only assigned teams.
- Coach: can help manage assigned team areas.
- Parent: can view their assigned team only.
- Player: can view assigned team only.

## Shared club view

The table/results section should stay club-wide and visible to approved users so everyone can see how all teams are getting on.

## Team identity

Each team should have its own editable identity:

- Team name
- Age group
- Badge/logo image
- Wallpaper image
- Team photo
- Primary colour
- Secondary colour

## Proposed tables

club_teams:
- id
- name
- age_group
- team_code
- badge_url
- wallpaper_url
- team_photo_url
- primary_colour
- secondary_colour
- active

team_memberships:
- id
- user_id
- team_id
- role
- active

## Build steps

1. Add database schema.
2. Add team identity editor.
3. Add team switcher for club admins.
4. Restrict editable data to assigned teams.
5. Keep league/table/results visible club-wide.
