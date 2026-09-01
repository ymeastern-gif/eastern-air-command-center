import { filterRecords } from '../core/filter-engine.mjs';
import { selectAssignedOut, selectMyWork, selectToday, selectWaiting, sortByUrgency } from '../core/selectors.mjs';
import { isScheduleRisk, selectUpcoming } from '../core/schedule-engine.mjs';
import { itemCard } from '../ui/item-card.mjs';
import { esc, fmtDate, human, qs, qsa, todayIso } from '../ui/dom.mjs';
import { renderToolbar, wireToolbar, WORK_FILTER_DIMS } from '../ui/page-tools.mjs';

function cards(rows,empty='Nothing here.') {return rows.length?`<div class="cardGrid">${rows.map(r=>itemCard(r)).join('')}</div>`:`<div class="emptyState">${esc(empty)}</div>`}
function wireCards(root,onOpen){qsa('[data-manage-item]',root).forEach(b=>b.addEventListener('click',()=>onOpen(b.dataset.manageItem)))}
function filter(rows,state){return filterRecords(rows,state.viewState.filters,state.universe)}
function kpi(label,value,sub=''){return `<div class="metric"><strong>${value}</strong><span>${esc(label)}</span>${sub?`<small>${esc(sub)}</small>`:''}</div>`}
function schedMini(m){return `<button class="scheduleMini" data-open-schedule="${esc(m.id)}"><div class="scheduleMiniDate">${esc(fmtDate(m.plannedDate))}</div><div><strong>${esc(m.title)}</strong><span>${esc(m.projectName||'')}${m.floor?` · ${esc(m.floor)}`:''}</span></div><span class="confidence ${esc(m.confidence)}">${esc(human(m.confidence))}</span></button>`}

export function renderToday(ctx,root){
  const state=ctx.store.get(),today=todayIso(),base=selectToday(state.records,{userId:state.user.id,today,projectScope:state.projectScope}),rows=sortByUrgency(filter(base,state),today);
  const waiting=filter(selectWaiting(state.records,{userId:state.user.id,projectScope:state.projectScope,mineOrWatched:true}),state).filter(r=>r.followUp&&r.followUp<=today);
  const upcoming=selectUpcoming(state.schedule,{today,days:21,projectScope:state.projectScope}).slice(0,8);
  const risks=state.schedule.filter(m=>(state.projectScope==='all'||m.project===state.projectScope)&&isScheduleRisk(m,today)).slice(0,8);
  const assignedOut=selectAssignedOut(state.records,{userId:state.user.id,projectScope:state.projectScope});
  root.innerHTML=`<div class="pageHeader"><div><div class="eyebrow">${state.projectScope==='all'?'ALL JOBS':esc(state.maps.projects[state.projectScope]?.name||state.projectScope)}</div><h1>Today</h1><p>What needs your attention, what needs chasing, and what can hurt the schedule.</p></div><button class="btn primary" data-add-work>+ Add Work</button></div>${renderToolbar(state,{page:'today',placeholder:'Search my attention…',dimensions:WORK_FILTER_DIMS})}<div class="metricGrid">${kpi('Needs Attention',rows.length)}${kpi('Chase Today',waiting.length)}${kpi('Schedule Risks',risks.length)}${kpi('Assigned Out',assignedOut.length)}</div><section class="pageSection"><div class="sectionHeading"><div><h2>Needs My Attention</h2><p>Action, review, waiting and risk items that are actually relevant to you.</p></div></div>${cards(rows,'Your live attention queue is clear.')}</section><div class="twoCol"><section class="pageSection"><div class="sectionHeading"><h2>Waiting / Chase</h2></div>${cards(waiting,'Nothing needs chasing today.')}</section><section class="pageSection"><div class="sectionHeading"><h2>Schedule Risks</h2></div>${risks.length?`<div class="scheduleMiniList">${risks.map(schedMini).join('')}</div>`:'<div class="emptyState">No current schedule risks in this scope.</div>'}</section></div><section class="pageSection"><div class="sectionHeading"><div><h2>Coming Up</h2><p>Next important project-cycle and procurement milestones.</p></div><button class="btn secondary" data-go-calendar>Open Calendar</button></div>${upcoming.length?`<div class="scheduleMiniList">${upcoming.map(schedMini).join('')}</div>`:'<div class="emptyState">No dated milestones in the next 21 days.</div>'}</section>`;
  wireToolbar({root,state,store:ctx.store,api:ctx.api,page:'today',dimensions:WORK_FILTER_DIMS,onChange:ctx.render});wireCards(root,ctx.openItem);qs('[data-go-calendar]',root)?.addEventListener('click',()=>ctx.navigate('calendar'));qs('[data-add-work]',root)?.addEventListener('click',ctx.addWork);qsa('[data-open-schedule]',root).forEach(b=>b.addEventListener('click',()=>ctx.openSchedule(b.dataset.openSchedule)));
}

export function renderMyWork(ctx,root){
  const state=ctx.store.get(),today=todayIso(),base=selectMyWork(state.records,{userId:state.user.id,projectScope:state.projectScope}),rows=sortByUrgency(filter(base,state),today);
  root.innerHTML=`<div class="pageHeader"><div><div class="eyebrow">${state.projectScope==='all'?'ALL JOBS':esc(state.maps.projects[state.projectScope]?.name||state.projectScope)}</div><h1>My Work</h1><p>Only work you own, explicitly watch, or deliberately promoted into your personal management layer.</p></div><button class="btn primary" data-add-work>+ Add Work</button></div>${renderToolbar(state,{page:'my_work',placeholder:'Search my work…',dimensions:WORK_FILTER_DIMS})}<div class="resultBar"><strong>${rows.length}</strong> matching live item${rows.length===1?'':'s'}</div>${cards(rows,'No work matches this view.')}`;
  wireToolbar({root,state,store:ctx.store,api:ctx.api,page:'my_work',dimensions:WORK_FILTER_DIMS,onChange:ctx.render});wireCards(root,ctx.openItem);qs('[data-add-work]',root)?.addEventListener('click',ctx.addWork);
}

export function renderAssigned(ctx,root){
  const state=ctx.store.get(),today=todayIso(),base=selectAssignedOut(state.records,{userId:state.user.id,projectScope:state.projectScope}),rows=sortByUrgency(filter(base,state),today);
  const groups=new Map();for(const r of rows){const k=r.ownerName||'Unassigned';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r)}
  root.innerHTML=`<div class="pageHeader"><div><div class="eyebrow">${state.projectScope==='all'?'ALL JOBS':esc(state.maps.projects[state.projectScope]?.name||state.projectScope)}</div><h1>Assigned Out</h1><p>Everything actively owned by someone else. Assignment removes it from your ownership without losing shared visibility.</p></div></div>${renderToolbar(state,{page:'assigned_out',placeholder:'Search assigned work…',dimensions:WORK_FILTER_DIMS})}<div class="resultBar"><strong>${rows.length}</strong> matching item${rows.length===1?'':'s'} across <strong>${groups.size}</strong> owner${groups.size===1?'':'s'}</div>${rows.length?[...groups].map(([name,list])=>`<section class="ownerGroup"><div class="ownerGroupHead"><div><h2>${esc(name)}</h2><span>${list.length} active</span></div></div>${cards(list)}</section>`).join(''):'<div class="emptyState">No assigned-out work matches this view.</div>'}`;
  wireToolbar({root,state,store:ctx.store,api:ctx.api,page:'assigned_out',dimensions:WORK_FILTER_DIMS,onChange:ctx.render});wireCards(root,ctx.openItem);
}
