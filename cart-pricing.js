/* One set of prototype totals shared by the bag and checkout. */
(() => {
  if(!window.FlowerInkBag||!window.FI)return;
  const PREFERENCE_KEY='flowerink-bag-preferences-v1';
  const FREE_SHIPPING=6500,STANDARD=695,EXPRESS=1800;
  const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2,maximumFractionDigits:2});
  const normalize=value=>({code:value?.code==='WELCOME10'?'WELCOME10':'',gift:value?.gift===true,message:typeof value?.message==='string'?value.message.slice(0,240):''});
  function readPreferences(){try{return normalize(JSON.parse(localStorage.getItem(PREFERENCE_KEY)||'null'));}catch{return normalize(null);}}
  function savePreferences(value){try{localStorage.setItem(PREFERENCE_KEY,JSON.stringify(normalize(value)));return true;}catch{return false;}}
  const format=cents=>cents%100?money.format(cents/100):window.FI.price(cents);
  function totals(delivery='standard',preferences=readPreferences()){
    const subtotal=window.FlowerInkBag.subtotal(),count=window.FlowerInkBag.count();
    const discount=preferences.code==='WELCOME10'?Math.round(subtotal*.1):0;
    const merchandise=subtotal-discount;
    const shipping=!count?0:delivery==='express'?EXPRESS:merchandise>=FREE_SHIPPING?0:STANDARD;
    return {subtotal,count,discount,merchandise,shipping,total:merchandise+shipping,remainingToFree:Math.max(0,FREE_SHIPPING-merchandise),freeShippingThreshold:FREE_SHIPPING};
  }
  window.FlowerInkCart={PREFERENCE_KEY,readPreferences,savePreferences,format,totals};
})();
