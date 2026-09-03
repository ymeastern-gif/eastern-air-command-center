import { fallbackAttentionState, isLiveAttention } from './attention-engine.mjs';
import { resolveSourceLink, sourceActionLabel, sourceLabel } from './source-links.mjs';

function mapBy(rows = [], key = 'id') {
  return Object.fromEntries(rows.map(row => [row[key], row]));
}

function groupBy(rows = [], key) {
  const out = new Map();
  for (const row of rows) {
    const k = row[key];
    if (!out.has(k)) out.set(k, []);
    out.get(k).push(row);
  }
  return out;
}

function activePrimaryAssignment(assignments = []) {
  return assignments.find(a => a.active !== false && a.is_primary) ?? assignments.find(a => a.active !== false) ?? null;
}

function clean(values = []) {
  return [...new Set(values.filter(v => v !== null && v !== undefined && v !== ''))];
}

export function buildCanonicalModel(raw, currentUserId) {
  const projects = mapBy(raw.projects);
  const categories = mapBy(raw.categories);
  const people = mapBy(raw.people);
  const management = mapBy(raw.management, 'item_id');
  const prefs = mapBy(raw.userItemPreferences, 'item_id');
  const sources = mapBy(raw.sourceRecords);
  const tags = mapBy(raw.tags);

  const assignmentsByItem = groupBy(raw.assignments, 'item_id');
  const watchersByItem = groupBy(raw.watchers, 'item_id');
  const itemSourcesByItem = groupBy(raw.itemSources, 'item_id');
  const itemTagsByItem = groupBy(raw.itemTags, 'item_id');

  return (raw.items ?? []).map(item => {
    const m = management[item.id] ?? {};
    const p = prefs[item.id] ?? {};
    const itemAssignments = assignmentsByItem.get(item.id) ?? [];
    const primaryAssignment = activePrimaryAssignment(itemAssignments);
    const owner = primaryAssignment ? people[primaryAssignment.person_id] : (m.current_owner_person_id ? people[m.current_owner_person_id] : null);
    const watcherRows = watchersByItem.get(item.id) ?? [];
    const sourceLinks = itemSourcesByItem.get(item.id) ?? [];
    const sourceList = sourceLinks.map(link => {
      const source = sources[link.source_record_id];
      if (!source) return null;
      const resolved = resolveSourceLink(source);
      return {
        ...source,
        isPrimary: !!link.is_primary,
        resolvedUrl: resolved.url,
        urlKind: source.source_url_kind || resolved.kind,
        badge: sourceLabel(source.source_system),
        actionLabel: sourceActionLabel(source.source_system),
      };
    }).filter(Boolean);
    sourceList.sort((a,b) => Number(b.isPrimary)-Number(a.isPrimary));
    const sourceSystems = clean(sourceList.map(s => s.source_system));
    const tagList = (itemTagsByItem.get(item.id) ?? []).map(link => tags[link.tag_id]?.name).filter(Boolean);

    const projectId = m.project_id_override || item.project_id || null;
    const categoryId = m.category_id_override || m.category_override || item.category_id || item.category || null;
    const due = m.due_override || item.due_at || null;
    const followUp = m.follow_up_at || null;
    const floor = m.floor_override || item.floor || null;
    const system = m.system_override || item.system_name || null;
    const equipment = m.equipment_override || null;
    const explicitManagement = !!(
      item.origin === 'command_center' ||
      sourceSystems.includes('todoist') ||
      m.flagged_at || m.attention_reason || m.follow_up_at || m.due_override ||
      m.management_origin === 'user' || m.management_origin === 'rule'
    );
    const attentionState = m.attention_state || fallbackAttentionState({
      status: m.status,
      flaggedAt: m.flagged_at,
      attentionReason: m.attention_reason,
      due: m.due_override,
      followUp: m.follow_up_at,
      explicitManagement,
    });

    const project = projects[projectId];
    const category = categories[categoryId];
    const ownerUserId = owner?.linked_user_id ?? null;
    const watcherUserIds = clean(watcherRows.map(w => w.user_id));
    const personalSource = item.origin === 'command_center' || sourceSystems.includes('todoist');

    return {
      id: item.id,
      canonicalKey: item.canonical_key,
      title: m.title_override || item.title,
      description: item.description,
      project: projectId,
      projectName: project?.name ?? null,
      category: categoryId,
      categoryName: category?.name ?? categoryId,
      floor,
      system,
      equipment,
      priority: m.priority_override || item.priority || 'medium',
      status: m.status || 'inbox',
      attentionState,
      attention: attentionState,
      due,
      followUp,
      waitingOn: m.waiting_on || null,
      scheduleImpact: m.schedule_impact || null,
      confidence: item.confidence || 'source_says',
      owner: owner?.id ?? null,
      ownerName: owner?.name ?? null,
      ownerUserId,
      watcherUserIds,
      watcher: watcherUserIds,
      tags: tagList,
      tag: tagList,
      source: sourceSystems,
      sources: sourceSystems,
      sourceRecords: sourceList,
      primarySource: sourceList.find(s => s.isPrimary) ?? sourceList[0] ?? null,
      origin: item.origin,
      personalSource,
      promoted: isLiveAttention(attentionState),
      personalDismissed: !!p.dismissed_from_live,
      personalFollowUp: p.personal_follow_up_at || null,
      personalNote: p.personal_note || null,
      pinned: !!p.pinned,
      hidden: !!p.hidden,
      flaggedToUserIds: [],
      meaningfulChangeNeedsReview: false,
      scheduleRisk: attentionState === 'risk' || m.schedule_impact === 'high' || m.schedule_impact === 'critical',
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      currentUserId,
      searchText: sourceList.flatMap(s => [s.title, s.body, s.source_ref]).filter(Boolean),
    };
  });
}

export function canonicalMaps(raw) {
  return {
    projects: mapBy(raw.projects),
    categories: mapBy(raw.categories),
    people: mapBy(raw.people),
    sources: mapBy(raw.sourceRecords),
  };
}
