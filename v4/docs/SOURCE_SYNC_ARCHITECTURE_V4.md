# Eastern Air Command Center Brain V4 — Source Sync Architecture

## Purpose

The Brain cannot be trusted if it cannot say **what it knows, where it came from, when it last checked, and what changed**.

This architecture turns source ingestion into a first-class system instead of a collection of snapshots.

## Non-negotiable source rule

All external systems are **inbound/read-only** unless Yosef explicitly authorizes a specific write later.

The sync layer never creates, edits, completes, comments on, labels, sends, archives, or otherwise mutates Asana, Gmail, Procore, Drive, Todoist, or another source system.

## Layers

### 1. Source Connection

`source_connections` is the operational truth for each configured feed.

It records:

- project
- source system
- connection key
- poll / webhook / push / manual mode
- sync interval
- stale threshold
- cursor
- last attempt
- last true server success
- next due
- last error
- health

Important distinction:

- **Snapshot imported** is not the same thing as **server sync succeeded**.
- Legacy snapshot timestamps are preserved in connection config but are not treated as live sync success.

Current server-poll status for Gmail/Asana remains `needs_credentials` until OAuth/service credentials are securely configured server-side.

### 2. Normalized Ingest Gateway

Every adapter outputs the same normalized record contract:

```json
{
  "source_ref": "stable-provider-id",
  "project_id": "1484-first-ave",
  "title": "...",
  "body": "...",
  "source_url": "https://...",
  "source_created_at": "...",
  "source_updated_at": "...",
  "fingerprint": "optional-provider-or-content-hash",
  "authoritative_system": "asana",
  "captured_via": "gmail",
  "raw": {},
  "ingest_metadata": {}
}
```

The secured `source-ingest` Edge Function accepts batches of these normalized records from an authenticated Eastern manager/admin and invokes the database gateway using the service role.

The endpoint is JWT-protected and capped at 500 normalized records per batch.

### 3. Current Source Record

`source_records` holds the latest known state for the provider record.

New provenance fields:

- `connection_id`
- `authoritative_system`
- `captured_via`
- `deleted_at`
- `ingest_metadata`

Example:

An Asana notification captured through Gmail is:

- source_system: `gmail` (the captured provider record)
- authoritative_system: `asana`
- captured_via: `gmail`

This prevents a Gmail notification from pretending to be the official Asana task.

### 4. Version History

`source_record_versions` preserves historical versions.

On a material or metadata change, the system stores:

- version number
- old/new provider data snapshot
- fingerprint
- changed fields
- capture timestamp

This is the foundation for:

- What Changed
- schedule revision drift
- commitment aging
- decision history
- "since last visit"
- source conflict detection

### 5. Delta Engine

Every new/changed source record produces `source_deltas` and an `activity_events` entry.

The ingest layer identifies changed fields and marks a change meaningful when it affects things such as:

- title/body content
- assignment
- completion
- due date
- status
- approval
- release status
- delivery date

The source remains the evidence; Brain logic can later interpret the delta into topics, commitments, risks, or suggested actions.

### 6. Batch / Run Audit

`source_ingest_batches` captures:

- received
- added
- updated
- unchanged
- rejected
- meaningful changes
- cursor before/after
- errors

`sync_runs` receives a compact run summary.

No silent sync failure is allowed.

## Adapter Contract

Each source adapter has four responsibilities only:

1. authenticate securely server-side;
2. read from the source;
3. map provider records into normalized records;
4. send the normalized batch into `ingest_source_batch`.

Provider-specific logic stays outside the Brain model.

Examples:

### Asana adapter

Reads project tasks/stories/attachments as allowed and maps stable task/story GIDs.

It does not write to Asana.

### Gmail adapter

Reads matching messages/threads and preserves Gmail message/thread links.

It does not change read state, labels, drafts, archive state, or send mail.

### Procore adapter

Reads configured project objects/API events and preserves Procore object IDs + web links.

### Drive adapter

Reads metadata/content/revision information for configured files/folders.

## Credentials

Never store provider credentials in:

- GitHub repository
- browser JavaScript
- source records
- normal database tables
- chat messages

Server adapters must use Supabase Edge Function secrets/vault or the provider's secure OAuth flow.

ChatGPT connector authorization is not transferable to Supabase; it must not be copied or impersonated.

## Rollback

Pre-V4 code snapshot:

- Git branch: `snapshot-v3-2026-09-03`
- Git SHA: `a5228cd64c10961d493165205101cad36a24cd57`

Pre-V4 operational data snapshot:

- Supabase schema: `rollback_v3_20260903`

V4 schema migrations are additive. Current V3 can continue to ignore new sync/brain tables.
