# Cork Club Championships 2026

Static GitHub Pages site covering:

- PSHC — Premier Senior Hurling Championship
- SAHC — Senior A Hurling Championship
- PSFC — Premier Senior Football Championship
- SAFC — Senior A Football Championship

## Score calculator

Unplayed fixtures have Goals / Points score inputs. Enter both teams' scores and press **Update standings** to recalculate:

- group tables
- For / Against / scoring difference
- live qualifier seeds
- quarter-final repeat-pairing flips
- relegation projection
- knockout projection

Entered scores are stored in the visitor's browser with `localStorage`. They are a local calculator/simulator and do not alter the GitHub repository or publish results for other visitors.

Use **Reset entered scores** to return to the hard-coded published results.

## Updating official results

When a score becomes official for everyone, edit the appropriate file under `data/`, add `hs` and `as`, and change `status` from `upcoming` to `result`.
