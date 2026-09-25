# WCAP-005 — Move screens to SQL-backed DTOs and retire direct browser state

## Position in the sequence

**Task 3 of 3.** Start only after WCAP-003 and WCAP-004 are implemented and verified. This task completes the user-visible cutover to the repository-local SQLite database.

## Outcome

Make orders, chats, messages, citations, photos, and reset load and save through the authenticated WCAP-004 API and WCAP-003 DTOs. Preserve the existing AskPat workflows and styling while removing the direct `DemoState`/IndexedDB dependency from active screens. The AHU-15 scenario must read as an ordinary **general chat**, with the authored opening followed naturally by user and AskPat follow-up messages.

## Read first

- Repository `AGENTS.md`, `docs/CONTRIBUTING.md`, WCAP-003/004 implementations and handoffs, existing `app/askpat-{app,context,orders,chats,panels}.tsx`, `lib/askpat/store.ts`, and scenario components. Inspect `git status` and preserve unrelated work.
- Relevant installed Next.js 16 guides under `node_modules/next/dist/docs/01-app/` before changing routes, rendering boundaries, cache behavior, or navigation.
- WCAP-001/002 source/handoffs. Follow the user's later decision that AHU-15 belongs in general chats with a working composer. The scripted “Logged” line and ticket summary do not correspond to an operational order.

## Required implementation

1. Replace screen reads and writes that use the browser `DemoState` with typed API calls and DTOs. Move sign-in/out to the server session, with the active user obtained from the session response. Remove trust in `sessionStorage` identity or client-provided `ownerId`. Preserve existing URLs, General/Order-linked filters, order-detail history, composer, citation viewer, source references, photo viewing/upload, and reset flow. Add clear loading, empty, failure, retry, and conflict states. Avoid showing demo fixtures as if they were live operational records.
2. Render AHU-15's twelve seeded turns and later messages through the **same message list component and ordering rules** as other general chats. Keep inline citation controls at the authored positions, mapped to their six supplied page images; preserve the full-page viewer behavior and metadata. Display scripted scenario title/summary as labeled chat metadata. Sending a follow-up must use the normal chat command and persist across reload/browser restart. Do not create an order when displaying the scripted ticket summary.
3. Provide a deliberate **one-time transition for pre-existing browser data**. Detect the old IndexedDB store and offer a versioned local export, including photo bytes, with a preview of record counts and effects. Add a **local maintenance CLI** that validates this export, prints a dry-run preview, and requires an explicit apply flag. It must import all accounts' records in one SQL transaction only while the database is at its pristine seeded baseline. This handles the old browser store's cross-account `DemoState` without granting a normal signed-in user cross-account API writes. Reconcile baseline IDs: keep the SQL-seeded twelve AHU-15 opening turns and append any browser-stored scenario follow-ups in order; do not duplicate baseline orders/chats/messages. Preserve IDs, ownership, order versions/history, receipts, references, and photo bytes. Make retry idempotent. If SQL has diverged, report the conflict and preserve both datasets; never silently replace user changes or merge multiple browser stores. Keep the old IndexedDB data until the user can verify the imported result, with a documented recovery path. If an old record cannot be mapped, show an actionable error rather than dropping it. Once import is resolved, remove obsolete direct browser-store writes from active code.
4. Refresh affected views after mutations and on return to a tab so changes from another tab or browser become visible. Reconcile stale order versions with the server's conflict response; avoid optimistic displays that claim persistence before confirmation. Make reset operate on SQL, then refresh session-scoped lists and details. The local SQLite file remains ignored and repository-local.
5. Update product and developer documentation to explain local setup (`migrate`, `seed`, dev), persistence location, reset/import behavior, data contracts, and the SQLite-to-PostgreSQL portability boundary. Keep demo-only authentication and scripted scenario limitations clear. Remove stale claims that records are held solely in IndexedDB.

## Acceptance and verification

| ID | Required result |
| --- | --- |
| AC-01 | Two demo users sign in separately. Each sees only authorized chats; general and order-linked chats, order lists/details, remarks, closure, and photo flows work through the API. |
| AC-02 | AHU-15 appears in General chats as a normal chat. Its twelve opening turns, citations, and subsequent follow-ups appear in one timeline; a sent message persists after reload and server restart. The scenario ticket remains labeled scripted and creates no order. |
| AC-03 | Create/modify records, reload, open another browser against the same app, and restart the app with the same checkout. SQL-backed records remain and the second browser can see authorized changes after refresh. |
| AC-04 | An existing WCAP-001/002 IndexedDB dataset can be previewed, exported, and imported once through the local maintenance command without losing records or photo bytes. The twelve SQL-seeded scenario turns appear once, followed by old browser follow-ups. Retry does not duplicate data. A non-pristine SQL database or invalid import produces a clear, non-destructive result, and the original browser store remains recoverable. |
| AC-05 | A stale order closure shows the server conflict and current order version. Failed sends/uploads show recoverable errors and do not appear as saved records. Reset restores the SQL baseline and all active views update. |
| AC-06 | No active screen writes directly to IndexedDB or treats client identity as authority. Database files remain untracked; code and migrations remain tracked. |

Run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build`. Exercise the flows in a running browser at desktop, 390px phone, and 320px stress width; include keyboard operation, citations, uploads, auth boundary, reset, reload, and restart. Test old-store import against a copy/temporary database, then verify the original store remains recoverable. Report any acceptance item not observed directly and review `git diff`/`git status`.

## Boundaries and final handoff

Do not add a hosted database, implement PostgreSQL now, add production auth, connect real AI/BMS, or make the scripted ticket operational. Report the SQLite file location, migration/reset/import commands, verified persistence and isolation behavior, remaining prototype limitations, and the domain/DTO contracts intended to survive a future PostgreSQL adapter.
