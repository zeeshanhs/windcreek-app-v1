# Wind Creek Hospitality — Experience

Working kit r1. Rule metadata separates observation, inference and extension from authority.

## EXP-001 | Be an approachable host, not a generic luxury institution

```yaml cek-rule
origin: inferred
authority: working
strength: default
area: intent
contexts:
- all-web
- image-only
evidence:
- EV-001
- EV-002
- EV-011
- EV-012
depends_on: []
assets: []
```

**Decision:** Lead with a recognizable hospitality experience or a clear service outcome. The working relationship is welcoming, lively and capable; it is not distant, austere or exclusively VIP.
**Why / evidence:** The supplied homepage connects entertainment, properties and rewards; the About page also foregrounds community and careers. The site is broader than gaming, without hiding gaming.
**Apply when:** Guest-facing content and shared brand expression. In staff tools, express hospitality through clarity and helpfulness rather than promotional language.
**Preserve / adapt:** Preserve accessible confidence. Adapt energy to the task: expressive for a guest introduction, calm for a record or answer.
**Avoid:** Unfounded demographic targeting, invented luxury exclusivity, or a black-and-gold casino aesthetic unrelated to the supplied pages.

## EXP-002 | Separate promotional voice from operational language

```yaml cek-rule
origin: inferred
authority: working
strength: required
area: voice
contexts:
- all-web
evidence:
- EV-001
- EV-002
- EV-011
- EV-012
- EV-013
depends_on:
- EXP-001
assets: []
```

**Decision:** Use a short benefit-led heading for marketing, followed by concrete explanatory copy and a direct action. For applications, instructions and AI answers, use plain task language and make the result or next step explicit.
**Why / evidence:** Promotional headlines coexist with straightforward navigation, forms and account-support copy in the supplied material; these are different jobs.
**Preserve / adapt:** Examples authored for this kit: marketing—“Make time for your next getaway”; application—“Search documents”; AI answer—“I found three matching records”; empty state—“No records match these filters. Clear a filter and try again.” These are illustrative, not client-approved copy.
**Avoid:** Casino slogans in operational answers, claims of certain winnings, invented benefits, celebratory errors, or implying a simulated action reached a business system.

## EXP-003 | Keep brand names and domain terms in their proper scope

```yaml cek-rule
origin: observed
authority: working
strength: required
area: domain
contexts:
- all-web
- image-only
evidence:
- EV-001
- EV-002
- EV-003
- EV-011
- EV-012
- EV-013
depends_on: []
assets: []
```

**Decision:** Use “Wind Creek Hospitality” for the corporate brand and “Wind Creek” for the short form. The user's “Win Creek” is treated as a spelling discrepancy, resolved against the supplied website and page captures.
**Information order:** Name the property, service or record before details and actions. The site uses Guests, Players, Rewards, Player Services, Tier-Points, Base-Points, WScore and Prime Tokens. Preserve those distinctions only when the future system actually concerns them.
**Preserve / adapt:** Geographic property labels belong to location discovery; rewards tier names belong to membership comparisons. Neither defines generic application navigation, permissions or record types.
**Avoid:** Importing live benefit amounts, schedules, totals, eligibility or legal statements as evergreen business logic. Confirm those in the future system's own requirements; this kit records expression, not operating policy.

## EXP-004 | Let the future system define the application

```yaml cek-rule
origin: extended
authority: working
strength: required
area: intent
contexts:
- all-web
evidence:
- EV-016
depends_on: []
assets: []
```

**Decision:** This kit supplies reusable expression, not application requirements. No screens, workflows, data model, integrations or access rules are specified here.
**Reason:** The attached meeting drawing is a project-specific pipeline sketch. It was recognized and excluded from brand-rule derivation, not silently promoted into a product specification.
**Apply when:** A new chat receives this kit with an actual system specification. That specification controls functionality; the screen specification records local adaptation.
**Preserve / adapt:** Continue with reversible presentation defaults and explicit fictional data when authorized by the next task. Flag missing functional requirements without inventing them.
**Avoid:** Designing a drawings system now, hard-coding rewards features into unrelated tools, or claiming authenticated application behavior was inspected.

