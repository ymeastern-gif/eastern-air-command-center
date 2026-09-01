# V3 Filter + Saved View Contract

## One filter engine everywhere

There is exactly one semantic filter engine. Pages may expose different dimensions, but they do not implement their own selection logic.

Pages using it:

- Today
- My Work
- Assigned Out
- Job Work
- Calendar
- Upcoming
- Project Cycle
- Procurement
- Sources / Intelligence
- What Changed

## Selection semantics

For any multi-select dimension with available values `A`:

- selected set = empty → unrestricted
- selected set = all available values → unrestricted
- selected set = proper subset → include only subset

Missing-value pseudo-options are part of `A` when relevant:

- `__unassigned__`
- `__no_category__`
- `__no_floor__`
- `__no_system__`
- `__no_source__`
- `__no_tag__`

Therefore selecting every visible Person including `Unassigned` is identical to no Person restriction.

## Include and exclude

Each dimension can represent:

- `include: []`
- `exclude: []`

Rules:

1. Exclude applies first.
2. Empty/all Include means unrestricted after excludes.
3. Missing pseudo-values are valid include/exclude values.

## Group controls

Every filter group includes:

- Select All
- Clear
- optional search when > 8 options
- Include / Exclude mode when exclusion is supported

Whole panel includes:

- Select All Groups
- Clear All
- Reset to Default
- Apply
- Set as Default
- Save View

## Filter-count badge

Count restrictions, not checkboxes.

Examples:

- every Person checked → 0 active restrictions
- Yosef + Israel checked → 1 restricted dimension
- Category subset + Status subset → 2 restricted dimensions
- exclude Ilya → 1 restricted dimension

## Scope

Filter state includes a `scope`:

- `all_jobs`
- `project:<project_id>`

A view saved under 1484 can remain project-specific. A user may intentionally save an All Jobs view separately.

## Default hierarchy

When opening a page:

1. project-specific page default, if set
2. global page default
3. built-in page default

Example keys:

- `project:1484-first-ave|my_work`
- `project:550-west-21st|my_work`
- `all_jobs|my_work`

## Saved view schema

A saved view contains:

- name
- owner user
- shared/personal
- page
- project scope
- include filters
- exclude filters
- date window
- sort
- grouping
- display density/card-table preference where supported

## Required dimensions

Core work dimensions:

- Project
- Owner
- Watcher
- Attention State
- Status
- Category
- Floor / Area
- System
- Equipment / Tag
- Priority
- Due window
- Follow-Up window
- Waiting On
- Schedule Impact
- Source System
- Confidence
- Flexible Tags
- Source Freshness

Schedule-specific:

- schedule category/type
- activity lane
- floor
- confidence
- source
- status/risk
- date range

## Built-in saved views

Potential built-ins:

- My Active
- Needs Review
- Waiting / Chase
- Schedule Risks
- Unassigned Actions
- Overdue

User-defined examples:

- #YosefToday
- #WaitingGC
- #Israel
- #Orders
- #Tomorrow
- #1484Mockup

## Acceptance tests

For every page where filters exist, run all tests under both `All Jobs` and at least one project scope:

1. Clear all → default/unrestricted result set.
2. Select all in a group → same result set as unrestricted.
3. Select all People → includes unassigned when Unassigned is available and selected.
4. Select subset of People → only matching owners.
5. Select Unassigned only → only unassigned.
6. Fully selected group adds 0 to badge.
7. Subset group adds 1 to badge.
8. Save view → reload → exact same result set.
9. Set 1484 default → switch 550 → 550 default unchanged.
10. User A default does not modify User B default.
