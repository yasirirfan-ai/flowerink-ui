/* Local bag presentation: prototype shipping, first-order offer and gift preferences. */
(() => {
  const bag=window.FlowerInkBag,FI=window.FI,pricing=window.FlowerInkCart;
  if(!bag||!pricing||!document.getElementById('bag-ritual-steps'))return;
  const KEY=pricing.PREFERENCE_KEY,format=pricing.format;
  const giftToggle=document.getElementById('bag-gift-toggle');
  const giftMessage=document.getElementById('bag-gift-message');
  const codeMessage=document.getElementById('bag-code-message');
  const codeInput=document.getElementById('bag-code-input');
  const load=pricing.readPreferences;
  let preferences=load();
  const persist=()=>pricing.savePreferences(preferences);
  function renderGift(){
    giftToggle.checked=preferences.gift;
    giftMessage.value=preferences.message;
    document.getElementById('bag-gift-note').hidden=!preferences.gift;
    document.getElementById('bag-gift-counter').textContent=preferences.message.length+' / 240';
  }
  function render(){
    const lines=bag.getLines(),{count,discount,shipping,total,remainingToFree,merchandise,freeShippingThreshold}=pricing.totals('standard',preferences);
    document.getElementById('bag-heading-count').textContent=count?lines.length+' '+(lines.length===1?'formula':'formulas')+' · '+count+' '+(count===1?'item':'items'):'Your next little bloom.';
    document.getElementById('bag-shipping-message').textContent=remainingToFree===0?'Standard shipping is complimentary.':format(remainingToFree)+' away from complimentary standard shipping.';
    document.getElementById('bag-shipping-progress').value=Math.min(merchandise,freeShippingThreshold);
    document.getElementById('bag-shipping-cost').textContent=shipping?format(shipping):'Complimentary';
    document.getElementById('bag-discount-row').hidden=!preferences.code||!count;
    document.getElementById('bag-discount').textContent='−'+format(discount);
    document.getElementById('bag-total').textContent=format(total);
    const steps=new Set(lines.map(line=>FI.bySku(line.sku).step));
    document.getElementById('bag-ritual-count').textContent=steps.size+' of 6 steps';
    document.getElementById('bag-ritual-steps').innerHTML=Array.from({length:6},(_,index)=>{
      const step=index+1,owned=steps.has(step);
      return `<li class="${owned?'is-in-bag':''}"><span class="bag-step-marker" aria-hidden="true">${owned?'✓':step}</span><span class="bag-step-name">${FI.stepName(step)}</span><span class="bag-step-state">${owned?'In your bag':'Not in bag'}</span></li>`;
    }).join('');
  }
  document.getElementById('bag-code-form').addEventListener('submit',event=>{
    event.preventDefault();
    const code=codeInput.value.trim().toUpperCase();
    if(code!=='WELCOME10'){
      codeInput.setAttribute('aria-invalid','true');
      codeMessage.textContent=code?'That code is not available in this preview.':'Please enter an offer code.';
      codeInput.focus();return;
    }
    const previous=preferences.code;preferences.code=code;
    if(!persist()){preferences.code=previous;codeMessage.textContent='Your browser could not save this offer. Please try again.';return;}
    codeInput.removeAttribute('aria-invalid');codeInput.value=code;
    codeMessage.textContent='10% first-order offer applied in this preview.';
    render();
  });
  codeInput.addEventListener('input',()=>{codeInput.removeAttribute('aria-invalid');codeMessage.textContent='';});
  document.getElementById('bag-remove-code').addEventListener('click',()=>{
    preferences.code='';const saved=persist();codeInput.value='';codeInput.removeAttribute('aria-invalid');
    codeMessage.textContent=saved?'Offer removed.':'Offer removed for this visit; your browser could not save the change.';render();
  });
  giftToggle.addEventListener('change',()=>{
    preferences.gift=giftToggle.checked;
    const saved=persist();renderGift();
    document.getElementById('bag-gift-status').textContent=saved?'Gift preference saved.':'Your browser could not save the gift preference.';
    if(preferences.gift)giftMessage.focus({preventScroll:true});
  });
  giftMessage.addEventListener('input',()=>{
    preferences.message=giftMessage.value.slice(0,240);
    document.getElementById('bag-gift-counter').textContent=preferences.message.length+' / 240';
    const saved=persist();
    document.getElementById('bag-gift-status').textContent=saved?'':'Your browser could not save this gift note.';
  });
  document.addEventListener('flowerink:bag-updated',render);
  window.addEventListener('storage',event=>{
    if(event.key===KEY||event.key===null){preferences=load();renderGift();codeInput.value=preferences.code;codeMessage.textContent='';}
    if(event.key==='flowerink-bag-v1'||event.key===KEY||event.key===null)render();
  });
  codeInput.value=preferences.code;renderGift();render();
})();
