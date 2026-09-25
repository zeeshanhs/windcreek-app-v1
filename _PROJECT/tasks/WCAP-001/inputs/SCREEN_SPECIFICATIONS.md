# SCREEN SPECIFICATIONS — WIND CREEK HOSPITALITY
## AskPat · Service orders and AI conversations

**Specification:** WC-ASKPAT-SCREENS v1.0 · 24 September 2026  
**Working brand kit:** Wind Creek Hospitality, CEK Chat Edition 1.0.0, working revision r1, 24 September 2026  
**Deliverable status:** Ready for screen rendering and subsequent prototype implementation; not a production approval or a tested application.  
**Current rendering scope:** Ten screen records, including four focused overlays. No new screen images, HTML, identity assets or photographs are produced with this specification.  
**First render:** `SCR-006.linked-populated / 1440×900 CSS-pixel working viewport / WC-ASKPAT-SCREENS v1.0`.

> **The central product distinction:** A service order is a shared operational record with an **Open** or **Closed** state. A chat is a user's conversation with AI. A chat may reference one service order, but opening, continuing or leaving a chat never starts, pauses, stops, assigns or closes work.

## Contents

1. Source basis, attachment check and authority
2. Resolved product decisions and scope
3. Requirements-to-screen coverage
4. Shared visual direction, shell and components
5. Shared interaction and state contracts
6. Fictional demonstration dataset
7. Screen records: SCR-001 through SCR-010
8. Asset dispositions and responsive transformations
9. Acceptance scenarios and validation boundaries
10. Deferred coverage, unresolved dependencies and rendering handoff

---

# 1. Source basis, attachment check and authority

## 1.1 What was actually available

| Source ID | Actual input and inspection | Authority for this specification |
|---|---|---|
| SRC-USER | Current request: descriptions of the four named HTML screens and the corrected service-order/chat behavior | Governs current product behavior; overrides conflicting older requirements and prototype behavior. |
| SRC-KIT | `CLIENT_KIT_FOR_CHAT(4).md`, complete working Wind Creek kit | Governs reusable brand expression within its stated working authority. Its canonical logical filename is `CLIENT_KIT_FOR_CHAT.md`. |
| SRC-OPEN | `OPEN_NEXT_CHAT(3).txt` | Handoff instructions, not product requirements. |
| SRC-REF-01 | `WC_REF_01_ACTION_STATES(2).png`, inspected visually | Filled, outline and quiet action appearances; reference-only. |
| SRC-REF-02 | `WC_REF_02_NAVIGATION_AND_FOCUS(2).png`, inspected visually | Selected navigation, disclosed menu, field focus and neutral field relationships; reference-only. |
| SRC-REF-03 | `WC_REF_03_COLOR_AND_TYPE(2).png`, inspected visually | Condensed display/body hierarchy and annotated palette relationships; reference-only. |
| SRC-REF-04 | `WC_REF_04_GROUPING_AND_COMPARISON(2).png`, inspected visually | Labeled comparisons, row rules and restrained tonal grouping; reference-only. |
| SRC-CREATE | `create-guided.html`; markup, styles, data arrays and scripts inspected | Existing guided-form fields and interaction intent. Its old visual styling is not brand authority. |
| SRC-QUEUE | `queue.html`; markup, styles and scripts inspected | Existing order list, search affordance and create entry. Current user corrections supersede its work-state vocabulary. |
| SRC-CHAT | `ticket.html`; markup, styles and scripts inspected | Existing AI thread, photo attachment, source opener, order-information popup and closure-note affordance. Current user corrections supersede its order-centric shell and work controls. |
| SRC-FRD | `WindCreek AskPat FRD v1.0.md`, retrieved from Library and read in full, FR-01–FR-30 | Recovered broader functional context, **not an attachment in this turn and not asserted to be the latest approved baseline**. Nonconflicting requirements are mapped; conflicts and deferred scope are explicit. |

The attachment inventory contains **nine files: one kit, one operator instruction sheet, four PNG references and three HTML files**. The instruction to use “CFI Group” and “six attached references” conflicts with the supplied packet. This specification deliberately uses **Wind Creek Hospitality and the four supplied WC_REF sheets**. It does not borrow CFI visuals or invent two additional references. The kit itself identifies Wind Creek and four analytical sheets. fileciteturn0file0L5-L13 fileciteturn0file0L43-L55

`index.html` is named in the request but was not attached and was not located in the targeted Library searches. A root Library listing was partial, so this is **not** a claim that the file does not exist anywhere. Login is specified from the current email/password requirement, not from an imagined inspection of that file. No separate system specification was attached; SRC-FRD was recovered from Library instead. The operator sheet explicitly distinguishes the system specification from the brand-kit packet. fileciteturn0file1L8-L19

## 1.2 Evidence, assumptions and extensions are different things

**[U] User requirement:** explicitly stated in the current request.  
**[H] HTML observation:** an actual field, control or behavior found in an attached prototype; not proof of a working integration.  
**[F] Recovered functional requirement:** a requirement in SRC-FRD; approval/currentness is not inferred.  
**[B] Brand rule:** inherited kit guidance; measured raster values are not official brand tokens.  
**[A] Assumption:** a reversible decision needed to complete this screen specification.  
**[X] Extension:** a deliberately specified UI behavior, layout or state not established by the source captures.  
**[D] Demo fixture:** authored synthetic content; not a fact about Wind Creek, its employees, facilities or equipment.

Screen records inherit these source classifications. Requirements tables identify their origins; dimensions, breakpoints, routes, copy, synthetic people and synthetic records are selected decisions unless expressly identified otherwise. A prototype requirement being “covered” means its presentation and behavior are specified—not that authentication, AI, source retrieval or an external system has been tested.

## 1.3 Specific source findings that affect the design

**Guided creation.** The supplied form has Issue, Location and New Remark; issue and location selectors have category filtering and text search. Its script requires all three values. It displays a creation toast and navigates to the list; this does not persist a new shared order. The two catalog arrays contain 1,788 issue records and 451 location records, counted directly from the supplied bytes; they are not verified current operational catalogs. The source caps displayed matches at 80 and asks the user to narrow the query. Preserve the three-field contract, not the persistence limitation or arbitrary result cap. fileciteturn0file2L739-L776 fileciteturn2file1L410-L463

**Queue.** The supplied list uses Started/Stopped and media-like status glyphs. Its search field has no search binding, most rows link back to the list, and the first row's order number does not match the order in `ticket.html`. The new specification replaces these with actual record-specific routes, consistent fixtures and Open/Closed only; it does not derive Closed from the old Stopped value. fileciteturn0file3L744-L795 fileciteturn0file4L738-L748

**Conversation.** The supplied page supports a visible thread, text composer, photo picker, source-document opener, order details and a required resolution note. Its AI replies are scripted. Start/Stop toggling, “Logged to HotSOS,” and “Recording paused” messages are present and must not survive this redesign. The linked PDF path is a reference in HTML, not an attached document. fileciteturn0file4L782-L859 fileciteturn0file4L894-L978

**Recovered broader scope.** SRC-FRD includes roles, natural-language creation, unit-specific retrieval, evidence, images, troubleshooting, ingestion and administration. Its Start/Pause actions and assigned-only queue conflict with the current request. It also limits visual state detection to four named categories, requires genuine citations, and distinguishes field images from the document-ingestion pipeline. These distinctions are preserved below. fileciteturn2file0L22-L64 fileciteturn2file0L122-L142 fileciteturn2file0L207-L223 fileciteturn2file0L295-L324

---

# 2. Resolved product decisions and scope

## 2.1 Decision register

| ID / class | Decision | Consequence |
|---|---|---|
| DEC-01 [U/B] | Wind Creek Hospitality is the corporate identity. Retain **AskPat** as the working application name from the HTML/FRD, in ordinary live text. | Neither the old “a” tile nor a newly drawn corporate logo is used. “CFI Group” is a packet-copy discrepancy, not a second brand. |
| DEC-02 [U] | Orders have exactly two business states: `open` and `closed`, displayed **Open** and **Closed**. | No Started, Stopped, Paused, In progress, Resolved, Escalated or Pending closure order state. All/Linked/General are filters, not order states. |
| DEC-03 [U/X] | Separate order detail from AI conversation. | Queue rows open SCR-004. Its chat action opens or resumes SCR-006. The source filename `ticket.html` does not define the new information architecture. |
| DEC-04 [U/X] | Each user's general and order-linked chats belong to one personal **Your chats** list. | Linked entries have a persistent `SO #1042`-style badge. Equipment mentions alone do not produce an order link. |
| DEC-05 [U/X] | Enforce at most one linked chat per `(authenticated user, service order)`; for technicians this directly implements the requirement. Apply the same rule to other chat-enabled users as a selected normalization. | Repeated entry reuses the same chat. Different technicians can each have their own chat about the same order. Multiple general chats about the same equipment remain allowed. |
| DEC-06 [U/A] | Anyone signed in with access to an order can initiate closure, regardless of requester/technician role, assignment or chat ownership. | SCR-004, linked SCR-006 and SCR-007 expose the same closure entry. No technician-only, assignee-only or administrator-approval gate is invented. |
| DEC-07 [A] | For this prototype, one explicit closure confirmation with a nonempty resolution note initiates a close request; success acknowledgement changes Open to Closed. | A failed or unconfirmed request keeps the last confirmed business state. Production close-API behavior remains unresolved; no real write is claimed. |
| DEC-08 [A] | Closing an order does not close or delete its chats. Existing linked conversations remain readable and writable. | Show **Order closed** as context; no reopening action, no second linked chat and no new work state. Closed order remarks are read-only in this revision. |
| DEC-09 [U/A] | The technician queue lists all orders within the user's authorized property scope, not only assigned orders. The fixture uses one fictional property shared by all demonstration users. | No “My assigned work” default, take-ownership control or workload timer. Production record visibility is an explicit policy dependency. |
| DEC-10 [A] | Current operational users share Chats and Service orders navigation. Team members can report, view accessible orders and initiate closure; chat access follows the user's broad “users can start chats” wording. | This deliberately expands the recovered FRD's requester-report-only presentation. Provisioned admins may use the operational interface; separate administration screens are deferred. |
| DEC-11 [H/A] | Guided order creation remains the current creation mode. Issue, Location and New Remark are required. Requester identity is automatic. | Natural-language-to-field extraction from recovered FR-02 is deferred, not quietly claimed as implemented by a textarea. No requester-name editing, assignment or priority control is added. |
| DEC-12 [H/F/X] | Retain photos, source opening, order remarks/history and closure notes as supporting operational capabilities. | Give them real states and recovery paths. Chat photos do not upload documents into the knowledge base. |
| DEC-13 [A] | A chat is user-scoped in ordinary navigation, not promised to be absolutely private. | Do not show another user's linked chat in the main list or order popup. Recovered administrator conversation review remains a separate deferred privilege, so do not write “Only you can ever read this.” |
| DEC-14 [A/X] | Use deterministic, clearly synthetic records and response specimens for the prototype. | No live BAS readings, real repairs, employee identities, verified manuals or successful external writes are invented. |
| DEC-15 [B/X] | One light operational direction, with restrained Wind Creek red and condensed short titles. | Remove the old warm beige, champagne-gold verification language, remote font dependencies, inflated radii and decorative status banners. |
| DEC-16 [A] | This revision specifies the current **operational prototype slice** and maps all recovered FRD requirements. | Ingestion services, administration, governance and reporting are explicitly deferred; this is not a full-system implementation specification. Their requirements are retained in the coverage register. |

## 2.2 Product objects and invariants

| Object | Required information for the screens | Invariant |
|---|---|---|
| Signed-in user | Stable user ID, display name, role label, accessible property scope | Display identity comes from authentication, never a role selector on the production login form. |
| Service order | Stable ID, issue ID/label, location ID/label, initial remark, requester ID/name, created time, Open/Closed, version; optional confirmed equipment reference; closure actor/time/note when closed | Initial business state is Open. Only an acknowledged closure changes it to Closed. Assignment and work-session data are not editable here. |
| Order remark | Order ID, author ID/name, time, literal submitted text | Shared order content is not a private chat message. Sending a chat message never silently adds a remark. |
| Order event | Order ID, event type, actor, time, relevant fields | Show creation, added remark and closure. Do not manufacture Start/Pause/Stop activity or treat equipment maintenance as this order's own history. |
| Chat | Stable chat ID, owner user ID, nullable order ID, title, messages, created/updated time, optional equipment context | Order association is explicit, stable and independent of equipment context. No attach/detach or duplicate-linked-chat feature in v1.0. |
| Message | Stable ID, chat ID, author kind, text, time, attachment IDs, supported source references, delivery state | A transport state is not an order status. Retrying a send must not duplicate the message. |
| Chat photo | Owner/chat association, filename, media type, size, available bytes or explicit missing state | A selected local file is not yet a sent attachment. File selection is not evidence that AI understood it. |
| Evidence reference | Source ID/title/version, locator, evidence type, availability; exact supporting passage when present | No diagnostic claim may use an invented source or unsupported page number. Synthetic references are visibly labeled as such. |
| Unknown-fault record | Chat ID, equipment/tag if known, reported code/condition, timestamp, submitted context and photo references | The UI may record “no confirmed answer”; it must not promote that entry into approved knowledge. |

**Relationship example:** Morgan + SO #1042 → CH-D01. Sam + SO #1042 → CH-S01. Morgan's two general AHU-D01 conversations have no order ID. All four may discuss the same equipment; only the first two are linked to an order, and each belongs to its own user.

**Order state transition:** `Open —[explicit close request + successful acknowledgement]→ Closed`. Opening a popup, submitting a chat message, requesting a source, receiving an AI answer or copying a handoff summary leaves this state unchanged. “Closing…” is temporary action feedback while the confirmed order remains Open; it is not a third state.

---

# 3. Requirements-to-screen coverage

## 3.1 Current user requirements

“In scope” means specified for this operational prototype, including a local simulation where a real service is absent.

| ID | Requirement / origin | Screen or state coverage | Disposition |
|---|---|---|---|
| UR-01 | Email/password login for all provisioned users [U] | SCR-001; authenticated shell and denied/expired states | In scope; actual authentication integration deferred. |
| UR-02 | Team members raise a service order for the technician team [U] | SCR-003.empty, ready, submitting, failed, created | In scope. |
| UR-03 | Created orders appear in the technician list [U] | SCR-003.created → SCR-002.created; shared order store | In scope; not merely a success toast. |
| UR-04 | Technician sees the order list and opens an order's details [U] | SCR-002 → SCR-004 with the selected ID | In scope; every fixture row has a destination. |
| UR-05 | No ability or impression of starting, pausing or stopping work [U] | All screens, components, copy, icons, history and mutations | Explicitly excluded, including inherited code and old status banners. |
| UR-06 | Only Open and Closed order states [U] | SCR-002/004/006/007/008; INV-ORDER in §5 | In scope. |
| UR-07 | Start a new AI chat from the main screen [U] | SCR-005.new → SCR-006.general-populated | In scope. |
| UR-08 | Initiate an AI chat from a service order [U] | SCR-004 → get-or-create linked chat → SCR-006 | In scope. |
| UR-09 | An order-linked chat also appears in the main chat list [U] | SCR-005 and SCR-006 shared Your chats panel | In scope, same chat identity and messages. |
| UR-10 | Linked chats have a differentiating badge/label [U] | Chat-list rows; order-context strip in SCR-006 | In scope; association is not indicated by color alone. |
| UR-11 | Linked chat has a top-right info button opening ticket information [U] | SCR-006 Order information → SCR-007 | In scope on desktop, tablet and phone. |
| UR-12 | At most one chat per technician per order [U] | Linked-chat get-or-create, existing/racing entry, repeated navigation | In scope; unique user/order relationship. |
| UR-13 | Multiple chats about the same equipment are allowed [U] | CH-D02 and CH-D04; SCR-005 New chat | In scope; general chats are not automatically merged or linked. |
| UR-14 | Anyone can initiate closing the ticket [U] | SCR-004/006/007 → SCR-008 for any authorized signed-in role | In scope; no ownership-based closure restriction. |
| UR-15 | Apply the working kit, coherent direction, responsive screens and disclosed assets [U/B] | §§4, 7, 8; all render briefs | In scope; source brand/count discrepancy explicitly resolved. |
| UR-16 | Complete Markdown specification before images or HTML [U] | This document and §10 handoff | Delivered in this stage; rendering is a later stage. |

## 3.2 Existing HTML affordances and their dispositions

| ID | Observed source feature | New coverage / deliberate change |
|---|---|---|
| HP-01 | Issue search and category filter [SRC-CREATE] | SCR-003.issue-picker. Preserve source category vocabulary, searchable options and explicit selection. |
| HP-02 | Location search and area filter [SRC-CREATE] | SCR-003.location-picker. Full location labels remain accessible; search may match names and codes as an extension. |
| HP-03 | Nonempty New Remark, required Issue/Location, cancel [SRC-CREATE] | SCR-003 validation, required-field help, cancel/discard handling. |
| HP-04 | Create toast and navigation only [SRC-CREATE] | Replace with one persisted-in-demo order, list insertion, correct requester and ID; no claim of live HotSOS delivery. |
| HP-05 | Search by order number and Create order [SRC-QUEUE] | SCR-002 working ID search and create route; optional issue/location search is a disclosed extension. |
| HP-06 | Started/Stopped row labels, play/stop symbols, mismatched IDs/self-links [SRC-QUEUE/CHAT] | Removed and replaced, never mapped by assuming Stopped = Closed. |
| HP-07 | Text chat, Enter sends, Shift+Enter newline, scripted thinking [SRC-CHAT] | SCR-006 text/delivery states. Preserve useful keyboard behavior; canned replies must be identified as simulation. |
| HP-08 | Photo browse/drop/preview/Add to chat [SRC-CHAT] | SCR-009; stage the image before Send rather than posting it immediately on selection. Validation explicitly narrows to PNG/JPEG. |
| HP-09 | PDF citation and PDF popup [SRC-CHAT] | SCR-010. Supplied PDF absent: genuine unavailable state. A separately labeled text-based demo reference supports the main fixture instead. |
| HP-10 | Info popup with location, requester, remarks and history [SRC-CHAT] | SCR-007; share content with canonical SCR-004, not a second independent hardcoded order. |
| HP-11 | Close order with a required resolution note [SRC-CHAT] | SCR-008; preserve note requirement and add acknowledgement/failure/already-closed states. |
| HP-12 | Generic account identity and AskPat text [SRC-QUEUE] | Signed-in account menu plus ordinary AskPat application text; new fictional identities. |
| HP-13 | Unused shared CSS for drawings, recording, knowledge-base management, discrepancy comparison, escalation pages, role-picker login and other flows | Styles alone are not requirements. Do not add these destinations. Relevant recovered FRD needs are mapped separately below. |
| HP-14 | Remote fonts, warm/gold theme, large rounding and repeated cards | Superseded by SRC-KIT; see §4. No font binaries, CDN or network font dependency. |

The HTML affordance register is based on the inspected form, queue, conversation markup and scripts—not on the names of unused CSS classes. fileciteturn0file2L739-L776 fileciteturn0file3L736-L830 fileciteturn0file4L738-L859 fileciteturn0file4L894-L986

## 3.3 Recovered FRD: all thirty requirements accounted for

These rows preserve SRC-FRD's identifiers and subject matter. **Partial**, **Deferred** and **Superseded** must not be reported as completed requirements in an implementation handoff.

| FRD requirement | Screen/state or dependency | Disposition for v1.0 |
|---|---|---|
| FR-01 Role-Based Access and Identity | SCR-001; authenticated identity; accessible-order and user-owned-chat checks | **Partial / adapted.** Identity and operational roles covered. Requester-report-only restriction is expanded under DEC-06/10; administrative interface deferred. |
| FR-02 Natural-Language Service Order Creation | SCR-003 provides Issue, Location and NewRemark, identity and validation | **Partial.** Required payload and clarification via explicit fields covered; automatic natural-language extraction/conversational intake deferred. Do not label guided selection “AI-resolved.” |
| FR-03 HotSOS Service Order Lifecycle Actions | SCR-003 create; SCR-004 remarks; SCR-008 close | **Partial / superseded.** Create/notes/close UI covered; actual API support unverified here. Start/Pause, and the HTML Stop variant, explicitly removed by UR-05. Assignment remains external. |
| FR-04 Technician Queue | SCR-002 → SCR-004 | **Adapted.** All accessible property orders per current request, replacing the recovered assigned-only queue. No assignment action. |
| FR-05 Multimodal Technician Input | SCR-006 typed questions/codes/tags/locations/results; SCR-009 still photos; §8 device matrix | **UI covered.** Text and local image interaction specified; live multimodal processing deferred to integration. Voice/video are not implied. |
| FR-06 Equipment Identification and Context Resolution | SCR-006.identifying, ambiguous-unit, unit-confirmed, changed-unit | **UI covered.** Explicit resolved context persists in the chat, not necessarily in the order. Real mapping/retrieval remains an integration dependency. |
| FR-07 Equipment-Specific Knowledge Retrieval | SCR-006.answer-with-evidence / no-source; SCR-010 | **UI covered.** Exact source/unit/locator contract specified. Live indexed manuals/specifications are not supplied. |
| FR-08 Maintenance and Service History | SCR-006.maintenance-history / history-unavailable | **Partial.** Completed/due/upcoming/no-record response structures specified with synthetic records. API availability and “begin tracking maintenance” feature deferred. |
| FR-09 Error Code–Based Lookup | SCR-006.code-lookup / unrecognized-code; SCR-009 | **UI covered.** Code and equipment required to anchor lookup; no invented fault-code meaning in fixtures. |
| FR-10 Visual Equipment State and Attribute Detection | SCR-006.image-review / unclear-image / unsupported-visual-condition | **UI covered within the recovered four-category limit.** Breaker tripped/set, overload relay tripped/normal, marked breaker amperage, and coil ice/water buildup. No arbitrary additional visual diagnoses. |
| FR-11 Symptom-Based Troubleshooting | SCR-006.symptom / ambiguous-unit / guided-step | **UI covered.** Resolve unit first; evidence-grounded actions only. A live diagnostic engine and validated procedures are not delivered. |
| FR-12 Guided Troubleshooting Workflow | SCR-006.guided-step / handoff-summary | **UI covered.** One step and user result at a time; unresolved outcome is narrative/handoff content, not a new order status. |
| FR-13 Diagnostic Clarification and Troubleshooting Control | SCR-006 clarification states | **UI covered.** Ask the minimum missing question; do not force a questionnaire when context suffices. |
| FR-14 Uncertainty and Safety Handling | SCR-006.insufficient-evidence / safety-boundary | **UI contract covered.** Distinguish reported, confirmed, possible and missing information; no source-free hazardous procedure. Domain safety validation remains a production dependency. |
| FR-15 Escalation and Handoff Support | SCR-006.handoff-summary; explicit Copy summary / Add as order remark | **Partial.** Complete summary fields and handoff recommendation covered; actual external routing, staffing, publishing photos into shared order attachments and escalation integrations deferred. Order stays Open until explicitly closed. |
| FR-16 Unknown Fault Logging | SCR-006.unrecognized-code / fault-log-failed | **Partial.** Unit/code/time/context are recorded in the demo chat's unknown-fault entry; production logging destination/retention unresolved. No speculative diagnosis or automatic KB learning. |
| FR-17 Evidence and Citation Display | SCR-006 citations → SCR-010 source viewer | **UI covered.** Claim-level source associations and real locators required; synthetic evidence labeled. Missing source does not become a fake PDF. |
| FR-18 Plain-Language Response Generation | SCR-006 response hierarchy and exact specimen copy | **UI/content contract covered.** Lead with supported answer, manageable next steps and relevant reasoning; if no cause is established, say so instead of inventing a “likely issue.” |
| FR-19 Blob-Storage-Only Ingestion | Platform constraint; no document-upload destination in these screens | **Deferred backend capability; exclusion enforced.** Chat photographs are evidence inputs, not contractor/manual ingestion. |
| FR-20 File Change Detection and Record Update | Source IDs/versions in evidence data model; ingestion service outside this slice | **Deferred.** Do not claim duplicate-safe ingestion has been implemented by displaying a version label. |
| FR-21 Contractor Onboarding via Folder Taxonomy | No manual contractor-onboarding screen | **Deferred backend capability.** Do not invent an Add contractor form. |
| FR-22 Accepted File Types | Knowledge ingestion permits PDF per recovered requirement; SCR-009 separately accepts chat PNG/JPEG | **Deferred ingestion enforcement; distinction preserved.** Image attachments are not an expansion of accepted knowledge-document types. |
| FR-23 Document Metadata Template | Source-reference fields in §2 are display needs, not the full ingestion template | **Unresolved / deferred.** The actual agreed metadata field set is not supplied in SRC-FRD. |
| FR-24 Automatic Extraction for Troubleshooting | Retrieval result and source availability states only | **Deferred backend capability.** No document processing progress dashboard is added. |
| FR-25 Duplicate and Conflict Resolution | SCR-006.conflicting-evidence; source version metadata | **Partial UI / deferred engine.** Expose unresolved contradictions; recovered newer-qualified-source preference is not a license to silently overwrite evidence. |
| FR-26 Admin Panel: Access and User Management | Future administration workstream | **Deferred.** Add/enable/disable users and permission editing are not reachable controls in this operational prototype. |
| FR-27 Usage History and Conversation Review | Future authorized admin user/chat review | **Deferred.** Ordinary lists remain user-scoped; no absolute-private-chat promise contradicting the recovered admin requirement. |
| FR-28 Reporting Dashboard | Future reporting surface | **Deferred.** No fabricated analytics cards. Closed-order count is not automatically “issues resolved”; duplicates and other closure reasons require a defined reporting rule. |
| FR-29 Explainability | Future admin evidence/action trace | **Deferred.** Plan source references, retrieval decisions, tool outcomes and concise decision explanations—not hidden model chain-of-thought. Required event schema remains a later design task. |
| FR-30 Feedback Capture and Approval | Future user feedback plus admin moderation/approved-knowledge workflow | **Deferred as a complete workflow.** No nonworking thumbs controls or implied learning pipeline in v1.0. |

Sources for the retained FRD organization and requirements: roles/creation/lifecycle; technician input and context; diagnostics/evidence; ingestion; administration. fileciteturn2file0L22-L64 fileciteturn2file0L122-L190 fileciteturn2file0L192-L315 fileciteturn2file0L317-L362 fileciteturn2file0L364-L400

---

# 4. Shared visual direction, shell and components

## 4.1 Direction: a clear, welcoming service workspace

**A light, task-led Wind Creek workspace—not a casino marketing page and not the old beige-and-gold prototype.** Recognition comes from the red action treatment, restrained condensed titles, quiet gray/white fields, purposeful rectangular controls and consistent navigation emphasis. The everyday work is reading an order, locating context and asking a clear question; those tasks receive more visual weight than branding decoration.

The four reference sheets are applied by role: action hierarchy from REF-01; selection, disclosure and focus from REF-02; display/body contrast from REF-03; aligned, labeled information and restrained grouping from REF-04. Their promotional labels, reward values and marketing artwork are not imported into the application. The kit explicitly separates operational language from promotional voice and permits application-specific shells. fileciteturn0file0L71-L97 fileciteturn0file0L101-L173

**Composition rules.** One dominant working region per screen. Use space, alignment, a light tonal change or a single separator before introducing a container. Chat responses sit on the page, not inside a grid of cards. The queue is a ruled table, not eight floating cards on desktop. Order detail is a readable record with supporting metadata, not a dashboard. Popups are the main elevated surfaces. No decorative photography, glass blur, gradient page backgrounds, animated LEDs, gratuitous shadows, gold verification stamps or marketing footer.

**Language.** Use “Service orders,” “New service order,” “Your chats,” “New chat,” “Order information,” “New Remark,” “Add remark,” “Resolution note” and “Close service order.” “Ticket” is a source synonym, not a second object or destination. Use “Open order” for navigation only where context makes the distinction clear; prefer **View order** for links to avoid confusing the verb with the Open status.

## 4.2 Token adoption and local adaptations

Inherited colors below are the kit's measured-raster values or selected expressions, not a new assertion of official Wind Creek CSS. Font families are the kit's local approximations. All geometry in this document is a selected implementation target. fileciteturn0file0L175-L228

| Role / token | Value | Application |
|---|---|---|
| Brand / action | `#A32B29` | Short display titles, selected route underline, association labels and primary actions. |
| Action deep / on-action | `#630213` / `#FFFFFF` | Primary button gradient and its label. |
| Body / secondary text | `#495057` / `#686E74` | Main content and supporting metadata. Do not reduce opacity on long or important content. |
| Main surface / page ground | `#FFFFFF` / `#F8F9FA` | Main work surface and quieter surrounding regions. |
| Group / quiet hover | `#EDF0F3` / `#EEF0F3` | User message blocks, selected chat region, lightweight groups and text-action hover. |
| Separator | `#CED4DA` | Thin row rules and nonessential boundaries. |
| Field edge | Kit reference `#ACB5BD`; selected stronger functional edge `#686E74` where the edge is the sole field boundary | The strengthening is a contextual adaptation, not a recovered source measurement. |
| Focus | `#A32B29`, 2px outline, 3px offset; supplementary `#EACBCA` halo | Ring remains distinct from normal hover and from validation feedback. |
| Success / warning / error / information | `#24674F` / `#78580E` / `#9B2428` / `#355E73` | Kit-selected semantic extensions with explicit words/icons. Do not use the rewards-tier palette. |
| Body and data family | `Arial, "Helvetica Neue", sans-serif` | 16px base, 1.5 line height; 14px secondary; tabular numerals for IDs/times. |
| Display family | `"Arial Narrow", "Liberation Sans Narrow", Impact, sans-serif` | Short uppercase application titles only. No font stretching and no substituted invented font name. |
| App page title [X] | 32px desktop / 28px mobile, weight 700, line-height 1.08 | Compact adaptation of the kit's marketing-scale title. |
| Chat title [X] | 28px desktop / 24px mobile; same display treatment | Keep equipment/order context readable, allow wrapping. |
| Section headings [X] | 20px ordinary sans, weight 700, line-height 1.3 | Dense working subsections need not be uppercase display headings. |
| Controls / surface corners | 4px / 2px | No pill-shaped action bars, oversized chat bubbles or nested rounded panels. |
| Spacing [X] | 4, 8, 12, 16, 24, 32, 48px | 24–32px between record sections; 8px within a related label/value group. |
| Control target | Minimum 44×44px for buttons; fields minimum 44px high | Labels remain full size; row content may grow rather than clip. |
| Primary fill | `linear-gradient(160deg, #A32B29 0%, #A32B29 20%, #630213 75%, #A32B29 100%)` | Normal filled action; only controls receive this gradient. |
| Primary hover | `linear-gradient(160deg, #630213 0%, #630213 20%, #A32B29 90%)` | Bounded edge emphasis and kit hover shadow; no positional shift. |
| Hover shadow | `0 5px 10px rgba(0,0,0,0.20)` | Limited to appropriate emphasized actions. Not a resting shadow on every content group. |
| Popup elevation [X] | `0 12px 32px rgba(0,0,0,0.16)` over a neutral 32% dark scrim | Selected overlay separation, never glass blur. |
| Motion | Optional 140ms control transition; remove nonessential transition for reduced motion | No pulsing operational status, auto-scrolling decoration or entrance animation. |

**Font fallback disposition:** Use the first installed family in the stack. When no condensed family is available, use the available sans-serif without horizontal scaling and record reduced typographic fidelity. Do not ship a font binary, silently load a remote font, or replace live text with a bitmap.

## 4.3 Shared authenticated shell

**Desktop target: 1440×900.** A 24px-high neutral demonstration strip reads **Prototype · Fictional data**. Below it is a 64px white header with a bottom rule. Left: plain **Wind Creek Hospitality** text and a quieter **AskPat** application name. Middle: ordinary-sans navigation links **Chats** and **Service orders**, with a 3px red underline on the current section. Right: **Training property** and the signed-in account trigger **Morgan Reed · Technician**, with a neutral initials avatar. The avatar is a person placeholder, not a corporate mark.

The account popup contains the display name, email, role and **Sign out**. It has no user-management or settings links whose screens are deferred. The brand/app text returns to `/chats` when signed in; it does not take users to a marketing website or log them out.

**Chats:** Below the header, a 304px left panel contains Your chats, New chat, list search, All/Order-linked/General filters and recency-grouped entries. The right region is the new-chat or selected-conversation workspace. Each region has its own purposeful vertical scrolling; the page must not accumulate unnecessary nested scrollbars. The sidebar remains visible on desktop while the order-information popup is closed. There is **no permanent right-side order rail**: the current request requires an information popup.

**Orders:** The same global header remains, Service orders is underlined, and the main record/list/form uses the full content region. The personal chat list is not forced into the order form. Returning to Chats restores the selected conversation and reading position. This is a contextual shell transformation, not a different app theme.

**Tablet:** At 960–1199px use a 264px chat panel; at 768–959px replace it with a Your chats disclosure. Header labels can wrap; account detail moves into its popup. **Phone:** at 390×844 use a compact two-row header: brand/app/account above the two navigation links. Keep each interactive target at least 44px. The demo strip may wrap to 32px. A focused chat includes a **Your chats** control and New chat remains reachable; the list becomes a full-height modal panel rather than disappearing. No bottom navigation is added solely to imitate a mobile app.

**Selected local width targets:** form 720px maximum; order detail 1120px; queue up to 1320px; chat reading column 760px; login 440px. These are not measurements of the original website.

## 4.4 Component recipes

| Component | Anatomy and hierarchy | State/behavior contract | Kit application |
|---|---|---|---|
| Filled / outline / quiet actions | Ordinary-sans label; optional generic icon; 4px corners | Filled commits local primary task; outline secondary route; quiet supportive navigation. Distinct hover/focus/disabled/submitting labels, stable geometry. | PAT-001, DES-001/003/005 |
| Navigation links | Two named routes with a persistent red underline | Current route remains apparent when hover ends. Use links, not an unlabeled segmented-control metaphor. | PAT-002, DES-005/006 |
| Order status | Small low-radius text label | **Open:** dark text on grouped gray. **Closed:** success-green text with a small check if helpful, no work-session glyph. Status is never clickable. | DES-007, PAT-004 |
| Linked-chat badge | `SO #1042` in red text on quiet neutral ground; optional generic link icon | Always visible outside title truncation. A closed linked order additionally says **Order closed**. Badge does not create an independent nested navigation target inside the chat link. | DES-001/003/007 |
| Chat-list row | Two-line title, updated time, order badge only when linked | Selected row uses a tonal surface and thin red edge; focus separately outlined. General rows have no fake order badge. Search/filters preserve association labels. | DES-003/005; PAT-004 adapted |
| Field group | Persistent label → concise help → control → error | Show requirement text; preserve input on recoverable failures; error uses words and icon, not a red halo alone. | PAT-005 |
| Searchable selector | Labeled trigger; search field; category filter; results with name/category/code | Click/tap/keyboard; Escape without changing selection; selected option indicated in text. Mobile picker expands into a reachable panel. | PAT-002/005 adapted |
| Order table | Column labels and aligned values; thin row rules | Order ID/title is a real link. No row-wide button containing nested buttons. On phone transform into labeled records, not miniature columns. | PAT-004, DES-006/007 |
| Order metadata | Label/value definition list with sectional rules | Values wrap. Missing equipment says **Not identified**; not “Unknown” as an order status. | PAT-006 |
| Message | Author label, body, time, optional attachment/evidence | AI text is unboxed on white; user message gets a quiet gray rectangular block. Author is explicit, not just a color. | EXP-002, PAT-006 |
| Evidence link | **Demo source** or genuine source type, title, locator, version when known | Opens SCR-010; no invented PDF badge/page count. The evidence associated with a statement must actually support it. | PAT-006; recovered FR-17 |
| Composer | **Message** label, multiline text, Add photo, Send | Send only with text or a valid staged photo; keyboard support in §5. Sending has no service-order side effect. | PAT-005, DES-005/007 |
| Information popup | Titled dialog, labeled fields, remarks, history, close control | Explicit close and Escape; modal focus containment and focus return; no nested popup pile. | DES-003/005/006 |
| Inline feedback | Short result/error near owning task, optional nonblocking toast | Durable result remains in the screen; toast is not the only proof of mutation. | EXP-002, DES-005 |

**Rule inheritance:** All operational screens preserve EXP-002/003/004 and DES-001/002/003/005/006/007/008. EXP-001 and DES-004 guide tone and hierarchy. PAT-001/002/004/005/006 apply by component. PAT-003 and IMG-001/002/003/004 do not mandate imagery or a marketing composition in this work tool.

---

# 5. Shared interaction and state contracts

## 5.1 Navigation and route map

| Destination | Logical route | Record |
|---|---|---|
| Sign in | `/login` | SCR-001 |
| Your chats / main workspace | `/chats` | SCR-005 |
| Unsaved general-chat draft | `/chats/new` | SCR-005.new |
| Existing conversation | `/chats/:chatId` | SCR-006 |
| Service-order list | `/orders` | SCR-002 |
| New service order | `/orders/new` | SCR-003 |
| Service-order detail | `/orders/:orderId` | SCR-004 |
| Linked order information | Existing chat route plus `panel=order` | SCR-007 |
| Close service order | Existing order/chat route plus `panel=close-order` | SCR-008 |
| Add photo | Existing chat/new-chat route plus `panel=photo` | SCR-009 |
| Evidence | Existing chat route plus `panel=source&sourceId=…` | SCR-010 |

These are logical destinations, not prescribed server architecture. A later local HTML may use equivalent hash routes. An old filename does not provide a valid object identity. Browser Back closes the current overlay before leaving its parent; after a mutation Back must not resubmit the mutation.

## 5.2 Linked-chat identity and creation

**INV-CHAT-1 — explicit association.** A new general chat has `orderId = null`, even when its text mentions SO #1042 or AHU-D01. No natural-language mention changes association silently. No Attach to order, Detach or Merge chat action exists in this revision.

**INV-CHAT-2 — get or create, never blindly create.** The action on an order checks the authenticated user's linked-chat relationship. If it exists, label the action **Continue your chat** and navigate to that chat. If absent, label it **Chat about this order**; one explicit activation creates/reserves the relationship and opens an empty linked conversation. That newly created linked entry appears in Your chats immediately, even before the first message. Its temporary title is the order's issue plus order badge; first-message title normalization must not change the chat ID.

**INV-CHAT-3 — duplicate prevention.** Two simultaneous activations, a refresh, a second browser tab or a retry use the same user/order uniqueness constraint and idempotent request. A uniqueness conflict resolves to the existing chat. Disable the initiating control while resolving and announce **Opening your order chat…**, then **Your existing chat is open.** A creation failure says **We couldn't open the order chat. Try again.** No orphaned duplicate list row appears.

**INV-CHAT-4 — scope.** Morgan never sees Sam's linked chat in ordinary navigation. The order popup does not enumerate every technician's conversations. Recovered admin review is not an ordinary order permission. General chats about one equipment ID are never deduplicated by equipment name.

**INV-CHAT-5 — draft behavior.** New chat opens one unsaved general draft; repeated clicks before sending do not create empty records. First successful send creates one general chat. Unsent drafts are kept per chat in the active prototype session while navigating. They do not update recency until a message is actually sent. No chat delete/archive/rename workflow is added in v1.0.

## 5.3 Orders, remarks and closure

**INV-ORDER-1 — acknowledged creation.** A create submission freezes a payload containing Issue, Location, NewRemark and the authenticated requester. The client sends one idempotent request. The prototype mutates its shared in-memory order store exactly once. The new order appears as Open in the list with the returned ID; a UI-only toast is insufficient. If the response is uncertain, show **We haven't confirmed whether the order was created. Check the list before trying again.** Retry reconciles the original request instead of blindly making a second order.

**INV-ORDER-2 — no work controls.** No Start/Pause/Stop/Resume action, labor timer, recording panel, “working now” flag, play/stop status glyph, work-session event or API mutation exists on any order or chat surface. Do not retain hidden event handlers that still change these states. External work tracking remains outside this application. No deep link to an external system is invented without a real configured destination.

**INV-ORDER-3 — notes are explicit shared writes.** Add remark is a separate action, with a labeled field and submit acknowledgement. “Add as order remark” from a chat opens an editable draft in order detail; it does not post the entire chat or expose another user's conversation. Source names may be included in the reviewed note, but publishing chat-photo bytes or private attachment links into shared orders is not specified in this revision. When a handoff has photos, its shared-note draft says **Photos remain in the originating chat; no attachments were added to this order.** Copying or saving the note does not grant photo access. Closed orders are read-only under DEC-08.

**INV-ORDER-4 — closure.** Everyone with authenticated access to the record can open SCR-008. The form shows the exact order, an initially blank required Resolution note, and the consequences. The user commits **Close service order** once. While waiting, keep the Open badge and show **Closing service order…** next to the action. On acknowledgement, update the central record, closure fields, list counts, detail, popup and every linked-chat context. Do not delete, archive or end any conversation.

**INV-ORDER-5 — conflict and failure.** A failed close says **The order is still Open. Your note has been kept. Try again.** An unconfirmed result says **Closure has not been confirmed. Refresh the order before trying again.** An order closed by another user says **This order has already been closed.** Show the received actor/time/note; do not submit a second closure, replace someone else's note or append the abandoned note silently. A version conflict refreshes the record and asks the user to review changed details without inventing a new approval chain.

**INV-ORDER-6 — closed is not necessarily repaired.** A closure note may describe a duplicate or withdrawn report. Neither UI nor future reports may infer a verified repair merely from Closed. No Reopen control is included; creation of a new report remains available.

## 5.4 Input, disclosure and accessibility behavior

Use semantic links, buttons, labels, headings and table/definition-list structures. All icon-only controls have accessible names; tooltips supplement rather than replace them. Focus is visible on each interactive element. Text and icons explain errors, selection and status. These are required prototype behaviors, not a claim of audited conformance.

**Selectors.** The trigger exposes expanded/collapsed state and the selected label. On opening, focus the selector's search. Tab reaches category filters and results; arrow keys navigate the result list; Enter selects; Escape closes without altering the old selection and returns focus. The category filter and query intersect. Changing the category does not silently choose the first result. Reset filter is explicit. Announce the number of matches after an intentional input update, not every rendered character of a long result list.

**Dialogs.** Label the dialog by its heading, contain keyboard focus, make the background inert, and return focus to the invoking control. Close and Escape dismiss read-only dialogs. Dirty note/photo forms ask whether to discard changes before leaving; a required user confirmation of a business mutation is different from an agent asking for routine design approval. Never place a close confirmation on top of an already active information popup: replace the popup and retain a return destination. On cancel, restore the prior popup and scroll position.

**Chat keyboard.** Desktop Enter sends; Shift+Enter adds a line; input-method composition must not accidentally send. On a phone, the keyboard Return inserts a line; the visible Send button commits. Attachments can be selected and removed without sending. Send is disabled only when there is no text/photo or the current turn is being submitted. Preserve recoverable text and attachments on send failure.

**Reading position.** New messages scroll into view only when the user is already near the conversation end or has just sent a message. Otherwise show **New response — jump to latest** without stealing their place. Selecting another chat restores its reading position. Long titles wrap on detail screens; list truncation retains an accessible full name.

**Reduced motion and reflow.** No required task depends on hover or motion. Keep the focused control above a mobile keyboard, allow content to scroll at short heights, and keep primary actions reachable without covering the last line of content. At enlarged text sizes the header, toolbars and action groups wrap rather than clip.

## 5.5 Shared loading, access and simulation boundaries

| State family | Exact representative feedback | Recovery and data rule |
|---|---|---|
| Initial loading | **Loading service orders…** / **Loading your chats…** / **Loading order information…** | Neutral placeholders follow final hierarchy. Do not show another user's cached data or a false empty state. |
| Recoverable read failure | **We couldn't load this information. Try again.** | Retry only the failed region; preserve unrelated chat draft and scroll. |
| Empty dataset | **No service orders yet.** / **No chats yet.** | Show the relevant creation action; distinguish from failed loading. |
| No filter matches | **No orders match these filters.** / **No chats match your search.** | Clear search/filters; never delete underlying records. |
| Unavailable or denied record | **This item isn't available to your account.** | Back to authorized list; don't disclose another person's chat title or protected source text. |
| Session expired | **Your session has expired. Sign in again to continue.** | Clear protected rendered content and passwords; retain only a safe intended route. Unsent sensitive drafts are cleared and this is stated. |
| Service disconnected | **Changes can't be saved right now.** | Keep readable authorized cached context labeled **Last loaded** when available; don't simulate a successful write. |
| Later local-prototype boundary | **Prototype · Fictional data**; login additionally says **Use demonstration credentials only.** | No real credentials, authentication, AI, HotSOS, blob storage, document ingestion, tracking or network font loads. Local selections and simulated results must be labeled. |

Sign out clears the active account, protected views, pending visual updates and unsent drafts; simulated already-saved fixture changes remain in the in-memory dataset until Reset demo or reload. This allows a requester-to-technician handoff demonstration without pretending there is a shared backend. A late AI response updates only its owning chat in the same authorized session; it cannot appear in whichever chat happens to be open.

---

# 6. Fictional demonstration dataset

## 6.1 Fixture boundary and identities

**Everything in this section is [D].** People, property, orders, equipment, timestamps and evidence below are authored demonstrations. They do not identify real Wind Creek employees, locations or technical configurations. Labels resembling source catalog issue categories preserve terminology only; demo IDs are not HotSOS IDs.

**Fixed demonstration clock:** 24 September 2026, 10:30 UTC. Use UTC explicitly in detailed timestamps; “Today” and “Yesterday” derive from that clock. This is a display fixture, not the actual timezone of a Wind Creek property. The create and close scenarios advance the demonstration clock to 10:31 and 10:35 respectively; their new events must not appear in the future relative to the displayed scenario clock. Property display name: **Training property**; full description: **Fictional training property — not a real venue**.

| User ID | Name / initials | Role | Demonstration email |
|---|---|---|---|
| USR-M | Morgan Reed / MR | Technician | `morgan.reed@example.com` |
| USR-A | Avery Cole / AC | Team member | `avery.cole@example.com` |
| USR-S | Sam Patel / SP | Technician | `sam.patel@example.com` |
| USR-J | Jordan Lane / JL | Team member | `jordan.lane@example.com` |

Primary chat/queue renders use Morgan. Creation renders use Avery. Closure renders use Avery to prove that closure is not limited to technicians. A future local demo may use the public, non-production password `demo` for these fictional accounts; never request or store a real password. The login image uses blank fields.

## 6.2 Demonstration issue and location catalog

Use the following compact fixture, rather than exposing the original catalog as verified current business data. In the source, issue categories include HVAC & Temperature, Plumbing & Water, Electrical & Lighting, Appliances, Doors, Windows & Locks, Floors, Walls & Ceilings, Furniture & Fixtures, Guest Services, Safety & Alarms and Other; location categories include Guestrooms, Casino & Gaming, Food & Beverage, Meeting & Events, Spa, Pool & Fitness, Restrooms, Public & Circulation, Back of House and Other. These source category labels may be used in filters even when a demonstration category has no matching fixture. fileciteturn2file1L410-L411

| Issue ID [D] | Issue label, preserving source-style terminology | Category |
|---|---|---|
| ISS-D01 | AC/Heat - Repair/Replace | HVAC & Temperature |
| ISS-D02 | Sink - Faucet - Dripping | Plumbing & Water |
| ISS-D03 | Ceiling Lamp/Light - Repair/Replace | Electrical & Lighting |
| ISS-D04 | Door - Latch - Repair/Replace | Doors, Windows & Locks |
| ISS-D05 | AC/Heat - Too Hot - Repair/Replace | HVAC & Temperature |
| ISS-D06 | Supply Fan - Repair/Replace | Other |

ISS-D04 is an authored demo label, not a claim that this exact label exists in the source catalog. All identifiers in this table are synthetic.

| Location ID [D] | Label | Area | Optional confirmed equipment from demo register |
|---|---|---|---|
| LOC-D01 | Conference Room C | Meeting & Events | EQ-D01 / AHU-D01 |
| LOC-D02 | Staff restroom — west corridor | Restrooms | None |
| LOC-D03 | Meeting foyer | Meeting & Events | None |
| LOC-D04 | Conference Room A | Meeting & Events | None |
| LOC-D05 | Guestroom 702 | Guestrooms | EQ-D02 / FCU-D02 |
| LOC-D06 | Lobby service area | Public & Circulation | EQ-D03 / SF-D03 |
| LOC-D07 | Guestroom 703 | Guestrooms | None |

## 6.3 Orders: one consistent store

The default queue shows six orders, sorted by created time descending: **All 6 · Open 4 · Closed 2**. There is no assignment column or technician work status.

| Order | Issue | Location | Requester | Created UTC | State |
|---|---|---|---|---|---|
| SO #1042 | ISS-D01 — AC/Heat - Repair/Replace | Conference Room C | Avery Cole | 24 Sep 2026, 09:20 | Open |
| SO #1041 | ISS-D02 — Sink - Faucet - Dripping | Staff restroom — west corridor | Avery Cole | 24 Sep 2026, 09:05 | Open |
| SO #1040 | ISS-D03 — Ceiling Lamp/Light - Repair/Replace | Meeting foyer | Sam Patel | 24 Sep 2026, 08:50 | Open |
| SO #1039 | ISS-D04 — Door - Latch - Repair/Replace | Conference Room A | Jordan Lane | 23 Sep 2026, 16:30 | Open |
| SO #1038 | ISS-D05 — AC/Heat - Too Hot - Repair/Replace | Guestroom 702 | Avery Cole | 23 Sep 2026, 14:10 | Closed |
| SO #1037 | ISS-D06 — Supply Fan - Repair/Replace | Lobby service area | Jordan Lane | 22 Sep 2026, 10:00 | Closed |

### Exact order detail content

| Order | Initial New Remark | Additional record content |
|---|---|---|
| SO #1042 | **Airflow in Conference Room C feels lower than usual. Please investigate.** | Equipment AHU-D01, identified from the demo register. Morgan's remark, 24 Sep 09:48 UTC: **Equipment tag reads AHU-D01. No cause has been confirmed.** History: created by Avery at 09:20; remark added by Morgan at 09:48. |
| SO #1041 | **The faucet in the staff restroom is dripping after use.** | Equipment **Not identified**. No additional remarks. History: created by Avery at 09:05. |
| SO #1040 | **One ceiling light in the meeting foyer is not illuminating.** | Equipment **Not identified**. No additional remarks. History: created by Sam at 08:50. |
| SO #1039 | **The Conference Room A door latch is not engaging consistently.** | Equipment **Not identified**. No additional remarks. History: created by Jordan at 16:30 on 23 Sep. |
| SO #1038 | **Guestroom 702 feels warmer than the neighboring rooms.** | Equipment FCU-D02. Closed by Morgan, 23 Sep 15:20 UTC. Resolution note: **Requester confirmed that the original report no longer needs attention.** |
| SO #1037 | **Please review the reported fan issue in the lobby service area.** | Equipment SF-D03. Closed by Sam, 22 Sep 11:00 UTC. Resolution note: **Duplicate report. The related report remains with the external operations team.** No specific external record or successful integration is implied. |

**Create-success fixture:** Avery selects ISS-D05 and LOC-D07; New Remark is **Guestroom 703 feels warmer than the neighboring rooms. Please investigate.** A successful simulated submission at 10:31 UTC creates **SO #1043**, Open, equipment Not identified. Queue becomes **All 7 · Open 5 · Closed 2**. No chat is created automatically.

**Close-success fixture:** Avery closes SO #1042 at 10:35 UTC with **Duplicate report confirmed with the requesting team. Follow-up remains in the existing external record.** In an isolated close scenario, counts become **All 6 · Open 3 · Closed 3**. If performed after the create scenario, counts become **All 7 · Open 4 · Closed 3**. Record the note as a closure explanation, not proof that the physical fault was repaired.

## 6.4 Your chats: current user Morgan

Default filter **All 5**; **Order-linked 3**; **General 2**. Recency is based on last message, not on clicking an old conversation. General titles may name equipment without receiving an order badge.

| Chat ID | Exact title | Order link | Equipment context | Last message UTC | Group |
|---|---|---|---|---|---|
| CH-D01 | AHU-D01 airflow question | SO #1042 | AHU-D01 | 24 Sep, 10:20 | Today |
| CH-D02 | AHU-D01 source documents | None | AHU-D01 | 24 Sep, 10:05 | Today |
| CH-D03 | Staff restroom sink report | SO #1041 | Not identified | 24 Sep, 09:30 | Today |
| CH-D04 | AHU-D01 service history | None | AHU-D01 | 23 Sep, 15:45 | Yesterday |
| CH-D05 | Guestroom 702 follow-up | SO #1038; show Order closed | FCU-D02 | 23 Sep, 15:25 | Yesterday |

**Second-technician fixture:** CH-S01 belongs to Sam and links to SO #1042. Its title is **Conference Room C follow-up**. It must not appear in Morgan's list. Sam's order action resumes CH-S01; Morgan's resumes CH-D01. Avery initially has no chats and therefore exercises the empty-list and first linked-chat paths.

### CH-D01 — exact first-render conversation

**Morgan · 10:16**  
Which unit serves Conference Room C?

**AskPat · 10:16**  
**AHU-D01 is listed as serving Conference Room C** in the demo equipment register. The order reports low airflow; that report does not establish the cause.

Evidence control: **Demo source · Training equipment register · Entry EQ-D01**.

**Morgan · 10:19**  
I'm looking at AHU-D01. Summarize what we know before I check the approved procedure.

**AskPat · 10:20**  
**Reported:** Lower-than-usual airflow in Conference Room C.  
**Identified:** AHU-D01, using your confirmation and the demo register.  
**Not established:** The cause or current operating readings.

The service order remains **Open**.

Supporting references are the readable **Order remark · SO #1042** link, which opens SCR-007 at the initial remark, and **Demo source · Training equipment register · Entry EQ-D01**, which opens SCR-010. These are references to supplied-in-this-spec synthetic records, not real technical manuals. Do not add an invented diagnosis, sensor reading, source count or percentage confidence.

### Other exact thread specimens

| Chat | User message | Assistant response / evidence |
|---|---|---|
| CH-D02 | **Which source identifies the area served by AHU-D01?** | **The demo equipment register lists Conference Room C for AHU-D01.** Evidence: Demo source · Training equipment register · Entry EQ-D01. |
| CH-D03 | **Summarize the reported sink issue.** | **The order reports a dripping faucet in the staff restroom — west corridor. No equipment unit or cause has been confirmed.** Reference: Order remark · SO #1041. |
| CH-D04 | **What service history is available for AHU-D01?** | **The demo history contains one completed inspection and one scheduled review. These are training records, not live maintenance data.** Show the two rows from DF-S02 below. |
| CH-D05 | **Can I continue asking about FCU-D02 after this order is closed?** | **Yes. This conversation can continue. SO #1038 is Closed, and sending another message will not reopen it.** Reference: current order status, not a technical citation. |
| CH-S01 | **What has the requester reported?** | **The report describes lower-than-usual airflow in Conference Room C. No cause is confirmed in the order.** Reference: Order remark · SO #1042. |

## 6.5 Evidence fixtures that actually exist as text in this specification

**DF-S01 — Training equipment register, demonstration revision 1, dated 23 Sep 2026.** This is a synthetic text record, not a PDF or actual property drawing. Its complete available content is:

| Entry | Equipment tag | Listed service area | Listed equipment location |
|---|---|---|---|
| EQ-D01 | AHU-D01 | Conference Room C | Roof mechanical area — training zone |
| EQ-D02 | FCU-D02 | Guestroom 702 | Level 7 service alcove — training zone |
| EQ-D03 | SF-D03 | Lobby service area | Ground-level plant area — training zone |

**DF-S02 — Training maintenance record, demonstration revision 1.** Complete available content: **AHU-D01: visual inspection recorded as completed on 22 Sep 2026; documentation review scheduled for 28 Sep 2026. No other maintenance records are present in this fixture.** An alternative scenario may show no history; it must not turn that absence into “no maintenance required.” No procedure, technical threshold or parts diagnosis is contained in this source.

**Unrecognized-code specimen [D]:** Morgan asks **What does TEST-X9 mean on AHU-D01?** Answer: **I don't have a confirmed meaning for TEST-X9 in the available material. Please confirm the code and the equipment tag; a readable photo may help.** The unknown-fault record stores `AHU-D01`, `TEST-X9`, 24 Sep 2026 10:30 UTC, the message and any actual attached-photo references. TEST-X9 is an authored placeholder, not a real manufacturer's fault code.

**Handoff specimen [D]:** **Equipment:** AHU-D01. **Reported issue:** Low airflow in Conference Room C. **Checks/results:** Equipment tag confirmed by Morgan; no diagnostic checks recorded. **Observations:** Lower-than-usual airflow reported by requester. **Readings:** None provided. **Photos:** None attached. **Next handoff:** Appropriate facilities specialist through the existing operational process. **Order:** SO #1042 remains Open. Do not fabricate completed checks to make the summary appear fuller.

**DF-S03 — Training identification checklist, demonstration revision 1.** An authored, non-repair procedure used only to demonstrate progressive chat UI: **Step 1: Read the equipment tag from an already visible label without opening a cover. Step 2: Compare the reported tag with the selected demo register entry. Step 3: Record whether the label and register match, or whether identification remains incomplete.** This fixture contains no electrical, mechanical, isolation or repair procedure. Its locator is Step 1, Step 2 or Step 3, not a fabricated PDF page.

---

# 7. Complete screen records

## Screen index

| ID | Name | Form | Primary representative state |
|---|---|---|---|
| SCR-001 | Sign in | Full page | `idle` |
| SCR-002 | Service orders | Full page | `all-populated` |
| SCR-003 | New service order | Full page | `ready` |
| SCR-004 | Service-order detail | Full page | `open-existing-chat` |
| SCR-005 | Your chats and new conversation | Workspace / mobile list | `home` |
| SCR-006 | AI conversation | Workspace | **`linked-populated` — first render** |
| SCR-007 | Order information | Popup / full-screen mobile sheet | `open-order` |
| SCR-008 | Close service order | Confirmation dialog / mobile sheet | `ready` |
| SCR-009 | Add a photo | Attachment dialog / mobile sheet | `empty` |
| SCR-010 | Source reference | Evidence viewer dialog / mobile sheet | `demo-source` |

The following records inherit §§2–6. An overlay is given a screen ID because it has its own renderable composition and state contract; this does not make it a separate app destination.

---

## SCR-001 — Sign in

### Purpose, scope and routes

Authenticate a provisioned user using the email and password described in SRC-USER. Requirement references: UR-01, UR-15; recovered FR-01 identity portion. **Source classification:** login behavior [U], automatic identity [F], screen composition and recovery [X]. The absent `index.html` is not used as visual evidence.

Entry: initial application visit, explicit Sign out, session expiry or an unauthenticated protected route. Exit: successful sign-in → SCR-005 by default; an authorized intended order/chat route may be restored after reauthentication. Invalid credentials and service failure stay on this screen. Do not expose a protected title, account name or record preview before authentication.

### Hierarchy, exact content and layout

Plain corporate identity → application name → **SIGN IN** → guidance → credentials → **Sign in**.

Use a white page on the light page ground. A quiet top identity area uses **Wind Creek Hospitality** and **AskPat** as ordinary live text. Center a 440px maximum form column, beginning approximately 210px below the top on the desktop target; this is not a floating shadow card. Heading **SIGN IN**, then **Use your provided email and password to access AskPat.** Fields are labeled **Email address** and **Password**. Email placeholder: **name@example.com**. Password is masked; a separate **Show password** control becomes **Hide password** without changing field width. The full-width filled action is **Sign in**.

Below the form, show **Accounts are provided by your organization.** Do not invent registration, SSO, password-reset or contact links. A later local demo additionally shows **Demonstration only. Do not enter real credentials.** and its public fictional account details outside the production-form semantics.

### States and interactions

| State | Entry / exact feedback | Actions and result |
|---|---|---|
| `idle` | Empty fields, baseline guidance | Email/password input; Show password; Sign in validates. |
| `invalid-fields` | **Enter your email address.** / **Enter an email address in the format name@example.com.** / **Enter your password.** | Inline messages; focus first invalid field; no authentication request. |
| `submitting` | **Signing in…** | Prevent double submission; do not display a guessed identity. |
| `credentials-rejected` | **Unable to sign in. Check your email and password and try again.** | Retain email, clear password; return focus to password. Same wording for an unknown account or incorrect password. |
| `service-failed` | **Sign-in is temporarily unavailable. Try again.** | Re-enable a safe retry; no provider stack trace. |
| `expired` | **Your session has expired. Sign in again to continue. Unsent drafts were cleared.** | Render no protected data; safe route restoration after valid login. |
| `signed-out` | **You're signed out.** | Blank password and no active account controls. |

Enter submits once; password-manager/paste input remains possible. The production integration determines any rate-limit or inactive-account response; do not invent countdowns or a security policy. A local prototype accepts only its announced fictional credentials and is not represented as actual authentication.

### Responsive, assets and brand application

On 390px, use 16px gutters and a naturally scrolling form beginning 32px below identity; do not vertically center it off-screen when the keyboard opens. Inputs remain 16px and targets 44px. No sidebar, marketing photography or decorative illustration. Assets AS-01/02/03 only. Apply PAT-001/005 and shared required brand rules, with DES-004's compact hierarchy adaptation.

### Acceptance checks

Both fields have persistent labels and distinct focus. A missing password cannot authenticate. No role selector substitutes for credentials. An expired session reveals no previous chat or order. Sign-in success uses the authenticated identity for later requester attribution. Corporate text is not presented as a reconstructed logo.

### Resolved render brief

`SCR-001.idle / 1440×900 / v1.0`. Show the quiet Wind Creek text identity, AskPat name, compact red condensed SIGN IN heading, one 440px form with empty Email address and Password, Show password, one gradient-red Sign in button, and a small Prototype · Fictional data strip. Generous surrounding white/light-gray field. No account identity, role chooser, photo, logo imitation, card shadow or error state.

---

## SCR-002 — Service orders

### Purpose, scope and routes

Let users scan accessible service orders, find a particular order and open its information. Requirements: UR-03/04/05/06, HP-05/06, recovered FR-04 as adapted. Entry: Service orders navigation, create success, or Back from order detail. Exit: selected record → SCR-004 with its exact ID; New service order → SCR-003; Chats → restored chat workspace.

### Hierarchy, exact content and layout

Shared shell, Service orders active. Main region uses 32px desktop gutters and up to 1320px width. Page title **SERVICE ORDERS**. Supporting line **View reported issues and open an order for details.** Top-right filled action **New service order**.

Below: labeled **Search service orders**, placeholder **Order number, issue or location**, clear-search control when nonempty. Preserve order-number search from the source; issue/location search is a selected extension. A quiet filter row reads **All 6**, **Open 4**, **Closed 2**, with underline/selected text rather than oversized pills. These counts describe the full authorized fixture before the text query; a separate line reports the number of matches.

The white ruled table has headers **Order**, **Issue**, **Location**, **Requested by**, **Created**, **Status**. Use the six records in §6.3 exactly. IDs and issue titles are explicit record links with accessible names such as **View service order 1042: AC/Heat - Repair/Replace**. No inline closure button, assignment control, play icon or elapsed-work timer is added to a row. Default sort is newest created first. A named sort control **Created: newest first** may switch to oldest first; do not show decorative sortable arrows on unsupported columns.

### States and interactions

| State | Visible content | Result / recovery |
|---|---|---|
| `all-populated` | All selected; six fixture rows | Select any row's order link → its correct detail. |
| `open-filter` | Open selected; four open rows | Closed rows remain in the dataset, accessible through Closed or All. |
| `closed-filter` | Closed selected; SO #1038 and #1037 | Opening a closed record does not reopen it. |
| `search` | Query **1042**; **1 order matches**; correct row | Clearing query restores filter results. Query and business-state filter combine. |
| `no-results` | **No orders match these filters. Clear a filter or try another search.** | Clear search; All filter; no false empty-dataset claim. |
| `empty` | **No service orders yet. Report an issue to create the first one.** | New service order remains visible. |
| `loading` / `failed` | Shared loading/failure copy | Retry list only; no invented count while loading. |
| `created` | Durable notice **Service order SO #1043 created.**; new row briefly emphasized | Select All if the prior filter would hide the new record; clear an excluding query with an explicit notice. Counts update to 7/5/2. Focus new row link. |
| `updated-after-close` | Updated Closed label and counts | Refresh from shared store. Under Open filter, closed row disappears and status announcement explains why. |
| `stale` | **Showing the last loaded orders. Refresh to check for changes.** | Refresh; no “Live” badge or fake last-sync timestamp. |

Changing a filter preserves keyboard focus on its control and announces results. Clicking a row's whitespace may be a convenience, but the genuine link remains keyboard accessible. Browser Back from detail restores filter, query, sort and list scroll position.

### Responsive, assets and brand application

At 768–1099px, combine Issue and Location in one cell and move requester/created metadata under the order/issue text, while keeping it present. Below 768px, each order is a ruled full-width record: first line order ID plus status; second issue; then **Location**, **Requested by** and **Created** with values. No microscopic table or hidden required detail. Search and primary action stack; filter controls wrap rather than shrink.

Assets AS-01/02/03 only. Apply PAT-004 and DES-003/004/006/007. Use the reference's labeled comparison logic, not its reward colors or promotional values.

### Acceptance checks

All six rows resolve to the correct record. There are only Open/Closed status values. Search **1042** returns one result. Create adds one real fixture record, not just a toast. Closing updates list/filter counts without creating an “in progress” state. Every phone record retains location and requester information.

### Resolved render brief

`SCR-002.all-populated / 1440×900 / v1.0`. Show the shared header, Morgan, Training property, red condensed SERVICE ORDERS title, one New service order primary action, search, All 6/Open 4/Closed 2 filters, and a six-row white ruled table using §6.3. Keep four Open and two Closed labels understated. No charts, KPI cards, Started/Stopped text, media glyphs, work timers or heavy row cards.

---

## SCR-003 — New service order

### Purpose, scope and routes

Capture the source form's three required values and submit one issue to the shared order list. Requirements: UR-02/03, HP-01–04, recovered FR-01 requester attribution, FR-02 payload portion and FR-03 create portion. Entry: New service order from SCR-002; optional global create link from a relevant empty state. Exit: successful create → SCR-002.created; Cancel → invoking screen, after discard handling when needed.

### Hierarchy, exact content and layout

Shared shell, Service orders active, Avery Cole signed in. A 720px maximum form column within the white workspace. Quiet **Back to service orders** link, title **NEW SERVICE ORDER**, supporting copy **Tell the technician team what needs attention and where. All three fields are required.**

Read-only context line: **Requested by Avery Cole · Training property**. Do not ask the user to type their identity or choose a technician.

Fields in source order:

1. **Issue — required.** Helper: **Filter by category or search all issues, then choose one.** Trigger initially **Choose an issue…**.
2. **Location — required.** Helper: **Filter by area or search rooms and locations, then choose one.** Trigger initially **Choose a location…**.
3. **New Remark — required.** Helper: **Describe what you observed so the technician team can investigate.** Textarea initially empty. A selected prototype maximum of 2,000 characters may be used with a visible count; this is not asserted to be the external API's limit.

After a single section rule: filled **Create service order**, quiet **Cancel**. When incomplete, adjacent help explains **Choose an issue and location, then add a remark to continue.** No right-side payload card duplicates the same fields.

Ready fixture: **AC/Heat - Too Hot - Repair/Replace**; **Guestroom 703**; **Guestroom 703 feels warmer than the neighboring rooms. Please investigate.** Requester and all values remain visible before submission.

### States and interactions

| State | Exact representative UI | Actions / result |
|---|---|---|
| `empty` | Three empty required fields; disabled primary plus completion help | No order ID assigned yet. |
| `issue-picker` | Search label **Search issues**; category **HVAC & Temperature**; two matching fixture issue options | Category/query intersection; clear filter; explicit option selection. Preserve original label, store selected synthetic code. |
| `location-picker` | Search label **Search locations**; query **703**; option **Guestroom 703 · Guestrooms · LOC-D07** | Select option, close picker, return focus to trigger. |
| `picker-no-results` | **No matches. Try different words or another category.** | Clear search/filter. Do not create a free-text location silently. |
| `picker-load-failed` | **We couldn't load the available choices. Try again.** | Retry choices only; keep remark and other selected field. |
| `invalid` | **Choose an issue.** / **Choose a location.** / **Add a short description of the problem.** | On blur/validation or rejected submission, show owning error; focus first invalid control. Whitespace is not a valid remark. |
| `ready` | All selected values, nonempty remark, active Create service order | Submission freezes one request; no separate routine approval screen. |
| `submitting` | **Creating service order…** | Disable repeated commit; retain visible values. |
| `failed` | **The order wasn't created. Your information has been kept. Try again.** | Preserve fields; safe retry uses original request identity. |
| `unconfirmed` | **We haven't confirmed whether the order was created. Check the list before trying again.** | Check list/reconcile; don't create a duplicate blindly. |
| `created` | SO #1043 returned in the success scenario | Update shared dataset once; route to SCR-002.created. |
| `dirty-cancel` | **Discard this service order draft?** Supporting **No service order has been created.** | **Keep editing** or **Discard draft**. Unchanged empty form cancels directly. |

A category filter never changes the selected Issue unless an option is chosen. Canceling the selector retains the previous value. Changing location does not overwrite the user's remark. Failed submission must not clear the form or send the user to an unchanged queue.

### Responsive, assets and brand application

Desktop is intentionally one form column, not a multi-stage wizard. On phone use 16px gutters; textareas grow and the entire form scrolls. Selectors become full-width/full-height option panels when the anchored list cannot fit, with persistent search, filter access, clear close control and scrollable results. Never hide Issue/Location or duplicate them in a disappearing rail. Stack actions at narrow widths; primary remains visible after the form rather than covering it.

Assets AS-01/02/03 only. Apply PAT-005, PAT-001 and DES-005/006. Field halo and stronger keyboard outline are distinct from red error messages.

### Acceptance checks

All three fields are required and use the selected values, not their display text alone. Requester is Avery without an editable name field. A successful create yields one new Open record with the same values. A failed or canceled submission yields none. Search/filter/selection works by keyboard and touch. Natural-language extraction is not claimed.

### Resolved render brief

`SCR-003.ready / 1440×900 / v1.0`. Show Avery in the shared header, Service orders active, one 720px clean form, NEW SERVICE ORDER, Requested by Avery Cole, the three exact ready-fixture values, visible required labels, and Create service order plus Cancel. No payload rail, AI extraction claims, assignment control, photo or floating marketing card. If a selector state is later requested, show that one panel rather than a collage of states.

---

## SCR-004 — Service-order detail

### Purpose, scope and routes

Provide the actual order record before a technician enters AI chat. Requirements: UR-04/06/08/12/14, HP-10/11, recovered FR-03 notes and close. This is a selected structural extension that separates the former `ticket.html` combination into record and conversation.

Entry: an order link in SCR-002 or **View order** in SCR-007. Exit: Back to service orders; Chat about this order/Continue your chat → SCR-006; Close order → SCR-008; Chats navigation. Preserve the list return state.

### Hierarchy, exact content and layout

Shared shell, Service orders active. Record container up to 1120px. Quiet breadcrumb **Service orders / SO #1042**. Header: eyebrow **SO #1042**, short red condensed issue heading **AC/HEAT — REPAIR/REPLACE**, understated **Open** label. Primary action **Continue your chat** for Morgan; for Avery with no linked chat, **Chat about this order**. Secondary **Close order** is available to either role.

Main record uses two related regions at wide desktop: a roughly two-thirds reading region for **Reported issue**, **Remarks** and **Order history**, and a one-third neutral metadata region. Use one dividing rule or quiet tonal region, not a box around every value.

Exact primary content from SO #1042: **Airflow in Conference Room C feels lower than usual. Please investigate.** Metadata: **Location — Conference Room C**; **Equipment — AHU-D01**; **Requested by — Avery Cole**; **Created — 24 Sep 2026, 09:20 UTC**; **Property — Training property**. Equipment source line: **Demo register association**, not a live field verification badge.

Remarks list shows Morgan's 09:48 remark from §6.3 with author/time. **Add remark** opens an inline labeled **Remark** textarea and **Save remark / Cancel**. **Order history** is collapsed by default and discloses creation and remark events. Do not include another person's private AI messages or unrelated equipment maintenance events in order history.

### States and interactions

| State | Visible change | Actions / outcome |
|---|---|---|
| `open-existing-chat` | SO #1042 Open; Morgan has CH-D01 | Continue your chat reuses CH-D01 without creating or starting work. |
| `open-no-chat` | Same order, Avery has no linked chat | Chat about this order creates/reserves Avery's unique linked conversation. |
| `closed` | Show Closed, closure actor/time/note; no active Close order control | View history; continue existing chat or create the user's first linked chat for reference. Neither action reopens the order. |
| `unknown-equipment` | **Equipment — Not identified** | Do not fabricate a unit from the issue type. Chat can ask a minimal clarification. |
| `history-open` | Creation/remark/closure events expanded | Hide history; no unrelated equipment record masquerading as an order event. |
| `remark-editing` | Label **Remark**; blank or explicitly transferred handoff draft | Save only a nonempty note; Cancel leaves shared order unchanged. |
| `remark-saving` | **Saving remark…** | One request; disable duplicate Save. |
| `remark-saved` | New note with author/time; **Remark added.** | Shared order popup reflects it; private chat transcript remains separate. |
| `remark-failed` | **The remark wasn't saved. Your text has been kept.** | Retry/Cancel; no false history entry. |
| `loading` / `failed` / `unavailable` | Shared record feedback | Retry or Back to service orders. No guessed metadata. |

Selected prototype remark limit: 2,000 characters, subject to the eventual API contract. Closing while a remark draft is dirty preserves the draft or asks the user to discard it; it never silently commits the remark. A closed-record refresh replaces Add remark with **This order is closed. Remarks are read-only.**

### Responsive, assets and brand application

Below 1100px, stack record context, reported issue, remarks and history in that order. On phone keep ID/status and issue readable; wrap the chat and Close order actions below the title. All metadata remains available. No persistent bottom work-control bar. Assets AS-01/02/03; record illustration omitted. PAT-006/004 for information hierarchy, PAT-001/005 for actions and notes, DES-003 for purposeful boundaries.

### Acceptance checks

Queue and detail IDs match. Both Avery and Morgan can initiate closure. Their chat actions resolve different user-owned relationships for the same order. No remark is posted merely by chatting. Closed detail includes the closure explanation without implying repair. Missing equipment is labeled rather than invented.

### Resolved render brief

`SCR-004.open-existing-chat / 1440×900 / v1.0`. Show SO #1042 Open, Morgan, red compact issue heading, Continue your chat as the primary button and Close order secondary. Put the reported issue and one remark in the main reading region, with location/equipment/requester/created metadata alongside. History collapsed. No timer, Start/Stop control, assignee selector, marketing photo, chart or card dashboard.

---

## SCR-005 — Your chats and new conversation

### Purpose, scope and routes

Make personal AI conversations reachable regardless of where they began, and provide a main-screen entry to a new general chat. Requirements: UR-07/09/10/12/13; current multi-chat model. Entry: successful login, Chats navigation, New chat or Back to list on mobile. Exit: select a saved chat → SCR-006; first valid general message → one newly created SCR-006 conversation; Service orders → SCR-002.

### Hierarchy, exact content and layout

Shared Chats shell, Morgan signed in. Desktop left panel, 304px: **Your chats**, outline **New chat**, persistent search label **Search your chats**, placeholder **Title, equipment or order number**, filters **All 5 / Order-linked 3 / General 2**, then Today and Yesterday groups from §6.4. Each order-linked row retains its badge independent of title wrapping; CH-D05 also says **Order closed**. No badge is shown on either general AHU-D01 conversation.

The unselected/new right workspace uses a 640px reading column, beginning around the upper third of the remaining region—not an oversized empty-state card. Title **ASK ABOUT EQUIPMENT OR AN ISSUE**. Supporting copy **Start a general conversation, or open a service order to keep its context attached.** Context line **No service order attached**. Composer label **Message**, placeholder **Ask a question or describe what you observed…**, Add photo and Send.

Two quiet, rectangular example actions, not large cards: **Which unit serves Conference Room C?** and **What history is available for AHU-D01?** Clicking one fills the composer and gives it focus; it does not send automatically or create an order link.

### States and interactions

| State | Visible content | Result |
|---|---|---|
| `home` | Morgan's five chats, unselected right workspace | Choose a chat or compose a new one. |
| `new` | Same list, no selected saved chat; unsaved composer draft | Repeated New chat does not create empty records; first successful Send creates one general chat. |
| `empty-list` | Avery: **No chats yet. Start a general conversation, or open a service order and choose Chat about this order.** | Composer/New chat available; no fake sample chats attributed to Avery. |
| `filtered-linked` | Three linked chats | Badges visible on every row. |
| `filtered-general` | CH-D02 and CH-D04 only | Both may reference AHU-D01; no merging or deduplication by equipment. |
| `search` | Query **1042** gives CH-D01; query **AHU-D01** gives CH-D01/02/04 | Search title/equipment/association; order link remains explicit. |
| `no-results` | **No chats match your search. Clear the search or choose another filter.** | Clear search/All; underlying records intact. |
| `loading` / `failed` | Shared list loading/failure | Retry list; do not discard a right-side unsent draft. |
| `mobile-list-open` | Full-height Your chats panel with search, filters, recency and close control | Selecting a row closes panel and opens its conversation; focus moves to chat title. |

Filter counts describe the user's complete list; a separate matched-result count reflects search. Sort by last message descending within each recency group. Opening an order-linked chat from this list is the same action as continuing it from the order—no cloned transcript, second order reference or alternative chat ID.

### Responsive, assets and brand application

On phone `/chats` initially shows the full-width Your chats list with New chat. New chat opens the general compose workspace; **Your chats** returns to the list. A selected conversation can reopen the list as a full-height modal panel. Keep search and badges; do not reduce this to icon-only navigation. Assets AS-01/02/03. PAT-002/004/005/006 adapted; no decorative empty-state photo or AI mascot.

### Acceptance checks

Order-linked and general chats coexist in one list. Both general AHU-D01 chats remain separate. A chat opened from an order appears here under the same ID even before its first linked message. No other user's chat appears. General example questions only populate the field and never silently attach an order.

### Resolved render brief

`SCR-005.home / 1440×900 / v1.0`. Show Morgan's five-entry mixed chat list with three order badges and two unbadged AHU-D01 chats, Chats underlined, and a quiet open new-chat workspace with title, explanatory line, two text suggestions and empty Message composer. No selected order header, no info button for a nonexistent linked order, no image, no fake assistant avatar logo.

---

## SCR-006 — AI conversation

### Purpose, scope and routes

Support an ongoing AI conversation either independently or with explicit order context, while retaining the user's main chat list. Requirements: UR-07–14, HP-07/08/09, recovered FR-05–18 and the answer-time portion of FR-25. Entry: a saved chat from Your chats, a first general message, or an order's get-or-create chat action. Exit: another chat, New chat, Service orders, order-information popup, photo dialog, source viewer or closure dialog.

**This is the suggested first screen to render:** it proves the distinctive multi-chat/order relationship and the brand translation at the same time.

### Hierarchy, exact content and region layout

Use the shared Chats shell and Morgan's five-row list. Select CH-D01. The main region is a continuous light working surface, not a chat card inside another card.

**Header, about 84px at the desktop target:** short condensed title **AHU-D01 AIRFLOW QUESTION**; secondary title/metadata may wrap. At the top right: quiet **Close order** and a 44px info button with accessible name **Order information**. The info button is visible without opening an overflow menu. It uses a generic information-circle glyph, not a logo. The close action does not replace Send as the primary local conversation action.

**Order context strip, about 44px:** **Linked service order · SO #1042 · Open** and **Conference Room C**. The strip is a light neutral band with no work-state banner. Order number opens SCR-004 only when offered as an explicit **View order** link; the information button opens SCR-007. Equipment context is separately labeled **Equipment: AHU-D01**; the equipment label is not an order association.

**Conversation region:** 760px maximum reading column, centered within the remaining width, with roughly 32–48px horizontal breathing room when space permits. Render the four messages and evidence links in §6.4 exactly. Ordinary-sans 16px body, 24px line height; names and timestamps 14px. AI answer occupies the light page without a border; user's message has a quiet gray block, 4px radius, aligned consistently toward the right. Source links sit directly below the supporting answer rather than in a distant generic source rail. Do not overdecorate every confirmed/missing phrase with a card.

**Composer:** fixed within the chat workspace's bottom region, not the browser page; one top rule and a white surface. Persistent **Message** label, growing textarea, Add photo and a filled **Send** button. Placeholder **Ask a follow-up or describe what you observed…**. Desktop help **Enter sends · Shift+Enter adds a line**; mobile help does not claim Return sends. A staged attachment occupies one removable row above the textarea. Keep at least enough padding for the last message to remain reachable above the composer.

At 1440×900, the 24px demo strip plus 64px shell leave an 812px workspace. The target allocation is approximately 84px chat header, 44px context strip, 512px thread and 172px composer. These are composition targets, not rigid heights when text wraps. The four-message first-render fixture should fit without tiny typography.

### General versus linked and closed variants

**General chat:** same list, message hierarchy and composer. Replace order context with **General conversation · No service order attached**. Omit order information and Close order entirely. Equipment may still be AHU-D01. Never show a disabled order button suggesting a hidden association.

**Linked to an Open order:** show the association, Open label, top-right info button and Close order. An empty linked chat says **This chat is linked to SO #1042. What would you like to ask?** and summarizes only the actual record's issue/location. It does not generate a diagnosis on entry or change work status.

**Linked to a Closed order:** association remains; show **Order closed** and the received closure date. Remove the actionable Close order control. A calm line says **You can continue this conversation. Messages will not reopen the order.** The information button and evidence access remain. The one-linked-chat invariant still applies.

### Conversation and response states

Every row below is a state of this screen, not a new order status. A state containing diagnostic content requires genuine qualifying source material in production; local fixtures are visibly synthetic.

| State | Exact representative content / contract | Actions and side effects |
|---|---|---|
| `linked-populated` | CH-D01's four-message thread and linked SO #1042 Open context | Send, Add photo, Order information, Close order, source links, list navigation. |
| `general-populated` | CH-D02 or CH-D04, General conversation strip | Same conversation actions, without order controls. |
| `linked-empty` | **This chat is linked to SO #1042. What would you like to ask?** | Persistent linked list entry; Send starts messages, not work. |
| `linked-closed` | **Order closed. You can continue this conversation. Messages will not reopen the order.** | Read/send remains available; no duplicate linked chat or reopen action. |
| `sending` | User message indicates **Sending…** | Prevent duplicate send. Message/attachment IDs are stable. |
| `waiting` | **Preparing a response…** | Busy state belongs to the response. No recording light, work timer or Stop-work control. |
| `send-failed` | **Your message wasn't sent. Try again.** | Retry the same message; retain text/photo; no duplicate bubble. |
| `answer-failed` | **We couldn't complete the response. Try again.** | Retry the answer without reposting the user message or repeating a business mutation. |
| `identifying` | **Which equipment tag or location does this concern?** | Ask only when context is absent; accept text/location/photo as appropriate. |
| `ambiguous-unit` | **I found two possible units for that description. Which tag is on the equipment you are checking?** | Show actual candidate labels if returned; no arbitrary selection. No synthetic candidate is called a real result. |
| `unit-confirmed` | **Equipment context: AHU-D01.** | Keep source of identification available. Does not automatically write the equipment onto the shared order. |
| `changed-unit` | **This question concerns FCU-D02. Use it as the equipment context for this conversation?** | **Use FCU-D02** / **Keep AHU-D01**. Explicit context change affects subsequent retrieval, not the order link. |
| `answer-with-evidence` | Supported answer followed by source title, exact locator and version when known | Open evidence at that locator in SCR-010. DF-S01 is labeled Demo source. |
| `no-source` | **I don't have a source that supports an answer for this unit. Share the equipment tag or identify the approved document.** | Clarify in chat; no manual/PDF-upload control is invented. Documents enter the knowledge base through the separate ingestion process. |
| `maintenance-history` | DF-S02's completed 22 Sep inspection and scheduled 28 Sep review | Separate past work from future due dates. Do not add order work-status controls. |
| `history-unavailable` | **No maintenance records were returned for this unit. That does not establish whether maintenance is due.** | Refine unit/context; no unsupported Begin tracking button. |
| `code-lookup` | **Which unit shows this code?** only if unit not known | Lookup must combine code and unit; no confident generic interpretation detached from equipment. |
| `unrecognized-code` | TEST-X9 response from §6.5; **Unrecognized code recorded for this chat.** only after local record acknowledgement | Record unit/code/time/context and actual photo references. No speculative cause or approved knowledge entry. |
| `fault-log-failed` | **No confirmed answer was found. The unknown-fault record wasn't saved; your message is still here.** | Retry record creation with the same record ID; preserve message. |
| `image-review` | **Reviewing the submitted photo…** | Actual attachment must exist; only state categories permitted by FR-10, plus separately required tag/code reading under FR-06/09. |
| `unclear-image` | **The detail needed to read this is not clear. Add a clearer photo or type the label or value you can see.** | Add photo; type observation. No confident reading from missing/blurred detail. |
| `unsupported-visual-condition` | **This condition isn't within the supported visual checks. Describe what you observed or provide the reading directly.** | Do not infer movement of a wheel from a still image or invent an additional visual diagnostic category. |
| `symptom` | **I have the reported symptom and the unit context. The cause is not established yet.** | Move to source-grounded next question/check, not an invented diagnosis. |
| `guided-step` | DF-S03 Step 1: **Read the equipment tag from an already visible label without opening a cover. What tag is shown?** Evidence: Demo source · Training identification checklist · Step 1 | User result advances to compare tag in Step 2; mismatch/unclear result returns to identification. Step 3 records match/incomplete outcome. No repair procedure is fabricated. |
| `insufficient-evidence` | **The available information does not establish the cause. The missing detail is the equipment tag.** | Replace “equipment tag” with the actual minimum missing fact; don't repeat already supplied questions. |
| `safety-boundary` | **This may require qualified personnel. I don't have a verified procedure for this condition; use your approved site process before proceeding.** | Explain the actual boundary when known; offer a handoff summary, not source-free hazardous steps. Order stays Open. |
| `handoff-summary` | Exact fields in §6.5: equipment, symptom, completed checks/results, observations, readings, photos and order context | **Copy summary**. Linked open chat additionally offers **Add as order remark**, opening an editable draft in SCR-004. No assignment or automatic external handoff. |
| `conflicting-evidence` | **The available sources disagree on this detail. I can't treat it as confirmed until the applicable version is established.** | Show each actual source/version and ask the smallest needed clarification. Do not manufacture a conflict-resolution result. |
| `order-context-failed` | **Order information couldn't be refreshed. The last loaded state was Open.** | Retry context; disable closure until current status/access is established; no guessed new state. |
| `unavailable` | **This conversation isn't available to your account.** | Back to Your chats; no title or messages from another user's chat. |

### Specific interaction boundaries

Removing order work controls must not suppress the recovered FR-14 safety boundary: when a condition makes continued troubleshooting unsafe, the assistant must tell the user not to continue that unsafe activity and direct them to the approved site process and appropriate qualified personnel. Safety language about an inspection is not a Start/Pause/Stop service-order control, and it must not trigger an equipment or order mutation.

A statement in a chat such as “close this order” does not itself perform closure. The assistant may present **Review closure**, which opens SCR-008 with the order identified; only its explicit commit requests closure. If no order is linked, do not guess which equipment-related order the user meant.

User messages and excerpts are rendered as content, never executed as HTML or application commands. A photo of a tag can help identify equipment where supported, but recognition and confidence must not be fabricated from an absent asset. A source list proves neither correctness nor currentness; claim/source association remains mandatory.

Copy summary is the only general-chat handoff action. It copies only visible summary text and acknowledged attachment references; if clipboard access is unavailable, show selectable text and **Copy isn't available here. Select the summary text to copy it.** Do not claim a photograph's bytes were copied when only its filename is included.

### Responsive, assets and brand application

Below 960px the chat list becomes the reachable Your chats panel; opening an information popup does not permanently replace the list. On phone the title and linked context wrap above the thread. Keep the info button in the top-right header area; Close order can move to a labeled second row, not disappear into an ambiguous menu. Composer sits above the keyboard and expands without hiding the last message. Evidence links wrap their title/locator. No marketing imagery is needed.

Use AS-01/02/03 and the text evidence fixtures AS-06 when applicable. Actual submitted photos are AS-04; missing images are never replaced by a claimed inspection photo. Apply EXP-002, DES-002/003/005/006/007, PAT-001/005/006. Unit/context/response states are [X/F], not website behavior.

### Acceptance checks

CH-D01 is the same conversation from both the main list and SO #1042. Morgan cannot create a second linked chat for that order; Sam can have his separate one. General AHU-D01 chats remain unlinked. The info button opens SO #1042, not a hardcoded ID. Closure is available to Avery as well as Morgan when authorized. Message sends, source views and photo selections never change order state. Unavailable evidence is labeled, and no fabricated diagnostic citation appears.

### Resolved render brief — first render

`SCR-006.linked-populated / 1440×900 / WC-ASKPAT-SCREENS v1.0`.

Produce one complete desktop application viewport, without browser chrome or an external device frame. Use the plain Wind Creek Hospitality + AskPat text header, Morgan Reed · Technician, Training property and a small Prototype · Fictional data strip. Chats is underlined in red. The 304px left panel shows all five specified chats, selected CH-D01, three visible SO badges and two unbadged general AHU-D01 conversations. In the dominant right region show AHU-D01 AIRFLOW QUESTION, Linked service order · SO #1042 · Open, Conference Room C, Equipment: AHU-D01, the top-right Order information icon and quiet Close order action. Render the four exact messages from §6.4, the Demo source link, and a bottom Message composer with Add photo and gradient-red Send. The order popup is **closed** in this first frame. Use white/light-gray surfaces, restrained red, condensed short title, readable 16px message body, subtle rectangular grouping and thin rules. No faux logo, marketing picture, PDF page image, right-side permanent order rail, Start/Pause/Stop control, timer, recording light, gold verification stamp or dashboard card grid. Framing targets this viewport; generated output pixels must be measured later rather than assumed.

---

## SCR-007 — Order information

### Purpose, scope and routes

Let a user inspect the linked order without losing the conversation. Requirements: UR-11/14, HP-10, inherited record/state rules. Entry: top-right Order information on linked SCR-006 or its Order remark reference. Never available on a general chat with no order association. Exit: Close/Escape → original conversation and focus; View order → SCR-004; Close order → SCR-008, replacing this popup with a remembered return destination.

### Hierarchy, content and layout

Desktop centered dialog approximately 560px wide, maximum 82% viewport height, over the dimmed conversation; use a neutral scrim and purposeful elevation. Header **ORDER INFORMATION** with an explicit close icon. Top summary **SO #1042 · Open**, issue **AC/Heat - Repair/Replace**. A ruled definition list shows Location, Equipment, Requested by, Created and Property using SO #1042 values. Follow with **Reported issue**, **Remarks** and **Order history** disclosure. No tile grid replicating each field.

Footer: outline **View order**, quiet **Close order** for an Open order, and a clear dismissal control in the header. Its content comes from the same order store as SCR-004. **View order** does not start a chat; this popup already belongs to a chat. Closing the popup never closes the business order.

### States and interactions

| State | Visible content | Recovery / result |
|---|---|---|
| `open-order` | SO #1042 Open; full exact metadata and initial report | View order, Close order, Order history, dismiss. |
| `history-open` | Creation and Morgan's remark event | Hide history; maintain popup scroll. |
| `remark-anchor` | Same popup, initial remark scrolled into view and heading focused | Used by the in-answer Order remark link; no duplicated transcript. |
| `closed-order` | Closed, closure actor/time/note | View order and dismiss remain; no duplicate closure control. |
| `loading` | **Loading order information…** | Keep dialog title/close available; do not flash another order. |
| `failed` | **We couldn't load the order information. Try again.** | Retry within popup or dismiss; chat draft/scroll intact. |
| `unavailable` | **This order isn't available to your account.** | No protected metadata; dismiss and recheck linked-chat access. |

### Responsive, assets and brand application

Phone: full-screen sheet with its own header and scrollable body; no cramped desktop dialog. Footer actions wrap/stack and stay reachable without covering remarks. Escape and explicit close return to the info button; Back behaves equivalently. Assets AS-01/03 only, no photo. PAT-006/004 and DES-003/005/006; metadata layout is a selected application extension.

### Acceptance checks

The popup reads the selected chat's order ID. A general chat has no fake order popup. The same remarks/closure appear in detail and popup. Avery may initiate closure here. Dismissing the popup restores the exact chat and draft. The popup contains no list of other technicians' chats and no work-status controls.

### Resolved render brief

`SCR-007.open-order / 1440×900 / v1.0`, parent SCR-006 CH-D01. Keep the recognizable linked-chat/list composition dimly visible behind one centered 560px ORDER INFORMATION dialog. Show SO #1042 Open, issue, Conference Room C, AHU-D01, Avery Cole, created time, initial remark and one Morgan remark; history collapsed. Footer View order and Close order. No Start/Stop, nested card tiles, photo or additional stacked dialog.

---

## SCR-008 — Close service order

### Purpose, scope and routes

Allow any authorized signed-in user to initiate closure of an Open order with a required note. Requirements: UR-06/14, HP-11, recovered FR-03 close portion. Entry: Close order in SCR-004/006/007, or a linked-chat Review closure action. Exit: Cancel → invoking screen/popup unchanged; acknowledged close → invoking screen with refreshed Closed context. No routing to a work-session completion screen.

### Hierarchy, exact content and layout

Dialog approximately 560px wide, with title **CLOSE SERVICE ORDER**. Summary line **SO #1042 · Open**, issue and **Conference Room C**. Plain consequence copy: **This will mark the service order Closed. Its chats will remain available. Work-session controls are managed outside AskPat.**

Persistent label **Resolution note — required**. Helper: **Explain why this order is being closed and any follow-up that remains.** Textarea starts empty; it is not auto-filled with a claimed successful repair. Selected prototype maximum 2,000 characters, not an asserted API limit. Footer **Cancel** and filled **Close service order**. Ready render uses Avery as the actor and the exact close fixture note from §6.3. This demonstrates that closure is not technician-only.

### States and interactions

| State | Exact content / control change | Result |
|---|---|---|
| `empty` | Blank note; primary disabled; **Add a resolution note to continue.** | User writes note; no order mutation. |
| `ready` | Fixture note entered; Avery is signed in | One explicit Close service order submits. |
| `invalid` | **Add a resolution note.** | Whitespace rejected; focus note. |
| `submitting` | **Closing service order…**; last-confirmed Open badge retained | Prevent duplicate commit. Do not offer Cancel as a promise to undo an already accepted request. |
| `success` | **Service order SO #1042 closed.** | Update store/actor/time/note and all linked contexts; dismiss to refreshed parent with durable success notice. No repair claim. |
| `failed` | **The order is still Open. Your note has been kept. Try again.** | Retry safely; no false Closed badge. |
| `unconfirmed` | **Closure has not been confirmed. Refresh the order before trying again.** | Reconcile original request; do not issue a blind second close. |
| `already-closed` | **This order has already been closed.** plus received actor/time/note | **Return to order** or dismiss. Do not overwrite closure note or append the user's abandoned draft silently. |
| `changed-record` | **The order changed while you were reviewing it. Review the current details before closing.** | Refresh details; preserve note; use current version on next explicit commit. |
| `access-lost` | **You no longer have access to close this order.** | No bypass; return to authorized list/context. This is access enforcement, not an assignee-only rule. |

Canceling before submission changes nothing. While a request is already in flight, leaving the dialog does not cancel the backend operation: retain pending-request identity and reconcile its result into the authorized parent. After closure, focus the parent's status/confirmation rather than a removed Close order button. A dirty pre-submit dismissal offers Keep editing/Discard note without closing the order.

### Responsive, assets and brand application

Mobile full-screen sheet; order summary, explanation and note remain in one reading order; actions stack if necessary. Keyboard must not obscure the note or footer. No imagery. PAT-001/005, EXP-002 and DES-005/006. Use red as the brand action with explicit consequence text, not an alarming full-screen red error treatment.

### Acceptance checks

Avery, the team member, can initiate closure of an accessible order created by someone else. A required note is captured with actor/time. Failed and unconfirmed requests do not assert Closed. Closed order chats persist; the queue counts update. Closing never implies Stop work, recording completion or a repair verification.

### Resolved render brief

`SCR-008.ready / 1440×900 / v1.0`, parent SO #1042 with Avery signed in. Show one focused CLOSE SERVICE ORDER dialog, SO #1042 Open, Conference Room C, consequence text, labeled Resolution note containing the exact duplicate-report fixture, Cancel and filled Close service order. No repair-success celebration, approval chain, assignee gate, Stop control or stacked second popup.

---

## SCR-009 — Add a photo

### Purpose, scope and routes

Attach a still image to the current conversation without implying that it is a knowledge-document upload or that AI has already analyzed it. Requirements: HP-08; recovered FR-05/06/09/10. Entry: Add photo in SCR-005.new or SCR-006. Exit: Cancel → unchanged composer; Add to message → staged attachment in that composer; actual Send later submits the message.

### Hierarchy, exact content and layout

Dialog approximately 520px wide. Heading **ADD A PHOTO**. Supporting text **Add a photo of the equipment or label you want to discuss.** A quiet, thin-dashed drop region has a generic image icon and **Choose a photo or drop it here**. Its button is **Choose file**; accepted formats **PNG or JPEG · Up to 10 MB**. The size limit and one-image-per-message limit are selected prototype defaults, not supplied integration constraints.

After valid selection, show the **actual selected image**, filename, file size and editable **Photo description — optional**. Use contain-fit so labels are not cropped, rather than the old cover-fit preview. Provide **Replace photo**, **Remove photo**, Cancel and **Add to message**. Initial Add to message is disabled. No fabricated sample equipment photograph is necessary for the empty render.

### States and interactions

| State | Exact visible content | Result |
|---|---|---|
| `empty` | Selection/drop instructions; no preview | Choose file or drop one supported file. |
| `reading` | **Preparing photo preview…** | No Send or analysis claim yet. |
| `preview` | Actual file preview/name/size; description field | Add to message stages the attachment; replacement remains possible. |
| `invalid-type` | **Choose a PNG or JPEG image. Documents aren't uploaded here.** | Reject PDF/SVG/other formats rather than accepting every `image/*` type. |
| `too-large` | **This photo is larger than 10 MB. Choose a smaller image.** | Keep composer text; no partial attachment. |
| `too-many` | **Add one photo at a time in this prototype.** | Select one; do not silently discard the other selected files. |
| `read-failed` | **We couldn't read this photo. Choose another file.** | Retry selection; don't show a broken-image tile as a successful preview. |
| `staged` | In composer: filename, optional description, Remove | Not yet a sent chat message; Send commits text/photo together. |
| `send-failed` | Parent SCR-006 send-failed state | Retain staged bytes/text for safe retry. |

Selecting or removing a file does not create an order, alter its state or publish it to a shared order record. One photo may be sent without text. The submitted message uses the user's supplied description when available; otherwise a neutral **Photo attached: filename** label. Do not create alternative text claiming a condition the system has not established. A later authorized analysis can add a separate response.

### Responsive, assets and brand application

Phone full-screen picker sheet; Choose file works with the platform picker without forcing camera permission. Do not claim direct camera capture unless implemented and permitted. Preview fits available width and can scroll; all actions remain reachable. AS-04 actual user-selected bytes are the only image asset for preview; no source screenshot extraction or generated replacement. PAT-005 and DES-005/006, generic authored icon AS-03.

### Acceptance checks

Only selected actual images receive previews. Add to message does not immediately send. Cancel discards pending selection, not the chat text. PNG/JPEG/size errors are explicit. Field photos are not contractor/manual ingestion. No fake “code read” or diagnosis appears solely because a file was selected.

### Resolved render brief

`SCR-009.empty / 1440×900 / v1.0`, parent CH-D01. Show one 520px ADD A PHOTO dialog with source-neutral generic icon, file/drop instructions, PNG or JPEG/10 MB help, Cancel and disabled Add to message. No equipment image or photo preview exists in this state. Keep the underlying conversation dimmed and unchanged.

---

## SCR-010 — Source reference

### Purpose, scope and routes

Let a technician inspect the material supporting an answer, with an honest unavailable state when source bytes or access are missing. Requirements: HP-09; recovered FR-07/17 and source-version aspects of FR-20/25. Entry: a source control in SCR-006. Exit: Close/Escape/Back → the invoking evidence control in the same conversation and reading position.

### Hierarchy, exact content and layout

Desktop dialog up to 960px wide and 82% viewport height. Header **SOURCE REFERENCE**, explicit close control. Under it: source title, **Demo source** or actual supported source type, version and locator. A readable scrollable content region follows. No unrelated navigation, extraction dashboard or permanent evidence rail.

Primary render fixture is **Training equipment register**; badge **Demo source**; metadata **Demonstration revision 1 · 23 Sep 2026 · Entry EQ-D01**. A neutral note states **Authored training record, not an actual property document.** Show the full DF-S01 table from §6.5, with EQ-D01 lightly emphasized and a text marker **Cited entry**. The evidence genuinely supports the synthetic service-area statement. It contains no invented technical drawing, diagram or PDF pagination.

The old `assets/ahu1-points.pdf` is not available in the supplied packet. A request to open that source uses `source-unavailable`; it must not be replaced by an invented PDF, copied website image or presumed page 60/62 content.

### States and interactions

| State | Visible content / contract | Actions |
|---|---|---|
| `demo-source` | DF-S01 exact table and Cited entry marker | Close; optionally move to other actual entries in this fixture. No PDF download affordance. |
| `demo-procedure` | DF-S03 exact checklist with cited step emphasized | Close; only the authored steps are shown. |
| `demo-history` | DF-S02 exact text record | Close; no additional fabricated service events. |
| `loading` | **Loading source…** | Close remains available; no source-ready claim. |
| `source-unavailable` | **The source file isn't available in this prototype.** Supporting **The reference exists in the supplied HTML, but its document was not supplied.** | Close; no broken Open in new tab or fake download. Metadata from the source HTML is labeled unverified, not treated as source content. |
| `access-denied` | **This source isn't available to your account.** | Close; no protected excerpt or thumbnail. |
| `load-failed` | **We couldn't open the source. Try again.** | Retry when a real accessible source exists; otherwise unavailable state. |
| `available-document` | A genuinely supplied/authorized document, its actual version and valid locator | Page controls only when the real document has pages; Open in new tab/download only when real permitted bytes and a working target exist. |
| `version-changed` | **This answer cited an earlier version.** Show cited and current version when available | Prefer the cited snapshot for verification; clearly distinguish any newer available version. Never silently swap passages while retaining the old citation label. |

A locator must refer to the actual available source: entry/section for these text fixtures; actual PDF page when an authorized PDF is later supplied. A viewer button is not proof that a claim is supported. If source access is lost, do not manufacture evidence from the assistant's answer.

### Responsive, assets and brand application

Phone full-screen viewer. Header and metadata wrap; table becomes labeled entry sections or an explicitly labeled local horizontal scroll region if column comparison is necessary. The cited entry stays findable; no scaled-to-unreadable desktop PDF. AS-06 text fixtures; AS-05 real PDF only when supplied and authorized. PAT-004/006 and DES-005/006/007; no branded document cover is fabricated.

### Acceptance checks

DF-S01 opens with its actual authored text and the correct entry. The missing source displays unavailable rather than imaginary pages. A general chat can open valid evidence without acquiring an order link. Closing returns to the same source control. Version labels and pagination never describe nonexistent files.

### Resolved render brief

`SCR-010.demo-source / 1440×900 / v1.0`, parent CH-D01. Show one wide SOURCE REFERENCE dialog with Training equipment register, explicit Demo source label, revision/date/Entry EQ-D01, the three-row table and a restrained Cited entry marker. Include the training-record note and Close. No PDF page count, real client drawing, download button, scan texture or fabricated technical diagram. An alternate request for the original linked PDF must render `source-unavailable` instead.

---

# 8. Asset dispositions and responsive transformations

## 8.1 Asset register

The kit explicitly says original identity files, photographs, decorative artwork and source fonts are not delivered. Analytical reference sheets are not reusable UI bitmaps. This is an asset boundary, not a reason to block an information-led operational prototype. fileciteturn0file0L166-L173 fileciteturn0file0L341-L348

| Asset ID | Role / availability | Disposition and exact fallback | Used by |
|---|---|---|---|
| AS-01 | Wind Creek original combined logo/mark/wordmark: **not supplied** | Use plain live **Wind Creek Hospitality** text, plus separate plain **AskPat** application text. This is a disclosed identity fallback, not an approved replacement logo. Do not crop a mark or reconstruct its geometry. | All full-page shell records; underlying shell behind overlays. |
| AS-02 | Original fonts: unidentified and not supplied | Use the local-only body/display stacks in §4. No font binaries, remote loading or invented font attribution. Record reduced fidelity if condensed fallback is absent. | All screens. |
| AS-03 | Generic functional icons: no standalone package required for planning | Later author simple semantic glyphs/SVGs or use an appropriately permitted local icon set. These are ordinary controls, not brand artwork. Information, search, close, photo, caret and check have text/accessible names. No media-like order-status glyphs. | All control-bearing screens. |
| AS-04 | Actual equipment/photo inputs: **no reusable photo supplied for these screens** | SCR-009 empty state needs no image. Preview only the exact user-selected file later. For a missing historical attachment show **Photo unavailable**, filename when known and retry only if a real retrieval path exists. Do not generate a replacement and call it an inspected field photo. | SCR-006/009; not automatically published to shared order remarks. |
| AS-05 | `assets/ahu1-points.pdf`: referenced in HTML, **not attached or inspected** | SCR-010.source-unavailable. Do not claim p.60/p.62 contain a particular fact. Do not render a fake drawing or a broken download link. An actual permitted original would be needed for faithful document viewing. | Alternate SCR-010 state. |
| AS-06 | DF-S01/02/03 synthetic source text: **authored in §6 of this document** | A later prototype may render this text directly in SCR-010. Always label **Demo source**; use entry/step locators, not fake PDF pages. These are not separately generated PDF assets. | SCR-006/010. |
| AS-07 | Four WC_REF analytical sheets: supplied reference-only | Inspect for relationships only. Do not embed, crop into components, trace artwork or bundle as application UI. Keep their stated same-brand reference-use restriction when carrying them to the next chat. | Design handoff only. |
| AS-08 | Hospitality/property/corporate photography: original bytes/permissions not provided here | **Omit.** No operational screen needs a hero, venue photo or staff portrait. Do not caption an illustrative venue as a real Wind Creek property. | None. |
| AS-09 | Footer pattern, red texture, divider emblem, rewards artwork | **Omit.** Plain backgrounds and rules already meet the operational need. No proprietary decorative tracing. | None. |
| AS-10 | Old AskPat “a” tile and gold verification styling in HTML | **Do not promote to identity.** Remove the tile/gold system; retain only the working application name as live text. | None as artwork. |
| AS-11 | Favicon: no verified original supplied | Omit in the prototype; don't manufacture a corporate icon. | No dependency. |

**Image generation disposition:** no supporting image is required for any first-render state in this specification. If a later task requests an equipment illustration, it must be separately identified as fictional and cannot serve as evidence of the real system, actual site or actual inspection. A screen image containing an illustrative photo does not automatically create a reusable photo asset.

## 8.2 Responsive transformation matrix

Working viewports are **1440×900 desktop**, **1024×768 tablet landscape**, **768×1024 narrow tablet**, **390×844 phone** and a **320px-width stress check**. They are selected testing targets, not source-site measurements. Breakpoints below belong to this prototype.

| Region | Desktop ≥1200px | Tablet 960–1199px / narrow tablet 768–959px | Phone <768px |
|---|---|---|---|
| Shell | 24px demo strip; 64px header; named top routes | Allow header wrapping; reduce account text into popup | Two-row compact header, named Chats/Service orders links; demo strip can wrap. |
| Chat list | Persistent 304px panel | 264px at ≥960; below 960 use Your chats modal panel | Full-width list at `/chats`; panel reachable from selected/new chat. |
| Chat thread | 760px maximum reading width; desktop side padding | Fill available width; preserve 16px body | 16px gutters; wrap long labels/evidence; no horizontal page scrolling. |
| Chat header/context | Title plus top-right Order information and quiet Close order | Context can wrap; info remains explicit | Top-right info stays in header; other actions may use a labeled second row. |
| Composer | Workspace-bottom region with multiline text and visible Send | Same ordering; controls wrap if needed | Above keyboard; Return adds line; Send remains explicit. Attachment row removable. |
| Queue | Six aligned columns | Combine issue/location and metadata without losing values | Labeled ruled records; ID/status first, issue then location/requester/created. |
| Creation | One 720px form, anchored selector when it fits | One column; picker panel expands as necessary | Full-width fields; selector sheet with reachable search/filter/results. |
| Order detail | Main reading region plus supporting metadata | Stack below 1100px | ID/status/title, actions, metadata, report, remarks/history; all content reachable. |
| Info/close/photo dialogs | Focused centered dialogs, bounded height | Expand to available size, no clipped footer | Full-screen sheets with scrollable body; one modal at a time. |
| Source reference | Wide readable viewer, exact locator | Reflow metadata; retain readable source text | Full-screen viewer; transform table into labeled entries or labeled local scroll. |

At 320px width and enlarged text, allow additional vertical scrolling and stacked actions. No fixed-height header may clip the order badge. Long issue and location names must remain discoverable without hover. Phone screenshots are not scaled desktop frames. A hidden panel always has an explicit reachable disclosure if its contents are required.

---

# 9. Acceptance scenarios and validation boundaries

## 9.1 Behavioral acceptance scenarios for the later prototype

These are **tests to execute during implementation**, not claims that this specification has already passed browser or integration testing.

| Test | Setup and action | Required observation |
|---|---|---|
| AT-01 Login | Submit empty email/password; then invalid credentials; then Morgan's fictional demo account | Useful inline errors; no protected data before success; correct identity after success. |
| AT-02 Requester identity | Sign in as Avery and open creation | Requested by is Avery and cannot be replaced by free text. |
| AT-03 Required fields | Select only Issue/Location with whitespace remark | Cannot create; required remark guidance visible. |
| AT-04 Issue selection | Filter HVAC & Temperature, search “Too Hot,” select exact option | Stored Issue is ISS-D05; canceling selector never silently changes selection. |
| AT-05 Location selection | Search 703 and select Guestroom 703 | Stored Location is LOC-D07; full label readable at 390px. |
| AT-06 Creation handoff | Create SO #1043 as Avery, sign out, sign in as Morgan without resetting demo | Morgan's list contains the same new Open order; counts 7/5/2. This is explicitly one in-memory demo session, not a live backend claim. |
| AT-07 Duplicate create | Double click Create and retry an unconfirmed request | At most one order for the same submitted request; failure never yields a fake success row. |
| AT-08 Correct destinations | Open each of the six default queue records | Each detail shows the selected ID/issue/location, never hardcoded SO #361888. |
| AT-09 Status vocabulary | Inspect every route, state badge, filter, history and side effect | Order states are only Open and Closed. No work Start/Pause/Stop/Resume controls, labels, timers or callbacks. |
| AT-10 List filtering | Search 1042; select Closed; clear query | Correct intersection/no-results state; then exactly SO #1038/#1037. |
| AT-11 First general chat | Avery chooses New chat and sends an equipment question | One general chat created; `orderId=null`; no service order created. |
| AT-12 General duplicates allowed | Morgan creates another general AHU-D01 conversation | Existing AHU-D01 general chats remain distinct; no equipment-based merge. |
| AT-13 Linked entry | Morgan opens SO #1042 and chooses Continue your chat | CH-D01 opens with the same messages as the main list. |
| AT-14 First linked chat | Avery opens SO #1042 and chooses Chat about this order | A single Avery-owned linked chat appears in her list immediately; order stays Open. |
| AT-15 Linked uniqueness race | Activate the same user's order-chat entry twice or simulate two simultaneous requests | One relationship/chat ID; race loser resolves to existing chat. |
| AT-16 Per-technician scope | Switch Morgan → Sam for SO #1042 | Morgan gets CH-D01; Sam gets CH-S01; neither ordinary list shows the other's chat. |
| AT-17 Badges and association | Inspect All/General/Order-linked lists; type “SO #1042” in a general chat | Badges reflect actual `orderId`, not title or text matching. Typed mention does not link the chat. |
| AT-18 Top-right information | Open info in CH-D01 | SCR-007 shows SO #1042 and same canonical values as SCR-004. General CH-D02 has no order info button. |
| AT-19 Popup preservation | Type an unsent message, open/close info, then source viewer | Draft, selected chat and reading position survive; focus returns to invoking control. |
| AT-20 Anyone can initiate close | Avery opens an accessible order requested by Jordan | Close order available; no technician, creator, assignee or administrator gate. Authentication/access checks still apply. |
| AT-21 Closure commitment | Submit a nonempty resolution note | Open until acknowledgement; then Closed with actor/time/note in all views. No Started/Stopped side effect. |
| AT-22 Closure failure | Simulate rejected/uncertain close | No confirmed Closed label; preserved note; safe retry/reconciliation copy. |
| AT-23 Concurrent closure | Another user closes while dialog is open | Already-closed state; first closure note retained; no duplicate mutation. |
| AT-24 Chat after closure | Close SO #1042, return to CH-D01 and send | Chat persists, order context says Closed, order not reopened, linked-chat uniqueness retained. |
| AT-25 Explicit shared note | Copy handoff into Add as order remark; cancel, then submit | Cancel posts nothing; explicit Save posts one authored shared remark, not entire private transcript. |
| AT-26 Photo staging | Choose a valid image, cancel, choose again and Add to message | Actual preview only; Cancel leaves chat text; staged file isn't sent until Send. |
| AT-27 Photo validation | Select PDF/SVG/oversized image/multiple images | Correct explicit restriction; no document-ingestion path, no silent file discard. |
| AT-28 Honest evidence | Open DF-S01 then the old missing PDF reference | Exact synthetic table labeled Demo source; old PDF shows unavailable, not generated pages or broken download. |
| AT-29 Source support | Compare first-render answer to DF-S01 and SO #1042 remark | Every record claim has the matching source; no unsupported mechanical diagnosis added. |
| AT-30 Unknown fault | Enter TEST-X9 on AHU-D01 | No fabricated meaning; unit/code/time/context recorded; logging failure distinguished from answer uncertainty. |
| AT-31 Visual scope | Ask whether a heat wheel is moving from a still image | No unsupported movement diagnosis; request direct observation. Supported FR-10 categories remain bounded. |
| AT-32 Progressive guidance | Run DF-S03 with matching, mismatching and unreadable tag results | One next step based on result; no invented repair procedure or completion of all checks at once. |
| AT-33 Async isolation | Send in one chat, navigate to another, then receive the answer | Response goes only to owning chat; no content leakage or selected-chat jump. |
| AT-34 Authorization | Attempt another user's chat/source or expired route | Generic unavailable/reauthentication view; no protected title, preview or cached messages. |
| AT-35 Responsive tasks | Perform create, queue open, chat list, info, close and source inspection at all target widths | Required content and actions remain reachable; no side rail hidden without alternative. |
| AT-36 Keyboard/reduced motion | Complete routes, selectors and dialogs using keyboard; enable reduced motion | Visible focus, Escape/return behavior, no hover-only action, no unnecessary animation. |
| AT-37 No misleading inactive features | Inspect header, sidebar and response controls | No admin/feedback/reporting/voice/assignment controls presented as working while deferred. |
| AT-38 Closed versus resolved | Close a duplicate report and inspect record summary | It says Closed with the actual explanation, not “Issue repaired” or a fabricated resolved metric. |

## 9.2 Visual acceptance

The screen must be recognizable through the complete relationship of light ground, controlled red, condensed short headings, ordinary readable body text, restrained geometry and a clear action hierarchy. A red header alone is insufficient. A generic rounded-card dashboard with a changed accent color is not the intended result.

The main chat render must visibly demonstrate both linked and general conversations, not merely state in explanatory prose that they exist. SO #1042 and its Open label must be legible. The Order information control must be in the top-right chat header. The conversation remains the dominant content region; branding, chrome and status do not overpower it.

The four source sheets are reference evidence, not screenshot components. Exact logo/font fidelity is not claimed while originals are missing. Body labels and responses cannot be shrunk to fit a predetermined frame. Failure, no-result and focused states must be designed with the same care as the populated state.

## 9.3 Inspection performed and not performed

**Performed for this document:** attachment inventory; complete working-kit and operator-sheet reading; visual inspection of the four supplied analytical reference sheets; attached HTML source inspection, including relevant scripts and actual file/asset references; programmatic counting of source catalog arrays; complete reading and requirement mapping of the recovered Library FRD; internal screen/requirement/state consistency review.

**Not performed in this stage:** live website discovery, source-site interaction testing, authentication, HotSOS/API capability verification, actual AI inference, equipment diagnosis, PDF inspection of the missing document, original-asset licensing verification, browser interaction tests, responsive rendering tests, automated accessibility audit or production security validation. No new screen image or HTML was generated. Acceptance scenarios above are implementation obligations, not results of tests already run.

---

# 10. Deferred coverage, unresolved dependencies and rendering handoff

## 10.1 What is deliberately outside this operational rendering slice

| Coverage item | Disposition | What remains specified / why it does not block current screens |
|---|---|---|
| Work Start/Pause/Stop/Resume and labor recording | **Out of scope by current instruction**, not a future hidden tab | Their absence is a hard acceptance condition. External work controls do not appear in the interface. |
| Order assignment/distribution | **External responsibility** | No assign/claim controls. Current queue can show accessible orders without claiming to route them. |
| Natural-language order creation | **Deferred recovered FR-02 portion** | Guided Issue/Location/NewRemark creation is complete. Do not imply the form auto-resolves language into IDs. |
| Administration, user/permission editing, cross-user chat review, reporting and explainability | **Deferred recovered FR-26–29 and FR-01 admin portion** | No reachable unfinished admin shell. Their source requirements remain in §3.3. A future admin specification must define privileged access and review behavior. |
| User feedback and admin approval-to-knowledge pipeline | **Deferred recovered FR-30** | Avoid orphaned thumbs controls, unmoderated learning claims or a fictional approval queue. |
| Blob ingestion, taxonomy onboarding, versioning, metadata extraction and conflict engine | **Deferred backend/governance FR-19–25** | Preserve no-document-upload boundary and honest evidence/version states. The operational UI is not proof of these services. |
| Voice recording, video, report canvas, dashboard cards, document-management upload, contractor forms, rewards or casino marketing | **Not in current screen scope** | They are not added from generic CSS, previous unrelated projects or brand screenshots. |
| Chat deletion/archiving/manual association changes, publishing chat photos into shared orders, and order reopening | **Deferred extensions** | No dead controls. Saved linked identity remains stable; general chats are created through New chat. |
| Dark theme | **Uncovered in working kit and deferred here** | One coherent light direction is specified; no theme toggle. |

## 10.2 Dependencies and assumptions that must remain visible

| ID | Missing fact / unresolved production question | Selected prototype treatment | Blocks initial rendering? |
|---|---|---|---|
| DEP-01 | Missing `index.html`; no inspected login source | Design email/password screen from UR-01 and kit. Do not assert pixel fidelity to the unavailable file. | No. |
| DEP-02 | Recovered FRD is not attached/current-approved in this turn | Use it as identified broader context; current request wins conflicts. All FR-01–30 are mapped with honest dispositions. | No. |
| DEP-03 | Exact role/property/record-access policy beyond the current broad user wording | One shared fictional property; authenticated access required; no requester/assignee closure restriction. Ordinary chat ownership is enforced. | No; required before production authorization. |
| DEP-04 | Whether the production close API directly closes, acknowledges a request first, or needs additional fields | Explicit note plus submit; retain Open until a confirmed Closed result. Do not introduce Pending closure as a third business state or promise real API support. | No; required before integration. |
| DEP-05 | Full verified issue/location catalogs and valid production identifiers | Small synthetic catalog; preserve source-style labels and required IDs, don't call them real HotSOS codes. | No. |
| DEP-06 | Original logo, exact permitted font families and loading instructions | Plain corporate text and local approximations. No font binaries or mark extraction. | No; limits identity fidelity. |
| DEP-07 | `assets/ahu1-points.pdf`, real unit manuals, drawings and source permissions | Missing-source view; synthetic text records only for the demo. No verified technical PDF claims. | No; blocks faithful original document viewing. |
| DEP-08 | AI model/retrieval, equipment mappings, maintenance API, approved procedures and visual detection validation | Response-state contracts with labeled synthetic fixtures; no real diagnosis or repair advice claimed. | No; required for a live technician assistant. |
| DEP-09 | Unknown-fault storage, retention, privileged conversation review and approved-feedback governance | Local chat-associated record only; no absolute privacy or automatic-learning promise. | No; required before production handling. |
| DEP-10 | Ingestion taxonomy, actual metadata template, duplicate handling and newer-qualified-source rules | Preserve source ID/version fields and no-upload boundary; backend design remains deferred. | No; blocks claiming ingestion completeness. |
| DEP-11 | Definition of an “issue resolved” for future reporting | Do not equate Closed with repaired/resolved. No reporting dashboard in this slice. | No. |
| DEP-12 | Cross-device persistence, concurrency and notification contracts | Specify idempotent/unique operations and state synchronization; local demo uses one shared in-memory store with explicit reset. No push-notification UI is invented. | No; integration validation still required. |

None of these gaps requires an approval round to render the specified operational screens. They must not disappear from a production handoff simply because the screen looks finished.

## 10.3 First render and continuation contract

**Render first:** `SCR-006.linked-populated`, 1440×900 CSS-pixel working viewport, WC-ASKPAT-SCREENS v1.0. Use CH-D01, Morgan Reed, SO #1042 Open and the exact four-message fixture. Keep the order-information popup closed. This frame tests the shared shell, the personal mixed chat list, order association, top-right information entry, AI reading hierarchy and working brand translation together.

**A subsequent focused state:** `SCR-007.open-order` is the same conversation with the information popup open—not a replacement for the first frame. Mobile translation uses `SCR-006.linked-populated / 390×844` and the specified Your chats disclosure, not a scaled desktop composition.

For the next rendering chat, provide this Markdown specification, the working Wind Creek kit and the same four WC_REF sheets individually. The original HTML is useful functional provenance, not visual authority. The missing logo/PDF is not required for the chosen first frame because their fallbacks are resolved. Include an authorized original only when the selected screen genuinely needs it. The recovered FRD's requirement coverage and its status are documented here; do not let a later session silently restore its superseded work controls.

**Resolved next-stage request:**

> Use WC-ASKPAT-SCREENS v1.0 to render SCR-006.linked-populated at the 1440×900 desktop working viewport. Use the exact CH-D01 conversation, Morgan's mixed general/order-linked chat list, SO #1042 Open context and the specified Wind Creek text-identity fallback. Keep the Order information popup closed. Apply the supplied four WC_REF sheets only as design references. Do not add Start, Pause, Stop, work recording, a permanent order rail, invented assets or unsupported technical claims.

A later HTML implementation must use the same entities, routes, statuses and component recipes, be honest about simulated services, avoid external fonts/CDNs/fetch dependencies in a local standalone delivery, and exercise the acceptance scenarios before reporting what works. Rendering may refine deliberate presentation choices only by updating the owning screen decision; an attractive generated detail does not silently become a new brand rule or product requirement.

---

**End of specification · WC-ASKPAT-SCREENS v1.0**
