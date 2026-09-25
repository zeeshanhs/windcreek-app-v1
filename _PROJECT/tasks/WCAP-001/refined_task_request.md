# WCAP-001 — Implement the AskPat operational prototype

## Outcome

Replace the generated Next.js starter page with a working, responsive **Wind Creek Hospitality AskPat** prototype for service orders and personal AI conversations. Implement the ten screen records and their documented states in [`inputs/SCREEN_SPECIFICATIONS.md`](inputs/SCREEN_SPECIFICATIONS.md) as one connected application. A screen that only looks complete, while its navigation or core actions are inert, does not satisfy this task.

This is a **fictional, local prototype**, not a production integration. Use the specification's deterministic demo users, orders, chats, clock, issue/location catalog, and source records. Label simulated behavior and synthetic evidence clearly. Do not imply that real authentication, HotSOS, AI inference, maintenance retrieval, image recognition, or document ingestion has been connected.

## Inputs and decision order

1. This refined request defines the implementation deliverable and resolves repository-specific changes since the screen specification was written.
2. [`inputs/SCREEN_SPECIFICATIONS.md`](inputs/SCREEN_SPECIFICATIONS.md), version `WC-ASKPAT-SCREENS v1.0`, defines screen content, routes, fixtures, interaction contracts, responsive behavior, and acceptance scenarios. Read §§2–9 before implementation. Use exact specimen content where the specification calls for it.
3. The repository's `brand-kit/kit.yaml` and linked guidance define the *working* visual direction; they are not product requirements or an approved brand manual. The four `brand-kit/evidence/captures/WC_REF_*.png` files are design references, not UI assets.
4. The original [`task_request.md`](task_request.md) supplies the two identity files and asks for implementation of the screens. Follow repository `AGENTS.md` and `docs/CONTRIBUTING.md` for the development workflow.

The specification records an earlier source packet and contains citations to that packet. Those sources are not all present in this repository. Implement from the specification and files actually available here; do not invent missing HTML, an FRD, a PDF, or external service behavior.

### Resolved asset and stage differences

- The specification's AS-01/AS-11 and DEP-06 say no original logo or favicon was supplied. The repository now includes `_PROJECT/assets/wind-creek-logo.svg` and `_PROJECT/assets/windcreek-mark.png`, and the original task explicitly names the mark for favicon use. Use these supplied files for the application identity and favicon, preserving the logo's proportions. Treat the specification's plain-text identity as fallback if an asset cannot render. Do not extract or redraw identity from screenshots. This override concerns identity assets only; its original font, photography, and PDF gaps remain.
- The specification recommends rendering `SCR-006.linked-populated` first as a visual checkpoint and describes image-generation handoff. Here the deliverable is a functioning Next.js implementation of **all ten** screen records. Build and inspect that first chat state early, then complete the remaining screens and flows. Standalone screen images are not required deliverables.
- If any other source statements conflict, preserve the specification's explicit product decisions (§2), especially its order/chat separation and current Open/Closed model. Record any new assumption in the implementation handoff instead of silently changing product behavior.

## Deliverable and route coverage

Implement in the repository's existing Next.js App Router, React, TypeScript, and Tailwind setup. The following logical destinations must be reachable by navigation and direct URL. A modal may be implemented with route state or query parameters, provided Back/Forward and deep links behave as described in §5.1.

| Record | Destination and required purpose |
| --- | --- |
| SCR-001 | `/login` — email/password demonstration sign-in, validation, sign-out and expired/unavailable states. |
| SCR-002 | `/orders` — accessible service-order list with correct record links, search, Open/Closed filters, counts and empty/error states. |
| SCR-003 | `/orders/new` — guided creation with required Issue, Location and New Remark; searchable/filterable selectors and safe submission. |
| SCR-004 | `/orders/:orderId` — selected order's details, remarks, history, linked-chat entry and closure entry. |
| SCR-005 | `/chats` and `/chats/new` — one personal list combining general and order-linked chats, filters/search, and a new general-chat draft. |
| SCR-006 | `/chats/:chatId` — general or linked conversation, contextual header, messages, composer, evidence links and documented response states. |
| SCR-007 | `panel=order` on a linked chat — order-information dialog/sheet from the top-right chat button. |
| SCR-008 | `panel=close-order` on an order or linked chat — explicit closure form with required resolution note. |
| SCR-009 | `panel=photo` on a chat — photo selection, validation, preview, staging and cancel behavior. |
| SCR-010 | `panel=source&sourceId=…` on a chat — readable synthetic source viewer and honest unavailable-source state. |

Use the exact six initial orders and five Morgan chats from §6, including CH-D01 and SO #1042. Avery's successful creation adds SO #1043 once and becomes visible to Morgan after a demo account switch without reset. Morgan and Sam each retain their separate existing SO #1042 chat; Avery can create her own. A demo reset may restore the initial fixture. Keep the chosen prototype store consistent across routes and account switches; identify its reload/tab limits in the handoff.

## Required behavior

### Service orders

- An order is a shared record with only `open` and `closed` business states. The queue, detail, popup, counts, and linked-chat context read the same canonical record. Creation and closure update all affected views after acknowledgement.
- Creating an order requires selected issue and location IDs, a nonblank remark, and the signed-in requester. Prevent duplicate creation on double submission or retry. A failure or uncertain result preserves the draft and does not display a false new order.
- Authorized signed-in users with access to an Open order can initiate closure, regardless of role, requester, or assignment. Require an explicit, initially blank resolution note. Keep the order Open until success is confirmed; preserve the note on failure; handle an already-closed record without a second mutation. Closing an order does not end its chats or prove a repair occurred.
- Adding an order remark is an explicit separate write. Sending a chat message, opening a chat, viewing an order, or copying a summary never silently changes the shared order.

### Conversations

- Keep one personal **Your chats** list containing both general and order-linked chats. Display an `SO #…` badge only for a stored order association, not for text that happens to mention an order or equipment.
- A general chat has `orderId = null`. Multiple general conversations about the same equipment remain distinct. A new general draft becomes a saved chat on its first successful send, not merely on opening New chat.
- Enforce at most one linked chat per `(user, order)`. Opening from an order resumes the existing chat or creates exactly one for that user; retries and concurrent activations resolve to the same ID. The linked entry appears in the user's main list even before its first message. Another user's chat is never shown in ordinary navigation.
- The top-right **Order information** button exists for linked chats and opens the selected chat's order, not a hardcoded record. General chats have no order popup or closure action. After closure, linked chats remain readable and writable without reopening the order.
- Keep message/answer state attached to its owning chat when the user switches conversations. Retain a failed message and staged photo for retry without duplicate bubbles. A chat instruction such as “close this order” may open the closure review but does not itself commit it.

### Evidence, photos, and simulation

- Use the exact labeled demo source text DF-S01/02/03 from §6.5 where applicable. A technical assertion must point to a source that supports it. The referenced `assets/ahu1-points.pdf` is absent; its viewer state says unavailable and offers no invented page or download.
- A selected photo is a local chat attachment only. Validate the specified PNG/JPEG, 10 MB, one-photo-per-message prototype limits; preview the actual selected bytes; stage before Send; do not treat it as a knowledge-base upload or a confirmed visual diagnosis.
- The assistant's demonstrated responses must stay within the specification's supported evidence and visual categories. Unknown fault code `TEST-X9` has no invented meaning. Do not claim real diagnosis, repair, source retrieval, equipment readings, or successful external handoff.
- Keep authorization boundaries in the demo UI: unauthenticated/expired access reveals no protected content, and one ordinary user cannot open another user's private chat or source through direct navigation.

## Interaction and visual requirements

- Use the working kit's light neutral surfaces, restrained Wind Creek red, short condensed display headings, readable body type, subtle rectangular grouping, clear labels, and visible focus. Use the supplied logo/mark as noted above. Do not embed the WC_REF sheets as components or import unrelated marketing imagery.
- Preserve the specification's desktop queue as a ruled table and conversation as the dominant reading area. Show the mixed five-chat list, SO #1042 association, four exact CH-D01 messages, top-right information control, and bottom composer in the first `SCR-006.linked-populated` checkpoint at 1440×900.
- Implement the responsive transformations in §8.2 at 1440×900, 1024×768, 768×1024, 390×844, and a 320px stress width. Required content and actions stay reachable without horizontal page scrolling; narrow-screen dialogs become usable sheets and the chat list has an explicit disclosure.
- Use semantic controls, persistent labels, keyboard-operable selectors and dialogs, visible focus, Escape/Back behavior, focus return, and reduced-motion support. Preserve drafts and scroll position when opening and dismissing read-only overlays. Provide loading, no-results, failure, and unavailable states without leaking other users' content.
- No Start, Pause, Stop, Resume, labor timer, recording indicator, assignment control, or hidden work-state mutation. Do not add inactive admin, reporting, feedback, voice, or document-ingestion controls for deferred capabilities.

## Validation and completion

The implementation is complete when all ten records are reachable, their primary and recovery paths work with the shared demo data, and the behavioral scenarios **AT-01 through AT-38** in specification §9.1 have been exercised or any unmet scenario is explicitly listed with its reason. In particular, verify requester-to-technician creation, linked-chat uniqueness, per-user privacy, close/failure behavior, source honesty, keyboard access, and phone layouts. Visual acceptance follows §9.2.

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`; add focused automated tests for the state invariants and mutations that would be easy to regress. Inspect the prototype in a browser at the listed widths and test the affected interactions. Update the starter `README.md` with actual demo setup, fictional sign-in instructions, reset behavior, route map, and known prototype limits once the app is implemented.

In the handoff, state which routes and scenarios were verified, which services are simulated, any remaining failures, and the production dependencies in specification §10.2. Do not describe the prototype as production-ready or claim unavailable integrations were tested.
