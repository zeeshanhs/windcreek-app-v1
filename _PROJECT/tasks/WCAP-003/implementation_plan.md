# WCAP-003 implementation plan — SQLite, Drizzle, and stable data contracts

## Goal and current baseline

Build a repository-local, server-side SQLite foundation that WCAP-004 can use for authenticated operations and WCAP-005 can use for the UI cutover. This task does not switch the current IndexedDB UI, create an API, change demo sign-in, or touch existing browser records.

The current source of truth is `lib/askpat/fixtures.ts`, `model.ts`, and `store.ts`, plus the typed AHU-15 transcript and citation map in `app/scenarios/ahu-15/scenario-data.ts`. `DemoState` is one IndexedDB value. It currently seeds 4 users, 6 issues, 7 locations, 6 orders, 6 ordinary chats, and 4 empty per-user AHU-15 general chats. The scenario's 12 opening turns are rendered separately from chat messages. WCAP-002's later decision makes those chats normal general chats with appendable follow-ups; its earlier read-only wording is superseded. The repository already has an `npm test` command, despite stale wording in `AGENTS.md` and `docs/CONTRIBUTING.md`.

## Implementation decisions

1. **Runtime and packages.** Use Drizzle ORM and Drizzle Kit with the local `better-sqlite3` driver, plus runtime schema validation (prefer one small validator such as Zod) and necessary TypeScript types. Check released package/driver compatibility with the installed Node and Next 16 before locking versions; verify the native driver with `npm ci` and tests. The installed Next guide lists `better-sqlite3` among automatically externalized server packages, so add `serverExternalPackages` only if the actual build needs it. Keep all driver and filesystem imports in server-only modules. No route needs the database during this task.
2. **File and lifecycle.** Resolve the default database to `<repository>/.local/askpat.sqlite`; accept only a server-side `DATABASE_FILE` override. Ignore `.local/` so the database, `-wal`, and `-shm` files stay untracked. Opening a connection may create a file when a command explicitly calls it; importing a module or running `next build` must not migrate, seed, or open it. Enable `PRAGMA foreign_keys = ON` on every connection and set a busy timeout. Keep connection construction injectable for temporary-file tests.
3. **Migration ownership.** Commit SQLite Drizzle table definitions and generated, versioned SQL migrations with Drizzle's migration journal. Use a checked-in migration runner rather than `push` for setup. The initial schema/migration is version `0000`; later changes use new migrations. Do not hand-edit a previously applied migration.
4. **Stable contracts.** Put canonical domain types, input validators, and screen-facing DTO schemas outside the SQLite adapter. DTOs contain strings, numbers, nulls, arrays, and metadata only; they never contain Drizzle rows, `DemoState`, `Blob`, `Buffer`, or image bytes. Explicit adapter mappers validate rows and JSON at read boundaries. This lets a future PostgreSQL adapter implement the same repository port, while owning separate PostgreSQL table builders and migrations.
5. **Auth boundary.** Repository reads and writes take an explicit actor/owner context and enforce chat ownership in queries. WCAP-004 will derive that actor from a server session. No public route or production authentication is added here.

## Proposed schema and relationships

Use string primary keys to preserve existing IDs. Store timestamps as ISO text where an absolute instant is known; use explicit message order for conversations. Add checks for valid enum values, positive order versions, nonempty required text, and valid nullable combinations. Define actual SQL foreign keys and indexes in the migration, not only Drizzle relation helpers.

| Table | Main fields and rules |
| --- | --- |
| `users`, `issues`, `locations` | Current demo IDs and catalog fields; unique user email. Seeded catalogs have stable IDs. |
| `orders` | Existing string ID, issue/location/requester FKs, status, version, equipment, created time, and nullable closure actor/time/note. Index status/time and requester/time for list/detail access. |
| `order_remarks`, `order_events` | Existing string IDs, order and actor FKs, timestamp, text/kind, and per-order ordinal with a unique `(order_id, ordinal)` constraint. Preserve all history and event order. |
| `scenarios`, `scenario_followups` | `ahu-15` metadata, scripted ticket summary, and three ordered scripted follow-ups. Label them as authored scenario material; no `orders` row comes from the word “Logged.” |
| `chats` | Existing string ID, owner FK, nullable order FK, optional scenario FK, title/equipment/times. `UNIQUE(owner_id, order_id)` enforces one linked chat per owner/order; SQLite's null handling allows multiple general chats. Index owner/update time and owner/order. |
| `messages` | Existing or deterministic seeded string ID, chat FK, author, status, ordered position, nullable absolute `at`, nullable original display-time label, and plain/rich content fields. Rich blocks stay structured JSON with a versioned discriminator, validated on write and read. Unique `(chat_id, position)` supports appending after scripted turns. |
| `citation_pages`, `source_records`, `message_references` | Six citation records retain document, sheet, PDF page, image path, dimensions; source records cover current demo source IDs. Each reference occurrence has message FK, ordinal, kind, label/locator, and the appropriate citation/source/order FK. Checks constrain the target by kind; repeated inline citations remain separate occurrences. Cross-check rich-text citation markers against these rows in mapping/validation. |
| `photos` | Existing string ID, chat/message relationship, file name, MIME type, byte size, description, and SQLite BLOB payload. A unique message attachment relation supports the current one-photo limit. Metadata queries exclude the BLOB; a separate authorized repository read returns bytes. |
| `unknown_faults` | Existing string ID, chat/message FKs, equipment, code, time, optional photo FK. Verify the message and photo belong to the same chat within the write transaction; use composite FKs where practical. |
| `operation_receipts` | Unique operation ID, actor, operation kind, request fingerprint, stable result IDs, and time. A replay with different inputs must fail rather than reuse an unrelated result. Baseline is empty. |
| `demo_runtime` | Singleton deterministic clock plus next order number and next general ID sequence. Allocate and advance inside a SQLite write transaction; never calculate `MAX(id) + 1` outside one. Reconcile counters after any later import before writes resume. |
| `seed_metadata` | Singleton seed version/installed time marker written in the same transaction as baseline rows. It makes a second seed run a no-op; an integrity check verifies required baseline rows. |

The current two closed orders retain their original closure data and versions. Order visibility remains the existing shared demo order model; chats and their messages/photos are owner-scoped. SQLite constraints cover parent existence; repository transactions additionally enforce cross-table ownership and same-chat references where a simple FK cannot express them.

## Contract and repository layout

Place shared contracts under `lib/askpat/contracts/` (domain types, input schemas, DTO schemas, rich-text/citation schemas, and repository interface). Place SQLite-only code under `lib/askpat/persistence/sqlite/` (schema, connection, mapper, repository, migration/seed helpers). Keep CLI entry points under `scripts/` and SQL under `drizzle/`. Exact filenames may be adjusted to fit Drizzle Kit's generated layout, but imports must preserve this boundary.

Define validated DTOs for order list/detail (with remarks/events/closure on detail), chat list/detail, messages, references, citation metadata, and photo metadata. Use a discriminated message-content type: plain text for ordinary demo messages and structured paragraphs/ordered lists with text, emphasis, and inline citation nodes for AHU-15. Preserve the original six Marcus time labels on their turns. Leave time absent/null for AskPat turns with no supplied timestamp; do not invent an afternoon UTC date. A stored ordinal, not a synthetic timestamp, governs display order. Scenario summary/follow-ups are DTO metadata rather than an operational ticket.

Expose owner-aware list/detail queries and transaction-scoped persistence operations for orders/history, chats/messages/references, photos, faults, and receipts. The implementation should return validated DTOs or explicit not-found/conflict results, never a row. Include a separate photo-byte method. The contract can carry actor IDs now; WCAP-004 must supply them from its session and add HTTP validation/status mapping. Keep deterministic demo-answer logic and the current IndexedDB store intact until the later tasks.

## Seed, setup, and reset

Create a deterministic seed source by mapping the current fixtures and scenario data, not by manually copying transcript prose into SQL. Move or extract the scenario's pure typed data into a shared module if needed, keeping its current UI exports and behavior intact. In one transaction, insert the baseline only when its seed marker is absent. A successful second `db:seed` is a no-op, leaving new orders/chats/messages and counters unchanged. If a marker is present but expected seed rows are missing, report an integrity error rather than silently repairing or overwriting user data. A failed seed rolls back completely.

Expected fresh baseline: 4 users, 6 issues, 7 locations, 6 orders, 7 remarks, 9 events, 10 chats (including 4 general AHU-15 chats), 62 messages (14 ordinary plus 48 scripted), 6 citation pages, and 60 message-reference occurrences (8 ordinary plus 13 inline citations for each of 4 scenario chats). Confirm these counts from the actual mapping in tests. Photos, faults, and receipts start empty. The AHU-15 chat IDs and existing ordinary IDs remain stable. Each scenario chat has exactly 12 authored opening messages before any later follow-up.

Add documented commands such as `npm run db:migrate`, `npm run db:seed`, `npm run db:setup` (migrate then seed), and `npm run db:reset`. Reset is an explicit local maintenance command that clears domain rows in dependency order inside a transaction, restores the baseline and runtime counters, and leaves migration history in place. It must clearly state that it removes later SQL records and does not clear IndexedDB. It is not a public endpoint. The runner should accept `DATABASE_FILE` for isolated temporary databases and create its parent directory as needed. Document a writable persistent filesystem requirement for durable deployments; ephemeral serverless files do not provide persistence.

## Execution sequence and verification gates

| Step | Work | Gate |
| --- | --- | --- |
| 1. Dependencies and boundaries | Lock compatible packages, add `.local/` ignore rule, create server-only connection and explicit CLI commands. Review the installed Next 16 server/client-boundary and package-bundling guides before any Next-specific change. | Import/build alone leaves `.local/` absent; native driver loads. |
| 2. Schema and migration | Define all tables, checks, FKs, unique constraints, indexes, and migration `0000`; run the committed migration against a fresh temporary SQLite file. | `PRAGMA foreign_key_check` is empty; inserting deliberate bad parent IDs fails with FK enforcement on. |
| 3. Contracts and mapper | Define validators, DTOs, rich-text nodes, and explicit row mapping, including JSON parse failures and byte-free list/detail results. | Typed round-trips preserve IDs, versions, chronology, citations, and photo metadata without leaking BLOBs. |
| 4. Repository and seed | Add owner-aware queries, transaction-scoped write primitives, deterministic seed marker/counters, and explicit reset. | Fresh setup, second seed, mutation then reseed, reset, and concurrent/duplicate ID cases behave as specified. |
| 5. Docs and handoff | Update README and add `docs/PERSISTENCE.md` for commands, contract entry points, durability, schema ownership, and a separate PostgreSQL adapter/migration path. | A clean checkout can run one setup command; docs state WCAP-004's required actor/session and API work. |

Use temporary database files for meaningful migration, seed/idempotence, reset, FK, ownership, rich-citation, receipt, photo BLOB, and repository round-trip tests. Include a test that appends a follow-up after position 12 without changing the authored turns. Run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build`; record any native-driver install/build limitation. Check `git diff --check`, `git diff`, and `git status` before handoff. Do not commit the SQLite file, journals, generated output, secrets, or unrelated task inputs.

## WCAP-004 handoff requirements

Report the applied migration version; exact setup/reset commands; repository and DTO entry points; baseline counts; ID/counter and receipt semantics; transaction/ownership guarantees; and tests. Call out that WCAP-004 must add server session/authentication, route handlers, protected photo delivery, origin defense, complete command orchestration, and API error/status mapping. WCAP-005 then replaces IndexedDB consumers and handles local browser-data import. A future PostgreSQL implementation reuses domain contracts, but needs its own Drizzle schema builder, driver, migration SQL, and concurrency strategy.
