# WCAP-004 implementation handoff

## Delivered

WCAP-004 adds a demo-only, cookie-authenticated API at `/api/askpat/*` over the WCAP-003 SQLite repository. Migration `0001_demonic_hitman.sql` adds revocable hashed-token sessions and a durable reset generation. The server derives every acting user from a signed HttpOnly cookie; route bodies cannot choose another owner. Mutations require the configured exact Origin. Orders remain shared fictional records, while chat, message, reference, fault, and photo reads/writes use owner-scoped SQL checks.

The API supports login/bootstrap/logout; paged order and chat lists; order detail/create/remark/close; general and unique order-linked chats; paged chat messages; atomic send with optional photo, deterministic answer, references, TEST-X9 fault, and retry receipt; equipment prompt choice; unknown-fault retry; owner-scoped binary photo delivery and reference resolution; and explicit SQL reset. AHU-15 stays a general chat with its twelve seeded authored turns, six citation page mappings, ordinary appended follow-ups, and no operational ticket/order creation. The current UI remains on browser IndexedDB for WCAP-005.

## Contract and setup

See [the API contract](../../../docs/ASKPAT_API.md) for request/response fields, endpoint paths, pagination, status/error codes, cookie/origin rules, upload limits, receipts, and reset effects. Run `npm run db:setup` before starting the app, set a random server-only `ASKPAT_SESSION_SECRET` of at least 32 characters, and set `ASKPAT_APP_ORIGIN` when the app origin differs from `http://localhost:3000`. The default SQL file is ignored `.local/askpat.sqlite`; `DATABASE_FILE` overrides it. No secret or database file was committed.

The cookie lasts eight hours, uses `HttpOnly`, `SameSite=Lax`, path `/`, and `Secure` on HTTPS. Logout revokes its SQL session. Reset removes all sessions, restores the seed in one immediate transaction, increments reset generation, and expires the caller cookie; every client must sign in again. `isPristineBaseline(connection)` is server-only and compares all 18 domain tables, including row values and runtime counters, to a fresh deterministic seed. It ignores sessions and reset generation so login alone does not make the domain non-pristine. WCAP-005's local maintenance importer can call this function; there is no browser import or raw-row endpoint.

Mutation receipts bind an operation UUID to actor, operation kind, and canonical request hash. A same-key/same-input replay returns prior IDs; a changed replay returns 409. The send command includes new-general-chat creation, user message, optional photo BLOB, answer and references, optional unknown-fault row, and receipt in one immediate transaction. Any failure rolls back all of them. The equipment choice is conversation-only; it does not alter a linked order. A stale closure returns 409 `VERSION_CONFLICT` with the current order.

## Verification

- `npm run lint`, `npx tsc --noEmit`, `npm test` (22 tests), `npx drizzle-kit check`, and `npm run build` passed.
- Temporary-file integration tests cover unsigned and cross-origin requests, logout, owner spoofing, guessed chats/references/photos, shared orders, stale closure, receipt retries, linked/general chat behavior, AHU-15 ordinal 13+ follow-ups, citation metadata, photo MIME/size and authorized bytes, equipment choice, TEST-X9 fault retry, reset, full-domain pristine changes, and send rollback/retry after an injected answer-write failure.
- A production build was started against a separate temporary SQLite file on localhost:3100. HTTP checks observed 401 before login; a login `Set-Cookie` with HttpOnly/SameSite/expiry; 200 bootstrap with the cookie; 403 for a foreign-Origin write; 201 order creation; the same order and cookie readable after server restart; 204 logout; and 401 when the old cookie was replayed. The temporary server was stopped after verification.
- `git diff` and `git status` were reviewed. The WCAP-004 plan and task request remain intact; no IndexedDB data or default SQL file was modified.

## WCAP-005 work left

Replace the active UI's IndexedDB and `sessionStorage` identity with these session and domain endpoints; render both authored AHU-15 turns and new messages through one DTO timeline; use authenticated photo URLs and reference metadata; handle 401, conflict, retry, reset, and cross-tab refresh states. Build the one-time browser export and local maintenance import, calling `isPristineBaseline` before importing and `reconcileRuntimeCounters` afterward. Keep the old browser store recoverable until import is verified. The six existing AHU-15 JPEG citation pages remain public static assets for the unchanged UI; a future restricted-document policy would require moving their delivery behind authorization.
