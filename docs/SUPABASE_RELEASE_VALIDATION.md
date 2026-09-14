# Football OS — Supabase release validation

This is the production-readiness check for club/team access and youth-player privacy. It is intentionally separate from the normal web/iOS compile checks because it requires authenticated test accounts and a real Supabase environment.

## Required staging setup

Create one release-test team and one separate team in the same staging project. Create three invited users assigned only to the release-test team:

- Coach — team role `coach` or `manager`
- Assistant coach — team role `assistant_coach`
- Parent — team role `parent` (or `viewer` if testing the most restrictive view)

The separate team must contain at least one player so cross-team isolation is meaningful. The release-test team must contain at least one active player. For the strongest private-data check, add at least one `player_private_details` row to the release-test team.

## GitHub Actions configuration

Create a GitHub Actions environment named `release-validation` and add these secrets:

- `SUPABASE_TEST_URL`
- `SUPABASE_TEST_ANON_KEY`
- `FOOTBALL_OS_TEST_TEAM_ID`
- `FOOTBALL_OS_OTHER_TEAM_ID`
- `FOOTBALL_OS_COACH_EMAIL`
- `FOOTBALL_OS_COACH_PASSWORD`
- `FOOTBALL_OS_ASSISTANT_EMAIL`
- `FOOTBALL_OS_ASSISTANT_PASSWORD`
- `FOOTBALL_OS_PARENT_EMAIL`
- `FOOTBALL_OS_PARENT_PASSWORD`

Do not use production family accounts or real child data for this check. Test accounts and synthetic player records are sufficient.

## What the automated check proves

Run the `Football OS Supabase Access Smoke Test` workflow, or run `npm run test:access` with the same variables set locally.

The test signs in as each role through the public Supabase auth flow. It verifies:

1. the assigned team is visible;
2. a different team is not visible;
3. players from the different team are not visible;
4. `can_manage_team()` returns the correct answer for the role;
5. coaches and assistant coaches can perform an authorised no-op player update;
6. the parent/viewer cannot update the player;
7. protected `player_private_details` are not returned to the parent/viewer.

A failure blocks release sign-off. This check uses the anon key and real authenticated sessions, so it exercises row-level security rather than bypassing it with the service-role key.

## Migration prerequisite

Apply all migrations in order, including:

- `20260727_football_os_foundation.sql`
- `20260727_offline_match_event_sync.sql`
- `20260902_release_security_privacy.sql`
- `20260907_cloud_squad_privacy.sql`

If the cloud-squad migration is missing, the app and the access verifier should not be considered release-ready.

## Release evidence

Before TestFlight sign-off, record the successful workflow run ID in the release notes/checklist alongside:

- database migration version;
- test date;
- tester;
- coach result;
- assistant-coach result;
- parent result;
- account deletion result;
- physical-iPhone build number.

This gives Football OS a repeatable access-control sign-off rather than relying on a one-off manual check.
