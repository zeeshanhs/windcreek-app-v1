# WCAP-002 implementation handoff

## Delivered

The scripted **AHU-15 Drops Off the BMS** conversation is available from a separate entry in `/chats` and directly at `/scenarios/ahu-15`. It renders all twelve authored messages, the scripted ticket summary, and three follow-ups without writing a chat, order, or ticket. All thirteen inline citation occurrences map to the six supplied JPEG pages. The citation dialog shows the complete page with sheet and PDF-page metadata, Fit page, zoom, two-axis panning, loading/error/retry states, and no added highlighting.

The six page images were copied unchanged into `public/scenarios/ahu-15/`. The README now documents the route, viewer, scripted status, and static-asset access limit. WCAP-001's existing source viewer and order/chat data paths were not changed.

## Acceptance results

| Scenario | Result | Evidence |
| --- | --- | --- |
| AC-01 | Pass | Morgan reached the scenario from `/chats` and by direct URL. A fresh unsigned browser tab was sent to `/login`, then returned to the scenario after fictional sign-in. The separate entry was visible at 320px. |
| AC-02 | Pass | The browser displayed twelve messages and three follow-ups. A source-to-data text comparison found no wording differences after removing Markdown escapes and list markers. Ordered steps and emphasis rendered as semantic HTML. |
| AC-03 | Pass | All six distinct citation controls loaded their mapped image at 390px; all six also loaded at 1440px and 320px. The images reported native widths of 2550px for controls pages and 7200px for the mechanical page. Citation `[6]` loaded the actual M Series file. Repeated markers use the same mapping. |
| AC-04 | Pass | Zoom in/out, two-axis scrolling at enlarged scale, and Fit page were exercised on the mechanical drawing at desktop and narrow widths. At Fit page, all image edges were within the viewer at every checked width. The zoomed image retained the original pixels and had no overlay or highlight. |
| AC-05 | Pass, with device limit | The transcript and viewer were inspected at 1440×900, 768×1024, 390×844, and 320×844. No app-level horizontal overflow was measured. Controls stayed reachable during panning. Keyboard Enter opened a citation; Escape, Close, Back, and Forward behaved correctly; focus and the transcript scroll position returned after dismissal. Native scroll geometry and `touch-action: pan-x pan-y` were checked, but a physical touchscreen gesture was not available to test. |
| AC-06 | Pass | Direct `/scenarios/ahu-15?panel=citation&citation=3` loaded page 148. An invalid number showed an unavailable state. Temporarily removing the copied page-148 image showed the error state; restoring it and pressing Retry loaded the correct page. The file was restored unchanged. |
| AC-07 | Pass | Before and after scenario viewing and Reset demo, Morgan's personal filters read All 5 / Order-linked 3 / General 2, and orders read All 6 / Open 4 / Closed 2. The scenario remained available after reset. |

The existing `CH-D01` synthetic source viewer was also opened after this change and still displayed DF-S01.

## Checks and limits

- `npm run lint`, `npx tsc --noEmit`, `npm test` (10 tests), `npm run build`, and `git diff --check` passed after implementation. The build includes `/scenarios/ahu-15`.
- Browser checks used the local Webpack dev server and viewport emulation. Actual touchscreen pinch/pan on a physical phone was not tested. The viewer provides zoom buttons and native touch panning without requiring pinch.
- The scenario is static authored content. “Logged” and the ticket summary are part of its script; no BMS, ticket service, AI inference, or new order was contacted or created.
- The copied JPEGs have direct URLs under `public/`. WCAP-001 demo sign-in is browser-local and does not protect those static URLs. Production use of restricted drawings requires real access controls and a document-serving policy.
