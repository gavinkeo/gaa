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


## Club colour markers
Club primary colours are stored once in `assets/js/team-colours.js` and rendered beside team names across tables, fixtures, seedings and knockout projections.

### Completed group stages
The shared championship engine now switches its wording automatically when all published group games in a competition are complete: final seed order, rule-determined quarter-final pairings, and final relegation ranking replace live/provisional language.

## 2026 knockout dates

- PSHC / SAHC: quarter-finals 18–20 September, semi-finals 4 October, county finals 18 October.
- PSFC / SAFC: quarter-finals 25–27 September, semi-finals 11 October, county finals 25 October.
