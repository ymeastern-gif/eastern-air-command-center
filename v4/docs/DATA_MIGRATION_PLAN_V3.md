# V2 → V3 Data Migration Plan

## Objective

Preserve every source record and legitimate user-management edit while separating background intelligence from actual management work.

## Current audit

Current hosted database:

- 169 canonical/normalized items
- 179 source records
- 415 schedule milestones
- 8 people
- 5 projects

V2 management pollution:

- 158 items status `assigned`
- 5 `needs_review`
- 4 `watching`
- 2 `done`

Every imported item currently has a management row.

## Proposed attention-state preview

Read-only preview against current production data using the V3 classification rules produced:

| Proposed attention | Count | Source pattern |
|---|---:|---|
| Background | 157 | Asana |
| Resolved | 2 | Asana |
| Review | 5 | Todoist |
| Watch | 4 | Todoist |
| Action | 1 | Todoist |

This classification is much closer to the intended product model: raw Asana inventory becomes background intelligence while the personal Todoist-derived items remain promoted.

## Migration method

### Step 1 — additive schema only

Add new fields; do not delete/reinterpret old fields yet.

Proposed additions:

- `item_management.attention_state`
- `item_management.management_origin`
- `item_management.promoted_at`
- `item_management.promoted_by`
- `item_management.schedule_impact`
- `source_records.source_url_kind`
- `schedule_milestones.source_record_id`
- `schedule_milestones.date_type`
- `schedule_milestones.schedule_revision_key`

### Step 2 — snapshot

Before classification, capture a migration snapshot of all existing management rows into an audit table or export so rollback is exact.

### Step 3 — classify without changing legacy status

Populate `attention_state` based on explicit evidence.

Initial proposal:

1. status `done` → `resolved`
2. status `needs_review` → `review`
3. status `watching` → `watch`
4. status `waiting`/`follow_up` → `waiting`
5. Todoist + assigned/inbox/working → `action`
6. explicit flag / attention_reason / follow-up / due override → `action`
7. otherwise → `background`

Legacy `status` remains intact during rollout so rollback and forensic comparison are possible.

### Step 4 — source links

- Preserve existing direct Gmail links as `source_url_kind=direct`.
- Derive Asana deep links from valid task GIDs and mark `source_url_kind=derived_deeplink`.
- Do not invent Todoist links until deterministic deep-link behavior is verified.

### Step 5 — schedule provenance

Attach 1484 cycle milestones to the 8/28/26 schedule source record/file identity.

Future schedule imports create revision identities rather than silently overwriting prior milestones.

### Step 6 — V3 frontend reads attention state

V3 uses `attention_state` for Today/My Work/Assigned Out eligibility.

V2 remains untouched on `main` until V3 acceptance is complete.

### Step 7 — release and later cleanup

Only after successful V3 release may obsolete V2 semantics be cleaned up. Cleanup is a separate migration and is not required for launch.

## Rollback

Rollback requires only:

- V3 frontend reverted/not merged; and/or
- newly added V3 fields ignored;
- attention-state population can be restored from migration snapshot.

No source record should ever be deleted as part of this migration.
