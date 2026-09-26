# AskPat demo API (WCAP-004)

This is a repository-local, Node.js/SQLite prototype API. It uses fictional accounts and deterministic answer rules. It is not production authentication, a live AI service, a BMS connection, or a service-ticket integration. The current UI still uses IndexedDB; WCAP-005 will call this API.

## Setup and session

Run `npm run db:setup` before starting the server. Set `ASKPAT_SESSION_SECRET` to a random value of at least 32 characters in an ignored `.env.local` or the server environment, and set `ASKPAT_APP_ORIGIN` to the browser origin (default `http://localhost:3000`). For example, generate a secret locally with `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Never use `NEXT_PUBLIC_` for these values. `DATABASE_FILE` selects the server-only SQLite file; the default is `.local/askpat.sqlite`. Migrations and seed are explicit commands, never API read or login side effects.

`POST /api/askpat/session` takes `{ "email": "morgan.reed@example.com", "password": "demo" }`. The other fictional addresses are listed in the README. Success returns a public user and expiry and sets `askpat_session`, an HttpOnly, SameSite=Lax, path `/`, eight-hour cookie. It is Secure when `ASKPAT_APP_ORIGIN` uses HTTPS. The cookie is signed using the server secret and backed by a revocable, hashed-token SQL session. `GET /api/askpat/session` returns `{ user, expiresAt, users, issues, locations, resetGeneration }`; `DELETE /api/askpat/session` revokes the session and expires the cookie. Neither endpoint returns a password, token, or secret in JSON.

All private GETs and all writes require the cookie. Every POST/DELETE also requires an exact `Origin: <ASKPAT_APP_ORIGIN>`; requests with absent/foreign Origin or foreign Fetch Metadata fail with 403. The server derives the actor from the cookie. Request bodies that supply `ownerId`, `actorId`, or `requesterId` are rejected. Browser requests use same-origin credentials. Private responses, including photos, use `Cache-Control: no-store`. API routes run in Node.js; SQLite needs a persistent writable filesystem.

## Envelope, errors, and pagination

JSON success: `{ "data": ... }`. JSON failure: `{ "error": { "code": "...", "message": "...", "details": ... } }`. Login or other authentication failures return 401 (`INVALID_CREDENTIALS` or `UNAUTHENTICATED`); a forbidden mutation origin returns 403 `FORBIDDEN_ORIGIN`; an unavailable or another user's item returns 404 `NOT_FOUND`; stale closure returns 409 `VERSION_CONFLICT` with `details.currentOrder`; reused operation ID with different input returns 409 `OPERATION_CONFLICT`; oversized uploads return 413 `FILE_TOO_LARGE`; unsupported content returns 415 `UNSUPPORTED_MEDIA_TYPE`; invalid request fields return 422 `VALIDATION_ERROR`; missing setup returns 503 `SETUP_REQUIRED`. Unexpected errors return 500 `INTERNAL_ERROR` without SQL detail. `GET /api/askpat/photos/:id` returns image bytes rather than a JSON envelope.

List endpoints accept `limit=1..50` (default 50), optional opaque `cursor`, and `q` up to 100 characters. Orders also accept `status=open|closed` and `sort=newest|oldest`; chats accept `kind=general|linked`. The result is `{ items, nextCursor, hasMore }`. Reuse the cursor with the same filters and sort. Chat detail returns `{ chat, nextCursor, hasMore }` with its first 50 messages. `GET /chats/:id/messages?after=<ordinal>` returns `{ items, nextCursor, hasMore }` for later messages. Message order is the stored ordinal; AHU-15 authored turns occupy 1–12 and follow-ups start at 13. The cursor for messages is the last ordinal as a decimal string.

## Endpoints

All paths below are under `/api/askpat`. Request JSON uses `Content-Type: application/json`; unknown body fields are rejected. IDs on mutation commands are client-generated UUID `operationId` values, reused unchanged after an uncertain response. A repeated key with the same canonical input returns the existing result; a changed input or actor returns 409. The server records receipts in SQLite transactions.

| Method and path | Request | Response data |
| --- | --- | --- |
| `GET /orders` | Query params above | Order list page, shared among fictional accounts. |
| `GET /orders/:orderId` | — | Order detail, including version, remarks, events, and closure. |
| `POST /orders` | `{ issueId, locationId, remark, operationId }` | Created order, with requester from session. |
| `POST /orders/:orderId/remarks` | `{ text, operationId }` | Updated order. Closed orders conflict. |
| `POST /orders/:orderId/close` | `{ note, expectedVersion, operationId }` | Updated order or current version in 409. |
| `GET /chats` | Query params above | Owner-scoped chat list page. |
| `GET /chats/:chatId` | — | Owner-scoped chat and first message page, with scenario metadata. |
| `GET /chats/:chatId/messages` | `after` ordinal | Owner-scoped message page with reference/photo metadata. |
| `POST /chats/linked` | `{ orderId, operationId }` | Existing or new unique owner/order chat. |
| `POST /chats` | `{ title, operationId }` | New general chat. |
| `POST /chats/:chatId/messages` | Multipart send below | Committed user/answer pair. |
| `POST /chats/new/messages` | Multipart send below | New general chat and committed pair in one transaction. |
| `POST /chats/:chatId/equipment-choice` | `{ promptMessageId, useNewUnit, operationId }` | Updated chat. Choice affects only this chat. |
| `POST /chats/:chatId/faults/:messageId/retry` | Empty body | Idempotently ensure a stored TEST-X9 response has its owner-scoped fault record. |
| `GET /photos/:photoId` | — | Owner-scoped PNG/JPEG bytes, exact MIME, `nosniff`. |
| `GET /references/:referenceId` | — | Owner-scoped reference with citation/source/order details. |
| `POST /reset` | `{ "confirmation": "RESET_DEMO" }` | Restores the SQL baseline for all accounts, increments generation, revokes all server sessions, and expires the caller cookie. Sign in again. |

The send body is `multipart/form-data` with one `operationId` UUID, `text` (up to 4,000 characters; optional if a photo is supplied), optional `photo` (one PNG/JPEG up to 10 MiB), and optional `description` (up to 500 characters). Total request size is bounded before multipart parsing. MIME and file signature are checked. JSON returns `{ chatId, messageId, answerId, replayed, messages }`; `messages` contains the committed user message and deterministic answer. A photo is represented by metadata in the user message; download through `/photos/:photoId`. The message, photo, answer, references, optional TEST-X9 fault record, and receipt commit together. A failed transaction saves none of them, so repeating the same operation ID is safe. The fault retry route also handles a prior response that lacks its fault record; it does not accept a new fault description from the browser.

The six supplied AHU-15 citation pages are still static files under `public/scenarios/ahu-15/` for the existing browser UI and have direct URLs. They are scripted source images, distinct from private user-uploaded photos. Moving them to an authenticated document-serving policy is separate from this WCAP-004 API.

## Reset and maintenance boundary

`npm run db:reset` and `POST /api/askpat/reset` share the baseline restoration logic. Both affect SQL only; neither deletes browser IndexedDB. The API reset is intentionally cross-account within this fictional shared demo. Sessions end so other clients receive 401 and must re-bootstrap. The server-only `isPristineBaseline(connection)` compares every domain table and meaningful row value to a freshly seeded baseline, excluding auth sessions and reset generation; WCAP-005's local maintenance importer will call it. No browser route provides cross-account import or raw SQL access.
