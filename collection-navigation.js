/* Three-second autoplay and manual product navigation, shared with Shopify. */
(() => {
  if (window.FlowerInkCollectionNavigation) {
    window.FlowerInkCollectionNavigation.initialize(document);
    return;
  }
  const cleanups = new WeakMap();
  const selector = '[data-collection-carousel]';
  function initialize(scope) {
    const roots = [...(scope.matches?.(selector) ? [scope] : []), ...scope.querySelectorAll(selector)];
    roots.forEach(root => {
      if (cleanups.has(root)) return;
      const grid = root.querySelector('.shop-product-grid');
      const previous = root.querySelector('[data-collection-direction="-1"]');
      const next = root.querySelector('[data-collection-direction="1"]');
      if (!grid || !previous || !next) return;
      const controller = new AbortController();
      const signal = controller.signal;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      let timer = 0;
      let inView = false;
      let dragging = false;
      function update() {
        const position = Math.abs(grid.scrollLeft);
        const limit = Math.max(0, grid.scrollWidth - grid.clientWidth);
        previous.disabled = position <= 2;
        next.disabled = position >= limit - 2;
      }
      function shift(direction, loop = false) {
        const card = grid.querySelector('.shop-product-card:not([hidden])');
        if (!card) return;
        const limit = Math.max(0, grid.scrollWidth - grid.clientWidth);
        if (limit <= 2) return;
        const behavior = reduced.matches ? 'auto' : 'smooth';
        if (loop && Math.abs(grid.scrollLeft) >= limit - 2) {
          grid.scrollTo({left:0,behavior});
          return;
        }
        const style = getComputedStyle(grid);
        const width = card.getBoundingClientRect().width + (parseFloat(style.columnGap) || 0);
        grid.scrollBy({left:direction*width*(style.direction==='rtl'?-1:1),behavior});
      }
      function synchronize() {
        clearInterval(timer);
        if (!inView || dragging || document.hidden || reduced.matches) return;
        timer = setInterval(() => {
          if (!document.querySelector('dialog[open]')) shift(1, true);
        }, 3000);
      }
      function move(event) {
        shift(Number(event.currentTarget.dataset.collectionDirection));
        synchronize();
      }
      previous.addEventListener('click',move,{signal});
      next.addEventListener('click',move,{signal});
      grid.addEventListener('scroll',update,{passive:true,signal});
      grid.addEventListener('collection:updated',()=>{
        grid.scrollTo({left:0,behavior:'instant'});
        update();
        synchronize();
      },{signal});
      grid.addEventListener('pointerdown',()=>{dragging=true;synchronize();},{signal});
      function release() {
        if (!dragging) return;
        dragging=false;
        synchronize();
      }
      window.addEventListener('pointerup',release,{signal});
      window.addEventListener('pointercancel',release,{signal});
      document.addEventListener('visibilitychange',synchronize,{signal});
      reduced.addEventListener('change',synchronize,{signal});
      const visibility = new IntersectionObserver(entries=>{
        inView=entries[0].isIntersecting;
        synchronize();
      },{threshold:.1});
      visibility.observe(grid);
      const observer = new ResizeObserver(update);
      observer.observe(grid);
      cleanups.set(root,()=>{clearInterval(timer);controller.abort();observer.disconnect();visibility.disconnect();cleanups.delete(root);});
      update();
    });
  }
  window.FlowerInkCollectionNavigation={initialize};
  document.addEventListener('shopify:section:load',event=>initialize(event.target));
  document.addEventListener('shopify:section:unload',event=>{
    event.target.querySelectorAll(selector).forEach(root=>cleanups.get(root)?.());
  });
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>initialize(document),{once:true});
  else initialize(document);
})();
