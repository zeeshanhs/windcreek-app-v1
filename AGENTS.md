<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Repository guidance for Codex

## Before changing the app

- Read the current user request, `git status`, and the files you will change. Preserve unrelated work, including untracked files in `_PROJECT/tasks/`.
- This repository is an early Next.js 16 App Router starter, not an implemented product. Do not infer completed screens, APIs, authentication, persistence, or tests from planning documents.
- For every Next.js feature you touch, read its relevant guide in the installed `node_modules/next/dist/docs/01-app/` first. Follow the version in `package.json` and the lockfile, not remembered framework conventions.
- Read [the contribution guide](docs/CONTRIBUTING.md) for the development workflow and extension rules.

## Source map and authority

- `app/page.tsx` is the current starter route; `app/layout.tsx` owns the root layout and metadata; `app/globals.css` contains the current Tailwind import and starter styles. `public/` still contains starter assets.
- `brand-kit/kit.yaml` is the entry point for the Wind Creek working kit. Follow its links to `experience.md`, `design.md`, `patterns.md`, `theme.css`, and the asset and evidence indexes. The kit records observed, inferred, and extended guidance with *working* authority; it is not an approved identity manual or a product specification.
- `_PROJECT/tasks/<task-id>/` contains task-specific requests and inputs when present. Read the relevant task before implementing it. Task material can be incomplete or untracked; do not silently promote one task's assumptions into repository-wide requirements. The current user request and later explicit decisions govern conflicts.
- `_PROJECT/assets/` contains supplied identity files. Check the intended task and asset provenance before publishing or copying them into `public/`. The brand kit's reference-only asset inventory predates these separately supplied files; neither source grants general reuse rights to other artwork seen in screenshots.
- `README.md` is still the generated starter README. Do not treat it as product documentation until it has been updated.

## Implementation defaults

- Keep route files and layouts in `app/`. Add route-specific components near their route; move components or utilities into shared directories only when reuse is real. Use the existing `@/*` alias for root-relative imports.
- Keep React Server Components by default. Add `"use client"` only at the interactive boundary that needs state, handlers, or browser APIs. Keep secrets and privileged data access on the server.
- Use TypeScript's strict settings; model domain data and states explicitly. Do not present demo fixtures or simulated responses as live integrations or verified operational data.
- Use semantic HTML and accessible names, keyboard operation, visible focus, and responsive layouts. Apply the kit's hierarchy and tokens deliberately; do not paste reference screenshots as UI or recreate unprovided brand assets.
- Keep changes focused. Avoid new dependencies, global styles, routes, or product behavior without a task need. If requirements are ambiguous, document the chosen assumption near the change or in the task handoff.

## Checks and handoff

- For code changes, run `npm run lint` and `npx tsc --noEmit`; run `npm run build` when the changed behavior warrants a production check. For UI changes, inspect the result at desktop and narrow widths and exercise affected interactions.
- There is no test script yet. Add meaningful tests with a feature when they protect behavior; do not report a test suite as passing when none exists.
- Report what changed, what you verified, and any remaining limitation. Keep generated output, secrets, and local environment files out of commits.
