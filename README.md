# PF2e Karmic Dice

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Z8Z6ZHDNA)

This module adds Karmic Dice to all check rolls in Pathfinder 2nd Edition.

This is a fork of [7H3LaughingMan/pf2e-karmic-dice](https://github.com/7H3LaughingMan/pf2e-karmic-dice), updated for Foundry VTT v13/v14 and the current PF2e system.

## Installation

In Foundry VTT, open **Add-on Modules → Install Module**, paste this manifest URL and click **Install**:

```
https://github.com/NBSamael/pf2e-karmic-dice/releases/latest/download/module.json
```

## Releasing a new version

1. Update `CHANGELOG.md` (and the `version` in `module.json`).
2. Commit and push to `main`.
3. On GitHub, create a release with a tag `vX.Y.Z` (e.g. `v7.0.1`) and publish it.

The **Release Creation** workflow then attaches `module.json` and `module.zip` to the release. Foundry picks up the update through the manifest URL above.

## Settings

**Roles**

Allows you to set which rolls Karmic Dice is enabled for.

**History**

PF2e Karmic Dice keeps track of the last **X** number of rolls for each individual user. This allows you to set what **X** is. Until a user's history length matches **X** it will not attempt to check to see if a user's roll needs to be nudged.

**Lower Threshold**

When enabled this sets the lower threshold that the average value of a user's historical rolls need to be less than or equal to before it will nudge that user's roll upwards.

**Upper Threshold**

When enabled this sets the upper threshold that the average value of a user's historical rolls need to be greater than or equal to before it will nudge that user's roll downwards.

**Nudge**

This sets the amount that a user's roll will be nudged by. If you enable the **Cumulative** option it will multiply the nudge value by the number of times it has had to nudge a user's dice in a row.

**Hero Points**

When enabled this will nudge any rerolls using a Hero Point upwards by **value** if the natural result of the reroll is less than or equal to the **threshold**.