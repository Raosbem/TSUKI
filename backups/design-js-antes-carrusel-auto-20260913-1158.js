/* Manual artist carousel: no autoplay, native touch scrolling. */
(function(){
  const row = document.querySelector('#artist-stories');
  const cards = row ? Array.from(row.querySelectorAll('.tst-card')) : [];
  if (!cards.length) return;
  const previous = document.querySelector('.tst-prev');
  const next = document.querySelector('.tst-next');
  const counter = document.querySelector('.tst-position');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function active(){
    let best = 0, distance = Infinity;
    cards.forEach((card, i) => {
      const delta = Math.abs(card.offsetLeft - cards[0].offsetLeft - row.scrollLeft);
      if (delta < distance){ distance = delta; best = i; }
    });
    return best;
  }
  function update(){
    const index = active();
    counter.textContent = String(index + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    cards.forEach((card, i) => card.classList.toggle('is-current', i === index));
  }
  function go(direction){
    const index = Math.max(0, Math.min(cards.length - 1, active() + direction));
    row.scrollTo({left: cards[index].offsetLeft - cards[0].offsetLeft, behavior: reduced.matches ? 'instant' : 'smooth'});
  }
  previous.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));
  row.addEventListener('keydown', event => {
    if (event.target !== row) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft'){
      event.preventDefault(); go(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let pending = false;
  row.addEventListener('scroll', () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; update(); });
  }, {passive:true});
  window.addEventListener('resize', update);
  update();
})();
