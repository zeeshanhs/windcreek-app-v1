# WCAP-004 — Put authenticated AskPat operations behind the SQLite repository

## Position in the sequence

**Task 2 of 3.** Start only after WCAP-003 is implemented and its migration/seed tests pass. WCAP-005 will move the interface to these operations; keep the existing browser-backed UI usable during this task.

## Outcome

Implement server-owned sessions, validated read/write operations, and protected photo delivery over the WCAP-003 repository-local SQLite/Drizzle data layer. Establish a complete API contract for the existing orders, general chats, order-linked chats, scenario follow-ups, and reset behavior. The server must derive the acting user from its session rather than accepting a client-supplied `ownerId` as authority.

## Read first

- `AGENTS.md`, `docs/CONTRIBUTING.md`, WCAP-003's implemented schema/contracts/handoff, `lib/askpat/model.ts`, `lib/askpat/store.ts`, and all current order/chat UI flows. Inspect `git status`; preserve unrelated work and browser data.
- Installed Next.js 16 route-handler, cookies, runtime, and server-module guides under `node_modules/next/dist/docs/01-app/` before adding routes or middleware. Use Node runtime for SQLite access.
- WCAP-001/002 handoffs and AHU-15 source content. The scenario is a general chat with ordinary follow-up sending; its scripted ticket summary is display metadata, not a real order.

## Required implementation

1. Create a **demo-only server session** for the existing fictional accounts. Preserve the `demo` password convention where the current UI uses it, label it clearly as non-production authentication, and use an HttpOnly, SameSite cookie with secure settings appropriate to the runtime. Keep signing material in an ignored local environment file or another server-only local secret. Add login, logout, and session/bootstrap operations; never return password material or secret values. Protect every data mutation and private read, including photos. Prevent cross-user chat access even if a caller guesses another chat ID. Apply an origin/CSRF defense to cookie-authenticated mutations.
2. Implement typed, validated route handlers (or equivalent server endpoints) over the WCAP-003 DTOs and repository. Cover the screen needs: order list/detail; create order; add remark; close order; chat list/detail; create/get an order-linked chat; create a general chat; send a message and obtain its demo answer; retrieve citation/reference metadata; photo upload/download; session; and explicit demo reset. Provide stable response/error shapes, status codes, pagination or bounded list behavior where needed, and an API contract document. Do **not** expose a generic writable `DemoState` or raw SQL/row endpoint.
3. Port current `lib/askpat/model.ts` and store semantics into server-owned commands: order version check and HTTP 409 on stale close, idempotent operation receipts/retries, unique owner/order linked chat, general chat not tied to an order, remarks/events history, unknown fault recording/retry, equipment prompt behavior, and the existing deterministic demo-answer rules. Preserve exact user-visible meaning where practical. A message send and its answer/receipt must be transactional or have a documented recoverable state that never silently duplicates a message on retry. Do not claim live AI, BMS, or service-ticket integration.
4. Validate all inputs at the API boundary. Enforce ownership through SQL queries/commands, not only route-level filtering. Enforce current photo type/size limits (including 10 MB maximum), authorize download, and avoid placing full binary payloads in JSON. Keep SQLite access in server-only modules with Node runtime. Use explicit transactions and database constraints for uniqueness and concurrency-sensitive operations.
5. Add a safe SQL demo-reset command/endpoint that restores the WCAP-003 seeded baseline and invalidates or refreshes relevant clients through the API contract. A reset must be explicit and must not be triggered by read, migration, build, or login. Provide a server-only repository check for whether the database still contains only pristine baseline records; WCAP-005's local maintenance importer will call it. Do not expose a cross-account import capability through an ordinary chat session, and do not silently merge or overwrite existing SQL data.

## Acceptance and verification

| ID | Required result |
| --- | --- |
| AC-01 | Login establishes a cookie session; logout ends it. Unsigned API reads/writes and photo fetches fail. Client-supplied owner IDs cannot impersonate another user. |
| AC-02 | A signed-in account can list/detail its permitted orders and chats, create an order, add a remark, close it, and retrieve complete history after a server restart. |
| AC-03 | General chat creation and ordinary sends work. One owner/order pair has at most one linked chat. AHU-15 opens as a general chat; follow-ups append after the twelve seeded turns without modifying the authored turns or creating a ticket. |
| AC-04 | A stale order version returns a typed conflict; repeating an operation with the same receipt key does not add a second order, remark, message, or answer. |
| AC-05 | A second user cannot read or mutate a first user's chat or photos by changing URLs/IDs. Invalid files, oversize files, invalid payloads, and cross-origin writes receive defined failures. |
| AC-06 | Explicit reset restores baseline counts/content. The pristine-state signal is accurate before and after a mutation or reset. |

Use temporary SQLite databases for integration tests that exercise real transactions and endpoint authentication, including negative authorization and retry cases. Run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build`. Inspect the route behavior under a running app where tests cannot cover cookie semantics. Review `git diff` and `git status`.

## Boundaries and handoff

Do not perform the WCAP-005 UI cutover or delete IndexedDB data. Do not implement PostgreSQL, production SSO, real AI, real equipment telemetry, or an operational ticket submission. The server session is a prototype mechanism, not a production security claim. In the handoff, list endpoint contracts, auth/cookie rules, error codes, receipts, reset/pristine semantics, and exact UI work left for WCAP-005.
