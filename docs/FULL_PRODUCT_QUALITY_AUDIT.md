# Football OS — Full Product Quality Audit

Reviewed: 2026-09-05
Branch: `feat/football-os-foundation`

## Executive assessment

Football OS is now a substantial product rather than a prototype, but the remaining work is uneven. Matchday and the native-release foundation are ahead of several supporting workspaces. The route to market is therefore not “add more features”; it is to remove friction, consolidate data, finish cloud/privacy behaviour and validate the native app on real devices.

## Product quality findings

### Home
Strong direction. It behaves like a coach command centre and surfaces real recorded information rather than fabricated KPIs.

Remaining work:
- connect more dashboard cards to cloud-backed data;
- add robust empty/loading/offline states;
- avoid team-specific hard-coding in a commercial release.

### Matchday
One of the strongest areas. Shared team formats now support 5v5/7v7/9v9/11v11 and the Tactical Board has a separate free-move interaction.

Remaining work:
- physical-iPhone gesture testing;
- competition rules must be the authoritative source for limits and durations;
- cloud/offline conflict handling needs visible sync state;
- full end-to-end match recovery testing is still required.

### Training
Previously the weakest major mobile workflow. The old version stacked the builder, full attendance register, pitch runner and events into one long page. Activity forms were always open and the screen required too much scrolling during a live session.

This audit build replaces that with four focused modes: Plan, Register, Run and Schedule; compact collapsed activities; a live session timer; progress; attendance notes on demand; and a sticky save state.

### Players
Good foundation and connected training history. The next commercial step is making the player profile the single authoritative data source used by Matchday, Training and reporting.

Remaining work:
- remove any duplicate player sources;
- cloud-backed profile persistence;
- role-based field visibility;
- parent-safe views.

### Club
The product now contains meaningful privacy, account and Respect functionality.

Remaining work:
- cloud-sync Respect acknowledgements;
- public Privacy Policy and Support URLs;
- admin completion view;
- production account-deletion test;
- club/team role and scope audit.

### Navigation and visual system
The dark navy/blue system is coherent and touch targets are generally improving. Six primary workspaces in the mobile bottom bar remain dense on the smallest iPhones and should be tested before release rather than assumed acceptable.

Remaining work:
- physical-device navigation test at supported text sizes;
- VoiceOver labels and focus order;
- Dynamic Type / large-text review;
- final iconography and motion pass.

### Offline and reliability
The app has offline foundations and durable local state in key workflows, but release quality requires visible ownership of sync state and conflict outcomes.

Remaining work:
- one global sync-state pattern;
- retry/error UX;
- online/offline transition tests during a live match;
- stale-data detection.

### Native iOS
Capacitor is now integrated and the native iOS simulator build passes in CI.

Remaining work:
- final Apple bundle identifier;
- Apple Developer Team and signing;
- signed archive/IPA;
- TestFlight upload;
- physical-device QA;
- App Store Connect metadata and review account.

## Priority order to market

1. Finish the mobile-quality pass across Training, Players and Club.
2. Consolidate player/team data into one cloud-backed source of truth.
3. Finish auth, parent scoping, youth-data minimisation and Respect sync.
4. Add visible offline/sync/error states across primary workspaces.
5. Configure signing and produce the first TestFlight build.
6. Run real-coach and parent scenarios on physical iPhones.
7. Complete privacy/support URLs, App Store privacy answers, screenshots and review notes.
8. Freeze and sign off one release candidate.

## Release principle

No new feature should be added merely because it sounds impressive. Every remaining change must improve one of five things: speed, trust, clarity, reliability or release readiness.
