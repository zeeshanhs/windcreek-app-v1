# WCAP-003 implementation handoff

## Delivered

The repository now has a local SQLite/Drizzle persistence adapter with a checked-in initial migration (`drizzle/0000_motionless_marauders.sql`), validated domain/screen DTOs, explicit row mapping, owner-aware repository methods, deterministic seed, and reset. `.local/askpat.sqlite` is the default server file and `.local/` ignores the file and its SQLite journals. `DATABASE_FILE` overrides the file path on the server. Existing browser IndexedDB data and UI behavior remain untouched; no API, server session, or production authentication was added.

The initial migration creates 18 tables: users, issues, locations, orders, remarks, events, scenarios, scenario follow-ups, chats, messages, citation pages, source records, message references, photos, unknown faults, operation receipts, runtime counters, and seed metadata. SQL foreign keys, unique constraints, checks, and owner/detail indexes are present. `PRAGMA foreign_keys = ON` is set on each connection. Message rich text uses validated versioned JSON; photos use SQLite BLOBs and have separate metadata/byte reads.

## Commands and entry points

```bash
npm ci
npm run db:setup
npm run db:migrate
npm run db:seed
npm run db:reset
```

`db:setup` is the one-command fresh local setup after installation. `db:seed` does nothing after a complete baseline is present and does not wipe new records. `db:reset` explicitly restores the SQL baseline and leaves migration history. All commands can use `DATABASE_FILE=/path/to/file.sqlite`. No command runs from import or build.

The validated contracts and repository interface are in `lib/askpat/contracts/`. The SQLite implementation is `lib/askpat/persistence/sqlite/repository.ts`; `connection.ts` opens an injected or default file, `seed.ts` owns baseline/reset, and `runtime.ts` reconciles counters after a later validated import. `docs/PERSISTENCE.md` explains lifecycle, durability, ownership, and the separate PostgreSQL adapter/migration path.

## Baseline and invariants

Fresh seed counts are 4 users, 6 issues, 7 locations, 6 orders, 7 remarks, 9 events, 10 chats, 62 messages, 6 citation pages, and 60 reference occurrences; photos, faults, and receipts start empty. Each demo user has one `CH-AHU15-<user-id>` **general** chat with 12 authored opening messages and 13 inline citation occurrences resolving to the six supplied pages. The source's six Marcus time labels are preserved; no unsupported AskPat timestamps are invented. The ticket summary and three follow-ups are scenario metadata. No AHU-15 operational order is seeded. Follow-up messages append at position 13 onward.

Existing order IDs, order versions, requester/closure data, ordinary chat/message IDs, and owner/order uniqueness remain intact. Orders remain shared demo records; chat, message, photo, fault, and receipt access is owner/actor scoped. Order and chat IDs are allocated inside immediate transactions from `demo_runtime`; `reconcileRuntimeCounters` advances order/sequence/clock state beyond imported records before new writes. Operation receipts bind retry IDs to actor, kind, and input hash, rejecting a changed replay.

## Verification

- `npm ci` completed; pinned `better-sqlite3` 12.11.1 declares Node 20/22–26 support, and the native driver opened an in-memory database under Node 24.19.0.
- `npm run db:setup`, `npm run db:seed`, and `npm run db:reset` completed at the default `.local/askpat.sqlite`; an earlier setup used `DATABASE_FILE` with a temporary path.
- `npx drizzle-kit check`, `npm run lint`, `npx tsc --noEmit`, `npm test` (16 tests), and `npm run build` passed.
- Temporary-file tests cover migration, exact counts, repeated seed, missing seed integrity, deliberate invalid FK, orders/history, owner scoping, linked/general chats, append after twelve authored turns, references/citations, photo BLOBs, faults, receipts/retry conflicts, reset, invalid stored rich JSON, and post-import counter reconciliation.
- `git check-ignore` confirmed `.local/askpat.sqlite`, `-wal`, and `-shm` are ignored. The build completed before default setup while `.local/` was absent, confirming that build did not create local data.

`npm audit` reports four moderate advisories in Drizzle Kit's development-only `@esbuild-kit`/older `esbuild` chain and none in production dependencies. The available automated fix proposes a Drizzle Kit downgrade; it was not applied. There was no native-driver setup failure.

## WCAP-004 and WCAP-005 boundaries

WCAP-004 must derive actor IDs from an authenticated server session, add protected route handlers and photo delivery, origin/CSRF defense, complete send/answer orchestration, and stable HTTP status/error mapping. The repository currently accepts explicit actor IDs only as a server-side boundary and must not be exposed directly to a client. WCAP-005 must cut the UI over from IndexedDB and decide how validated browser records are imported without silently merging them; call `reconcileRuntimeCounters` after import. PostgreSQL needs a different Drizzle table builder, migration SQL, driver, and transaction strategy while reusing the contracts.
