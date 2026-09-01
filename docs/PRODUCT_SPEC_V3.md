# Eastern Air Command Center V3 — Product Specification

## Mission

Eastern Air Command Center is a **private management and intelligence layer above the systems that run each project**. It is not another Procore, Asana, Gmail, Todoist, Drive, Bluebeam, Blue Rhythm, On Desk, Dalux, or spreadsheet replacement.

Its default screen and logic must answer:

1. **What do I need to know?**
2. **What do I need to do?**
3. **What am I waiting on, and who owns it now?**
4. **What is coming up that can hurt the job if I miss it?**

The source systems remain the operational record. The Command Center reads them, cross-references them, links back to them, and lets Eastern Air add an internal management layer without changing the source.

---

# 1. Non-negotiable operating rules

## 1.1 Source systems are read-only

Unless Yosef explicitly changes this policy later:

- Asana is read only.
- Gmail is read only. No mailbox state changes.
- Existing/master Todoist projects are read only.
- Procore and future GC platforms are read only.
- Google Drive, PDFs, schedules, logs and drawings are read only.
- Blue Rhythm, On Desk and future source systems are read only by default.

The **Command Center database is editable**.

## 1.2 Source intelligence is not automatically work

A source record is evidence, not automatically a task.

A source record enters a live management queue only when at least one is true:

- a user flags it;
- a user assigns it;
- a user watches it;
- a user sets a due/follow-up date;
- a management rule promotes it because it is overdue, blocking, a schedule risk, a delivery risk or requires a decision;
- the intelligence layer creates a `Needs Review` item with a written reason.

Everything else stays searchable in **Project Intelligence / Sources**, not Today or My Work.

## 1.3 Original source must always be available

Every imported record must preserve the source system, source identifier and, whenever possible, a deep link to the original record.

Examples:

- Asana → `Open in Asana`
- Gmail → `Open email / thread`
- Procore → `Open in Procore`
- Todoist → `Open in Todoist`
- Drive/PDF → `Open source file`

A normalized Command Center item may have multiple source records. One is marked **Primary Source** and the rest are **Supporting Sources**.

The Command Center summary is an Eastern Air summary, never a replacement for the official record.

---

# 2. Four-layer information model

## Layer A — Source Record

Read-only evidence from an external system.

Required fields:

- source system
- project
- source ID/reference
- direct source URL/deep link where possible
- title
- body/description/snippet
- source created/updated timestamp
- last seen timestamp
- historical/current flag
- fingerprint
- raw source metadata

## Layer B — Canonical Topic / Item

A normalized Eastern Air topic that can combine multiple source records.

Examples:

- `550 — MAU-1/2 procurement`
- `1484 — 4F duct riser readiness`
- `192 — 1F vertical penetration coordination`
- `242 — Bulletin 2 piping reconciliation`

The same real-world issue must not appear once from Gmail, once from Asana and once from Procore unless those are genuinely separate issues.

## Layer C — Shared Management Layer

Editable shared team truth:

- attention state
- management status
- owner
- watchers
- priority
- due date
- follow-up date
- waiting on
- shared note
- category/type
- floor/area
- system
- equipment/tag
- schedule impact
- confidence
- tags
- handoff history
- comments/conversation
- activity/history

## Layer D — Personal Layer

Per-user preferences that do not alter shared truth:

- keep in my live view
- dismiss from my live view
- pin
- mute/snooze
- personal note
- personal follow-up
- saved views
- default views by page and by job

---

# 3. Attention model

This is distinct from source status and normal task status.

- **Background** — searchable intelligence; no live-queue impact.
- **Watch** — worth monitoring; no action now.
- **Action** — somebody needs to do something.
- **Waiting** — responsibility has moved outward / waiting on another party.
- **Review** — decision, verification or review needed.
- **Risk** — schedule/procurement/field risk needing visibility.
- **Resolved** — Eastern management action is complete; source remains searchable.

The app must default to showing Action / Waiting / Review / Risk, not Background.

---

# 4. Management statuses

Shared status choices:

- Inbox
- Assigned
- Working
- Waiting
- Follow-Up
- Needs Review
- Snoozed
- Done

`Watching` is primarily a watcher/personal state, not a fake task status for raw source data.

---

# 5. Confidence and evidence

Every derived fact/milestone must show one of:

- **CONFIRMED** — explicitly confirmed or authoritative.
- **SOURCE SAYS** — directly represented by a source.
- **CALCULATED** — mechanically derived from source facts.
- **INFERRED** — cross-source/system interpretation.
- **NEEDS VERIFICATION** — unsupported, conflicting or incomplete.

Each confidence label must be traceable to its evidence.

---

# 6. Main navigation

## Today

Purpose: minimum viable brain dump.

Sections:

- **Needs My Attention** — items owned by me / watched by me that need action now.
- **Waiting / Chase** — follow-ups due now or overdue.
- **Schedule Risks** — upcoming project-cycle or procurement milestones needing attention.
- **Coming Up** — the next few important milestones across jobs.
- **Assigned Out** — compact count/status summary, not a full dump.

Today must never become a list of every Asana task.

## Calendar / Schedule

Views:

- Month
- Week / Lookahead
- Upcoming
- Project Cycle
- Procurement / Long Lead

Features:

- filter by project
- filter by schedule category
- source-confidence labels
- click milestone to see source and related management items
- show overdue/delayed/at-risk visually
- project-cycle grouping by floor and activity
- authoritative date vs calculated date distinction

## My Work

Only items that are actually mine:

- owned by me
- explicitly watched by me
- personal Todoist/Command Center items promoted to active work
- unassigned items only when a rule or explicit view requests them

Raw team source items do not appear merely because they exist.

## Assigned Out

Everything currently owned by someone other than the logged-in user, with person-first filtering.

Must support:

- Person
- Project
- Category
- Status
- Priority
- Due/follow-up
- Schedule impact
- Source
- Tags

## Jobs

One compact control panel per active job.

Each job card/overview shows:

- next important milestone
- current schedule risk count
- my open actions
- assigned-out open actions
- waiting/follow-up count
- procurement risks
- latest meaningful change
- source freshness

Opening a job gives tabs/views for:

- Overview
- Work
- Calendar
- Drawings & Submittals
- Orders & Materials
- Field & Foremen
- RFIs / Coordination
- Commissioning / Startup
- Change Orders
- Sources / Intelligence
- What Changed

## Project Intelligence / Sources

The place for raw/source-normalized information.

Search/filter all source records without forcing them into My Work.

## What Changed

Meaningful source deltas, not notification spam.

Examples:

- schedule date moved
- submittal changed status
- new drawing revision
- RFI response arrived
- vendor lead time changed
- delivery commitment changed
- Asana responsibility/comment materially changed

Routine/noise can be muted by source/person/rule.

## Team

People and shared assignments.

Shows:

- active owned work
- waiting work
- overdue follow-ups
- recently handed-off items
- login status where applicable

## Build / Diagnostics — admin only

Visible accountability window for the system itself:

- source health
- last sync by source
- import counts
- rejected/ambiguous records
- missing source links
- duplicate candidates
- schedule source freshness
- V3 build checklist / version

---

# 7. Assignment / Management Window

This is a first-class workflow, not a tiny dropdown.

When opening an item, the management window must contain:

## Header

- title
- project
- context chips
- confidence
- primary source badge
- **Open Original Source** button
- supporting-source count

## Assignment block

- Owner
- Add/remove watchers
- `Hand off` action
- optional handoff note
- option: `Keep in my live view after handoff`

Handoff semantics:

- new owner becomes primary owner
- previous owner leaves their personal live queue unless watching
- shared item remains intact
- handoff is logged
- target user receives an internal notification if they have a login

## Work state

- Attention state
- Status
- Priority
- Due
- Follow-up
- Waiting on
- Schedule impact

## Context

- Category
- Floor / area
- System
- Equipment/tag
- Type
- Tags

## Notes

- shared note
- comments/conversation
- personal note

## Sources

- Primary Source
- Supporting Sources
- source system icon/badge
- source title
- source updated time
- open-original-source link

## History

- assignment/handoff
- status changes
- comments
- management edits
- meaningful source events

---

# 8. Context taxonomy

The app needs structured context, not only hashtags.

Core dimensions:

- Project
- Category
- Floor / Area
- System
- Equipment / Tag
- Work Type
- Owner
- Watcher
- Attention State
- Status
- Priority
- Due Date
- Follow-Up Date
- Waiting On
- Schedule Impact
- Source System
- Confidence
- Source Age / Freshness
- Tags

Suggested categories:

- Drawings & Submittals
- Orders & Deliveries
- Field & Foremen
- Schedule
- Follow-Up
- RFI / Coordination
- Commissioning / Startup
- Change Order
- General

Tags remain flexible for project-specific concepts such as `#WaitingGC`, `#Vendor`, `#Mockup`, `#Riser`, `#Release`, `#LongLead`, etc.

---

# 9. Filter engine — exact semantics

This is a core system, not a cosmetic feature.

## 9.1 Availability

The same filter engine must be available on:

- Today
- My Work
- Assigned Out
- Jobs / Job Work
- Calendar / Upcoming / Cycle
- Sources / Intelligence
- What Changed

Each page can expose only relevant dimensions, but selection behavior must be identical.

## 9.2 Multi-select behavior

Within a group:

- zero selected = unrestricted
- all available selected = unrestricted
- subset selected = include only subset

Therefore **Select All must never accidentally exclude Unassigned or missing context**.

`Unassigned`, `No Category`, `No Floor`, `No Source` and similar missing values are explicit selectable pseudo-options where useful.

## 9.3 Controls

Every group has:

- Select All
- Clear
- search within group when large

The whole panel has:

- Select All Groups
- Clear All
- Apply
- Reset to Saved Default
- Set as Default
- Save View

## 9.4 Include / exclude

V3 should support both include and exclude where useful.

Examples:

- include Yosef + Israel
- exclude routine Ilya
- include Drawings + Field
- exclude Done

## 9.5 Filter count

A fully selected/unrestricted group contributes **zero** active-filter count.

The badge counts only actual restrictions.

---

# 10. Saved views and defaults

Saved views may be personal or shared.

Examples:

- `#YosefToday`
- `#WaitingGC`
- `#Israel`
- `#Orders`
- `#Tomorrow`
- `#1484Mockup`

A saved view remembers:

- page
- project scope
- includes/excludes
- categories
- people
- statuses
- priorities
- source systems
- schedule categories
- tags
- sort
- grouping
- date window

Each user can set a different default for:

- each page globally
- each page inside each job

Example: 1484 Work can default differently from 550 Work.

---

# 11. Source provenance UI

Every live card shows a compact source badge when applicable.

Opening the item shows full source provenance.

Source information includes:

- system
- source title
- primary/supporting
- source identifier
- direct deep link
- source updated date
- last synced date
- confidence contribution

If a source URL is missing but a stable source ID allows a deterministic official URL, the ingestion layer may derive it and mark the URL origin as `derived_deeplink`.

Current known V2 audit:

- Gmail records preserved direct source URLs.
- Asana records preserved task GIDs but not URLs; V3 must repair/derive `Open in Asana` links.
- Todoist records preserved task IDs but not URLs; V3 must repair/derive links where valid.

---

# 12. Schedule / calendar engine

## 12.1 Milestone types

- GC/master schedule dates
- Eastern floor-cycle dates
- lookahead dates
- test/inspection dates
- procurement release dates
- expected ship/delivery dates
- calculated lead-time dates
- commissioning/startup
- required-by dates

## 12.2 Source hierarchy

A date must indicate its origin:

1. authoritative schedule / explicit current commitment
2. direct source statement
3. calculated from explicit source facts
4. inferred
5. needs verification

Never display a calculated date as if it came from the GC schedule.

## 12.3 Project cycle

For 1484, the existing floor-cycle data should support:

- floor-by-floor sequence
- activity lane (risers, test, runout, branchwork, insulation, cabinet/HP work, etc.)
- next activity per floor
- date movement and delay flags
- current vs historical revisions when future schedule sources are imported

The 406-row V2 schedule import is useful evidence but V3 must restore the actual source provenance to the schedule file instead of leaving `source_system/source_ref` null.

## 12.4 Project without schedule

Do not invent dates.

If a job lacks a current schedule source:

- show `Schedule source needed`
- show known procurement commitments separately
- label calculated commitments accurately

---

# 13. Today logic

Today is intentionally small.

An item qualifies for `Needs My Attention` when one or more:

- owner is me and action/review/risk is active
- personal follow-up due
- shared follow-up due and I own/watch it
- overdue due date
- explicitly flagged to me
- schedule risk promoted to me
- new meaningful change requires my review

It does **not** qualify merely because it is an incomplete Asana task.

---

# 14. Search

Global search should search:

- canonical titles/descriptions
- shared notes
- source titles/bodies
- project
- people
- floor
- system
- equipment/tag
- source IDs
- tags

Search result must distinguish:

- Action Item
- Source Record
- Schedule Milestone
- Person
- Project

---

# 15. Import / sync behavior

Every source sync/import must be repeatable and auditable.

For each run record:

- source
- start/end
- added
- updated
- unchanged
- skipped
- duplicates
- rejected
- ambiguous
- errors

No silent overwrite of user-confirmed management fields.

Source refresh may update source evidence but must not erase Eastern management ownership, notes, status, tags or personal preferences.

---

# 16. Meaningful-change rules

The intelligence layer should favor material changes.

Examples of high-value changes:

- new/changed due date
- project schedule date movement
- RFI response
- submittal approval/revision/rejection
- material release
- lead-time change
- delivery commitment
- fabrication-ready confirmation
- blocker
- owner/responsibility change
- field issue affecting schedule

Routine/noise rules should be configurable.

Existing preference: routine Ilya activity is muted unless it represents a blocker, delivery, schedule, order or material issue.

---

# 17. Roles and team behavior

Roles remain simple:

- Viewer — read only in Command Center
- Member — manage own/shared work as allowed
- Manager — broader management capability
- Admin — team/configuration/source diagnostics

Source-system permissions are irrelevant because the Command Center does not write to source systems.

A person can exist before they have a login. Assignments remain valid. When a matching login is connected, the person/user link activates their personal queue.

---

# 18. Mobile / desktop

The app is a mobile-first PWA but must work professionally on desktop.

Desktop:

- left navigation
- wide work tables/cards
- dense filters
- split-pane item detail where useful

Mobile:

- bottom navigation
- compact cards
- full-screen management sheet
- easy one-handed status / handoff / follow-up

No feature may exist only on All Jobs while disappearing inside a project unless deliberately page-specific.

---

# 19. Definition of Done

A feature is **not done because code was committed or GitHub Pages deployed**.

It is done only when:

1. code exists;
2. syntax/build checks pass;
3. database queries succeed;
4. primary desktop flow passes acceptance tests;
5. primary mobile flow passes acceptance tests;
6. project-specific scope is tested;
7. All Jobs scope is tested;
8. missing/unassigned/null cases are tested;
9. provenance/source-link behavior is tested;
10. the build checklist is updated with evidence.

No more declaring a feature complete before these gates pass.
