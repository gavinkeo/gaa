# Cork Club Championships 2026

Static multi-page championship tracker for:

- PSHC — Premier Senior Hurling Championship
- SAHC — Senior A Hurling Championship
- PSFC — Premier Senior Football Championship
- SAFC — Senior A Football Championship

## Structure

- `index.html` — competition hub
- `pshc.html`, `sahc.html`, `psfc.html`, `safc.html` — competition pages
- `assets/css/site.css` — shared styling
- `assets/js/pshc.js` — PSHC-specific projection engine
- `assets/js/championship.js` — shared SAHC / PSFC / SAFC engine
- `data/*.js` — competition fixture/result data
- `.nojekyll` — serve directly as a static GitHub Pages site

Each competition page integrates its group table with Round 1, Round 2 and Round 3 fixtures/results beneath the same group card. Standings, live 1–6 seeds, repeat-pairing quarter-final adjustments and relegation projections are calculated from the data files.
