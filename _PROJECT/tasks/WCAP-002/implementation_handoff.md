# WCAP-002 implementation handoff

## Delivered

The scripted **AHU-15 Drops Off the BMS** conversation is a normal, user-owned general chat at `/chats/CH-AHU15-<user-id>`, listed in All and General. Each demo account receives its own chat with no service order. The first twelve Marcus/AskPat turns, ticket summary, and three follow-ups remain authored content; new follow-up messages use the standard composer and save in that user's browser-local chat. Bounded demo answers draw only from the scripted incident and six supplied pages. Viewing creates no order or ticket. `/scenarios/ahu-15` now redirects to the signed-in user's chat and preserves citation parameters. All thirteen original inline citation occurrences map to the six supplied JPEG pages. The citation dialog shows the complete page with sheet and PDF-page metadata, Fit page, zoom, two-axis panning, loading/error/retry states, and no added highlighting.

The six page images were copied unchanged into `public/scenarios/ahu-15/`. The README documents the chat, viewer, scripted response boundary, and static-asset access limit. Existing browser demo stores are migrated once to add the chat without replacing personal records. Reset demo restores it without follow-up messages. WCAP-001's existing source viewer and service-order data paths remain intact.

## Acceptance results

| Scenario | Result | Evidence |
| --- | --- | --- |
| AC-01 | Pass, updated flow | Morgan reached the scenario as a general chat from `/chats`. The legacy direct URL redirects to that chat, including direct citation links. The existing sign-in gate applies. |
| AC-02 | Pass | The browser displayed twelve messages and three follow-ups. A source-to-data text comparison found no wording differences after removing Markdown escapes and list markers. Ordered steps and emphasis rendered as semantic HTML. |
| AC-03 | Pass | All six distinct citation controls loaded their mapped image at 390px; all six also loaded at 1440px and 320px. The images reported native widths of 2550px for controls pages and 7200px for the mechanical page. Citation `[6]` loaded the actual M Series file. Repeated markers use the same mapping. |
| AC-04 | Pass | Zoom in/out, two-axis scrolling at enlarged scale, and Fit page were exercised on the mechanical drawing at desktop and narrow widths. At Fit page, all image edges were within the viewer at every checked width. The zoomed image retained the original pixels and had no overlay or highlight. |
| AC-05 | Pass, with device limit | The original viewer checks covered 1440×900, 768×1024, 390×844, and 320×844. The integrated chat was rechecked at 1440×900, 390×844, and 320×844 with no app-level horizontal overflow. A physical touchscreen gesture was not available to test. |
| AC-06 | Pass | Direct `/scenarios/ahu-15?panel=citation&citation=3` loaded page 148. An invalid number showed an unavailable state. Temporarily removing the copied page-148 image showed the error state; restoring it and pressing Retry loaded the correct page. The file was restored unchanged. |
| AC-07 | Superseded by user request | Viewing the opening still creates no ticket or order. The scenario is now intentionally counted as a general chat: Morgan has All 6 / Order-linked 3 / General 3, while orders remain All 6 / Open 4 / Closed 2. Sending a follow-up intentionally adds messages to the browser-local chat. |

The existing `CH-D01` synthetic source viewer was also opened after this change and still displayed DF-S01.

## Checks and limits

- The general-chat update passed `npm run lint`, `npx tsc --noEmit`, `npm test` (12 tests), `npm run build`, and `git diff --check`.
- Browser checks used the local Webpack dev server and viewport emulation. Actual touchscreen pinch/pan on a physical phone was not tested. The viewer provides zoom buttons and native touch panning without requiring pinch.
- The opening is static authored content. “Logged” and the ticket summary are part of its script. Follow-up answers are deterministic local demo responses; no BMS, ticket service, AI inference, or new order is contacted or created.
- The copied JPEGs have direct URLs under `public/`. WCAP-001 demo sign-in is browser-local and does not protect those static URLs. Production use of restricted drawings requires real access controls and a document-serving policy.
