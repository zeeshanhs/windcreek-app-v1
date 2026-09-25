# WCAP-002 — Add the scripted AHU-15 AskPat scenario and citation viewer

## Outcome

Add a preloaded, readable AskPat conversation for **“AHU-15 Drops Off the BMS”** to the existing Wind Creek prototype. A reader can follow the complete Marcus/AskPat exchange and open every inline citation in a document viewer showing the corresponding **full, unhighlighted page image**. The experience must work on desktop and phones, including zooming and navigating a large drawing on a narrow screen.

This is a **scripted demonstration**, not a live conversation, equipment diagnosis, BMS connection, or ticket submission. The source transcript says “Logged”; display that as part of the authored scenario, while the surrounding UI makes clear that no real or prototype service order is created by viewing it.

## Source of truth and scope

1. [`task_request.md`](task_request.md) defines the business goal and the six supplied citation files.
2. [`inputs/AskPat Scenario AHU-15 Drops Off the BMS (US-09).md`](inputs/AskPat%20Scenario%20AHU-15%20Drops%20Off%20the%20BMS%20%28US-09%29.md) supplies the **six Marcus messages, six AskPat replies**, their order, the Marcus timestamps, the ticket summary, and the citation markers. Preserve the authored wording and technical caveats. Remove Markdown escape characters only where needed to render the intended text, lists, emphasis, and links. Do not silently rewrite the troubleshooting advice or add new technical claims.
3. [`inputs/citations/`](inputs/citations/) supplies the actual JPEG page images. The referenced PDFs are not present; this task displays the supplied images, not a reconstructed PDF.
4. WCAP-001's implemented app, [`refined_task_request.md`](../WCAP-001/refined_task_request.md), and [`implementation_handoff.md`](../WCAP-001/implementation_handoff.md) define the current prototype's personal chats, fictional accounts, browser-local storage, and source-viewer conventions. Keep those behaviors intact. Use `brand-kit/kit.yaml` and its linked guidance as working visual direction, subject to repository `AGENTS.md` and `docs/CONTRIBUTING.md`.

### Resolved product interpretation

Implement this as a **read-only scenario**, reachable from the existing `/chats` experience through a clearly labeled “AHU-15 scripted scenario” entry and directly at `/scenarios/ahu-15`. Reuse the chat reading hierarchy and app shell where practical. Keep the scenario distinct from the signed-in user's personal chats: it must not appear in personal chat counts or General/Order-linked filters, acquire a `Chat`/`Order` record, use the composer, or be modified by demo reset. Marcus is the character in the supplied transcript, not a new sign-in account. The entry remains available to any signed-in demo user; the current sign-in gate applies to direct navigation.

The page should identify the scenario as **Scripted example · fictional incident**, show its title and US-09 context, and then the conversation in source order. The transcript starts at 2:14 PM and ends at 2:55 PM; use only timestamps supplied by the source. Present the supplied ticket summary and its three follow-ups after the final reply under a heading such as **Scenario ticket summary**, visibly marked as scripted. Do not add a working “Log ticket,” “Reset breaker,” or “Send” control to this page. Existing live-demo chat and service-order actions elsewhere in the app remain governed by WCAP-001.

## Conversation and citation contract

- Render all twelve messages, maintaining speaker identity, paragraph breaks, ordered steps, bold emphasis, and the distinction between observed facts, inference, and drawing discrepancies. AskPat replies should render as formatted content, with no raw `**`, backslash escapes, or bare `[1]` citation tokens visible.
- Every occurrence of `[1]` through `[6]` in an AskPat reply is an inline, keyboard-operable citation control at that exact point in the text. Repeated uses of the same number open the same page. Do not replace citations solely with a detached reference list.
- Give each control an accessible name such as “Open citation 3, AHU-15 Control Panel-1, PDF page 148.” The visible marker can remain `[3]`. Its purpose must also be apparent by focus styling, not color alone.
- A missing or failed image produces a clear unavailable/retry state with document and page metadata. Never show a different page as fallback, a fabricated extract, or an empty viewer that appears successful.

Use this exact citation map; **sheet numbers and PDF page numbers are different labels**:

| Marker | Document and sheet label | PDF page | Supplied image |
| --- | --- | ---: | --- |
| `[1]` | BAS-Niagara Wind Creek Casino HVAC Controls · Sheet 15 of 276, Casino BAS Network-4 | 22 | `BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-22.jpg` |
| `[2]` | BAS-Niagara Wind Creek Casino HVAC Controls · Sheet 6 of 276, BAS Network Switches Connectivity | 13 | `BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-13.jpg` |
| `[3]` | BAS-Niagara Wind Creek Casino HVAC Controls · Sheet 141 of 276, AHU-15 Control Panel-1 | 148 | `BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-148.jpg` |
| `[4]` | BAS-Niagara Wind Creek Casino HVAC Controls · Sheet 143 of 276, AHU-15 Points List-1 | 150 | `BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-150.jpg` |
| `[5]` | BAS-Niagara Wind Creek Casino HVAC Controls · Sheet 268 of 276, Sequence of Operation-11 (AHU-7, 9–16 VAV) | 275 | `BAS-Niagara_Wind_Creek_Casino_HVAC_Controls_page-275.jpg` |
| `[6]` | UPDATED M Series – Mechanical · Sheet M0.29, Mechanical Schedules, Air Handling Unit Schedule | 30 | `UPDATED_M_Series_-_Mechanical_page-30.jpg` |

The original task's link text for citation `[6]` contains escaped characters that do not match the file name. Resolve it to the actual file above. Copy only these task-supplied page images into an intentional app-served asset location if needed; preserve enough resolution to read the drawings at zoom. Do not use unrelated art or treat the brand kit's reference-only imagery as product assets.

## Document viewer behavior

- Open a citation in a dedicated dialog/sheet associated with the scenario, addressable as `/scenarios/ahu-15?panel=citation&citation=N` for `N` from 1 to 6. A direct valid URL opens the same page; browser Back closes a viewer opened from the transcript. Invalid citation values show an unavailable state and never expose unrelated app sources.
- Show the citation number, document title, sheet label, and PDF page number outside the image. At the default **Fit page** setting, the entire page image and its edges are visible. The drawing is never cropped to the cited detail.
- Provide labeled **Zoom in**, **Zoom out**, and **Fit page/reset** controls with a visible zoom state. Zooming must support reading small drawing text without losing the original image detail. At enlarged scales, permit panning in both directions; keep controls reachable while the page is panned. On touch screens, provide usable pinch zoom or equivalent accessible zoom buttons and touch panning. Prevent the image from forcing horizontal scrolling of the app page.
- **No highlighting of any kind** on the citation image: no boxes, tinted areas, spotlight, pins, selected rows, text overlays, or automatic crop/scroll-to-region. Metadata and controls may sit around the image, not over the drawing content.
- The viewer works at desktop and narrow widths, including a 390px phone and 320px stress width. On phones it should use the available screen height as a full-screen sheet, allow scrolling/panning, respect safe areas, and keep Close and zoom controls usable. Preserve the scenario's reading position on close; restore keyboard focus to the citation control that opened it. Escape and the Close control dismiss it.
- Load the chosen page when needed rather than eagerly loading all six high-resolution images. Provide a loading state and an image-error state. Do not invent PDF download, search, text selection, page turning, or annotation controls for these JPEG-only inputs.

## Implementation boundaries

Keep scenario content and citation metadata in one typed, maintainable source so markers, labels, and image paths cannot drift. Render the trusted authored transcript as semantic headings, paragraphs, and lists with explicit citation components. Preserve React Server Components by default; place client state at the viewer/navigation boundary. Before changing a Next.js route, asset, or URL convention, read the relevant installed guide under `node_modules/next/dist/docs/01-app/` as required by repository guidance.

Use the existing prototype's light neutral surfaces, restrained red, readable body type, and visible focus treatment. Keep the conversation dominant on desktop and in a single readable column on mobile. Do not add a new global navigation system or change personal-chat storage to host this static scenario.

## Acceptance scenarios

| ID | Action | Required result |
| --- | --- | --- |
| AC-01 | Sign in with any existing demo account and open the scenario from `/chats`; also load `/scenarios/ahu-15` directly. | Both paths show the same scripted page; an unsigned visitor follows the current sign-in flow. |
| AC-02 | Read the page from top to bottom. | All six Marcus messages, six AskPat replies, their source order and supplied timestamps, the ticket summary, and three follow-ups are present. Markdown is rendered; no raw formatting markers remain. |
| AC-03 | Activate each distinct marker `[1]`–`[6]`, including repeated markers. | Every instance opens the mapped full JPEG page with correct document/sheet/PDF-page metadata. Citation `[6]` loads the actual mechanical file. |
| AC-04 | Open a citation, zoom in twice, pan to an edge, zoom out, and choose Fit page. | Detail becomes readable; pan and controls work; Fit page shows every image edge. No highlight, crop, or overlay is applied to the drawing. |
| AC-05 | Repeat AC-03/04 at desktop, 390px, and 320px widths; use keyboard only for one citation. | Transcript and viewer remain readable, app page has no horizontal overflow, controls are reachable, Escape/Close and Back dismiss correctly, and focus/reading position return. |
| AC-06 | Open a direct citation URL with a valid number, then an invalid number or simulate an image failure. | Valid URL loads its page; invalid/failure state identifies the unavailable citation and provides a way back or retry without substituting a page. |
| AC-07 | Visit personal chats and orders before and after viewing the scenario, then use Reset demo. | Their counts and records do not change from viewing this scenario; no new chat, service order, message, or ticket is created. |

## Verification and handoff

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Use the existing test command for focused logic tests only where they protect citation mapping, transcript completeness, or route behavior; do not add snapshot tests that merely restate the fixture. Inspect the actual browser UI at desktop and narrow widths and exercise the viewer with mouse, touch simulation, and keyboard. Report each acceptance scenario's result, any unverified device gesture or browser behavior, and the scripted/no-integration boundary. Review `git diff` and `git status`, preserving unrelated task files and local data.
