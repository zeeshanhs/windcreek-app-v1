# WCAP-001 implementation handoff

## Delivered

The ten screen records are connected through `/login`, `/orders`, `/orders/new`, `/orders/[orderId]`, `/chats`, `/chats/new`, `/chats/[chatId]`, and the order, closure, photo, and source query panels. The app uses the supplied Wind Creek logo and mark, six seeded orders, separate user-owned chats, a browser-local IndexedDB store, deterministic synthetic responses, and explicit demo/source labels. The README contains run instructions, accounts, routes, reset behavior, and limits.

This is a fictional local prototype. Sign-in, order writes, assistant answers, source records, fault logging, and photos are simulated in the browser. No HotSOS, real identity provider, AI/retrieval service, maintenance API, image interpretation, document ingestion, external handoff, or cross-device storage was connected.

## Acceptance scenarios

The following results are from browser interaction against the local app, focused state tests, and inspection of the code paths. “Partial” identifies the one check not fully exercised.

| Scenario | Result | Evidence |
| --- | --- | --- |
| AT-01 | Pass | Empty and rejected credentials showed inline errors and no protected record; Morgan's fictional credentials opened his chats. Expired route returned to sign-in and cleared drafts. |
| AT-02 | Pass | Avery's creation form displayed Requested by Avery Cole from the session, without a free-text requester field. |
| AT-03 | Pass | Whitespace-only remark kept Create disabled and showed explicit description guidance. |
| AT-04 | Pass | HVAC & Temperature plus “Too Hot” yielded ISS-D05; selection stayed explicit. |
| AT-05 | Pass | “703” yielded Guestroom 703 / LOC-D07, readable at 390px and 320px. |
| AT-06 | Pass | Avery created SO #1043; Morgan later saw the same Open record with All 7 / Open 5 / Closed 2. |
| AT-07 | Pass | Unconfirmed create retained fields; Check order list found no receipt, then double-click retry produced one SO #1043. The model test also checks operation-ID idempotence. |
| AT-08 | Pass | Opened all six seeded order URLs and checked each selected ID and issue. |
| AT-09 | Pass | Queue, detail, chat, closure, and source views use Open/Closed for orders; no work-session action appears. |
| AT-10 | Pass | Search 1042 plus Closed gave zero results; clearing search showed only #1038 and #1037. |
| AT-11 | Pass | Avery's first equipment question created one General chat; order count remained six. |
| AT-12 | Pass | Morgan created another AHU-D01 general chat; his two existing general chats remained separate. |
| AT-13 | Pass | SO #1042's Continue your chat returned Morgan to CH-D01. |
| AT-14 | Pass | Avery's Chat about this order created her own empty linked chat while #1042 stayed Open. |
| AT-15 | Pass | Reopening Avery's order chat returned the same chat ID and list count; the unique relationship transaction and model test cover retry/race behavior. |
| AT-16 | Pass | Sam saw CH-S01 and not CH-D01; Morgan saw CH-D01 and not CH-S01. Direct cross-user access was denied. |
| AT-17 | Pass | General and linked counts followed stored `orderId`; typing SO #1042 in a general message did not add a badge or association. |
| AT-18 | Pass | CH-D01 top-right information opened SO #1042's canonical issue, location, requester, remarks, and status. General chats had no order control. |
| AT-19 | Pass | A draft and nonzero reading position survived information/source dialogs; Escape, Close, Back/Forward, and focus return were checked. |
| AT-20 | Pass | Avery could open Close order on Jordan-requested Open SO #1039. |
| AT-21 | Pass | A confirmed close wrote Avery's actor/time/note and Closed state to detail and chat context. |
| AT-22 | Pass | Rejected and unconfirmed closure kept Open and preserved the note; the uncertain case offered Refresh order. |
| AT-23 | Pass | Avery closed in a second tab while Sam's dialog stayed open; Sam's submission showed already closed and retained Avery's original note. |
| AT-24 | Pass | A linked chat remained readable/writable after #1042 closed; no reopen or second linked chat was created. |
| AT-25 | Pass | Handoff summary opened an editable order remark. Cancel posted nothing; explicit Save posted one authored remark. |
| AT-26 | Pass | A real synthetic PNG rendered from a blob URL; Cancel retained chat text; Add to message staged it until Send. |
| AT-27 | Pass | PDF, SVG, >10 MB PNG, and two selected PNGs each produced a specific restriction message. |
| AT-28 | Pass | DF-S01 showed its labeled synthetic table and cited entry; the original referenced PDF showed an unavailable view without page or download. |
| AT-29 | Pass | The initial answer's register claim matched DF-S01 EQ-D01; the order report matched SO #1042's initial remark, reachable from linked order context. No mechanical cause was asserted. |
| AT-30 | Pass | TEST-X9 had no invented meaning. A simulated fault-log failure was distinct from answer uncertainty; retry acknowledged the local record for that chat. |
| AT-31 | Pass | A still-image heat-wheel question refused to infer movement and requested direct observation. |
| AT-32 | Pass | Browser flow advanced through DF-S03 Steps 1–3 for a matching tag; focused tests checked mismatching and unreadable results. |
| AT-33 | Pass | Sent from Sam's linked chat, navigated to New chat while waiting, then found the answer only in the originating chat. |
| AT-34 | Pass | Morgan's direct CH-S01/source URL and Sam's direct CH-D01 URL showed generic unavailability; expiry showed sign-in without protected content. |
| AT-35 | Pass | Queue, creation, chat, information, closure, and source routes were measured at 1440×900, 1024×768, 768×1024, 390×844, and 320px. None had horizontal page overflow. Phone list, picker, composer, and sheets were exercised. |
| AT-36 | Partial | Keyboard picker selection, Escape, dialog focus return, and visible focus CSS were checked. Reduced-motion rules and the jump-to-latest branch were inspected, but an OS/browser reduced-motion emulation was not available in this browser test session. |
| AT-37 | Pass | No inactive admin, reporting, feedback, voice, assignment, or document-ingestion control was presented. |
| AT-38 | Pass | The duplicate-report closure read Closed with its explanation and did not claim the physical issue was repaired. |

## Checks and remaining limits

- `npm run lint`, `npx tsc --noEmit`, `npm test` (8 focused tests), and `npm run build` passed. The build script uses the documented Next.js 16 `--webpack` option. The unmodified Turbopack default failed in this workspace when its CSS worker attempted to bind a local port, including during an elevated retry.
- A built app was started locally and the sign-in path was exercised. Automated accessibility auditing and a browser run with reduced motion enabled were not completed.
- IndexedDB persists committed fictional records across routes, reloads, and same-browser tabs; it is separate in other browsers/devices and can be cleared by the browser. Session storage holds only the selected fictional user ID. This is a UI access demonstration, not a production security boundary.

## Production dependencies from specification §10.2

- DEP-01/02: The original login HTML and a current approved FRD were unavailable; this prototype follows the refined request and screen specification.
- DEP-03/04: Confirm property/role/record permissions and the real create, remark, close, acknowledgement, conflict, and idempotency API contracts.
- DEP-05/06: Supply verified production issue/location IDs and licensed font assets/instructions. The separately supplied logo and mark resolved the specification's earlier identity-file gap for this task.
- DEP-07/08: Supply authorized manuals/drawings/PDFs and source permissions, approved equipment mappings and procedures, maintenance data, validated retrieval/AI, and visual detection before offering live technical guidance.
- DEP-09/10: Define unknown-fault retention/review/feedback governance and document ingestion taxonomy, metadata, deduplication, and source-version rules.
- DEP-11/12: Define “issue resolved” independently of Closed, plus cross-device persistence, concurrency, synchronization, and notification behavior.
