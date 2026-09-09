# muneron.com

Static site for MUNERON, S.L. (en formacion). Deployed via GitHub Pages.

## Current public scope

- `/`: the planned EUR 390 single-seat Desk Pack, explicitly early access; no checkout.
- `/test/`: version 2 of the free, self-reported Boundary Check.
- `/aviation/`: the internal connected-workflow example and the limits of its evidence.

The three routes share `assets/site.css`, fonts, the default light theme and the saved theme preference. The questionnaire renders from `assets/check-model.mjs`; its scoring and text export are pure functions. `assets/check.js` handles accessible controls and session-only answer storage. No questionnaire answers are transmitted to a server.

Early-access links open the visitor's own email application. They do not send automatically or subscribe anyone. The stop-control example affects its illustration only, not real systems.

Before publishing changes, check JavaScript syntax, local links, both themes, 320px and 390px layouts, partial and complete answers, unknown/not-applicable states, reload/navigation recovery, clearing and the plain-text export fallback. Do not execute the suggested questions on real confidential data as part of website QA.

Public release claims must remain bounded to verified compatibility and actual acceptance checks. The internal aviation integration is not the single-seat pack specification.
