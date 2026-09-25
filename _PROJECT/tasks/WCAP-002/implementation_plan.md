# WCAP-002 implementation plan — scripted AHU-15 scenario

> **Follow-up product decision:** The user's later request supersedes this plan's read-only, separate-page integration. AHU-15 now appears as a user-owned general chat in `/chats`, with the normal composer and browser-local follow-up messages. The authored opening and citation viewer remain source-controlled. `/scenarios/ahu-15` redirects to the chat. See [`implementation_handoff.md`](implementation_handoff.md) for the delivered behavior and verification.

## Objective and authority

Implement [`refined_task_request.md`](refined_task_request.md) in the current Next.js 16 AskPat prototype. The deliverable is a read-only, preloaded conversation at `/scenarios/ahu-15`, discoverable from `/chats`, with six working inline citation targets and a full-page, zoomable JPEG viewer. The source transcript, ticket summary, and supplied citation images are in [`inputs/`](inputs/). The refined request governs scope and acceptance; keep WCAP-001 personal chat and service-order behavior unchanged.

The worktree currently has the WCAP-002 refined request as an **untracked input**. Preserve it and all other task material. The existing app is implemented despite older wording in `docs/CONTRIBUTING.md`: `app/layout.tsx` mounts a client `AskPatApp`, route `page.tsx` files are placeholders, and `package.json` has an `npm test` command. Plan against the checked-in code rather than the older starter description.

The installed Next.js 16.3.6 guides for pages/layouts, Server/Client Components, public assets, images, and `useRouter` have been checked for this plan. Recheck the relevant installed guide before implementing any additional Next.js feature. The scenario route page can remain a Server Component placeholder under the current shell; do not restructure the root layout just to add this static scenario.

## Integration decisions

| Concern | Implementation decision |
| --- | --- |
| Route and access | Add `app/scenarios/ahu-15/page.tsx` for the direct URL. Route `/scenarios/ahu-15` through `AskPatApp` after its existing session gate so unsigned navigation still goes to sign-in and returns to the intended URL. Do not add Marcus to demo users. |
| Discoverability | Put a clearly named **AHU-15 scripted scenario** link in the `/chats` experience, separate from the personal chat list, search, filters, and counts. Keep it reachable in the mobile chat-list layout. |
| Data ownership | Keep the transcript and citations as versioned source-controlled content. Do not write scenario messages, ticket summary, or citation state into IndexedDB; `resetDemo` must have no effect on them. No `Chat`, `Order`, composer, send handler, or closure action is attached to the scenario. |
| Rendering | Use the existing app shell and chat typography, but give the scenario its own read-only body component near `app/scenarios/ahu-15/`. Keep the twelve messages, Marcus timestamps, summary, and three follow-ups in semantic reading order. |
| Viewer URL | Use exactly `/scenarios/ahu-15?panel=citation&citation=N`, with a strict 1–6 lookup. Extend the existing URL-panel routing only for this path; do not route its JPEGs through the WCAP-001 synthetic source viewer or accept arbitrary file paths from the query. |
| Asset delivery | Copy the six supplied JPEGs to a task-specific path such as `public/scenarios/ahu-15/`, preserving their original pixels and names. Load only the selected image. The original PDFs are absent, so the viewer presents a page image, sheet/PDF-page metadata, and no PDF-specific controls. |

The copied files will have direct static URLs, as is normal for `public/`. The existing browser-local sign-in is a prototype UI gate, not server-side asset authorization. Document that limit in the README/handoff; a real protected-document design needs production authentication and document-serving rules.

## Content model and fidelity

Create one typed scenario module near the route, for example `app/scenarios/ahu-15/scenario-data.ts`. It should contain:

- Citation records keyed by `1 | 2 | 3 | 4 | 5 | 6`, each with document title, sheet label, PDF page, public image path, natural width/height, and accessible citation name. Use the exact file map in the refined request; citation `[6]` uses the actual `UPDATED_M_Series_-_Mechanical_page-30.jpg` file.
- A twelve-entry ordered transcript (`speaker`, optional supplied `time`, and structured content blocks). Represent paragraphs, ordered lists, strong text, and inline citation tokens explicitly rather than storing rendered HTML or using a general Markdown parser. This allows each citation occurrence to be an actual link/button in its source position and avoids adding a dependency.
- The authored ticket summary and three follow-ups as display-only content. Label the incident and ticket summary as scripted. Preserve the final “Logged” reply verbatim while making the non-persistence boundary clear beside the transcript.

Transcribe from the scenario sheet once. Remove only Markdown escapes such as `\[3\]`, `15\.`, and `\#1` when converting them to presentation. Keep the source's uncertainty about “Switch-X,” the unknown breaker-trip cause, and the drawing fan-count discrepancy. Do not infer new equipment facts or change the operational advice. Check all twelve turns and every citation occurrence against the source after rendering; the reference table itself is metadata, not a substitute for inline links.

## Viewer design

1. Add a scenario-only citation panel in `app/askpat-panels.tsx` (or a small route component it invokes), guarded by the exact pathname and validated citation ID. Use the existing panel open/close pattern so an in-page click pushes a history entry, Back closes it, and a directly loaded panel closes by replacing the URL with `/scenarios/ahu-15`. Preserve the underlying reading scroll; restore focus to the triggering citation on ordinary dismissal.
2. Give this panel a dedicated dialog layout rather than inheriting the current source dialog's narrow reading body. Keep document metadata and Close/zoom controls outside the image scrollport, with a sticky or fixed toolbar that remains reachable while panning. Use full-screen mobile treatment with safe-area padding and an independently scrollable image viewport.
3. Start in **Fit page**, calculating displayed dimensions from the image's intrinsic size and available viewport. Expose Zoom in, Zoom out, and Fit page with a visible level. Increase displayed image dimensions within the scrollport rather than cropping or applying a highlight. Allow two-axis native scrolling/touch panning when enlarged; cap enlargement at approximately the supplied image's native pixel size so zoom does not merely blur an upscaled raster. Buttons plus touch panning satisfy the phone interaction requirement; pinch support is optional.
4. Serve the selected original JPEG at zoom-capable resolution. A `next/image` instance with `unoptimized` or an equivalent original-resolution image approach is preferable to requesting a small optimized derivative and enlarging it. Reserve the correct aspect ratio, show loading feedback, and report image load failure with the citation metadata and Retry/Close controls. Do not preload all six images (the mechanical sheet alone is roughly 4.6 MB).
5. Keep the entire page visible at Fit page, including all edges. Add no crop, locator jump, selected region, overlay, highlight, annotation, or PDF controls. Test the mechanical page and a controls page at high zoom to confirm small text remains inspectable.

## Build sequence and checkpoints

| Phase | Work | Reviewable checkpoint |
| --- | --- | --- |
| 1. Source and assets | Verify all six input names/dimensions; copy only those files; author typed citation metadata and structured transcript; verify source wording and link IDs. | A data review shows twelve ordered turns, three follow-ups, six valid citation IDs, and six existing image paths. |
| 2. Route and entry | Add route placeholder, scenario view, `AskPatApp` route branch, and separated `/chats` entry. Apply the existing auth gate and show the scripted label. | A signed-in user reaches the same transcript from the link and direct URL; an unsigned user is sent to sign-in; chat/order counts do not change. |
| 3. Citation panel | Wire inline controls to the exact query contract; implement full-page image, metadata, fit/zoom/pan, loading/error, history, focus return, and mobile sheet. | Each marker opens its correct page; Back/Close/Escape work; images are unhighlighted at fit and zoom. |
| 4. Polish and docs | Add narrowly scoped responsive/focus CSS, document the new route and static image/prototype limits in `README.md`, and review all source text. | Desktop and phone reading/viewing flows are complete without horizontal app overflow or clipped controls. |

Likely code touchpoints: `app/askpat-app.tsx`, `app/askpat-chats.tsx`, `app/askpat-panels.tsx`, `app/globals.css`, new files under `app/scenarios/ahu-15/`, six files under `public/scenarios/ahu-15/`, and `README.md`. Keep modifications to `lib/askpat/fixtures.ts`, `store.ts`, and `responses.ts` unnecessary; the scenario is static and separate from their domain model.

## Verification and exit criteria

- Cover **AC-01–AC-07** from the refined request in a browser. Check desktop (1440×900), intermediate width (around 768px), phone (390×844), and 320px stress width. On the phone, verify zoom-button use and touch panning in the actual viewer; if only touch simulation is available, record that limit.
- Check every marker and repeated occurrence against the six-image mapping, with special attention to `[6]`; confirm the viewer displays both the drawing sheet label and the distinct PDF page number. Force an image error and an invalid `citation` value to inspect recovery states.
- Exercise keyboard Tab/Enter, visible focus, Escape, browser Back/Forward, direct viewer URL, close/focus return, and transcript scroll preservation. Verify the page image has no highlighting at fit or zoom and that its edges are visible at Fit page.
- Check the existing personal-chat list/filter/count, one linked chat, and the service-order count before and after scenario viewing and `Reset demo`. No scenario interaction should cause an IndexedDB mutation.
- Add focused `npm test` coverage only for consequential invariants such as twelve-turn completeness, valid citation references, and six unique mapped files if the data shape makes those checks valuable. Avoid snapshot tests that merely repeat the transcript. Run `npm run lint`, `npx tsc --noEmit`, `npm test` when tests are added or affected, and `npm run build`.
- Review `git diff` and `git status`; keep supplied inputs and unrelated files intact. In the implementation handoff, record AC-01–AC-07 results, any browser/device checks not completed, the image-serving and prototype-auth limits, and the fact that “Logged” is only scripted text.
