/* A standard featured collection with a same-page product quick view. */
(() => {
  const grid = document.getElementById('track');
  if (!grid || !window.FI) return;
  const FI = window.FI;
  const filters = [...document.querySelectorAll('[data-bloom-filter]')];
  const dialog = document.getElementById('formula-quickview');
  let filter = 'all';
  const matches = card => {
    const step = Number(card.dataset.step);
    return filter === 'all' || (filter === 'cleanse' ? step === 1 : filter === 'hydrate' ? [2,3,5].includes(step) : [4,6].includes(step));
  };
  function render() {
    const cards = [...grid.querySelectorAll('.shop-product-card')];
    const matching = cards.filter(matches);
    cards.forEach(card => { card.hidden = !matching.includes(card); });
    document.getElementById('collection-count').textContent = matching.length + ' formulas';
    document.getElementById('live').textContent = matching.length + ' formulas shown.';
    grid.dispatchEvent(new CustomEvent('collection:updated'));
  }
  filters.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.bloomFilter;
    filters.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    render();
  }));
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-quick-view]');
    if (!button) return;
    const product = FI.bySku(button.dataset.quickView);
    if (!product) return;
    const image = document.getElementById('quickview-image');
    image.src = (window.FI_IMG && window.FI_IMG[product.img]) || 'img/' + product.img + '.jpg';
    image.alt = product.name;
    const values = {step:FI.stepName(product.step),title:product.name,price:FI.priced(product)?FI.price(product.price):'Coming soon',description:product.blurb,active:product.active,size:product.ml+' ml',when:product.when==='pm'?'Evening':product.when==='am'?'Morning':'Morning & evening'};
    Object.entries(values).forEach(([key,value]) => { document.getElementById('quickview-'+key).textContent=value; });
    dialog.showModal();
  });
  new MutationObserver(render).observe(grid,{childList:true});
  render();
})();
