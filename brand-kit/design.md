# Wind Creek Hospitality — Design

Working kit r1. Rule metadata separates observation, inference and extension from authority.

## DES-001 | Keep a light neutral field with recognizable red accents

```yaml cek-rule
origin: inferred
authority: working
strength: required
area: recognition
contexts:
- all-web
- image-only
evidence:
- EV-001
- EV-002
- EV-005
- EV-006
- EV-007
- EV-017
depends_on:
- EXP-001
assets: []
```

**Decision:** Establish a white or very light gray field, dark gray readable text, and a restrained red accent for short headings, important controls and selected states. Use deeper red inside a primary-action treatment, not as a universal page background.
**Why / evidence:** These relationships recur across the supplied pages and state crops. The normalized sampled red is in theme.css; it is not asserted to be an official brand specification.
**Preserve / adapt:** In applications, reserve saturated red for priority and recognition. Use neutral grouping for everyday work. Photography may contain other colors without creating a new UI palette.
**Avoid:** Blue/purple gradients, automatic black-and-gold styling, red on every surface, or equating brand red with every error. Distinguish error meaning with words and icons.

## DES-002 | Contrast narrow display headings with readable body text

```yaml cek-rule
origin: observed
authority: working
strength: required
area: foundations
contexts:
- all-web
- image-only
evidence:
- EV-001
- EV-002
- EV-003
- EV-022
depends_on:
- DES-001
assets: []
```

**Decision:** Use tall, condensed, uppercase sans-serif treatment for short display headings and an ordinary mixed-case sans-serif for paragraphs, labels and dense information. Keep display hierarchy strong without setting an entire interface in capitals.
**Evidence / uncertainty:** This typographic relationship is visible. Actual family names, weights, loaded fonts, CSS sizes and tracking were not verified. The local-only font stacks and sizes in theme.css are chosen approximations, not recovered original fonts.
**Preserve / adapt:** A compact application title may use less display scale. Keep long labels, data and AI responses in the body treatment. If no condensed face is available, use the fallback and flag the fidelity limitation; never stretch text horizontally to imitate a missing font.
**Avoid:** Invented font attribution, shipping font files, remote-font dependence in local HTML, or shrinking body text to copy a scaled screenshot.

## DES-003 | Use restrained rectangles and purposeful boundaries

```yaml cek-rule
origin: inferred
authority: working
strength: required
area: recognition
contexts:
- all-web
- image-only
evidence:
- EV-001
- EV-002
- EV-003
- EV-004
- EV-005
- EV-006
- EV-007
depends_on:
- DES-001
assets: []
```

**Decision:** Favor square or subtly rounded surfaces, thin separators and clear alignment. Reserve shadows for meaningful emphasis, such as supplied button hover states. Identify groups first with spacing and tonal surfaces; use containers when content genuinely belongs together.
**Why / evidence:** The source contains restrained cards, grouped benefits, row rules and low-radius controls. These are contextual choices, not a requirement to box every element.
**Preserve / adapt:** Keep the contrast between quiet surroundings and an emphasized action. A table can replace a card grid in a work tool without losing recognition.
**Avoid:** Pill-shaped everything, glass blur, floating oversized panels, gratuitous 3D buttons, nested borders or source-card repetition without a grouping purpose.

## DES-004 | Keep hierarchy, alignment and breathing room explicit

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: composition
contexts:
- all-web
evidence:
- EV-001
- EV-002
- EV-003
- EV-004
depends_on:
- DES-002
- DES-003
assets: []
```

**Decision:** Use a clear introduction, a dominant content region, supporting detail and a next action. Marketing examples pair copy with imagery, then shift into discovery or structured benefits. They do not prove one mandatory page template.
**Preserve / adapt:** The homepage introduction is centered within its text column; the corporate introduction is left-aligned. Choose alignment by reading task. Keep related edges aligned and separate major sections more than items within a section. The content maximum and spacing expressions are selected defaults.
**Application extension:** Reduce marketing-scale gaps for repeated work, keep text left-aligned, and let a table or workspace widen when requirements justify it. Editorial reading columns stay narrower than data regions.
**Avoid:** Copying a large site header/footer into every tool, imposing equal cards on all content, or calling screenshot raster dimensions source CSS measurements.

## DES-005 | Express control states without guessing their triggers

```yaml cek-rule
origin: extended
authority: working
strength: required
area: interaction
contexts:
- all-web
evidence:
- EV-005
- EV-006
- EV-007
- EV-008
- EV-009
depends_on:
- DES-001
- DES-003
assets: []
```

**Observed basis:** Supplied button pairs establish appearances described by the user as normal and hover. A selected navigation underline, an open menu, an emphasized menu row and a field halo/caret are visible. They do not establish event handlers, animation duration, keyboard support or loading behavior.
**Decision:** Preserve these visual relationships and implement semantic controls with visible keyboard focus, persistent labels, a clear selected state and text feedback. A pale halo alone is insufficient for the selected prototype focus treatment; add the stronger outline tokens.
**Selected defaults:** Click/tap and keyboard disclosure, Escape to close, stable geometry on hover, comfortable control height, and short optional transitions. Respect reduced motion. No production form submission occurs in a local demo.
**Avoid:** Hover-only access, conflating focus with error, hidden labels, animated decoration or claims that these extensions were tested on the source website.

## DES-006 | Reflow the hierarchy rather than miniaturizing it

```yaml cek-rule
origin: extended
authority: working
strength: required
area: responsive
contexts:
- all-web
evidence:
- EV-001
- EV-002
- EV-003
depends_on:
- DES-004
- DES-005
assets: []
```

**Decision:** Treat desktop 1440×900 and mobile 390×844 CSS pixels as future prototype working targets, not source measurements. Support intermediate widths; these targets are not promises about image-generation output size.
**Reason:** Supplied full-page captures are desktop-shaped, including the narrow exported Rewards files. Their small raster widths do not demonstrate a mobile layout. A live mobile render was not obtained.
**Apply:** Stack paired content in reading order; reduce display scale; keep actions reachable; wrap or disclose navigation with an explicit control. Keep table labels and category context when using a locally scrollable table or a deliberately transformed comparison.
**Preserve / adapt:** Select breakpoints where content actually stops fitting. Do not assign a supposed source breakpoint. Keep all required content reachable.
**Avoid:** A scaled desktop screenshot, clipping labels, or hiding required work just to fit a phone.

## DES-007 | Extend the brand into work tools without importing a marketing shell

```yaml cek-rule
origin: extended
authority: working
strength: required
area: adaptation
contexts:
- web-app
evidence:
- EV-003
- EV-004
- EV-005
- EV-006
- EV-009
depends_on:
- EXP-002
- EXP-004
- DES-001
- DES-002
- DES-003
- DES-005
- DES-006
assets: []
```

**Decision:** Keep a light workspace, recognizable red action/selection accents, subdued grouping and a restrained condensed title. Let the functional specification determine navigation, panels, data density and the primary task.
**Reason:** Public controls and structured Rewards content supply useful visual precedents, but no authenticated working application was visually inspected.
**Apply:** Use ordinary sans-serif labels and tabular numerals for records. Data comparisons require explicit units and legends. Status colors in theme.css are selected functional extensions; rewards tier colors are not a universal status palette. Use task-specific neutral error/loading/empty text.
**Preserve / adapt:** One dominant primary action per local task area is a working default, not a restriction on large workflows. Omit decorative imagery when it competes with information. Exact identity may remain an explicit placeholder until an authorized file is supplied.
**Avoid:** Mandatory casino imagery, claims of AI capability absent from requirements, or turning a prototype adaptation into new permanent brand authority.

## DES-008 | Treat identity and decoration as separate asset roles

```yaml cek-rule
origin: inferred
authority: working
strength: required
area: recognition
contexts:
- all-web
- image-only
evidence:
- EV-001
- EV-002
- EV-010
- EV-014
depends_on:
- DES-001
assets: []
```

**Decision:** The observed header uses a red mark with a horizontally set Wind Creek wordmark. Preserve an authorized original's proportions and variant when supplied. Do not rebuild it from text, a screenshot crop or image generation and call it original.
**Asset boundary:** No standalone original logo, wordmark, mark or favicon is delivered. The footer's linear emblem, pale angular pattern, textured image backplate and rewards-card art are distinct artwork roles, not interchangeable logos. Missing permissions or bytes are local asset gaps.
**Preserve / adapt:** A labeled identity placeholder or plain non-logo brand-name text can support planning; neither is an approved replacement identity. A plain red rectangle can replace optional textured decoration without recreating proprietary artwork.
**Avoid:** Isolating a mark from a screenshot, inventing a reversed logo, treating decorative diamonds as tribal symbols, or forwarding original photographs/artwork under the kit's guidance permission.

## IMG-001 | Hospitality moments: recognizable setting, human interaction

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: imagery
contexts:
- web-marketing
- web-editorial
- image-only
evidence:
- EV-001
- EV-003
depends_on:
- EXP-001
- DES-008
assets: []
```

**Purpose:** Guest-facing introductions and experience stories; omit imagery in dense work areas unless it explains the task.
**Subject / setting:** Adults sharing an authentic hospitality moment in a legible resort, dining or casino setting. Visible faces, gestures and contextual equipment matter more than generic luxury props.
**Composition / viewpoint:** A medium or medium-wide eye-level, three-quarter view; one clear human focal group. Keep adjacent live copy on its own surface where possible. Leave crop tolerance around heads and hands; locate the focal group so a mobile crop remains meaningful.
**Light / treatment:** Warm practical light and believable skin, with contextual color from the venue. Keep highlights controlled, realistic textures and naturally engaged expressions; avoid excessive bloom or retouching.
**Placement / crop:** Landscape hero or feature imagery; a portrait crop requires deliberate subject placement. Exact ratio and output dimensions belong to the screen spec, not an inferred source measurement.
**Authenticity / reuse:** Existing client scenes need authorized originals. Generated alternatives must be plainly illustrative, with fictional people and unbranded settings; they must not claim a specific actual venue, customer, win or event. No minors in gambling scenes, fabricated logos or promised outcomes.

## IMG-002 | Property photography: make the destination identifiable

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: imagery
contexts:
- web-marketing
- web-editorial
- image-only
evidence:
- EV-001
depends_on:
- DES-008
assets: []
```

**Purpose:** Location discovery or factual property context; not generic decoration for unrelated records.
**Subject / setting:** A real property exterior and its immediate setting. The supplied grid uses buildings, grounds and coastal context to differentiate destinations.
**Composition / viewpoint:** Elevated or aerial views when they reveal the property; otherwise a clear exterior viewpoint. Retain identifying architecture and environmental context. Leave sufficient margins for a location caption outside or at the edge of the image.
**Light / treatment:** Credible daylight or contextual evening exposure, natural material color and clear spatial separation. Do not force every climate or property into one artificial color grade.
**Placement / crop:** Landscape discovery tiles or wider property features. Preserve the main building when moving to narrower crops; use another authorized crop when the identifier would disappear.
**Authenticity / reuse:** Named-property images require actual, authorized source files. Generation cannot supply documentary proof of a Wind Creek property. A generic illustrative resort image must be labeled and cannot be captioned as a real location. No invented signage, facilities or awards.

## IMG-003 | Corporate and community imagery: show a real human purpose

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: imagery
contexts:
- web-marketing
- web-editorial
- image-only
evidence:
- EV-002
- EV-012
depends_on:
- EXP-001
- DES-008
assets: []
```

**Purpose:** Service, careers, community and corporate stories; use imagery to explain the activity, not merely to add a smiling person.
**Subject / setting:** A service exchange, a collaborative gesture or an evidenced corporate/community event. Distinguish an illustrative hands-together image from documentary event or heritage photography.
**Composition / viewpoint:** Eye-level or modest contextual elevation. Show the interaction and enough environment to understand it; for gestures, keep hands anatomically readable. Leave a separate caption area and crop margins around faces, hands and relevant objects.
**Light / treatment:** Natural or believable event light, clean neutral rendering and human texture. Preserve authentic uniforms, settings and context only through authorized originals.
**Placement / crop:** Editorial feature, story tile or corporate split introduction. Choose landscape or portrait according to the real source and story; do not force a crop that removes essential context.
**Authenticity / reuse:** Do not identify pictured people from appearance, invent client employees or leaders, or generate documentary-looking tribal heritage, regalia or ceremonies as decoration. Use approved cultural material with its context; a fictional service illustration must be labeled and unbranded.

## IMG-004 | Support graphics stay behind the content

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: imagery
contexts:
- all-web
- image-only
evidence:
- EV-001
- EV-002
- EV-010
depends_on:
- DES-001
- DES-008
assets: []
```

**Purpose:** Optional visual continuity in marketing transitions; normally omit in operational workspaces.
**Subject / setting:** Abstract supporting geometry, not a photographed scene. Sources show a textured red backplate offset behind an image, light angular footer lines and a small linear divider emblem.
**Composition / viewpoint:** Flat supporting plane, no camera viewpoint. Keep the principal image/text as the focal content, abundant clear space, and decoration away from labels. A backplate can show at the left and bottom edges without surrounding every image.
**Light / treatment:** Low-contrast neutral linework or a restrained red field. Avoid metallic gloss, gold, excessive sparkle and full-screen texture.
**Placement / crop:** Section background, image edge or divider; it should crop or disappear without losing information. The offset token is selected, not measured source geometry.
**Authenticity / reuse:** The supplied texture is actual reference material but not permission-cleared reusable artwork; it is not included. Use a plain CSS red plane or omit it. Do not trace the exact mesh or divider emblem, reconstruct identity artwork, or describe a newly generated graphic as an original brand asset.

