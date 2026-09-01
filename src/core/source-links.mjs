const NUMERIC_ID = /^\d{6,30}$/;

export function isValidHttpUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export function deriveAsanaTaskUrl(sourceRef) {
  const gid = String(sourceRef ?? '').trim();
  if (!NUMERIC_ID.test(gid)) return null;
  return `https://app.asana.com/0/0/${gid}/f`;
}

export function resolveSourceLink(source = {}) {
  if (isValidHttpUrl(source.source_url)) {
    return { url: source.source_url, kind: 'direct' };
  }

  const system = String(source.source_system ?? '').toLowerCase();
  if (system === 'asana') {
    const url = deriveAsanaTaskUrl(source.source_ref);
    return url ? { url, kind: 'derived_deeplink' } : { url: null, kind: 'unavailable' };
  }

  return { url: null, kind: 'unavailable' };
}

export function sourceLabel(system) {
  const s = String(system ?? '').toLowerCase();
  const labels = {
    asana: 'ASANA', gmail: 'GMAIL', procore: 'PROCORE', todoist: 'TODOIST',
    google_drive: 'DRIVE', drive: 'DRIVE', file: 'FILE', command_center: 'COMMAND CENTER',
  };
  return labels[s] ?? String(system ?? 'SOURCE').toUpperCase();
}

export function sourceActionLabel(system) {
  const label = sourceLabel(system);
  if (label === 'GMAIL') return 'Open Email';
  if (label === 'DRIVE' || label === 'FILE') return 'Open Source File';
  return `Open in ${label === 'COMMAND CENTER' ? 'Command Center' : label[0] + label.slice(1).toLowerCase()}`;
}
