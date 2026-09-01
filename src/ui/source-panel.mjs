import { esc, fmtDateTime } from './dom.mjs';

export function sourceBadge(source,{compact=false}={}) {
  if(!source)return '';
  const link=source.resolvedUrl;
  const content=`<span class="sourceBadge ${compact?'compact':''}">${esc(source.badge||source.source_system)}</span>`;
  return link?`<a class="sourceBadgeLink" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${content}</a>`:content;
}

export function sourceList(records=[]){
  if(!records.length)return '<div class="emptyInline">No linked source records.</div>';
  return `<div class="sourceList">${records.map(s=>`<article class="sourceRow ${s.isPrimary?'primary':''}"><div class="sourceRowTop"><div>${sourceBadge(s)} ${s.isPrimary?'<span class="primaryLabel">Primary Source</span>':'<span class="supportingLabel">Supporting Source</span>'}</div>${s.resolvedUrl?`<a class="btn small primary" href="${esc(s.resolvedUrl)}" target="_blank" rel="noopener noreferrer">${esc(s.actionLabel||'Open Original')}</a>`:'<span class="unavailable">Original link unavailable</span>'}</div><div class="sourceTitle">${esc(s.title||'Untitled source')}</div><div class="sourceMeta">${esc(s.source_ref||'')}${s.source_updated_at?` · Updated ${esc(fmtDateTime(s.source_updated_at))}`:''}${s.urlKind?` · ${esc(s.urlKind.replaceAll('_',' '))}`:''}</div>${s.body?`<details><summary>Source text</summary><div class="sourceBody">${esc(s.body)}</div></details>`:''}</article>`).join('')}</div>`;
}
