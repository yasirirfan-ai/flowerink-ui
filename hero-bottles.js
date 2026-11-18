/* Alternate the hero products continuously every two seconds, entering from the right. */
(() => {
  const hero = document.getElementById('flower-hero');
  const link = hero?.querySelector('[data-hero-bottles]');
  if (!link) return;
  const slides = [...link.querySelectorAll('.fi-hero-bottle-slide')];

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = 0;
  let ready = false;
  let inView = true;


  function advance() {
    const previous = slides[current];
    current = (current + 1) % slides.length;
    const next = slides[current];
    previous.classList.remove('is-active');
    previous.classList.add('is-leaving');
    previous.setAttribute('aria-hidden', 'true');
    next.classList.remove('is-leaving');
    next.classList.add('is-active');
    next.setAttribute('aria-hidden', 'false');
    link.setAttribute('aria-label', next.dataset.bottleLabel);
    link.setAttribute('href', next.dataset.bottleHref);
    setTimeout(() => previous.classList.remove('is-leaving'), 600);
  }
  function synchronize() {
    clearInterval(timer);
    const stopped = !inView || document.hidden || reduced.matches;
    hero.classList.toggle('bottles-paused', stopped);
    if (ready && !stopped) timer = setInterval(advance, 2000);
  }

  document.addEventListener('visibilitychange', synchronize);
  reduced.addEventListener('change', synchronize);
  new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    synchronize();
  }, { threshold: .05 }).observe(hero);
  Promise.all(slides.map(slide => slide.querySelector('img').decode().catch(() => null))).then(() => {
    ready = slides.every(slide => slide.querySelector('img').naturalWidth > 0);
    synchronize();
  });
})();
