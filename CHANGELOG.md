# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [7.0.0] - 2026-11-16

First release of the [NBSamael fork](https://github.com/NBSamael/pf2e-karmic-dice).

### Changed

- Compatible with Foundry VTT v13 and v14 (verified on 14.370) and PF2e 8.7.0. Foundry v12 is no longer supported.
- The manifest and download links now point to the fork's GitHub releases.
- The chat indicator uses the `renderChatMessageHTML` hook and `data-tooltip-html`.
- Settings headers work with the ApplicationV2 settings window.
- The libWrapper fallback warning uses `DialogV2`.
- The release workflow no longer relies on deprecated third-party actions and no longer publishes to the Foundry package listing.

### Fixed

- Attack rolls (`StrikeAttackRoll`, a subclass of `CheckRoll`) are now affected by karmic dice.
- Hero Point rerolls are detected with the resource object PF2e now passes to `pf2e.preReroll`. Mythic Point rerolls are no longer treated as Hero Point rerolls.
- A later reroll of a Hero Point reroll is no longer treated as a Hero Point reroll.

## [6.0.1] - 2024-09-10

### Fixed

- Make sure `_root` is not undefined, resolves [#2].

## [6.0.0] - 2024-09-09

Initial Release

[#2]: https://github.com/7H3LaughingMan/pf2e-karmic-dice/issues/2

[Unreleased]: https://github.com/NBSamael/pf2e-karmic-dice/compare/v7.0.0...HEAD
[7.0.0]: https://github.com/NBSamael/pf2e-karmic-dice/releases/tag/v7.0.0
[6.0.1]: https://github.com/7H3LaughingMan/pf2e-karmic-dice/compare/v6.0.0...v6.0.1
[6.0.0]: https://github.com/7H3LaughingMan/pf2e-karmic-dice/releases/tag/v6.0.0
