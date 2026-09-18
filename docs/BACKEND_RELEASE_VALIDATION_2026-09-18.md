# Football OS — Backend Release Validation

Validated: 2026-09-18  
Supabase project: `sharks-team-manager`

## Result

The connected Supabase project has been restored, migrated to the Football OS multi-club schema and validated against the release privacy model.

### Applied migrations

- `legacy_schema_bridge`
- `football_os_foundation`
- `offline_match_event_sync`
- `release_security_privacy`
- `cloud_squad_privacy`
- `release_database_lockdown`

The original prototype data was preserved rather than overwritten. The previous player and fixture tables are retained as locked legacy tables. The active Football OS `players` and `fixtures` tables are the new team-scoped schema.

## Live structure created

The connected project now contains:

- the Football OS club, team and membership model;
- a Leonard Stanley FC club record;
- a U11 Girls 2026/27 7v7 team record;
- an owner/manager path for the existing primary account;
- protected `player_private_details`;
- account-deletion RPC support;
- policy acknowledgement storage;
- team-scoped players, fixtures, matches and match events.

The existing prototype player/fixture records were not copied into the new cloud squad automatically. This avoids silently treating historic squad data as the current U11 roster. The current squad should be seeded from the canonical app squad only when the authenticated release flow is intentionally enabled.

## Privacy / RLS evidence

Role-boundary tests were executed inside rollback-only transactions using the real RLS policies and authenticated Postgres role.

### Coach

- Assigned team visible: PASS
- Unassigned team hidden: PASS
- Assigned player visible: PASS
- Other-team player hidden: PASS
- Protected player details readable: PASS
- Player write permitted: PASS
- `can_manage_team`: true

### Assistant coach

- Assigned team visible: PASS
- Unassigned team hidden: PASS
- Assigned player visible: PASS
- Other-team player hidden: PASS
- Protected player details readable: PASS
- Player write permitted: PASS
- `can_manage_team`: true

### Parent / viewer

- Assigned team visible: PASS
- Unassigned team hidden: PASS
- Assigned player visible: PASS
- Other-team player hidden: PASS
- Protected player details hidden: PASS
- Player write blocked: PASS
- `can_manage_team`: false

All synthetic release-test rows and temporary role assignments were rolled back after each scenario.

## Database lockdown

The pre-Football-OS prototype tables no longer expose direct client policies to `anon` or `authenticated`. Their data is preserved for audit/history, but the release app must use the new team-scoped schema.

Legacy league views were changed to security-invoker behaviour and direct client access was removed.

Security-definer trigger helpers that do not need client access were revoked from `anon` and `authenticated`. The authenticated policy helpers and account-deletion function remain callable because the release app and RLS policies intentionally depend on them.

## Supabase security-advisor status

After the lockdown migration:

- no ERROR-level security-advisor findings remain;
- the remaining RLS-without-policy notices are intentional locked legacy tables;
- authenticated security-definer notices remain for the small set of functions deliberately used by RLS/the app;
- leaked-password protection is still disabled in Supabase Auth and remains a release-hardening action.

## Still required before TestFlight sign-off

- enable `NEXT_PUBLIC_AUTH_REQUIRED=true` in the release deployment;
- configure the final Supabase public URL/key in the release environment;
- run a credential-backed Coach / Assistant Coach / Parent smoke test through the actual app;
- enable leaked-password protection in Supabase Auth;
- test account deletion end-to-end using disposable production-like data;
- seed/confirm the canonical current squad only after the authenticated cloud path is enabled;
- complete physical-iPhone and TestFlight testing.

This validation proves the database/RLS model currently enforces the intended team and youth-data boundaries. It does not by itself make the overall app an App Store release candidate.
