# V3 Attention / Live Queue Contract

## Why this exists

V2 treated source records as managed work. The audit found 169 normalized source items and all 169 had management states; 158 were marked `assigned`. This violates the product mission.

V3 separates source existence from management attention.

## Attention states

- `background` — searchable evidence only.
- `watch` — monitored but not requiring action.
- `action` — action required by an owner.
- `waiting` — action is with another person/party.
- `review` — decision/verification required.
- `risk` — schedule/procurement/field risk.
- `resolved` — management matter closed.

## Promotion into management

A background source record can be promoted by:

- explicit user flag
- explicit assignment
- explicit watch
- due/follow-up date
- trusted rule
- intelligence rule creating a written `attention_reason`

A source sync alone does not promote it.

## Today eligibility

An item may enter Today only if it is not background/resolved and at least one is true:

- owned by current user and actionable/review/risk
- watched by current user and currently actionable/risk/review
- personal follow-up is due/overdue
- shared follow-up is due/overdue and user owns/watches
- due date is overdue and user owns/watches
- explicitly flagged to current user
- schedule risk is assigned/promoted to current user
- meaningful change is awaiting current user's review

## My Work eligibility

Default My Work:

- primary owner = current user; or
- current user is watching; or
- personal Command Center/Todoist item explicitly promoted to active management

Unassigned source intelligence does not default into My Work.

## Assigned Out eligibility

- active attention state
- primary owner exists
- owner != current user

## Watch semantics

Watch is not ownership.

After handoff, previous owner may choose `Keep watching`. The item then leaves My Work ownership but can remain in Watch/Today when rules trigger.

## Waiting semantics

`Waiting` must include `waiting_on` and optional follow-up date.

Examples:

- Waiting on GC
- Waiting on vendor
- Waiting on engineer
- Waiting on foreman
- Waiting on internal office

## Risk semantics

Risk has a reason and optionally an impact dimension:

- schedule
- procurement
- field
- coordination
- cost/change order
- commissioning

## Migration principle

V2 management rows must not simply be deleted.

Migration classifies each record:

- preserve as genuine active management
- convert to background intelligence
- preserve as resolved/historical
- flag ambiguous for review

Current Todoist-derived needs-review/watch items and genuine user-created management edits receive higher preservation priority than bulk-imported Asana defaults.

## Acceptance tests

- Raw new Asana source record does not appear in My Work automatically.
- User promotes Asana source → appears in management.
- User assigns promoted item to Israel → leaves Yosef ownership view unless watching.
- Background source stays searchable in Intelligence.
- Schedule risk can appear in Today without creating a fake source-system task.
- Done/resolved management matter remains historically searchable.
