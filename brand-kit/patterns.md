# Wind Creek Hospitality — Patterns

Working kit r1. Rule metadata separates observation, inference and extension from authority.

## PAT-001 | Action hierarchy: filled, outlined and quiet

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: pattern
contexts:
- all-web
evidence:
- EV-005
- EV-006
- EV-007
- EV-020
depends_on:
- DES-001
- DES-003
- DES-005
assets: []
```

**Use / order:** Choose a filled action for the main local commitment, an outline for an important secondary route, and a text action for quieter navigation. The source labels are examples, not mandatory actions in a future system.
**Anatomy:** Short ordinary sans-serif label; optional functional icon; stable padding; low-radius edge. Filled uses on-action white with the normalized red fill; outline uses red text/border; quiet uses red text on the surrounding light surface.
**States:** Preserve the supplied hover relationships. Focus gets a separately visible keyboard treatment. Loading, disabled and success are task-local extensions with explicit text; a hover shadow does not imply click behavior.
**Responsive:** Allow labels to remain legible, wrap action groups or stack them, and maintain the selected control minimum. Do not shrink a label to preserve a desktop row.
**Adapt / assets:** Use real semantic controls, never screenshot button bitmaps. Generic icons may be authored or drawn from an authorized library; the source icon font is not supplied.

## PAT-002 | Navigation disclosure with a persistent active marker

```yaml cek-rule
origin: extended
authority: working
strength: default
area: pattern
contexts:
- all-web
evidence:
- EV-008
- EV-021
depends_on:
- DES-004
- DES-005
- DES-006
assets: []
```

**Use / order:** For a genuine hierarchy requiring a short submenu, name the current section, show its selected underline, then disclose child destinations. The source contains Overview, Community Support, Careers and News; these are not application navigation requirements.
**Anatomy:** Plain-text trigger plus directional indicator; understated light popup; vertically arranged rows separated by thin rules; a distinct emphasized row.
**States / behavior:** Selected, closed, open and row emphasis are visually anchored. Implement click/tap and keyboard disclosure, correct expanded-state semantics, Escape closing and focus return as chosen extensions. Do not assert that hover alone opens the source.
**Responsive:** Put the same routes in a reachable mobile disclosure instead of squeezing desktop navigation. Keep current-location indication.
**Adapt / assets:** Number and naming of routes follow the system. An ordinary navigation list with disclosure is sufficient; do not impose complex application-menu semantics on simple website links. Use a generic caret, not an extracted icon-font dependency.

## PAT-003 | Marketing introduction: live copy beside optional imagery

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: pattern
contexts:
- web-marketing
- web-editorial
evidence:
- EV-001
- EV-002
- EV-022
depends_on:
- DES-002
- DES-004
- DES-006
- DES-008
assets: []
```

**Use / order:** For a page introduction, place a quiet identifying eyebrow, short display title, explanatory body and a relevant next action when needed. Pair with an image only when it adds useful human or place context.
**Anatomy:** Two related columns, not necessarily equal; text is centered for a short promotional statement or left-aligned for explanatory corporate copy. Optional red backplate supports—not replaces—the image. The title remains live text; no original flattened title-image file was established.
**States / behavior:** Static reading and any real link/action; no autoplay, carousel, parallax or animation is inferred.
**Responsive:** Stack in the intended reading order, reduce the headline scale and retain image focal context. Use a different authorized crop when needed.
**Adapt / assets:** Choose IMG-001, IMG-002 or IMG-003 by purpose. Imagery may be omitted or explicitly placeholdered without blocking the introduction. Do not use this marketing pattern as a required application shell.

## PAT-004 | Comparison and benefit groups use meaning before color

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: pattern
contexts:
- all-web
evidence:
- EV-003
- EV-004
- EV-023
depends_on:
- EXP-003
- DES-003
- DES-005
- DES-006
assets: []
```

**Use / order:** When alternatives must be compared, show the category/benefit label first, then aligned values by named alternative. For a set of related benefits, group the collection on a white surface with quiet interior tiles when that grouping improves scanning.
**Anatomy:** Clear headings, thin row rules, lightly tinted category columns and explicit words or symbols. Small red icons can cue benefit types. Rewards colors are scoped to their named tiers; do not automatically use them for unrelated categories.
**States / behavior:** The two supplied Rewards captures show different tab selections. Use proper tabs only when content is actually switched; provide selected, focus and relevant empty states. Runtime switching was not exercised on the source.
**Responsive:** Preserve row/category association; choose an accessible scroll region or a readable alternative-by-alternative layout rather than microscopic text.
**Adapt / assets:** Labels, values, units and conditions come from the future requirements and consistent demonstration data. Do not copy promotional figures from these screenshots or claim their continued validity.

## PAT-005 | Fields explain their purpose and preserve clear focus

```yaml cek-rule
origin: extended
authority: working
strength: default
area: pattern
contexts:
- all-web
evidence:
- EV-009
- EV-021
depends_on:
- EXP-002
- DES-005
- DES-006
assets: []
```

**Use / order:** For input tasks, show a persistent label, the field, concise help when needed and validation feedback adjacent to the affected field. Put the primary submission action after the required inputs.
**Anatomy:** White field, subtle gray edge, low radius and legible body text. The source focus reference includes a pale red halo, tinted edge and caret; preserve that association without relying on placeholder text as a label.
**States / behavior:** Neutral and focused appearances are observed. Required, invalid, disabled, submitting and success are deliberate future-task extensions. Communicate why input is invalid and how to recover. In local prototypes, state clearly when submission is simulated.
**Responsive:** Stack inputs and labels in reading order, keep controls within the viewport, and use appropriate semantic input types. Do not carry over an enormous source-crop size as a real control dimension.
**Adapt / assets:** Form fields require no photo or original graphic asset. No newsletter signup or other production form was submitted while building this kit.

## PAT-006 | Editorial and operational sections start with the reader’s task

```yaml cek-rule
origin: extended
authority: working
strength: default
area: pattern
contexts:
- web-app
- web-editorial
evidence:
- EV-002
- EV-003
- EV-004
depends_on:
- EXP-002
- EXP-004
- DES-002
- DES-004
- DES-005
- DES-006
assets: []
```

**Use / order:** In an article or working region, put the subject/title first, relevant context next, then the main text/table/result, with supporting sources or actions where needed. This is a compositional extension, not a specified screen.
**Anatomy:** A modest red or dark condensed heading, ordinary sans-serif content, white or neutral background, and tonal or ruled separation. Long-form text uses a reading width; information-heavy results may be wider.
**States / behavior:** Only include states the future system needs. An AI response should separate its answer from supporting evidence where the requirements provide evidence; do not imply citations or data exist when they do not.
**Responsive:** Preserve logical reading order, move secondary material below the main task, and retain access to required detail.
**Adapt / assets:** Decorative photography is optional and usually omitted. Full editorial pages and authenticated tools were not visually inspected; this recipe borrows the source hierarchy without inventing their architecture.

