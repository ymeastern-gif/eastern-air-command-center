(function(){
  function allBoxes(root){return [...root.querySelectorAll('input[type="checkbox"]')].filter(x=>!x.disabled)}
  function setAll(root,value){allBoxes(root).forEach(x=>{x.checked=value;x.dispatchEvent(new Event('change',{bubbles:true}))})}
  function button(text,primary=false){const b=document.createElement('button');b.type='button';b.className='btn small'+(primary?' primary':'');b.textContent=text;return b}
  function normalizeFullySelected(modal){
    modal.querySelectorAll('.filterGroup').forEach(group=>{
      const boxes=[...group.querySelectorAll('input[data-filter]')].filter(x=>!x.disabled);
      if(boxes.length&&boxes.every(x=>x.checked)) boxes.forEach(x=>{x.checked=false});
    });
  }
  function enhance(){
    const modal=document.querySelector('#modal');
    if(!modal)return;
    const h2=modal.querySelector('h2');
    if(!h2||h2.textContent.trim().toLowerCase()!=='filters'||modal.dataset.selectAllV2==='1')return;
    modal.dataset.selectAllV2='1';
    const grid=modal.querySelector('.filterGrid');
    if(!grid)return;

    const top=document.createElement('div');
    top.className='row';
    const title=document.createElement('strong');
    title.textContent='All filter options';
    title.className='grow';
    const all=button('Select all',true),clear=button('Clear all');
    all.onclick=()=>setAll(grid,true);clear.onclick=()=>setAll(grid,false);
    top.append(title,all,clear);
    grid.parentNode.insertBefore(top,grid);

    modal.querySelectorAll('.filterGroup').forEach(group=>{
      const heading=group.querySelector('.filterGroupTitle');
      if(!heading)return;
      const controls=document.createElement('div');
      controls.className='row';
      const label=document.createElement('strong');
      label.className='grow';
      label.textContent=heading.textContent.trim();
      const a=button('Select all'),c=button('Clear');
      a.onclick=()=>setAll(group,true);c.onclick=()=>setAll(group,false);
      controls.append(label,a,c);
      heading.replaceWith(controls);
    });
  }
  document.addEventListener('click',e=>{
    const open=e.target.closest('#openFilters,.filterBtn');
    if(open){setTimeout(enhance,0);setTimeout(enhance,60);setTimeout(enhance,180);return;}
    const apply=e.target.closest('#applyFilters,#setDefault');
    if(apply){const modal=document.querySelector('#modal');if(modal)normalizeFullySelected(modal);}
  },true);
})();
