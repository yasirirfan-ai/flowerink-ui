/* Shared navigation, product information and quick views for Flower Ink. */
(() => {
  const PRODUCTS = [
    {sku:'FIVTNPC',slug:'violet-tansy',name:'Violet Tansy Nectar Purifying Cleanser',step:1,ml:110,price:4400,img:'violet-tansy',active:'Resurfacing AHAs',when:'both',blurb:'A nectar cleanser for normal to oily skin, with resurfacing AHAs.'},
    {sku:'FIJOMFC',slug:'jasmine-osmanthus',name:'Jasmine Osmanthus Milk Foam Cleanser',step:1,ml:110,price:4400,img:'jasmine-osmanthus',active:'Calming Botanicals',when:'both',blurb:'A milk foam cleanser for dehydrated skin, with calming botanicals.'},
    {sku:'FIPBHLE',slug:'periwinkle-butterfly',name:'Periwinkle Butterfly Hydra Lock Essence',step:2,ml:110,price:7600,img:'periwinkle-butterfly',active:'Plumping Polysaccharides',when:'both',blurb:'An essence for all skin types, morning and evening, with plumping polysaccharides.'},
    {sku:'FIRCHS',slug:'rose-calendula',name:'Rose Calendula Hyaluronic Serum',step:3,ml:30,price:8400,img:'rose-calendula',active:'Flower Vitamins',when:'both',blurb:'A hyaluronic serum that plumps, rejuvenates and locks in hydration, with flower vitamins.'},
    {sku:'FICPBMFN',slug:'cold-pressed-botanicals',name:'Cold Pressed Botanicals Medicinal Flower Nutrients',step:4,ml:30,price:11000,img:'cold-pressed-botanicals',active:'Bakuchiol + Rosehip Oil',when:'both',blurb:'Extra-virgin botanical oils for deep nourishment, with bakuchiol and rosehip oil.'},
    {sku:'FISJDHPM',slug:'superflower-juicy-dew',name:'Superflower Juicy Dew Hydra Plump Moisturizer',step:5,ml:50,price:9800,img:'superflower-juicy-dew',active:'Replenishing Ceramides',when:'both',blurb:'An intensely hydrating, nourishing moisturizer with replenishing ceramides.'},
    {sku:'FINFRPMM',slug:'nocturnal-flowers',name:'Nocturnal Flowers Reparative PM Moisturizer',step:5,ml:50,price:null,img:'nocturnal-flowers',active:'10% Tetrahexyldecyl Ascorbate',when:'pm',blurb:'A restorative moisturizer for night, with 10% tetrahexyldecyl ascorbate.'},
    {sku:'FICFAEC',slug:'caffeinated-flowers',name:'Caffeinated Flowers Awake Eye Cream',step:6,ml:15,price:7200,img:'caffeinated-flowers',active:'Peptides + Stem Cells',when:'am',blurb:'An eye cream that brightens and de-puffs, with peptides and stem cells.'},
    {sku:'FITIRPET',slug:'triple-indigo',name:'Triple Indigo Repair PM Eye Treatment',step:6,ml:15,price:7600,img:'triple-indigo',active:'10% Vitamin C',when:'pm',blurb:'An overnight eye treatment with 10% vitamin C.'}
  ];
  const images = Object.fromEntries(PRODUCTS.map(p=>[p.img,'img/'+p.img+'.jpg']));
  const esc = text => String(text).replace(/[&<>"']/g, character=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const format = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
  const FI = {
    PRODUCTS,
    bySku: sku=>PRODUCTS.find(p=>p.sku===sku),
    stepName: step=>({1:'Cleanse',2:'Essence',3:'Serum',4:'Nourish',5:'Moisturize',6:'Eyes'}[step]||''),
    priced: product=>Number.isFinite(product.price),
    price: cents=>format.format(cents/100)
  };
  window.FI = FI;
  window.FI_IMG = images;
  const grid = document.getElementById('track');
  if (grid) grid.innerHTML = [0,2,3,5,1,4,6,7,8].map(index=>{
    const p=PRODUCTS[index];
    return `<article class="card shop-product-card" data-step="${p.step}" data-sku="${p.sku}"><button type="button" class="shop-product-media" data-quick-view="${p.sku}" aria-label="View ${esc(p.name)}"><img src="${images[p.img]}" alt="${esc(p.name)} with its botanical ingredients" width="900" height="1125" loading="lazy"></button><div class="shop-product-info"><div class="shop-product-overline"><span>${FI.stepName(p.step)}</span><span>${p.ml} ml</span></div><div class="shop-product-name-row"><h3>${esc(p.name)}</h3><span class="shop-product-price">${FI.priced(p)?FI.price(p.price):'Coming soon'}</span></div><div class="shop-product-foot"><p class="shop-product-active">${esc(p.active)}</p><button type="button" class="shop-product-cta shop-product-explore" data-quick-view="${p.sku}" aria-label="View ${esc(p.name)} formula"><span aria-hidden="true">&nearr;</span></button></div></div></article>`;
  }).join('');

  function openQuickView(sku) {
    const product=FI.bySku(sku);
    const dialog=document.getElementById('formula-quickview');
    if(!product || !dialog)return;
    const image=document.getElementById('quickview-image');
    image.src=images[product.img];image.alt=product.name;
    const values={step:FI.stepName(product.step),title:product.name,price:FI.priced(product)?FI.price(product.price):'Coming soon',description:product.blurb,active:product.active,size:product.ml+' ml',when:product.when==='pm'?'Evening':product.when==='am'?'Morning':'Morning & evening'};
    Object.entries(values).forEach(([key,value])=>{document.getElementById('quickview-'+key).textContent=value;});
    const add=document.getElementById('quickview-add');
    if(add){
      add.dataset.addToBag=product.sku;
      add.disabled=!FI.priced(product);
      add.innerHTML=FI.priced(product)?'Add to bag <span aria-hidden="true">&rarr;</span>':'Coming soon';
      document.getElementById('quickview-bag-message').textContent='';
      dialog.querySelector('.shop-quickview-launch').hidden=FI.priced(product);
    }
    if(!dialog.open)dialog.showModal();
  }
  FI.openQuickView=openQuickView;
  const destinations={home:'index.html',skincare:'skincare.html',makeup:'makeup.html','the-flowers':'the-flowers.html',about:'about.html',account:'account.html',bag:'bag.html',checkout:'checkout.html'};
  const aliases={'ritual-finder':'join'};
  function go(destination) {
    if(destinations[destination]){location.assign(destinations[destination]);return;}
    const target=aliases[destination]||destination;
    const element=document.getElementById(target);
    history.replaceState(null,'','#'+target);
    if (element) element.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    else window.scrollTo({top:0,behavior:'smooth'});
  }
  window.FIApp={go,state:{customer:{joined:false},cart:{lines:[]}}};
  const search=document.getElementById('search');
  const searchInput=document.getElementById('search-q');
  const searchResults=document.getElementById('search-results');
  function renderSearch() {
    const query=searchInput.value.trim().toLowerCase();
    const matches=PRODUCTS.filter(p=>(p.name+' '+p.active+' '+p.blurb).toLowerCase().includes(query));
    searchResults.innerHTML=matches.length?matches.map(p=>`<button type="button" class="search-result" data-search-sku="${p.sku}"><img src="${images[p.img]}" alt="" width="55" height="68"><span>${esc(p.name)}</span><b>${FI.priced(p)?FI.price(p.price):'Coming soon'}</b></button>`).join(''):'<p style="margin-top:20px">No formulas found. Try a flower or ingredient.</p>';
  }
  searchInput.addEventListener('input',renderSearch);
  document.addEventListener('click',event=>{
    const close=event.target.closest('[data-action="close-dialog"]');
    if(close){close.closest('dialog')?.close();return;}
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(action==='open-menu')document.getElementById('menu').showModal();
    if(action==='open-search'){renderSearch();search.showModal();searchInput.focus();}
    const result=event.target.closest('[data-search-sku]');
    if(result){search.close();openQuickView(result.dataset.searchSku);}
    const formula=event.target.closest('[data-quick-view]');
    if(formula)openQuickView(formula.dataset.quickView);
    const anchor=event.target.closest('a[href^="#"]');
    if(anchor){
      anchor.closest('dialog')?.close();
      if(anchor.getAttribute('href')==='#home'){event.preventDefault();go('home');}
    }
    const policy=event.target.closest('[data-policy]');
    if(policy){
      event.preventDefault();
      const privacy=policy.dataset.policy==='privacy';
      document.getElementById('policy-title').textContent=privacy?'Privacy Policy':'Accessibility';
      document.getElementById('policy-copy').innerHTML=privacy?'<p>This is a local Flower Ink presentation. Product browsing does not place an order. Email details entered in this preview are stored only in this browser and are not sent to a mailing service.</p><p>The store’s complete privacy notice will be available at launch.</p>':'<p>Use the keyboard to navigate the page and collection tabs. Press Escape to close product details or search. The page respects your reduced-motion preference.</p>';
      document.getElementById('policy').showModal();
    }
  });
  document.querySelector('[data-form="join"]').addEventListener('submit',event=>{
    event.preventDefault();
    const input=document.getElementById('join-email');
    const message=document.getElementById('join-msg');
    if(!input.value.trim()||!input.checkValidity()){
      message.textContent='Please enter a valid email address.';
      input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby','join-msg');input.focus();return;
    }
    try{localStorage.setItem('flowerink-preview-interest',input.value.trim());}catch{}
    input.removeAttribute('aria-invalid');
    message.textContent='Thank you. Your interest has been saved on this device for the preview.';
    window.FIApp.state.customer.joined=true;
  });
  const requestedFormula=new URLSearchParams(location.search).get('formula');
  if(requestedFormula)requestAnimationFrame(()=>openQuickView(requestedFormula));
})();
