# muneron.com

Static site for MUNERON, the company behind HAI. Deployed via GitHub Pages from `main` (CNAME `muneron.com`).

## Pages

- `/` - HAI by MUNERON: the product, owner outcomes, a comparison with using AI for a task, an illustrative walkthrough, the six parts, origin, the offer (starter vs connected deployment), FAQ.
- `/start-here/` - for companies at the chat stage: what HAI offers today, the six parts, what to have in place before day one, the order to build in.
- `/aviation/` - the reference implementation inside the founding group: wiring, functions, outbound channels, controls, dated registry figures, the live demo and the audit record.
- `/start/` - contact. Opens the visitor's own email application with three prompts. No form backend, no analytics, nothing is sent from the page.

## Claim boundaries

No customers, ROI figures, adoption counts, certifications or turnkey integrations are claimed. Scale numbers are dated and describe the internal reference implementation, not what every new customer gets. The starter is described as read-only (it does not send, write to company systems or move money); a connected deployment is scoped per company. No prices.

## Assets

`assets/site.css` (tokens, light and dark themes), `assets/sales.css` (page components), `assets/fonts.css` + `assets/fonts/` (Poppins woff2, swap), `assets/hero-field.js` (home hero renderer, respects reduced motion), `assets/verify-demo.js` (the demo on `/aviation/`), `assets/hai-map.svg` (wiring diagram, also inlined on `/aviation/`), `assets/card.png` (OpenGraph card).

## Before publishing

Check JavaScript syntax (`node --check`), internal links and anchors, both themes, 320 / 390 / 1440 layouts, reduced motion, and the impeccable detector. Rollback: `git tag -l 'live-baseline-*'`; the exact live baseline is also zipped under `outputs/muneron/refresh-<date>/` outside this repository.
