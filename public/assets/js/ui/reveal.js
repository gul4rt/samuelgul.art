/* reveal.js — animações de entrada por scroll (reveals, medidores) */
import { scramble } from './scramble.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $$ = s => [...document.querySelectorAll(s)];

export function initReveal(){
  const sel = '.rv-f,.rv-l,.sec-head,.h2,.frow';
  if (RM){
    $$(sel).forEach(el => el.classList.add('in'));
    $$('.frow').forEach(animMeter);
    return;
  }
  const io = new IntersectionObserver(es => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      io.unobserve(el);
      if (el.hasAttribute('data-scramble')) scramble(el, el.dataset.final, 620);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  $$(sel).forEach(el => {
    if (el.hasAttribute('data-scramble')) el.dataset.final = el.textContent.trim();
    io.observe(el);
  });
}