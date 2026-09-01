import { normalizeFilterState } from './filter-engine.mjs';

export const V3_SETTINGS_KEY='v3';

export function scopeKey(page, projectScope='all') {
  const scope = projectScope === 'all' ? 'all_jobs' : `project:${projectScope}`;
  return `${scope}|${page}`;
}

export function normalizeViewState(state={}, universe={}) {
  return {
    filters: normalizeFilterState(state.filters ?? state, universe),
    sort: state.sort ?? null,
    groupBy: state.groupBy ?? null,
    dateWindow: state.dateWindow ?? null,
    display: state.display ?? null,
  };
}

export function getV3Settings(settings={}) {
  return settings?.[V3_SETTINGS_KEY] ?? {defaults:{},ui:{}};
}

export function resolveDefaultView({settings={},page,projectScope='all',builtIn={},universe={}}) {
  const v3=getV3Settings(settings);
  const specific=v3.defaults?.[scopeKey(page,projectScope)];
  if (specific) return normalizeViewState(specific,universe);
  if (projectScope!=='all') {
    const global=v3.defaults?.[scopeKey(page,'all')];
    if (global) return normalizeViewState(global,universe);
  }
  return normalizeViewState(builtIn,universe);
}

export function setDefaultView({settings={},page,projectScope='all',viewState,universe={}}) {
  const next=structuredClone(settings ?? {});
  next[V3_SETTINGS_KEY] ??= {defaults:{},ui:{}};
  next[V3_SETTINGS_KEY].defaults ??= {};
  next[V3_SETTINGS_KEY].defaults[scopeKey(page,projectScope)] = normalizeViewState(viewState,universe);
  return next;
}

export function clearDefaultView({settings={},page,projectScope='all'}) {
  const next=structuredClone(settings ?? {});
  if (next[V3_SETTINGS_KEY]?.defaults) delete next[V3_SETTINGS_KEY].defaults[scopeKey(page,projectScope)];
  return next;
}

export function savedViewPayload({name,page,projectScope='all',viewState,isShared=false,universe={}}) {
  return {
    name:String(name??'').trim().replace(/^#/,''),
    is_shared:!!isShared,
    filters:{
      version:3,
      page,
      project_scope:projectScope,
      ...normalizeViewState(viewState,universe),
    },
  };
}

export function parseSavedView(row, universe={}) {
  const f=row?.filters ?? {};
  if (f.version===3) {
    return {
      id:row.id,
      name:row.name,
      isShared:!!row.is_shared,
      page:f.page ?? 'my_work',
      projectScope:f.project_scope ?? 'all',
      state:normalizeViewState(f,universe),
    };
  }
  return {
    id:row.id,
    name:row.name,
    isShared:!!row.is_shared,
    page:f.page ?? 'my_work',
    projectScope:f.project_id ?? 'all',
    state:normalizeViewState({filters:{
      search:f.search??'',
      include:{
        owner:f.people??[], category:f.categories??[], status:f.statuses??[], priority:f.priorities??[], source:f.sources??[],
      },
      exclude:{}, date:{},
    }},universe),
  };
}

export function viewVisibleInScope(view,{page,projectScope}) {
  if (view.page!==page) return false;
  if (view.projectScope==='all') return true;
  return view.projectScope===projectScope;
}
