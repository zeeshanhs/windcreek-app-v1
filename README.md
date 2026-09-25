# AskPat operational prototype

AskPat is a **fictional, browser-local** Wind Creek Hospitality prototype for service orders and personal AI conversations. It implements the WCAP-001 screen specification as a connected Next.js 16 App Router application. No real employee accounts, property records, HotSOS calls, AI inference, equipment diagnosis, source retrieval, image recognition, or document ingestion are connected.

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
| `/orders` | Shared fictional service-order queue |
| `/orders/new` | Guided order creation |
| `/orders/:orderId` | Selected order, remarks, history, chat and closure actions |

Dialogs use the parent URL with `?panel=order`, `?panel=close-order`, `?panel=photo`, or `?panel=source&sourceId=…`. Browser Back dismisses an opened dialog. The source viewer presents the authored DF-S01/02/03 training text where available. The referenced `ahu1-points.pdf` is absent and has an unavailable state.

## Demo data and reset

Six orders and Morgan's five chats are seeded from the WCAP-001 specification. Sam has his own SO #1042 chat. Avery can create SO #1043 and a distinct linked chat. Order status is only Open or Closed; closing does not end a conversation or prove a repair.

Committed demo records live in this browser's IndexedDB and remain across route changes, account switches, and reloads. **Reset demo** in the account menu restores the initial fixture. Open tabs are notified of committed changes, and each write rechecks the local store. Other browsers and devices have separate data. Browser storage can be cleared or unavailable; there is no server-side persistence, production authorization, or cross-device synchronization.

The demonstration clock begins at 24 Sep 2026, 10:30 UTC and advances deterministically with actions. Answers and sources are scripted training specimens. A sent photo remains a local chat attachment and is not uploaded to a knowledge base. The photo control accepts one PNG or JPEG up to 10 MB per message.

For recovery-state review, add `?simulate=` to the relevant route. Supported values are `create-failed`, `create-uncertain`, `close-failed`, `close-uncertain`, `send-failure`, `answer-failure`, `fault-log-failure`, `source-load-failed`, and `order-context-failed`. Mutation faults occur once per opened form or chat route so the same request can be retried. `/login?reason=expired` and `/login?reason=unavailable` show the corresponding sign-in states. These switches affect only the local demonstration.

## Checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

`npm test` exercises the core fixture, idempotent order creation/closure/remarks, linked-chat identity, and grounded response rules. Browser inspection is still required for responsive layout, dialogs, keyboard behavior, and the full AT-01–AT-38 acceptance scenarios.

## Production dependencies

This prototype leaves open the real identity and record-access policy, service-order create/close/remark API contracts, verified issue/location catalog, authorized source documents and versions, approved AI/retrieval and visual-validation services, unknown-fault retention/governance, ingestion taxonomy, report definitions, and cross-device persistence/concurrency/notification behavior. See WCAP-001 specification §10.2 before treating any of these as an integrated capability.
