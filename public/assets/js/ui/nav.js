/* nav.js — menu, rail lateral e ações de contato (consome data/site.js) */
import { toast } from './toast.js';
import { scramble } from './scramble.js';
import { site } from '../data/site.js';
import { ticks } from '../loop.js';

const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* seções mapeadas no rail (ordem = ordem da página) */
const SECS = [
  ['about','01 · ABOUT'], ['track','02 · TRACK RECORD'], ['hobbies','03 · OFF-SCREEN'],
  ['focus','04 · FOCUS AREAS'], ['contact','05 · CONTACT'],
];

export function initNav(){
  /* contato: fonte única em data/site.js (sem e-mail — só sociais) */

  /* sociais do rodapé: alvo em nova aba, URLs vindas de data/site.js */
  const ext = { rel: 'noopener noreferrer', target: '_blank' };
  Object.assign($('#ghLink'), { href: site.github }, ext);
  Object.assign($('#liLink'), { href: site.linkedin }, ext);

  /* menu */
  $('#navAbout').addEventListener('click', e => {
    e.preventDefault();
    $('#about').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  });
  /* contato: rola direto pro fim da página (SEC.05) */
  $('#navContact').addEventListener('click', e => {
    e.preventDefault();
    $('#contact').scrollIntoView({ behavior: RM ? 'auto' : 'smooth' });
  });
  /* publications agora é link pra posts/index.html (nada a fazer aqui) */
  $$('.soc[data-msg]').forEach(b => b.addEventListener('click', () => toast(b.dataset.msg)));
  $('#logoLink').addEventListener('click', e => {
    e.preventDefault();
    scrollTo({ top: 0, behavior: RM ? 'auto' : 'smooth' });
  });

  /* scramble em hover (logo) */
  const span = $('#logoLink').childNodes[0];
  const fake = { // adapta o nó de texto do logo à API do scramble
    set textContent(v){ span.textContent = v; },
    get textContent(){ return span.textContent; },
    set innerHTML(v){ span.textContent = v.replace(/<[^>]+>/g, ''); },
  };
  $('#logoLink').addEventListener('mouseenter', () => scramble(fake, site.handle, 420));

  /* rail lateral */
  const railTrack = $('#railTrack'), railFill = $('#railFill'), railPct = $('#railPct');
  const dotEls = SECS.map(([id, label], i) => {
    const b = document.createElement('button');
    b.className = 'rail-dot'; b.dataset.cursor = 'GO';
    b.setAttribute('aria-label', label);
    b.style.top = `calc(${(i / (SECS.length - 1)) * 100}% - 4px)`;
    b.innerHTML = `<span class="rl">${label}</span>`;
    b.addEventListener('click', () => document.getElementById(id)
      .scrollIntoView({ behavior: RM ? 'auto' : 'smooth' }));
    railTrack.appendChild(b);
    return b;
  });
  const secIO = new IntersectionObserver(es => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      const i = SECS.findIndex(([id]) => id === en.target.id);
      if (i > -1) dotEls.forEach((d, j) => d.classList.toggle('on', j === i));
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
  SECS.forEach(([id]) => secIO.observe(document.getElementById(id)));

  /* tick: progresso do rail + estado do header */
  const headerEl = $('#siteHeader');
  ticks.push(({ y, progress }) => {
    railFill.style.height = (progress * 100).toFixed(1) + '%';
    railPct.textContent = String(Math.round(progress * 100)).padStart(3, '0') + '%';
    headerEl.classList.toggle('scrolled', y > 40);
    document.body.classList.toggle('scrolled', y > 90);
  });
}