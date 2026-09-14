# Football OS — App Store Release Gate

Last reviewed: 2026-09-14

This is the release gate for Football OS. A release is not signed off until every P0 item is green and the candidate has completed device testing through TestFlight.

## P0 — submission blockers

- [ ] Production build passes with no TypeScript, lint or runtime errors on the frozen release-candidate commit.
- [ ] iOS distribution project exists and produces an installable signed archive.
- [ ] The iOS build provides genuine app value beyond a thin website wrapper.
- [ ] Production Supabase migrations are applied and verified.
- [ ] Authentication is enabled for private club/team data.
- [x] Privileged league-result APIs require authenticated staff access.
- [x] Team write RLS is restricted to management/coaching roles rather than parents/viewers.
- [x] Authenticated coach / assistant / parent access-regression harness exists.
- [ ] Current staging Supabase environment passes the authenticated access-regression workflow.
- [x] In-app account deletion path exists in the product and database migration.
- [ ] Account deletion has been tested end-to-end against production-like data.
- [ ] Public Privacy Policy URL is final and configured.
- [ ] Public Support URL is final and configured.
- [ ] App Store privacy answers match the app's real data collection and third-party SDK use.
- [ ] Youth-player personal data has been minimised and reviewed field-by-field.
- [ ] U7-U11 results and grading tables cannot be exposed publicly outside permitted trophy events.
- [ ] App Review demo account or fully-featured review mode is ready.
- [ ] Backend services remain available throughout App Review.
- [ ] No placeholder, dead, hidden or unfinished controls are visible in the release build.
- [ ] Crash-free smoke test completed on supported iPhone sizes and current iOS.

## P1 — commercial quality

- [ ] Matchday uses competition-driven 5v5 / 7v7 / 9v9 / 11v11 rules rather than hard-coded player counts.
- [ ] Matchday touch interactions are reliable on physical iPhones.
- [x] True tactical free-move behaviour is separated from semantic formation-slot movement.
- [x] Training builder is compact, quick and comfortable in the mobile layout.
- [x] Squad data is one source of truth for players, positions, roles and availability in the app.
- [ ] Offline Matchday sync is conflict-safe and visibly communicates sync state.
- [ ] Respect Code acknowledgements sync to the cloud and admins can see current-version completion.
- [ ] Parent access is team-scoped and never exposes other teams' player data in the validated staging environment.
- [ ] Accessibility review covers text sizing, contrast, touch target size, VoiceOver labels and reduced motion.
- [ ] Empty, loading, offline and error states are designed for every primary workspace.
- [ ] Destructive actions require clear confirmation and recoverability where appropriate.

## P2 — App Store presentation

- [ ] Final app name, subtitle, description and keywords approved.
- [ ] App icon set and launch experience approved.
- [ ] iPhone screenshots show real production features and real release UI.
- [ ] Age rating questionnaire completed accurately.
- [ ] Copyright, support and privacy metadata completed.
- [ ] Review Notes explain Matchday, offline behaviour, youth-data protections and any non-obvious permissions.
- [ ] Version number, build number and release notes are final.

## Release process

1. Freeze the release candidate branch.
2. Run production web build and automated checks.
3. Apply/test database migrations in staging.
4. Run the authenticated Supabase access smoke test for Coach, Assistant Coach and Parent.
5. Create iOS candidate and distribute with TestFlight.
6. Run coach Matchday scenario offline and online on a physical iPhone.
7. Run parent/privacy/account-deletion scenario.
8. Run safeguarding/privacy review for youth data.
9. Complete App Store Connect metadata and privacy disclosures.
10. Sign off P0, P1 and App Store presentation checklist, then submit one final release candidate to App Review.

## Current release position

Football OS now has a native iOS compile gate, role-aware team scoping, protected youth-player private data, and an automated authenticated access-control test harness. It is not yet an App Store release candidate because the Supabase migrations and role journeys still need to pass in a connected staging environment, authentication must be enabled for the release build, and a signed TestFlight archive still needs physical-device QA.

See `docs/SUPABASE_RELEASE_VALIDATION.md` for the exact staging setup and evidence required before the access/privacy items can be signed off.
