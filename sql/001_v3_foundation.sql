-- Eastern Air Command Center V3 foundation migration
-- DRAFT ONLY on rebuild-command-center branch. Do not apply to production until QA gate.

begin;

alter table public.item_management
  add column if not exists attention_state text,
  add column if not exists management_origin text,
  add column if not exists promoted_at timestamptz,
  add column if not exists promoted_by uuid references auth.users(id),
  add column if not exists schedule_impact text;

alter table public.source_records
  add column if not exists source_url_kind text;

alter table public.schedule_milestones
  add column if not exists source_record_id uuid references public.source_records(id),
  add column if not exists date_type text,
  add column if not exists schedule_revision_key text;

-- Constraints are added as NOT VALID first so existing production data can be audited before validation.
alter table public.item_management
  drop constraint if exists item_management_attention_state_check;
alter table public.item_management
  add constraint item_management_attention_state_check
  check (attention_state is null or attention_state in ('background','watch','action','waiting','review','risk','resolved')) not valid;

alter table public.source_records
  drop constraint if exists source_records_source_url_kind_check;
alter table public.source_records
  add constraint source_records_source_url_kind_check
  check (source_url_kind is null or source_url_kind in ('direct','derived_deeplink','unavailable')) not valid;

alter table public.schedule_milestones
  drop constraint if exists schedule_milestones_date_type_check;
alter table public.schedule_milestones
  add constraint schedule_milestones_date_type_check
  check (date_type is null or date_type in ('master_schedule','project_cycle','lookahead','testing','procurement_release','ship','delivery','calculated_lead_time','commissioning','required_by','internal_target')) not valid;

create index if not exists idx_item_management_attention_state on public.item_management(attention_state);
create index if not exists idx_schedule_milestones_source_record on public.schedule_milestones(source_record_id);
create index if not exists idx_schedule_milestones_revision on public.schedule_milestones(workspace_id, project_id, schedule_revision_key);

-- No production classification/backfill is included in this foundation migration.
-- Backfill is intentionally separated so it can be previewed and reconciled first.

commit;
