# Football OS — Native iOS release foundation

Football OS now has a Capacitor 8 native iOS foundation so the web product can be packaged and validated as a real iOS application.

## What is automated now

Every push to `feat/football-os-foundation` and `main` runs two independent release gates:

1. the existing TypeScript + Next.js production build on Linux;
2. a macOS native-iOS job that installs Capacitor, generates the iOS project, resolves Swift Package Manager dependencies and compiles an unsigned iOS Simulator build with Xcode.

The iOS project is generated from source so native scaffolding does not drift silently between machines.

## Release configuration

The native shell reads these variables when the iOS project is generated or synced:

- `CAPACITOR_APP_ID` — the final Apple bundle identifier. CI currently uses `app.footballos.mobile` as a technical placeholder.
- `CAPACITOR_SERVER_URL` — the HTTPS production Football OS URL used by the native shell.

If no server URL is supplied, the app deliberately displays the local development shell instead of pretending to be a production build.

## What this does not claim yet

This does **not** mean the app is ready for App Store submission. A signed archive still needs an Apple Developer Team, final bundle identifier, signing certificates/profiles and App Store Connect configuration. The production URL, authentication, offline behaviour and native-value features also need physical-iPhone testing before submission.

## Next native milestone

The next release milestone is a signed TestFlight pipeline. It will add App Store Connect credentials and signing secrets to GitHub Actions, produce an archive/IPA, upload a release candidate to TestFlight, and then run the physical-device sign-off scenarios from the App Store release gate.
