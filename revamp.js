/* A standard featured collection with a same-page product quick view. */
(() => {
  const grid = document.getElementById('track');
  if (!grid || !window.FI) return;
  const filters = [...document.querySelectorAll('[data-bloom-filter]')];
  let filter = 'all';
  const matches = card => {
    const step = Number(card.dataset.step);
    if (/^step-[1-6]$/.test(filter)) return step === Number(filter.slice(-1));
    if (filter === 'ritual') return ['FIVTNPC','FIJOMFC','FIRCHS','FISJDHPM'].includes(card.dataset.sku);
    if (filter === 'icons') return ['FIPBHLE','FICPBMFN','FITIRPET'].includes(card.dataset.sku);
    return filter === 'all' || (filter === 'cleanse' ? step === 1 : filter === 'hydrate' ? [2,3,5].includes(step) : [4,6].includes(step));
  };
  function render() {
    const cards = [...grid.querySelectorAll('.shop-product-card')];
    const matching = cards.filter(matches);
    cards.forEach(card => { card.hidden = !matching.includes(card); });
    const count = matching.length + (matching.length === 1 ? ' formula' : ' formulas');
    document.getElementById('collection-count').textContent = count;
    document.getElementById('live').textContent = count + ' shown.';
    grid.dispatchEvent(new CustomEvent('collection:updated'));
  }
  filters.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.bloomFilter;
    filters.forEach(other => other.setAttribute('aria-pressed', String(other.dataset.bloomFilter === filter)));
    render();
    if(button.hasAttribute('data-scroll-to-formulas'))grid.closest('section').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }));
  new MutationObserver(render).observe(grid,{childList:true});
  render();
})();
