# V3 Schedule / Calendar Contract

## Goal

Schedule should tell Eastern Air what is coming up, what is slipping, and what needs management attention — without mixing official schedule dates with calculated procurement estimates.

## Schedule record types

- GC/master schedule
- Eastern project-cycle schedule
- short-term/lookahead
- testing / inspection
- procurement release
- ship / delivery
- calculated lead-time milestone
- commissioning / startup
- required-by
- internal management target

## Date provenance

Every milestone stores:

- source system
- source reference
- source URL/file when available
- schedule revision/source fingerprint
- confidence
- date type
- planned date
- actual date when known
- status
- project
- floor/area
- activity lane/category
- notes

## Confidence rules

- CONFIRMED: explicitly authoritative/current.
- SOURCE SAYS: source states the date.
- CALCULATED: date = explicit inputs + deterministic calculation.
- INFERRED: interpretation from multiple facts.
- NEEDS VERIFICATION: weak/conflicting/missing evidence.

Calculated dates must never be visually presented as GC/master schedule dates.

## Calendar views

### Month

Normal calendar grid. Important milestones render as compact events.

### Week / Lookahead

7/14/21/30-day horizon focused on execution.

### Upcoming

Sorted milestone list with project, floor, activity, confidence and risk.

### Project Cycle

Designed for repeatable floor-by-floor work.

Rows/lanes can include:

- Duct Risers
- Heat Pump Risers
- Duct Riser Test
- Duct Runout Past Shaft Wall
- Perimeter Heat Pump Riser
- Perimeter HP Cabinet Install
- Heat Pump Ductwork
- Perimeter HP Ductwork
- Duct Riser Insulation
- Sheetmetal Branchwork
- other cycle activities from source

Views:

- floor rows × activity lanes
- activity rows × floors
- next milestone by floor
- late/current/upcoming

### Procurement / Long Lead

Separate view for release, lead time, expected delivery and delivered state.

## 1484 First Ave

Current imported evidence includes 406 floor-cycle milestones from the 8/28/26 cycle schedule through July 2027.

Known near-term sequence includes:

- 2F Duct Risers — 8/25/26 — delayed
- 2F Heat Pump Risers — 8/25/26 — delayed
- 3F Duct/HP Risers — 9/8/26
- 4F Mockup Duct/HP Risers — 9/11/26
- 5F Duct/HP Risers — 9/16/26
- 6F — 9/21/26
- 7F — 9/24/26
- 8F — 9/29/26
- Duct Riser Testing begins around 10/1/26
- 2F Duct Runout Past Shaft Wall — 10/6/26
- 2F Heat Pump Ductwork — 10/8/26
- 2F Duct Riser Insulation / Sheetmetal Branchwork — 10/9/26

V3 requirement: attach all cycle records to the actual source schedule provenance instead of leaving `source_system/source_ref` null.

## 550 West 21st

Current hosted data has a procurement milestone based on the documented 33-week AAON/ERU commitment.

Requirement:

- treat it as procurement/long-lead evidence
- preserve vendor/email source
- do not label it as GC schedule
- calculated/commitment date must carry confidence and formula/evidence

## 192 Douglas

Current hosted milestones are procurement dates derived from documented release dates + lead times.

Requirement:

- label CALCULATED
- preserve input release date + lead time source
- when equipment is marked delivered, future expected-delivery milestones should resolve/convert appropriately rather than remain misleadingly upcoming

## 242 Seigel

No current verified future schedule source is available in the hosted dataset.

Requirement:

- show `Schedule source needed`
- do not invent dates
- show known procurement/coordination commitments separately
- when Procore/GC schedule export arrives, ingest as a new source revision

## Schedule revisions

Schedule ingestion must support revision history.

For each revision:

- preserve source revision identity/date
- compare with prior revision
- flag moved dates
- do not silently overwrite historical schedule facts
- current view defaults to latest authoritative/current revision
- What Changed can show `3F risers moved Sep 8 → Sep 10`

## Schedule risk promotion

A milestone can create/promote management attention when:

- date is past and incomplete
- date moved later materially
- predecessor not ready
- procurement date threatens required-by date
- source explicitly flags delay/blocker
- user flags it

The schedule milestone remains separate from the management item; they are linked.

## Acceptance tests

- Month and Upcoming show same underlying milestones for same date scope.
- 1484 cycle counts reconcile to DB.
- 1484 3F/4F/5F dates display correctly.
- Delayed 2F dates are visibly delayed.
- 550 long-lead date never claims to be GC schedule.
- 192 calculated dates display CALCULATED.
- 242 has no fabricated dates.
- Opening a milestone exposes its source provenance.
