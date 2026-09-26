# AskPat operational prototype

AskPat is a **fictional** Wind Creek Hospitality prototype for service orders and personal AI conversations. The current screens use browser-local IndexedDB. A separate authenticated demo API now uses repository-local SQLite; WCAP-005 will connect the screens to that API. No real employee accounts, property records, HotSOS calls, AI inference, equipment diagnosis, source retrieval, image recognition, or document ingestion are connected.

## Run locally

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. If the local environment cannot run Turbopack, use `npm run dev -- --webpack`. The project build uses Next.js's supported Webpack mode because the default Turbopack CSS worker cannot bind its local port in this workspace.

## Fictional sign-in

Use password `demo` with any of these demonstration-only addresses:

| Account | Role | Email |
| --- | --- | --- |
| Morgan Reed | Technician | `morgan.reed@example.com` |
| Avery Cole | Team member | `avery.cole@example.com` |
| Sam Patel | Technician | `sam.patel@example.com` |
| Jordan Lane | Team member | `jordan.lane@example.com` |

The form is a UI simulation. Do not enter real credentials. The active demo user is held in tab session storage; sign-out clears unsent text and staged photos. It does not remove already committed fictional orders and chats.

## Routes

| Route | Purpose |
| --- | --- |
| `/login` | Fictional email/password sign-in |
| `/chats` | Personal mixed general and order-linked chat list |
| `/chats/new` | Unsaved general-chat draft; first send saves it |
| `/chats/:chatId` | One user-owned conversation |
| `/scenarios/ahu-15` | Redirects to the signed-in user's AHU-15 general chat, preserving citation query parameters |
| `/orders` | Shared fictional service-order queue |
| `/orders/new` | Guided order creation |
| `/orders/:orderId` | Selected order, remarks, history, chat and closure actions |

Dialogs use the parent URL with `?panel=order`, `?panel=close-order`, `?panel=photo`, or `?panel=source&sourceId=…`. Browser Back dismisses an opened dialog. The source viewer presents the authored DF-S01/02/03 training text where available. The referenced `ahu1-points.pdf` is absent and has an unavailable state.

Each demo account has an **AHU-15 Drops Off the BMS** general chat in the normal chat list and General filter, with no service order attached. Its Marcus/AskPat opening and ticket summary are source-controlled scripted content. New follow-up messages and their bounded demo answers use the regular composer and are saved to that account's browser-local chat. They do not contact a BMS or create a ticket; the authored “Logged” line does not report a real action. Reset demo clears follow-ups and restores the initial chat. Existing browser data is migrated once to add the chat without replacing other records. Inline markers `[1]`–`[6]` open the supplied full-page JPEG drawings at `/chats/:chatId?panel=citation&citation=N`. The viewer supports Fit page, zoom buttons, and two-axis panning on enlarged pages, including phones. It does not highlight a cited region. The JPEGs are served from `public/scenarios/ahu-15/` and therefore have direct static URLs. The demo sign-in gate is not server-side authorization for those files.

## Demo data and reset

Six orders and Morgan's five WCAP-001 chats are seeded, plus one AHU-15 general chat for each account. Sam also has his own SO #1042 chat. Avery can create SO #1043 and a distinct linked chat. Order status is only Open or Closed; closing does not end a conversation or prove a repair.

Committed UI records live in this browser's IndexedDB and remain across route changes, account switches, and reloads. **Reset demo** in the account menu restores the initial fixture. Open tabs are notified of committed changes, and each write rechecks the local store. Other browsers and devices have separate data. Browser storage can be cleared or unavailable; the current UI has no server-side persistence, production authorization, or cross-device synchronization.

## SQLite foundation and WCAP-004 API

After `npm ci`, run `npm run db:setup` to create and migrate the ignored `.local/askpat.sqlite` file and seed the relational baseline. `npm run db:seed` is repeatable without replacing later SQL records; `npm run db:reset` explicitly restores the SQL baseline. These commands do not affect browser IndexedDB. To use the demo API, set a random `ASKPAT_SESSION_SECRET` of at least 32 characters in an ignored `.env.local`, and set `ASKPAT_APP_ORIGIN` if the app is not at `http://localhost:3000`. Run `npm run dev` or `npm start` after setup. The API uses an HttpOnly cookie and server-owned actor identity; the present UI sign-in remains browser-local until WCAP-005. See [API contract](docs/ASKPAT_API.md) and [local persistence](docs/PERSISTENCE.md).

The demonstration clock begins at 24 Sep 2026, 10:30 UTC and advances deterministically with actions. Answers and sources are scripted training specimens. A sent photo remains a local chat attachment and is not uploaded to a knowledge base. The photo control accepts one PNG or JPEG up to 10 MB per message.

For recovery-state review, add `?simulate=` to the relevant route. Supported values are `create-failed`, `create-uncertain`, `close-failed`, `close-uncertain`, `send-failure`, `answer-failure`, `fault-log-failure`, `source-load-failed`, and `order-context-failed`. Mutation faults occur once per opened form or chat route so the same request can be retried. `/login?reason=expired` and `/login?reason=unavailable` show the corresponding sign-in states. These switches affect only the local demonstration.

## Checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

`npm test` exercises the existing browser-domain logic plus temporary SQLite migration, seed, repository, API session/ownership, photo, receipt, and reset behavior. Browser inspection is still required for responsive layout, dialogs, keyboard behavior, and the full AT-01–AT-38 acceptance scenarios.

## Production dependencies

This prototype leaves open the real identity and record-access policy, service-order create/close/remark API contracts, verified issue/location catalog, authorized source documents and versions, approved AI/retrieval and visual-validation services, unknown-fault retention/governance, ingestion taxonomy, report definitions, and cross-device persistence/concurrency/notification behavior. See WCAP-001 specification §10.2 before treating any of these as an integrated capability.
