/* main.js — entry: monta a página e liga os módulos, na ordem certa */
import './board.js'; // 3D — autocontido, falha em silêncio
import { ticks, startLoop } from './loop.js';
import { initCursor }   from './ui/cursor.js';
import { initGears }    from './ui/gears.js';
import { initReveal }   from './ui/reveal.js';
import { initCarousel } from './ui/carousel.js';
import { initSliders }  from './ui/sliders.js';
import { initNav }      from './ui/nav.js';
import { scramble }     from './ui/scramble.js';
import { focusAreas }   from './data/focus.js';
import { site }         from './data/site.js';

document.documentElement.classList.add('js');
window.lucide && lucide.createIcons();
document.getElementById('footYear').textContent = new Date().getFullYear();

renderFocus();   // antes do reveal, para as linhas entrarem no observer
initNav();
initCarousel();
initSliders();
initGears();
initReveal();
initCursor();
initParallax();
initClock();
drawBarcode();
initCertTicker();
initLoadSequence();
startLoop();

/* ---------- focus areas: render a partir de data/focus.js ---------- */
function renderFocus(){
  const host = document.getElementById('focusRows');
  const tagClass = s => s === 'ACTIVE' ? 't-active' : s === 'RAMPING' ? 't-ramp' : '';
  focusAreas.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'frow rv-l';
    row.dataset.cursor = 'EDIT';
    row.style.transitionDelay = (i * 0.08) + 's';
    row.innerHTML = `
      <span class="f-idx">${String(i + 1).padStart(2, '0')}</span>
      <div class="f-main"><h3>${f.title}</h3><p>${f.desc}</p></div>
      <span class="f-tag ${tagClass(f.state)}">${f.state}</span>`;
    host.appendChild(row);
  });
}

/* ---------- parallax (camadas do hero) ---------- */
function initParallax(){
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let plx = [];
  const cache = () => {
    plx = [...document.querySelectorAll('[data-parallax]')].map(el => ({
      el, f: +el.dataset.parallax || 0.15, h: el.offsetHeight,
      doc: el.getBoundingClientRect().top + scrollY,
    }));
  };
  cache();
  let rto;
  addEventListener('resize', () => { clearTimeout(rto); rto = setTimeout(cache, 200); });
  ticks.push(({ y }) => {
    if (RM) return;
    for (const p of plx){
      const off = ((p.doc + p.h / 2) - (y + innerHeight / 2)) * -p.f;
      p.el.style.transform = `translate3d(0,${off.toFixed(1)}px,0)`;
    }
  });
}

/* ---------- relógio do hero ---------- */
function initClock(){
  const el = document.getElementById('clock');
  const tick = () => {
    const d = new Date();
    el.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(v => String(v).padStart(2, '0')).join(':');
  };
  tick(); setInterval(tick, 1000);
}

/* ---------- ticker de certificações do dossier (decode ciclando em site.certs) ---------- */
function initCertTicker(){
  const el = document.getElementById('certTicker');
  if (!el || !site.certs.length) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % site.certs.length;
    scramble(el, site.certs[i], 900);
  }, 4200);
}

/* ---------- código de barras do dossier ---------- */
function drawBarcode(){
  const svg = document.getElementById('barcode');
  let bars = '', x = 0;
  for (let i = 0; i < 44; i++){
    const w = [1, 1, 2, 3][Math.floor(Math.random() * 4)];
    bars += `<rect x="${x}" y="0" width="${w}" height="34" fill="rgba(138,138,142,.6)"/>`;
    x += w + (Math.random() > .5 ? 3 : 2);
  }
  svg.setAttribute('viewBox', `0 0 ${x} 34`);
  svg.setAttribute('width', x * 0.9);
  svg.innerHTML = bars;
}

/* ---------- sequência de entrada (load) ---------- */
function initLoadSequence(){
  let fired = false;
  const done = () => {
    if (fired) return;
    fired = true;
    document.body.classList.add('loaded');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.hl-txt').forEach((el, i) =>
      setTimeout(() => scramble(el, el.dataset.text, 850), 180 + i * 150));
  };
  if (document.readyState === 'complete') done();
  else { addEventListener('load', done); setTimeout(done, 1800); }
}