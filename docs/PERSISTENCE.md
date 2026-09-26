# AskPat local persistence

WCAP-003 added the server-side SQLite data foundation. WCAP-004 adds authenticated demo HTTP operations over it. The current screens still read and write their existing browser IndexedDB state; WCAP-005 will perform the UI cutover and local browser-data transition. The [API contract](ASKPAT_API.md) documents routes, cookies, errors, and retries.

## Set up and operate a local database

Run from the repository root after `npm ci`:

```bash
npm run db:setup
```

This single command creates `.local/askpat.sqlite`, applies the checked-in migration, and seeds the baseline. The directory and SQLite journal files are ignored by Git. To use a different local file, set the **server-only** `DATABASE_FILE` environment variable for the command or server process. A relative override is resolved from the process working directory; do not use a `NEXT_PUBLIC_` variable.

```bash
DATABASE_FILE=/path/to/askpat.sqlite npm run db:setup
npm run db:migrate
npm run db:seed
npm run db:reset
```

`db:migrate` applies unapplied SQL migrations; `db:seed` inserts the baseline once. A second seed leaves later data and counters untouched. `db:reset` explicitly deletes SQL domain records in a transaction and restores the baseline while retaining migration history. It does **not** clear browser IndexedDB. The authenticated `POST /api/askpat/reset` performs the same SQL reset, revokes sessions, and increments the reset generation. Importing modules or running `next build` does not migrate or seed.

The runtime needs a writable, persistent filesystem for durable data. Ephemeral serverless storage does not satisfy this requirement. Back up the SQLite file with a SQLite-aware backup procedure before moving or restoring real local data; do not copy a live file without its active journal state.

## Schema and contracts

`lib/askpat/persistence/sqlite/schema.ts` owns the SQLite Drizzle table definitions. `drizzle/0000_motionless_marauders.sql` and `drizzle/meta/` are the applied migration history; add a new migration for future schema changes. The connection enables SQLite foreign keys on every open. Repository writes use immediate transactions for IDs, version changes, receipts, chat uniqueness, history, and attachment relationships.

`lib/askpat/contracts/index.ts` owns validated domain and screen DTO schemas. `lib/askpat/contracts/repository.ts` is the dialect-neutral repository port. `lib/askpat/persistence/sqlite/repository.ts` implements it with explicit row-to-DTO mapping. The repository returns order list/detail, chat list/detail, ordered messages, typed references and citation metadata, scenario metadata, and photo metadata. Photo BLOBs are read separately through the owner-scoped `getPhotoBytes`; no list/detail DTO carries image bytes. Stored rich JSON is validated on read and write, and inline citation placements must match their reference rows.

Current demo orders are shared across accounts; chats, messages, faults, and photos are owner-scoped. The repository requires an actor or owner ID. WCAP-004 derives it from a revocable authenticated server session and protects every API endpoint, especially binary photo delivery. The present fictional browser UI sign-in is still not a server security boundary.

The seed is deterministic: 4 users, 6 issues, 7 locations, 6 orders, 7 remarks, 9 events, 10 chats, 62 messages, 6 citation pages, and 60 reference occurrences. Four general AHU-15 chats each contain the 12 authored Marcus/AskPat opening turns. The six supplied Marcus time labels are preserved; AskPat turns have no invented absolute timestamp. The scripted ticket summary and three follow-ups are scenario metadata, not an operational order. Photos, faults, and receipts start empty. Follow-up messages can append at position 13 and beyond.

`demo_runtime` stores the deterministic clock and next ID counters. Generated IDs are allocated in write transactions. After a validated browser-data import, call `reconcileRuntimeCounters` in `lib/askpat/persistence/sqlite/runtime.ts` before allowing new writes; it advances counters and the clock beyond imported data. An operation receipt binds an operation ID to its actor, kind, input hash, and result. Reusing the ID with different input raises a conflict.

## Later adapters

The DTO and repository port can be reused by a PostgreSQL adapter. PostgreSQL needs its own Drizzle table builders, driver, migration SQL, BLOB or object-storage policy, transaction/locking strategy, and deployment configuration. The SQLite schema file and migration cannot be switched to PostgreSQL unchanged. No PostgreSQL adapter exists yet.
