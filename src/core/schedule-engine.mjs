function dateOnly(v){return v ? String(v).slice(0,10) : null;}

export function normalizeMilestone(row, projectMap={}, sourceMap={}) {
  const source = row.source_record_id ? sourceMap[row.source_record_id] : null;
  const confidence = row.confidence || 'source_says';
  const dateType = row.date_type || inferDateType(row);
  return {
    id: row.id,
    project: row.project_id,
    projectName: projectMap[row.project_id]?.name ?? row.project_id,
    title: row.title,
    floor: row.floor || null,
    category: row.category || null,
    plannedDate: dateOnly(row.planned_date),
    actualDate: dateOnly(row.actual_date),
    status: row.status || 'planned',
    confidence,
    notes: row.notes || null,
    sourceSystem: row.source_system || source?.source_system || null,
    sourceRef: row.source_ref || source?.source_ref || null,
    sourceRecordId: row.source_record_id || null,
    sourceUrl: source?.source_url || null,
    dateType,
    revisionKey: row.schedule_revision_key || null,
    predecessorId: row.predecessor_id || null,
  };
}

export function inferDateType(row) {
  const cat=String(row.category||'').toLowerCase();
  const conf=String(row.confidence||'').toLowerCase();
  if (cat.includes('floor_cycle')) return 'project_cycle';
  if (cat.includes('procurement')) return conf==='calculated' ? 'calculated_lead_time' : 'delivery';
  if (cat.includes('testing')) return 'testing';
  if (cat.includes('commission')) return 'commissioning';
  return 'internal_target';
}

export function isCalculatedMilestone(m) {
  return m.confidence === 'calculated' || m.dateType === 'calculated_lead_time';
}

export function isScheduleRisk(m, today) {
  if (['delayed','at_risk'].includes(m.status)) return true;
  if (m.plannedDate && m.plannedDate < today && !m.actualDate && !['done','complete','completed'].includes(m.status)) return true;
  return false;
}

export function selectUpcoming(milestones, {today, days=30, projectScope='all', includeTbd=false}={}) {
  const start=today;
  let end=null;
  if (days !== 'all') {
    const d=new Date(`${today}T12:00:00`); d.setDate(d.getDate()+Number(days)); end=d.toLocaleDateString('en-CA');
  }
  return milestones.filter(m => {
    if (projectScope!=='all' && m.project!==projectScope) return false;
    if (!m.plannedDate) return includeTbd;
    if (m.plannedDate < start) return false;
    if (end && m.plannedDate > end) return false;
    return true;
  }).sort((a,b)=>(a.plannedDate||'9999').localeCompare(b.plannedDate||'9999') || String(a.title).localeCompare(String(b.title)));
}

export function groupCycleByFloor(milestones, projectScope) {
  const groups=new Map();
  for (const m of milestones) {
    if (projectScope && projectScope!=='all' && m.project!==projectScope) continue;
    if (m.dateType!=='project_cycle') continue;
    const key=m.floor || 'No Floor';
    if (!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(m);
  }
  for (const list of groups.values()) list.sort((a,b)=>(a.plannedDate||'9999').localeCompare(b.plannedDate||'9999'));
  return groups;
}

export function nextMilestone(milestones, {today, projectScope='all'}={}) {
  return selectUpcoming(milestones,{today,days:'all',projectScope})[0] ?? null;
}

export function nextByFloor(milestones, {today, projectScope='all'}={}) {
  const out=[];
  for (const [floor,list] of groupCycleByFloor(milestones,projectScope)) {
    const next=list.find(m=>m.plannedDate && m.plannedDate>=today && !['done','complete','completed'].includes(m.status));
    if (next) out.push({floor,milestone:next});
  }
  return out.sort((a,b)=>a.milestone.plannedDate.localeCompare(b.milestone.plannedDate));
}

export function scheduleStats(milestones, {today, projectId}={}) {
  const scoped=milestones.filter(m=>!projectId||m.project===projectId);
  return {
    total: scoped.length,
    risks: scoped.filter(m=>isScheduleRisk(m,today)).length,
    upcoming30: selectUpcoming(scoped,{today,days:30}).length,
    calculated: scoped.filter(isCalculatedMilestone).length,
    tbd: scoped.filter(m=>!m.plannedDate).length,
  };
}
