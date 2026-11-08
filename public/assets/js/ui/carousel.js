/* carousel.js — track record (consome data/employers.js) */
import { employers } from '../data/employers.js';
import { scramble } from './scramble.js';

export function initCarousel(){
  const stage  = document.getElementById('carStage');
  const nameEl = document.getElementById('carName');
  const secEl  = document.getElementById('carSector');
  const roleEl = document.getElementById('carRole');
  const perEl  = document.getElementById('carPeriod');
  const tagEl  = document.getElementById('carTags');
  const idxEl  = document.getElementById('carIdx');
  const ticks  = [...document.querySelectorAll('#carTicks span')];
  let i = 0, busy = false;

  /* duração calculada em runtime — "PRESENT" usa sempre a data de hoje */
  function tenure(period){
    const [a, b] = period.split('—').map(s => s.trim());
    const parse = s => { const m = s.match(/^(\d{2})\/(\d{4})$/); return m ? { mo: +m[1], yr: +m[2] } : null; };
    const start = parse(a);
    const end = b === 'PRESENT'
      ? { mo: new Date().getMonth() + 1, yr: new Date().getFullYear() }
      : parse(b);
    if (!start || !end) return '';
    const mo = (end.yr - start.yr) * 12 + end.mo - start.mo;
    if (mo < 1) return ' · <b>CURRENT</b>';
    const y = Math.floor(mo / 12), m = mo % 12, parts = [];
    if (y) parts.push(y + (y > 1 ? ' YRS' : ' YR'));
    if (m) parts.push(m + (m > 1 ? ' MOS' : ' MO'));
    return ` · <b>≈ ${parts.join(' ')}</b>`;
  }

  const render = () => {
    const e = employers[i];
    nameEl.textContent = e.name;
    secEl.textContent  = `EMP-${String(i + 1).padStart(3, '0')} · ${e.sector}`;
    roleEl.textContent = e.role;
    perEl.innerHTML    = `${e.period}${tenure(e.period)}`;
    tagEl.innerHTML    = (e.stack || []).map(t => `<span>${t}</span>`).join('');
    idxEl.textContent  = `${String(i + 1).padStart(2, '0')} / ${String(employers.length).padStart(2, '0')}`;
    ticks.forEach((t, j) => t.classList.toggle('on', j === i));
  };

  const go = dir => {
    if (busy) return;
    busy = true;
    i = (i + dir + employers.length) % employers.length;
    stage.classList.add('swap');
    document.dispatchEvent(new CustomEvent('mcu:rx'));
    setTimeout(() => {
      render();
      stage.classList.remove('swap');
      scramble(nameEl, employers[i].name, 550);
      setTimeout(() => busy = false, 300);
    }, 240);
  };

  document.getElementById('carPrev').addEventListener('click', () => go(-1));
  document.getElementById('carNext').addEventListener('click', () => go(1));

  /* arrastar para trocar */
  let sx = null;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; stage.setPointerCapture(e.pointerId); });
  stage.addEventListener('pointermove', e => {
    if (sx === null) return;
    const dx = Math.max(-26, Math.min(26, (e.clientX - sx) * 0.14));
    stage.style.transform = `translateX(${dx}px)`;
  });
  const up = e => {
    if (sx === null) return;
    const dx = e.clientX - sx; sx = null;
    stage.style.transform = '';
    if (Math.abs(dx) > 55) go(dx < 0 ? 1 : -1);
  };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);

  /* primeira vez que entra em cena: decode do nome */
  new IntersectionObserver((es, o) => {
    if (es[0].isIntersecting){ scramble(nameEl, employers[i].name, 700); o.disconnect(); }
  }, { threshold: 0.18 }).observe(stage);

  render();
}