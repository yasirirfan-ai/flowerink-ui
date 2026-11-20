/* Searchable botanical-to-formula index. */
(() => {
  const source=document.getElementById('flower-library-data');
  if(!source)return;
  const plants=JSON.parse(source.textContent);
  const search=document.getElementById('flower-search');
  const rows=[...document.querySelectorAll('#flower-index li')];
  const specimen=document.getElementById('flower-specimen');
  const image=document.getElementById('flower-selected-image');
  let selected=plants[0].name;
  function select(plant,announce=true){
    selected=plant.name;
    rows.forEach(row=>{const button=row.querySelector('button');button.setAttribute('aria-pressed',String(button.dataset.flowerName===selected));});
    document.getElementById('flower-selected-name').textContent=plant.name;
    document.getElementById('flower-selected-category').textContent=plant.category;
    document.getElementById('flower-selected-formula').textContent=plant.formula;
    document.getElementById('flower-selected-active').textContent=plant.active;
    const next='img/'+plant.image+'.jpg';
    if(image.getAttribute('src')!==next)image.src=next;
    image.alt=plant.formula+' with its botanical ingredients';
    document.getElementById('flower-view-formula').dataset.quickView=plant.sku;
    document.getElementById('flower-view-formula').setAttribute('aria-label','Explore '+plant.formula);
    if(announce)document.getElementById('flower-selection-status').textContent=plant.name+'. Found in '+plant.formula+'.';
  }
  function filter(){
    const query=search.value.trim().toLowerCase();
    const matches=plants.filter(plant=>[plant.name,plant.category,plant.active,plant.formula].join(' ').toLowerCase().includes(query));
    rows.forEach(row=>{row.hidden=!matches.some(plant=>plant.name===row.querySelector('button').dataset.flowerName);});
    document.getElementById('flower-index-count').textContent=matches.length+(matches.length===1?' botanical':' botanicals');
    document.getElementById('flower-empty').hidden=matches.length>0;
    specimen.hidden=matches.length===0;
    if(matches.length&&!matches.some(plant=>plant.name===selected))select(matches[0]);
  }
  rows.forEach(row=>row.querySelector('button').addEventListener('click',event=>{
    const plant=plants.find(item=>item.name===event.currentTarget.dataset.flowerName);
    if(plant)select(plant);
  }));
  search.addEventListener('input',filter);
  document.querySelector('[data-flower-reset]').addEventListener('click',()=>{search.value='';filter();search.focus();});
  select(plants[0],false);
})();
