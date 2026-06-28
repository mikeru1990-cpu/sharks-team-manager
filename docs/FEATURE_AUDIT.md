# Football OS Feature Audit

This document tracks every module so existing work is not lost while the app becomes a club and multi-club platform.

## Status Key

- ✅ Restored / working
- 🚧 Present but needs integration
- 🧩 Planned module
- ⚠️ Needs audit
- ❌ Not built yet

## Core Navigation

| Feature | Workspace | Status | Notes |
|---|---|---:|---|
| Football OS shell | All | 🚧 | New shell exists but needs final stability checks |
| Bottom navigation | All | 🚧 | Fixed nav added; needs mobile testing |
| Scroll to top on tab change | All | 🚧 | Added in page state handler; needs testing |
| Legacy router cleanup | Platform | ⚠️ | Root appRouter still exists for compatibility; should be retired safely |
| One source of navigation truth | Platform | ⚠️ | WorkspaceTab should become primary |

## Existing Team App Features

| Feature | Workspace | Status | Notes |
|---|---|---:|---|
| Player list | Players | ✅ | Current PlayersScreen shows squad data from store |
| Player fatigue/workload cards | Players | ✅ | Present in PlayersScreen |
| Matchday screen | Matchday | ✅ | TacticalCockpitLayout is still used |
| Match centre | Matchday | ⚠️ | Needs full audit of child components |
| Quarter planner | Matchday | ⚠️ | Needs confirming it is visible in Matchday |
| Lineups | Matchday | ⚠️ | Needs confirming it is visible in Matchday |
| Live timeline | Matchday | ⚠️ | Needs confirming it is visible in Matchday |
| Player ratings | Matchday / Insights | ⚠️ | Needs confirming route and visibility |
| Match reports | Insights / Matchday | ⚠️ | Needs confirming route and visibility |
| Events screen | Training | ✅ | Restored inside Training workspace |
| Training plans | Training | ⚠️ | Needs route audit |
| Session history | Training | ⚠️ | Needs route audit |
| Coaches | Club | ⚠️ | Needs route audit |
| Statistics | Insights | ⚠️ | Needs route audit |
| AI Coach cards | Home / Insights | 🚧 | Present as static cards, needs real data |

## Club Platform Features

| Feature | Workspace | Status | Notes |
|---|---|---:|---|
| Club model | Platform | 🧩 | Build 23 |
| Team model | Platform | 🧩 | Build 23 |
| Active club selector | Home / Club | 🧩 | Build 23 |
| Active team selector | Home / Club | 🧩 | Build 23 |
| Club branding | Club | 🧩 | Build 23 or 24 |
| User roles | Platform | 🧩 | Build 23 |
| Permissions | Platform | 🧩 | Build 23 |
| Parent portal | Parent | ❌ | Build 24 |
| Finance | Club | ❌ | Later |
| Documents | Club | ❌ | Later |
| Volunteers | Club | ❌ | Later |
| Facilities | Club | ❌ | Later |
| Communications | Club / Parent | ❌ | Later |

## Immediate Build 22 Checklist

- [ ] Confirm current production build passes.
- [ ] Retire duplicate root `appRouter.tsx` safely or exclude it from compilation if unused.
- [ ] Audit `TacticalCockpitLayout` and child match modules.
- [ ] Audit player, match, training, coach and stats components.
- [ ] Ensure all original modules are reachable from one of the six workspaces.
- [ ] Ensure Home quick actions navigate to real modules.
- [ ] Ensure no placeholder screen replaces a working module.
- [ ] Ensure mobile layout remains usable.

## Build 22 Definition of Done

Build 22 is complete only when:

1. The app builds successfully on Vercel.
2. Every existing feature is visible somewhere in the new workspace structure.
3. The six workspaces are the only user-facing navigation model.
4. No original team data appears missing.
5. The repo has a clear roadmap toward multi-club support.
