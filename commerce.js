/* Browser-local bag and explicitly labelled account preview. No authentication or payment requests. */
(() => {
  const FI=window.FI;
  if(!FI)return;
  const BAG_KEY='flowerink-bag-v1';
  const PROFILE_KEY='flowerink-preview-account-v1';
  const LIMIT=10;
  const addFeedback=new WeakMap();
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}}
  function loadBag(){
    const saved=read(BAG_KEY,{lines:[]});
    const merged=new Map();
    for(const line of Array.isArray(saved?.lines)?saved.lines:[]){
      const product=FI.bySku(line?.sku);
      if(!product || !FI.priced(product) || !Number.isInteger(line.quantity) || line.quantity<1)continue;
      merged.set(product.sku,Math.min(LIMIT,(merged.get(product.sku)||0)+line.quantity));
    }
    return [...merged].map(([sku,quantity])=>({sku,quantity}));
  }
  function loadProfile(){
    const saved=read(PROFILE_KEY,null);
    if(!saved || typeof saved.email!=='string' || saved.email.length>254 || !/^[^\s@]+@[^\s@]+$/.test(saved.email))return null;
    return {email:saved.email,name:typeof saved.name==='string'?saved.name.slice(0,80):''};
  }
  let lines=loadBag();
  let profile=loadProfile();
  let mode='signin';
  const count=()=>lines.reduce((sum,line)=>sum+line.quantity,0);
  const subtotal=()=>lines.reduce((sum,line)=>sum+FI.bySku(line.sku).price*line.quantity,0);
  const itemLabel=n=>n+' '+(n===1?'item':'items');
  function header(){
    const badge=document.getElementById('bag-count');if(badge)badge.textContent=count();
    const link=document.getElementById('bag-btn');if(link)link.setAttribute('aria-label','Your bag, '+itemLabel(count()));
    document.querySelectorAll('[data-account-bag-count]').forEach(node=>{node.textContent=itemLabel(count());});
    if(window.FIApp)window.FIApp.state.cart.lines=lines.map(line=>({sku:line.sku,qty:line.quantity}));
  }
  function renderBag(){
    const target=document.getElementById('bag-items');
    if(!target)return;
    document.getElementById('bag-empty').hidden=lines.length>0;
    document.getElementById('bag-filled').hidden=lines.length===0;
    document.getElementById('bag-item-count').textContent=itemLabel(count());
    target.innerHTML=lines.map(line=>{
      const p=FI.bySku(line.sku),name=esc(p.name),sku=p.sku;
      return `<article class="bag-line" data-bag-line="${sku}"><button type="button" class="bag-line-photo" data-quick-view="${sku}" aria-label="View ${name}"><img src="${window.FI_IMG[p.img]}" alt="${name}" width="110" height="138"></button><div class="bag-line-body"><div class="bag-line-category">${FI.stepName(p.step)}</div><h2><button type="button" data-quick-view="${sku}">${name}</button></h2><p>${p.ml} ml <span aria-hidden="true">&middot;</span> ${FI.price(p.price)} each</p><div class="bag-item-actions"><div class="bag-quantity"><button type="button" data-bag-step="-1" data-bag-sku="${sku}" aria-label="Decrease ${name} quantity" ${line.quantity===1?'disabled':''}>&minus;</button><label class="vh" for="bag-qty-${sku}">Quantity for ${name}</label><input id="bag-qty-${sku}" data-bag-quantity="${sku}" type="number" min="1" max="${LIMIT}" step="1" value="${line.quantity}" inputmode="numeric"><button type="button" data-bag-step="1" data-bag-sku="${sku}" aria-label="Increase ${name} quantity" ${line.quantity===LIMIT?'disabled':''}>+</button></div><button type="button" class="commerce-text-button" data-bag-remove="${sku}" aria-label="Remove ${name} from your bag">Remove</button></div></div><span class="bag-line-total">${FI.price(p.price*line.quantity)}</span></article>`;
    }).join('');
    document.getElementById('bag-subtotal').textContent=FI.price(subtotal());
    document.getElementById('bag-total').textContent=FI.price(subtotal());
  }
  function announce(message){
    const status=document.getElementById('bag-status');
    if(status)status.textContent=message;
  }
  function publish(message){
    const saved=write(BAG_KEY,{lines});
    header();renderBag();
    if(message)announce(message+(saved?'':' Your bag could not be saved on this device.'));
    document.dispatchEvent(new CustomEvent('flowerink:bag-updated',{detail:{count:count(),subtotal:subtotal()}}));
  }
  function add(sku){
    const product=FI.bySku(sku);
    if(!product || !FI.priced(product))return false;
    const line=lines.find(item=>item.sku===sku);
    if(line?.quantity===LIMIT)return false;
    if(line)line.quantity+=1;else lines.push({sku,quantity:1});
    publish(product.name+' added to your bag.');
    return true;
  }
  function quantity(sku,value){
    const line=lines.find(item=>item.sku===sku);
    if(!line || !Number.isInteger(value) || value<1 || value>LIMIT)return false;
    line.quantity=value;publish('Quantity updated.');return true;
  }
  function remove(sku){
    const product=FI.bySku(sku);
    lines=lines.filter(line=>line.sku!==sku);
    publish((product?.name||'Formula')+' removed from your bag.');
  }
  window.FlowerInkBag={add,setQuantity:quantity,remove,count,subtotal,getLines:()=>lines.map(line=>({...line}))};
  function focusQuantity(sku,step){
    const button=document.querySelector(`[data-bag-step="${step}"][data-bag-sku="${sku}"]`);
    const input=document.getElementById('bag-qty-'+sku);
    (button && !button.disabled?button:input)?.focus({preventScroll:true});
  }
  document.addEventListener('click',event=>{
    const addButton=event.target.closest('[data-add-to-bag]');
    if(addButton && !addButton.disabled){
      const product=FI.bySku(addButton.dataset.addToBag);
      const added=add(addButton.dataset.addToBag);
      const message=document.getElementById('quickview-bag-message');
      if(message && addButton.closest('#formula-quickview'))message.textContent=added?'Added to your bag.':'You can add up to '+LIMIT+' of this formula.';
      if(!added && product)announce('You can add up to '+LIMIT+' of this formula.');
      if(added && !addButton.closest('#formula-quickview')){
        const feedback=addFeedback.get(addButton)||{markup:addButton.innerHTML,timer:0};
        clearTimeout(feedback.timer);
        addButton.textContent='Added \u2713';
        feedback.timer=setTimeout(()=>{if(addButton.isConnected)addButton.innerHTML=feedback.markup;addFeedback.delete(addButton);},1200);
        addFeedback.set(addButton,feedback);
      }
    }
    const adjust=event.target.closest('[data-bag-step]');
    if(adjust && !adjust.disabled){
      const line=lines.find(item=>item.sku===adjust.dataset.bagSku);
      if(line && quantity(line.sku,line.quantity+Number(adjust.dataset.bagStep)))focusQuantity(line.sku,adjust.dataset.bagStep);
    }
    const removal=event.target.closest('[data-bag-remove]');
    if(removal){remove(removal.dataset.bagRemove);document.querySelector('[data-bag-remove],.bag-empty .commerce-button')?.focus({preventScroll:true});}
  });
  document.addEventListener('change',event=>{
    const input=event.target.closest('[data-bag-quantity]');
    if(!input)return;
    const sku=input.dataset.bagQuantity;
    if(!quantity(sku,Number(input.value))){
      input.value=lines.find(line=>line.sku===sku)?.quantity||1;
      announce('Choose a whole quantity from 1 to '+LIMIT+'.');
    }else document.getElementById('bag-qty-'+sku)?.focus({preventScroll:true});
  });
  const recommendations=document.getElementById('bag-recommendations');
  if(recommendations)recommendations.innerHTML=['FIVTNPC','FIRCHS','FISJDHPM'].map(sku=>{
    const p=FI.bySku(sku);
    return `<article class="bag-recommendation"><button type="button" class="bag-recommendation-photo" data-quick-view="${sku}" aria-label="View ${esc(p.name)}"><img src="${window.FI_IMG[p.img]}" alt="${esc(p.name)} with its botanical ingredients" width="900" height="1125" loading="lazy"></button><h3>${esc(p.name)}</h3><div class="bag-recommendation-bottom"><span>${FI.price(p.price)}</span><button type="button" class="page-text-link" data-add-to-bag="${sku}" aria-label="Add ${esc(p.name)} to your bag">Add to bag <span aria-hidden="true">&nearr;</span></button></div></article>`;
  }).join('');

  function renderProfile(){
    const entry=document.getElementById('account-entry');
    if(!entry)return;
    entry.hidden=!!profile;document.getElementById('account-dashboard').hidden=!profile;
    if(profile){
      const name=profile.name.trim().split(/\s+/)[0]||profile.email.split('@')[0];
      document.getElementById('account-greeting').textContent='Welcome, '+name+'.';
      document.getElementById('profile-name').value=profile.name;
      document.getElementById('profile-email').value=profile.email;
      document.getElementById('profile-message').textContent='';
      document.querySelectorAll('#profile-form [aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
    }
    if(window.FIApp)Object.assign(window.FIApp.state.customer,{preview:!!profile,email:profile?.email||'',name:profile?.name||''});
    header();
  }
  function setMode(next,focus=false){
    mode=next;
    document.querySelectorAll('[data-account-mode]').forEach(tab=>{
      const selected=tab.dataset.accountMode===mode;
      tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
      if(selected && focus)tab.focus();
    });
    const name=document.getElementById('account-name');
    document.getElementById('account-name-field').hidden=mode!=='create';name.disabled=mode!=='create';name.required=mode==='create';
    document.getElementById('account-form-panel').setAttribute('aria-labelledby',mode==='create'?'account-create-tab':'account-signin-tab');
    document.getElementById('account-form-title').textContent=mode==='create'?'Make yourself at home.':'Welcome back.';
    document.getElementById('account-form-copy').textContent=mode==='create'?'Start your Flower Ink preview profile with a name and email.':'Start with your email and explore your Flower Ink space.';
    document.getElementById('account-message').textContent='';
    document.querySelectorAll('#account-form [aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
  }
  document.querySelectorAll('[data-account-mode]').forEach(tab=>{
    tab.addEventListener('click',()=>setMode(tab.dataset.accountMode));
    tab.addEventListener('keydown',event=>{
      if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
        event.preventDefault();setMode(event.key==='Home'?'signin':event.key==='End'?'create':mode==='signin'?'create':'signin',true);
      }
    });
  });
  function validate(form,messageId){
    for(const input of form.querySelectorAll('input:not(:disabled)')){
      input.value=input.value.trim();input.removeAttribute('aria-invalid');
      if(!input.checkValidity()){
        input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',messageId);input.focus();
        document.getElementById(messageId).textContent=input.type==='email'?'Please enter a valid email address.':'Please enter your name.';
        return false;
      }
    }
    return true;
  }
  document.getElementById('account-form')?.addEventListener('submit',event=>{
    event.preventDefault();if(!validate(event.currentTarget,'account-message'))return;
    const email=document.getElementById('account-email').value.toLowerCase();
    profile={email,name:mode==='create'?document.getElementById('account-name').value:''};
    if(!write(PROFILE_KEY,profile)){
      document.getElementById('account-message').textContent='Your browser could not save this preview profile. Please allow local storage and try again.';profile=null;return;
    }
    renderProfile();document.getElementById('profile-name').focus({preventScroll:true});
  });
  document.getElementById('profile-form')?.addEventListener('submit',event=>{
    event.preventDefault();if(!validate(event.currentTarget,'profile-message'))return;
    profile={email:document.getElementById('profile-email').value.toLowerCase(),name:document.getElementById('profile-name').value};
    const saved=write(PROFILE_KEY,profile);renderProfile();
    document.getElementById('profile-message').textContent=saved?'Preview profile saved on this device.':'This preview profile could not be saved on your device.';
  });
  document.querySelector('[data-account-leave]')?.addEventListener('click',()=>{
    try{localStorage.removeItem(PROFILE_KEY);}catch{}
    profile=null;renderProfile();document.getElementById('account-form').reset();setMode('signin');document.getElementById('account-email').focus();
  });
  window.addEventListener('storage',event=>{
    if(event.key===BAG_KEY || event.key===null){lines=loadBag();header();renderBag();}
    if(event.key===PROFILE_KEY || event.key===null){profile=loadProfile();renderProfile();}
  });
  header();renderBag();renderProfile();
})();
