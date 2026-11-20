/* Client presentation checkout. No payment details, charges, emails or real orders. */
(() => {
  const bag=window.FlowerInkBag,cart=window.FlowerInkCart,FI=window.FI;
  const form=document.getElementById('checkout-form');
  if(!form||!bag||!cart)return;
  const DRAFT='flowerink-checkout-draft-v1',PREVIEW='flowerink-checkout-preview-v1';
  const fields=['email','firstName','lastName','country','address','apartment','city','state','postal','phone'];
  const dialog=document.getElementById('checkout-review');
  const message=document.getElementById('checkout-form-message');
  const saveDetails=document.getElementById('co-save-details');
  const codeInput=document.getElementById('co-code-input');
  const codeMessage=document.getElementById('co-code-message');
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const delivery=()=>form.querySelector('[name=delivery]:checked')?.value==='express'?'express':'standard';
  const readData=()=>Object.fromEntries(fields.map(name=>[name,form.elements.namedItem(name).value.trim()]));
  const signature=()=>JSON.stringify({lines:bag.getLines(),preferences:cart.readPreferences(),delivery:delivery()});
  let reviewed=null,completed=false;
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}}
  function restore(){
    const draft=read(DRAFT);
    if(draft&&typeof draft==='object'){
      fields.forEach(name=>{
        const input=form.elements.namedItem(name),value=draft[name];
        if(typeof value==='string')input.value=value.slice(0,input.maxLength>0?input.maxLength:254);
      });
      form.elements.country.value='US';
      form.querySelectorAll('[name=delivery]').forEach(input=>{input.checked=input.value===(draft.delivery==='express'?'express':'standard');});
      saveDetails.checked=true;
    }else{
      const profile=read('flowerink-preview-account-v1');
      if(profile&&typeof profile.email==='string')form.elements.email.value=profile.email.slice(0,254);
      if(profile&&typeof profile.name==='string'){
        const names=profile.name.trim().split(/\s+/);
        form.elements.firstName.value=(names.shift()||'').slice(0,60);form.elements.lastName.value=names.join(' ').slice(0,60);
      }
    }
  }
  function saveDraft(){
    try{
      if(saveDetails.checked)localStorage.setItem(DRAFT,JSON.stringify({...readData(),delivery:delivery()}));
      else localStorage.removeItem(DRAFT);
      return true;
    }catch{message.textContent='Your browser could not update the saved details. You can still review this checkout.';return false;}
  }
  function setStep(review){
    document.getElementById('checkout-details-step').toggleAttribute('aria-current',!review);
    document.getElementById('checkout-review-step').toggleAttribute('aria-current',review);
    const current=document.getElementById(review?'checkout-review-step':'checkout-details-step');current.setAttribute('aria-current','step');
  }
  function render(){
    const preferences=cart.readPreferences(),totals=cart.totals(delivery(),preferences),lines=bag.getLines();
    document.getElementById('checkout-empty').hidden=totals.count>0;
    document.getElementById('checkout-layout').hidden=!totals.count||completed;
    if(!totals.count){completed=false;reviewed=null;document.getElementById('checkout-success').hidden=true;if(dialog.open)dialog.close();}
    document.getElementById('co-items').innerHTML=lines.map(line=>{
      const product=FI.bySku(line.sku);
      return `<article class="co-item"><div class="co-item-photo"><img src="${window.FI_IMG[product.img]}" alt="${esc(product.name)}" width="72" height="90"><span aria-label="Quantity ${line.quantity}">${line.quantity}</span></div><div><h3>${esc(product.name)}</h3><p>${product.ml} ml · ${FI.stepName(product.step)}</p></div><span class="co-item-price">${cart.format(product.price*line.quantity)}</span></article>`;
    }).join('');
    document.getElementById('co-item-count').textContent=totals.count+' '+(totals.count===1?'item':'items');
    ['co-summary-total','co-total','co-submit-total'].forEach(id=>{document.getElementById(id).textContent=cart.format(totals.total);});
    document.getElementById('co-subtotal').textContent=cart.format(totals.subtotal);
    document.getElementById('co-discount-row').hidden=!preferences.code||!totals.count;
    document.getElementById('co-discount-value').textContent='−'+cart.format(totals.discount);
    document.getElementById('co-delivery-total').textContent=totals.shipping?cart.format(totals.shipping):'Complimentary';
    const standard=cart.totals('standard',preferences);
    document.getElementById('co-standard-rate').textContent=standard.shipping?cart.format(standard.shipping):'Complimentary';
    document.getElementById('co-gift').hidden=!preferences.gift;
    document.getElementById('co-gift-message').textContent=preferences.message||'This bag is a gift.';
    codeInput.value=preferences.code;
  }
  function validate(){
    let first=null;
    form.querySelectorAll('[aria-invalid]').forEach(input=>input.removeAttribute('aria-invalid'));
    fields.forEach(name=>{
      const input=form.elements.namedItem(name);input.value=input.value.trim();
      if(!input.checkValidity()||(input.maxLength>0&&input.value.length>input.maxLength)){
        input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby','checkout-form-message');if(!first)first=input;
      }
    });
    if(first){
      const label=first.labels?.[0]?.textContent.replace(/\s*\(optional\)/,'').trim().toLowerCase()||'details';
      message.textContent=first.name==='postal'?'Enter a valid 5-digit ZIP code or ZIP+4.':first.name==='email'?'Enter a valid email address.':'Please check your '+label+'.';
      first.focus();return false;
    }
    message.textContent='';return true;
  }
  form.addEventListener('input',event=>{
    event.target.removeAttribute('aria-invalid');message.textContent='';
    if(saveDetails.checked)saveDraft();
  });
  form.addEventListener('change',event=>{
    if(event.target.name==='delivery')render();
    if(event.target===saveDetails||saveDetails.checked)saveDraft();
  });
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!bag.count()){render();return;}
    if(!validate())return;
    saveDraft();
    const data=readData(),preferences=cart.readPreferences(),totals=cart.totals(delivery(),preferences);
    reviewed={createdAt:new Date().toISOString(),currency:'USD',details:data,delivery:delivery(),gift:{on:preferences.gift,message:preferences.message},code:preferences.code,totals,lines:bag.getLines(),signature:signature()};
    const address=[data.address,data.apartment,data.city+', '+data.state+' '+data.postal,'United States'].filter(Boolean).map(esc).join('<br>');
    document.getElementById('checkout-review-content').innerHTML=`<div class="co-review-details"><section><h3>Your contact</h3><p>${esc(data.firstName+' '+data.lastName)}<br>${esc(data.email)}</p></section><section><h3>Shipping address</h3><p>${address}</p></section><section><h3>Delivery</h3><p>${delivery()==='express'?'Express delivery · preview option':'Standard delivery'}<br>${totals.shipping?cart.format(totals.shipping):'Complimentary'}</p></section>${preferences.gift?`<section><h3>Your gift note</h3><p>${esc(preferences.message||'This bag is a gift.')}</p></section>`:''}</div><div class="co-review-total"><span>Estimated total <small>before taxes</small></span><strong>${cart.format(totals.total)}</strong></div>`;
    document.getElementById('checkout-review-message').textContent='';setStep(true);dialog.showModal();
  });
  dialog.querySelectorAll('[data-close-review]').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  dialog.addEventListener('close',()=>setStep(false));
  document.getElementById('checkout-save-preview').addEventListener('click',()=>{
    if(!reviewed)return;
    if(reviewed.signature!==signature()||!bag.count()){
      reviewed=null;dialog.close();render();message.textContent='Your bag changed. Please review the updated checkout.';return;
    }
    try{
      const {signature:unused,...saved}=reviewed;
      localStorage.setItem(PREVIEW,JSON.stringify(saved));
    }catch{document.getElementById('checkout-review-message').textContent='Your browser could not save this preview. Please allow local storage and try again.';return;}
    completed=true;
    document.getElementById('checkout-success-description').textContent=reviewed.totals.count+' '+(reviewed.totals.count===1?'item':'items')+' · '+cart.format(reviewed.totals.total)+' estimated total before taxes.';
    reviewed=null;dialog.close();render();document.getElementById('checkout-success').hidden=false;
    document.getElementById('checkout-success-title').focus();
  });
  document.getElementById('checkout-edit').addEventListener('click',()=>{
    completed=false;document.getElementById('checkout-success').hidden=true;render();form.elements.email.focus();
  });
  document.getElementById('co-code-form').addEventListener('submit',event=>{
    event.preventDefault();const code=codeInput.value.trim().toUpperCase();
    if(code!=='WELCOME10'){codeInput.setAttribute('aria-invalid','true');codeMessage.textContent=code?'That code is not available in this preview.':'Enter an offer code.';codeInput.focus();return;}
    const preferences=cart.readPreferences();preferences.code=code;
    if(!cart.savePreferences(preferences)){codeMessage.textContent='Your browser could not save this code. Please try again.';return;}
    codeInput.removeAttribute('aria-invalid');codeMessage.textContent='10% first-order offer applied in this preview.';render();
  });
  codeInput.addEventListener('input',()=>{codeInput.removeAttribute('aria-invalid');codeMessage.textContent='';});
  document.getElementById('co-remove-code').addEventListener('click',()=>{
    const preferences=cart.readPreferences();preferences.code='';
    if(!cart.savePreferences(preferences)){codeMessage.textContent='Your browser could not remove this offer. Please try again.';return;}
    codeInput.removeAttribute('aria-invalid');codeMessage.textContent='Offer removed.';render();
  });
  function bagChanged(){
    if(dialog.open){reviewed=null;dialog.close();message.textContent='Your bag changed. Please review the updated total.';}
    render();
  }
  document.addEventListener('flowerink:bag-updated',bagChanged);
  window.addEventListener('storage',event=>{if(['flowerink-bag-v1',cart.PREFERENCE_KEY,null].includes(event.key))bagChanged();});
  const mobile=matchMedia('(max-width:980px)');
  const summary=document.getElementById('co-order-summary');
  const adaptSummary=()=>{summary.open=!mobile.matches;};mobile.addEventListener('change',adaptSummary);
  restore();render();adaptSummary();
})();
