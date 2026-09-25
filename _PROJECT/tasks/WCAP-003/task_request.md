# WCAP-003 — Establish a repository-local SQLite data layer and stable contracts

## Position in the sequence

**Task 1 of 3.** Complete this task before WCAP-004, then WCAP-005. This request authorizes implementation of the data foundation only; the existing browser-backed UI may continue to run until the final task.

## Outcome

Create a durable SQLite database **inside the repository checkout**, accessed on the server through Drizzle ORM. Persist the existing AskPat demo entities and the AHU-15 scenario conversation as relational records. Define explicit, validated domain and screen-facing contracts so later API and UI work does not depend on SQLite row shapes.

The SQLite file is local runtime data, **not a committed fixture**. Use `.local/askpat.sqlite` as the default, ignore `.local/` including SQLite journal files, and allow a server-only `DATABASE_FILE` override. The application must be able to create/migrate/seed a fresh checkout without any cloud database. Document that durable deployment requires a writable persistent filesystem; ephemeral serverless storage does not satisfy persistence.

## Read first

- Repository `AGENTS.md`, `docs/CONTRIBUTING.md`, `package.json`, `lib/askpat/{fixtures,model,store}.ts`, `app/askpat-context.tsx`, and WCAP-001/002 implementation handoffs. Inspect `git status` and preserve unrelated work, especially task inputs.
- The installed Next.js 16 guides under `node_modules/next/dist/docs/01-app/` for any server-only module or framework feature you change. Follow the installed version, not remembered conventions.
- The existing AHU-15 transcript and citation metadata in `app/scenarios/ahu-15/`, plus the original WCAP-002 inputs. The scenario is now a **general chat with follow-up messages**, per the user's later decision; older WCAP-002 read-only wording is superseded.

The current source of truth is the code: browser IndexedDB stores one `DemoState` object, and the UI consumes that object directly. There is no SQL schema, ORM, server API, or production identity system yet.

## Required implementation

1. Add Drizzle ORM, Drizzle Kit, a compatible **local `better-sqlite3` driver**, and type/runtime-validation dependencies only where needed. Select compatible released versions for this repo's Node/Next setup and lock them. Add explicit commands for migration, seed, and fresh local setup. Do not run migrations or seed as a side effect of module import or `next build`.
2. Add a versioned SQLite schema and checked-in migration files. Model at least: demo users, issues, locations, orders, order remarks, order events, chats, messages, message references/citations, photos, unknown faults, operation receipts, and the deterministic demo clock/ID state currently used by the store. Preserve the existing string IDs, order versions, ownership rules, and general chats (`orderId = null`). Store photo bytes as SQLite BLOBs with their metadata; do not keep photos only as browser `Blob`s. Provide real SQL foreign keys, uniqueness constraints, and indexes for owner/list/detail lookups. ORM relation declarations alone are insufficient for referential integrity.
3. Define canonical domain types and validated input/output DTOs independent of Drizzle table definitions. Implement explicit row-to-DTO mapping for order list/detail, chat list/detail, messages, references, and photo metadata. Keep binary photo payloads out of list DTOs. Keep scenario rich text/citation structure typed; do not flatten citation placements to an opaque rendered HTML string. Validate JSON stored in SQL at boundaries. Avoid leaking `DemoState` or database rows directly to screens.
4. Make the persistence boundary replaceable: domain commands/queries and DTOs may remain stable when a PostgreSQL adapter is added later. SQLite and PostgreSQL require **different Drizzle table builders and migration SQL**; do not claim a literal schema file or migration can be switched between dialects unchanged. Keep dialect-specific code inside the adapter and document the expected migration path. Do not implement PostgreSQL in this task.
5. Seed a fresh database deterministically from the existing demo data: users, issue/location catalogs, six service orders with their remarks/events, existing chat examples, and references. Provide tables for faults, receipts, and photos even if baseline collections are empty. Seed one AHU-15 **general** chat per demo user with all twelve authored Marcus/AskPat opening turns as message records in their original order, preserving speaker, available timestamps, rich text, and each inline citation target. Follow-up messages must be appendable later without special-case transcript splicing. Keep the scripted scenario ticket summary and its follow-ups as clearly labeled scenario metadata; **do not create an operational order/ticket** from the transcript's “Logged” wording. Re-running seed must not duplicate records or wipe later user data.
6. Provide a documented local reset/reseed operation usable by WCAP-004. Do not implement a public reset endpoint yet. Ensure generated IDs and transaction counters cannot collide after seed or an eventual browser-data import; avoid `MAX(id) + 1` outside a write transaction.

## Acceptance and verification

| ID | Required result |
| --- | --- |
| AC-01 | On a clean checkout, one documented local setup command creates and migrates `.local/askpat.sqlite` and seeds it; no cloud service or committed DB file is required. |
| AC-02 | A second seed run leaves counts and user-created records unchanged. A reset explicitly restores baseline data. SQLite foreign-key checking is enabled and deliberate invalid references fail. |
| AC-03 | Orders, remarks/events, chats, messages, citations, faults, receipts, and a photo round-trip through the repository with typed DTOs; list responses contain metadata rather than image bytes. |
| AC-04 | Each seeded account has an AHU-15 chat classified as general and containing exactly the twelve authored opening turns. Inline citations still resolve to the six supplied citation pages. No operational order is created for the scripted ticket. |
| AC-05 | The database file and journals remain ignored; migrations and seed source are tracked. Build/import alone does not modify local data. |
| AC-06 | Persistence documentation explains contract boundaries, schema ownership, local-file durability limits, and what changes for PostgreSQL. |

Use isolated temporary database files for meaningful migration, seed, integrity, and round-trip tests. Run `npm run lint`, `npx tsc --noEmit`, `npm test`, and `npm run build`. Record any native-driver setup limitation. Review `git diff` and `git status` before handoff.

## Boundaries and handoff

Do not switch the UI to SQL, add a second visible scenario, expose unauthenticated data routes, or implement production authentication. Existing IndexedDB records must remain untouched for the later cutover. In the handoff, identify the schema/migration version, commands, DTO/repository entry points, seeded counts, tests, and any schema choices WCAP-004 must honor.
