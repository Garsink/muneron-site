# muneron.com

Static site for MUNERON. Deployed via GitHub Pages.

## Current public scope

- `/`: Customer Enquiry Desk, the planned EUR 390 first single-seat Desk Pack. Concrete fictional example, source notes, no checkout.
- `/start/`: three-question enquiry preparation. Opens the visitor's email app only when requested; explicit manual-send and copy fallback. No enquiry backend, analytics or mailing-list signup.
- `/downloads/customer-enquiry-example.txt`: free fictional exercise and human answer checklist, not an installer or a security test.
- `/test/`: version 2 of the free, self-reported Boundary Check.
- `/aviation/`: the internal connected-workflow example and the limits of its evidence.

The routes share `assets/site.css`, fonts, the default light theme and the saved theme preference. Home and enquiry also use `assets/sales.css`. The questionnaire renders from `assets/check-model.mjs`; its scoring and text export are pure functions. `assets/check.js` handles accessible controls and session-only answer storage. No questionnaire answers are transmitted to a server. `assets/enquiry-model.mjs` validates allowed selections and composes bounded email text; `assets/enquiry.js` presents it without claiming receipt or compatibility.

Early-access links open the visitor's own email application. They do not send automatically or subscribe anyone. The stop-control example affects its illustration only, not real systems.

Before publishing changes, check JavaScript syntax, local links, both themes, 320px and 390px layouts, partial and complete answers, unknown/not-applicable states, reload/navigation recovery, clearing and the plain-text export fallback. Do not execute the suggested questions on real confidential data as part of website QA.

Public release claims must remain bounded to verified compatibility and actual acceptance checks. The internal aviation integration is not the single-seat pack specification.

The first commercial focus is owner-led distribution and equipment supply, with approved-file customer reply preparation. This is a research-informed validation hypothesis, not demonstrated market demand. Claude Code is the first validation target, not a claim that a public installation has passed on any platform. The free sample is written to be tried in an organisation-approved assistant and includes no real company data.

Keep private research, lead records, acceptance results and commercial launch notes outside this public repository. Do not enable payments until seller details, taxes/terms, fulfilment, compatibility and refund handling have been verified.
