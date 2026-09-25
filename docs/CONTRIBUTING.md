# Contributing to Wind Creek App

This repository is a Next.js 16 App Router and TypeScript starter with a working Wind Creek brand kit. The rendered app still shows the generated Next.js page. Product screens and integrations should be added from an explicit task or specification, with assumptions kept visible.

## Start locally

Use the Node.js version supported by the installed Next.js release. Install from the committed lockfile:

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. The available scripts are `dev`, `build`, `start`, and `lint` in `package.json`; there is no test script yet. Do not mix package managers or regenerate `package-lock.json` without a dependency change.

Before using a Next.js API or file convention, read the relevant page in `node_modules/next/dist/docs/01-app/`. This installed version may differ from examples found elsewhere. In particular, `npm run lint` invokes ESLint directly; `next lint` is not used in Next.js 16.

## Where things belong

| Path | Purpose |
| --- | --- |
| `app/` | App Router pages, layouts, route-specific UI, metadata, and global styles. |
| `public/` | Static files intentionally served by the app. Current Next.js sample files remain here. |
| `brand-kit/` | Working brand decisions, CSS tokens, evidence, and asset inventory. Start at `kit.yaml`. |
| `_PROJECT/tasks/` | Task-specific requests, specifications, and inputs when supplied. These may be untracked work in progress. |
| `_PROJECT/assets/` | Separately supplied identity assets. Review their intended use before publishing. |
| `docs/` | Contributor and long-lived repository documentation. |

Keep a route's components and data close to that route at first. Create shared folders only for code genuinely used across routes. The `@/*` TypeScript alias points to the repository root. Keep server data access out of client components; introduce `"use client"` at the smallest useful interaction boundary.

## Add or change a feature

1. Read the current task and relevant inputs. Distinguish required behavior from example data, design references, and unresolved decisions. If task documents disagree, use the current request and record the decision made.
2. Map the affected route, UI states, data model, and integrations before editing. Represent loading, empty, error, and success states where the feature needs them. Do not imply that a local fixture persists or calls a real service.
3. Use `brand-kit/experience.md`, `design.md`, `patterns.md`, and `theme.css` as working design guidance. The kit describes evidence and gaps; it does not define application workflows. Prefer real semantic controls over screenshot-derived graphics.
4. Build for desktop and narrow screens. Check text wrapping, keyboard access, focus visibility, labels, contrast, and any modal or disclosure behavior. Keep user-facing copy clear about what the app actually does.
5. Update related documentation when adding routes, commands, configuration, dependencies, data contracts, or operational assumptions. Replace starter README content as the product takes shape.

When using artwork, prefer supplied source files over extracting shapes from reference captures. The brand kit marks many observed images and graphics as reference-only. A file's presence in `_PROJECT/assets/` does not by itself establish permission for unrelated reuse or redistribution. Keep third-party images, fonts, and sensitive inputs out of the public app until their use is established for the task.

## Verify and submit

Run the checks that apply to the change:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

For visual or interactive work, also inspect the app in a browser at desktop and narrow widths and walk through the changed states. Add focused automated tests when behavior would be easy to regress; establish a test runner only when needed. If a check cannot run, explain why and what was checked instead.

Before handing off, review `git diff` and `git status`. Keep unrelated edits and task inputs intact. Summarize the behavior changed, checks performed, and any open integration or design questions. Do not commit `.env*`, generated `.next/` output, credentials, or private operational data.
