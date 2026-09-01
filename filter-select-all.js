// Enhances the shared Filters modal without changing source-system data.
(function(){
  const STYLE_ID='cc-filter-select-all-style';
  function addStyle(){
    if(document.getElementById(STYLE_ID)) return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      .ccFilterGlobal{display:flex;gap:7px;flex-wrap:wrap;align-items:center;margin:4px 0 13px;padding:10px;border:1px solid var(--line,#dbe3ec);border-radius:12px;background:#f8fbff}
      .ccFilterGlobal strong{font-size:11px;margin-right:auto}
      .ccSelectBtn{border:1px solid var(--line,#dbe3ec);background:#fff;color:var(--ink,#132033);border-radius:8px;padding:6px 9px;font-size:10px;font-weight:850;cursor:pointer}
      .ccSelectBtn.primary{background:var(--navy,#0b2344);border-color:var(--navy,#0b2344);color:#fff}
      .filterGroupTitle.ccEnhanced{display:flex;align-items:center;gap:6px}
      .filterGroupTitle.ccEnhanced>span:first-child{margin-right:auto}
      .ccMiniAction{border:0;background:transparent;color:var(--blue,#1768d5);font-size:9px;font-weight:900;padding:2px 3px;cursor:pointer;text-transform:none;letter-spacing:0}
    `;
    document.head.appendChild(s);
  }
  function boxes(root){return [...root.querySelectorAll('input[type="checkbox"]')].filter(x=>!x.disabled)}
  function setBoxes(root,value){boxes(root).forEach(x=>{x.checked=value;x.dispatchEvent(new Event('change',{bubbles:true}))})}
  function enhance(modal){
    if(!modal || modal.dataset.ccSelectAll==='1') return;
    const heading=[...modal.querySelectorAll('h2')].find(h=>h.textContent.trim().toLowerCase()==='filters');
    if(!heading) return;
    modal.dataset.ccSelectAll='1'; addStyle();

    const grid=modal.querySelector('.filterGrid');
    if(grid){
      const global=document.createElement('div');
      global.className='ccFilterGlobal';
      global.innerHTML='<strong>All filter options</strong><button type="button" class="ccSelectBtn primary" data-cc-global-all>Select all</button><button type="button" class="ccSelectBtn" data-cc-global-clear>Clear all</button>';
      grid.parentNode.insertBefore(global,grid);
      global.querySelector('[data-cc-global-all]').onclick=()=>setBoxes(grid,true);
      global.querySelector('[data-cc-global-clear]').onclick=()=>setBoxes(grid,false);
    }

    modal.querySelectorAll('.filterGroup').forEach(group=>{
      const title=group.querySelector('.filterGroupTitle');
      if(!title || title.dataset.ccGroupAll==='1') return;
      title.dataset.ccGroupAll='1';
      title.classList.add('ccEnhanced');
      const label=document.createElement('span');
      label.textContent=title.textContent.trim();
      title.textContent='';
      title.appendChild(label);
      const all=document.createElement('button');
      all.type='button'; all.className='ccMiniAction'; all.textContent='Select all';
      const clear=document.createElement('button');
      clear.type='button'; clear.className='ccMiniAction'; clear.textContent='Clear';
      all.onclick=()=>setBoxes(group,true);
      clear.onclick=()=>setBoxes(group,false);
      title.append(all,clear);
    });
  }
  function scan(){
    document.querySelectorAll('.modal').forEach(enhance);
  }
  const observer=new MutationObserver(scan);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',scan); else scan();
})();
