# Eastern Air Command Center V3 — Build Accountability Checklist

This is the working assignment board for the rebuild. Nothing is considered complete until its acceptance checks are documented.

## Phase 0 — Freeze and audit

- [x] Freeze the current live site; do not keep patching production blindly.
- [x] Create separate `rebuild-command-center` branch.
- [x] Audit existing Supabase schema.
- [x] Audit current row counts.
- [x] Confirm V2 management pollution: all 169 normalized items were promoted into management states.
- [x] Audit source-link preservation.
- [x] Confirm Gmail has source URLs.
- [x] Confirm Asana has source GIDs but missing source URLs.
- [x] Confirm Todoist has source IDs but missing source URLs.
- [x] Audit schedule volume and project distribution.
- [x] Confirm 1484 has 406 floor-cycle milestones.
- [x] Confirm 1484 schedule provenance fields are currently missing on imported milestones.
- [ ] Inventory every V2 UI page and decide Keep / Replace / Remove.
- [ ] Inventory every database field actually used by the V2 frontend.
- [ ] Document migration path that preserves user edits.

## Phase 1 — Product and data contracts

- [x] Write V3 product specification.
- [ ] Write source-provenance contract.
- [ ] Write canonical-item/deduplication contract.
- [ ] Write attention-state rules.
- [ ] Write filter-engine contract.
- [ ] Write saved-view/default-view contract.
- [ ] Write schedule/calendar contract.
- [ ] Write assignment/handoff contract.
- [ ] Write What Changed / meaningful-change rules.
- [ ] Write permissions contract.
- [ ] Write import/sync audit contract.

## Phase 2 — Database foundation

- [ ] Add/confirm explicit `attention_state` support without corrupting source status.
- [ ] Add source-link provenance metadata (`direct`, `derived_deeplink`, `missing`).
- [ ] Repair/derive Asana source URLs from stable task GIDs where valid.
- [ ] Repair/derive Todoist source URLs where valid.
- [ ] Add schedule source linkage and schedule revision identity.
- [ ] Attach 1484 cycle milestones to the imported schedule source.
- [ ] Add project-specific view/default preference structure.
- [ ] Add robust include/exclude filter representation.
- [ ] Add pseudo-value support for Unassigned / No Category / No Floor / No Source.
- [ ] Separate background intelligence from promoted management work.
- [ ] Define reversible migration for V2 polluted management states.
- [ ] Preserve genuine Todoist/current management items during migration.
- [ ] Preserve comments, notes, assignments, handoffs and personal preferences.

## Phase 3 — Source provenance

- [ ] Every source record renders a source badge.
- [ ] Every source record can show source ID/reference.
- [ ] Every source with a link gets `Open Original`.
- [ ] Asana cards can open their Asana task.
- [ ] Gmail cards can open their email/thread.
- [ ] Todoist cards can open their Todoist task when deep link is supported.
- [ ] Future Procore source card contract defined.
- [ ] Canonical item can display one Primary Source and multiple Supporting Sources.
- [ ] Source updated timestamp is visible in item detail.
- [ ] Last sync/last seen timestamp is visible in diagnostics.
- [ ] Missing source link is visibly flagged in admin diagnostics.

## Phase 4 — New frontend shell from scratch

- [ ] Create modular ES-module architecture; no monolithic patch file.
- [ ] Create single state store.
- [ ] Create single data-loading layer.
- [ ] Create single filter engine reused by all pages.
- [ ] Create single source-provenance component.
- [ ] Create single assignment/management component.
- [ ] Create responsive desktop shell.
- [ ] Create responsive mobile/PWA shell.
- [ ] Add error boundary / visible load errors.
- [ ] Add version/build identifier in admin diagnostics.

## Phase 5 — Filters

### Shared semantics

- [ ] Zero selected = unrestricted.
- [ ] All selected = unrestricted.
- [ ] Subset selected = restrict to subset.
- [ ] Fully selected group contributes zero filter-count badge.
- [ ] `Unassigned` is a real selectable pseudo-option.
- [ ] `No Category` is a selectable pseudo-option where relevant.
- [ ] `No Floor` is a selectable pseudo-option where relevant.
- [ ] `No Source` is a selectable pseudo-option where relevant.
- [ ] Include and Exclude are supported where useful.
- [ ] Filter state is deterministic after refresh.

### Controls

- [ ] Every group has Select All.
- [ ] Every group has Clear.
- [ ] Filter panel has Select All Groups.
- [ ] Filter panel has Clear All.
- [ ] Apply works.
- [ ] Reset to saved default works.
- [ ] Set as default works.
- [ ] Save View works.

### Availability

- [ ] Today filters.
- [ ] My Work filters.
- [ ] Assigned Out filters.
- [ ] Job Work filters.
- [ ] Calendar filters.
- [ ] Upcoming filters.
- [ ] Project Cycle filters.
- [ ] Sources/Intelligence filters.
- [ ] What Changed filters.

### Filter dimensions

- [ ] Project.
- [ ] Person/Owner.
- [ ] Watcher.
- [ ] Attention State.
- [ ] Status.
- [ ] Category.
- [ ] Floor/Area.
- [ ] System.
- [ ] Equipment/Tag.
- [ ] Priority.
- [ ] Due/Follow-Up date.
- [ ] Waiting On.
- [ ] Schedule Impact.
- [ ] Source System.
- [ ] Confidence.
- [ ] Tags.
- [ ] Source Freshness.

## Phase 6 — Saved views and project defaults

- [ ] Personal saved view.
- [ ] Shared saved view.
- [ ] Rename saved view.
- [ ] Delete saved view.
- [ ] Reorder/favorite saved view.
- [ ] Save project scope.
- [ ] Save page scope.
- [ ] Save filters/includes/excludes.
- [ ] Save sort.
- [ ] Save grouping.
- [ ] Save date window.
- [ ] Set global default per page.
- [ ] Set project-specific default per page.
- [ ] 1484 default can differ from 550.
- [ ] One user's default does not change another user's default.

## Phase 7 — Today / personal brain

- [ ] Today contains only actionable/review/waiting/risk items.
- [ ] Raw Asana volume never floods Today.
- [ ] My owned action items appear.
- [ ] My watched items appear when appropriate.
- [ ] Personal follow-ups due today appear.
- [ ] Shared follow-ups I own/watch appear.
- [ ] Overdue work appears.
- [ ] Schedule risks requiring me appear.
- [ ] Meaningful changes requiring review appear.
- [ ] Background intelligence stays out.
- [ ] Coming Up shows important schedule milestones, not arbitrary rows.
- [ ] Assigned Out summary is compact.

## Phase 8 — My Work

- [ ] Only genuinely mine/watch items by default.
- [ ] Unassigned does not automatically mean mine.
- [ ] Todoist personal items can appear.
- [ ] Command Center-created items can appear.
- [ ] Source item can be promoted into My Work.
- [ ] Dismissing from personal live view does not alter shared truth.
- [ ] Watch after handoff works.

## Phase 9 — Assignment / management window

- [ ] Professional full assignment window.
- [ ] Owner selector.
- [ ] Watcher selector.
- [ ] Handoff action.
- [ ] Handoff note.
- [ ] Keep watching after handoff.
- [ ] Status.
- [ ] Attention state.
- [ ] Priority.
- [ ] Due date.
- [ ] Follow-up date.
- [ ] Waiting on.
- [ ] Schedule impact.
- [ ] Category.
- [ ] Floor/area.
- [ ] System.
- [ ] Equipment/tag.
- [ ] Tags.
- [ ] Shared note.
- [ ] Personal note.
- [ ] Comments.
- [ ] Primary Source + Open Original.
- [ ] Supporting Sources.
- [ ] History timeline.
- [ ] Handoff logs.
- [ ] Assignment notification when target has login.

## Phase 10 — Assigned Out / Team

- [ ] Person-first assigned view.
- [ ] Group by person option.
- [ ] Filter by person.
- [ ] Filter by job.
- [ ] Filter by category/status/priority/source/context.
- [ ] Overdue/follow-up visibility.
- [ ] View a person's work without changing ownership.
- [ ] Team counts reconcile with underlying data.

## Phase 11 — Jobs control panels

For each main job:

- [ ] 1484 First Ave.
- [ ] 550 West 21st Street.
- [ ] 242 Seigel Street.
- [ ] 192 Douglas.

Each job overview must show:

- [ ] Next important milestone.
- [ ] Schedule risks.
- [ ] My actions.
- [ ] Assigned-out actions.
- [ ] Waiting/follow-up.
- [ ] Procurement/long-lead risks.
- [ ] Latest meaningful change.
- [ ] Source freshness.
- [ ] Project-specific default view.

Job subviews:

- [ ] Overview.
- [ ] Work.
- [ ] Calendar.
- [ ] Drawings & Submittals.
- [ ] Orders & Materials.
- [ ] Field & Foremen.
- [ ] RFI / Coordination.
- [ ] Commissioning / Startup.
- [ ] Change Orders.
- [ ] Sources / Intelligence.
- [ ] What Changed.

## Phase 12 — Calendar / schedule

- [ ] Month view.
- [ ] Week/lookahead view.
- [ ] Upcoming view.
- [ ] Project Cycle view.
- [ ] Procurement / Long Lead view.
- [ ] Click date to inspect events.
- [ ] Click milestone to inspect source.
- [ ] Filter by job.
- [ ] Filter by schedule category.
- [ ] Filter by floor/activity.
- [ ] Source-confidence labels.
- [ ] Delayed/at-risk visuals.
- [ ] Current vs historical schedule revision support.
- [ ] Authoritative vs calculated dates clearly distinct.

### 1484

- [ ] 406 floor-cycle rows render correctly.
- [ ] Cycle grouped by floor.
- [ ] Cycle grouped by activity lane.
- [ ] Next activity per floor.
- [ ] Delayed 2F riser dates visible.
- [ ] 3F 9/8, 4F 9/11, 5F 9/16 sequence visible.
- [ ] Testing and downstream branchwork/cabinet milestones visible.
- [ ] Original 8/28 cycle schedule source attached.

### 550

- [ ] Procurement milestones separated from GC schedule dates.
- [ ] 33-week MAU/ERU commitment labeled SOURCE SAYS / CALCULATED as appropriate.
- [ ] No fake master-schedule dates.

### 192

- [ ] Long-lead dates visibly CALCULATED when based on release + lead time.
- [ ] Delivered flags do not remain represented as future delivery commitments.

### 242

- [ ] No invented schedule.
- [ ] `Schedule source needed` status visible.
- [ ] Known procurement/coordination commitments can still display separately.

## Phase 13 — Source Intelligence

- [ ] Search source records directly.
- [ ] Filter by source system.
- [ ] Filter by project.
- [ ] Filter current vs historical.
- [ ] Open source directly.
- [ ] Promote source record into management work.
- [ ] Link source record to existing canonical item.
- [ ] Show duplicate/canonical candidates.

## Phase 14 — What Changed

- [ ] Meaningful changes only by default.
- [ ] Schedule movement.
- [ ] RFI response.
- [ ] Submittal status/revision.
- [ ] Drawing revision.
- [ ] Lead-time change.
- [ ] Delivery change.
- [ ] Owner/responsibility change.
- [ ] Field blocker.
- [ ] Source filter.
- [ ] Project filter.
- [ ] Person/noise rules.
- [ ] Routine Ilya muted unless blocker/delivery/schedule/order/material.

## Phase 15 — Search

- [ ] Search action items.
- [ ] Search source records.
- [ ] Search schedule milestones.
- [ ] Search people.
- [ ] Search projects.
- [ ] Search floor/system/equipment/tag.
- [ ] Search source IDs.
- [ ] Search notes/comments where authorized.
- [ ] Result type is clearly labeled.

## Phase 16 — Diagnostics / system accountability

- [ ] Admin Build / Diagnostics screen.
- [ ] Current frontend build ID.
- [ ] Current schema/migration version.
- [ ] Source last sync.
- [ ] Source status healthy/error.
- [ ] Counts by source.
- [ ] Missing source-link count.
- [ ] Ambiguous/duplicate count.
- [ ] Schedule source freshness.
- [ ] Import run summaries.
- [ ] Rebuild checklist visible/readable.

## Phase 17 — Security / permissions

- [ ] Re-audit RLS after V3 migrations.
- [ ] Viewer UI hides write controls.
- [ ] Member/manager/admin UI matches DB permissions.
- [ ] No service secrets in GitHub.
- [ ] Public repo contains no Eastern operational data.
- [ ] Source system writes remain impossible from V3 frontend.
- [ ] Enable leaked-password protection warning before broad rollout.

## Phase 18 — QA gates before merge

### Desktop

- [ ] Chrome desktop.
- [ ] Edge desktop.
- [ ] Today.
- [ ] My Work.
- [ ] Assigned Out.
- [ ] Jobs.
- [ ] Calendar.
- [ ] Filters All Jobs.
- [ ] Filters single job.
- [ ] Select All semantics.
- [ ] Unassigned semantics.
- [ ] Save View.
- [ ] Per-job default.
- [ ] Assignment/handoff.
- [ ] Open Original Source.

### Mobile

- [ ] iPhone-sized viewport.
- [ ] Bottom navigation.
- [ ] Filters usable one-handed.
- [ ] Assignment window usable.
- [ ] Calendar usable.
- [ ] Source deep-link button usable.

### Data reconciliation

- [ ] UI counts reconcile to SQL.
- [ ] My Work has no background-source flood.
- [ ] Assigned Out ownership reconciles to DB.
- [ ] Schedule counts reconcile to DB.
- [ ] Source-link diagnostics reconcile to DB.

## Phase 19 — Release

- [ ] V3 branch has final review.
- [ ] Master checklist is updated with evidence.
- [ ] No known P0/P1 defects.
- [ ] Migration backup/rollback documented.
- [ ] Merge to main only after explicit final check.
- [ ] GitHub Pages deploy succeeds.
- [ ] Post-deploy smoke test succeeds.
- [ ] Only then declare V3 live.
