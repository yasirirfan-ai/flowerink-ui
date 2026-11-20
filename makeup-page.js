/* Collection preview and device-local makeup preferences. */
(() => {
  const tabs=[...document.querySelectorAll('[data-makeup-tab]')];
  if(!tabs.length)return;
  function activate(tab,focus=false){
    tabs.forEach(item=>{
      const selected=item===tab;
      item.setAttribute('aria-selected',String(selected));
      item.tabIndex=selected?0:-1;
      document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;
    });
    if(focus)tab.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(tab));
    tab.addEventListener('keydown',event=>{
      let next;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;
      if(event.key==='Home')next=0;
      if(event.key==='End')next=tabs.length-1;
      if(next!==undefined){event.preventDefault();activate(tabs[next],true);}
    });
  });
  const form=document.getElementById('makeup-interest-form');
  const email=document.getElementById('mk-email');
  const status=document.getElementById('mk-form-status');
  const key='flowerink-makeup-interest-v1';
  const products=['Lipstick','Foundation','Primer'];
  const tones=['','Cool','Neutral','Warm','Olive','Not sure yet'];
  try{
    const saved=JSON.parse(localStorage.getItem(key)||'null');
    if(saved && typeof saved.email==='string'){
      email.value=saved.email.slice(0,254);
      form.querySelectorAll('[name="interest"]').forEach(input=>{input.checked=Array.isArray(saved.items)&&saved.items.includes(input.value);});
      if(tones.includes(saved.undertone))form.elements.undertone.value=saved.undertone;
    }
  }catch{}
  document.querySelectorAll('[data-makeup-interest]').forEach(link=>link.addEventListener('click',()=>{
    const input=[...form.querySelectorAll('[name="interest"]')].find(item=>item.value===link.dataset.makeupInterest);
    if(input)input.checked=true;
    email.focus({preventScroll:true});
  }));
  form.addEventListener('input',()=>{status.textContent='';email.removeAttribute('aria-invalid');});
  form.addEventListener('submit',event=>{
    event.preventDefault();
    email.value=email.value.trim();
    if(!email.checkValidity()){
      email.setAttribute('aria-invalid','true');status.textContent='Please enter a valid email address.';email.focus();return;
    }
    const items=[...form.querySelectorAll('[name="interest"]:checked')].map(input=>input.value).filter(item=>products.includes(item));
    const undertone=tones.includes(form.elements.undertone.value)?form.elements.undertone.value:'';
    try{
      localStorage.setItem(key,JSON.stringify({email:email.value,items,undertone}));
      status.textContent='Your makeup preferences are saved on this device. You can update them any time.';
    }catch{
      status.textContent='Your browser could not save these preferences. Please allow local storage and try again.';
    }
  });
})();
