# V3 Source Provenance Contract

## Principle

Every fact that entered the Command Center from outside the Command Center must remain traceable to its original source.

The user must never be forced to trust a summarized card without being able to inspect the real record behind it.

## Source record requirements

Every source record stores:

- `source_system`
- `source_ref`
- `source_url` when provided or safely derivable
- `source_url_kind`: `direct | derived_deeplink | unavailable`
- `title`
- `source_created_at`
- `source_updated_at`
- `last_seen_at`
- `is_historical`
- `fingerprint`
- raw source metadata

## Primary and supporting sources

A canonical item can have multiple linked source records.

Exactly zero or one linked source is `primary`.

The detail panel renders:

1. Primary Source first.
2. Supporting Sources after it.
3. Internal Command Center evidence last.

## Source badges

UI labels:

- ASANA
- GMAIL
- PROCORE
- TODOIST
- DRIVE
- FILE / PDF
- COMMAND CENTER
- future connector names

Each badge can be clicked when a deep link exists.

## `Open Original` behavior

### Asana

If `source_url` exists, open it.

If `source_url` is absent but `source_ref` is a valid task GID, derive an official Asana task deep link and mark `source_url_kind=derived_deeplink`.

For the current 1484 import, source task GIDs are preserved; V3 must repair the missing URLs before provenance acceptance testing is considered complete.

### Gmail

Use the preserved Gmail `display_url`/source URL.

### Todoist

Use a current official task deep link only when deterministically derivable from the task ID. If not safely derivable, mark unavailable rather than fabricating a link.

### Procore

When connected, preserve the Procore company/project/object identifier and direct web URL from the API/connector when available. No source write is permitted.

### Drive / files

Preserve the provider URL or file reference. If the source is a local/manual PDF import and no external URL exists, the source panel still identifies the file name, revision/date and import record.

## Canonical summary vs source truth

The detail panel visually separates:

- **Eastern Air Summary** — editable management summary.
- **Source Record** — read-only evidence.

Changing the Eastern summary never changes the original source.

## Confidence provenance

Every system-generated confidence label can be traced to one or more sources.

Examples:

- SOURCE SAYS → directly supported source.
- CALCULATED → formula inputs link back to their source records.
- INFERRED → all contributing sources are listed.
- NEEDS VERIFICATION → identifies missing/conflicting evidence.

## Missing-link diagnostics

Admin diagnostics show counts by source system:

- total source records
- with direct URL
- with derived URL
- without URL
- invalid URL/deep-link test failures

Missing source links do not silently disappear.

## Acceptance tests

- Asana source card shows task GID and opens the correct task.
- Gmail source card opens the correct message/thread.
- Canonical item with multiple sources shows Primary + Supporting Sources.
- Source updated time is shown.
- Management edits do not change source record contents.
- Missing link is shown as unavailable/diagnostic, not as a dead button.
