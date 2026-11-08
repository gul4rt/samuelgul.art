/* cursor.js — retículo + anel elástico com labels contextuais (só ponteiro fino) */
import { ticks } from '../loop.js';

export function initCursor(){
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  document.documentElement.classList.add('cursor-fx');
  const dot  = document.getElementById('curDot'),
        ring = document.getElementById('curRing'),
        lab  = document.getElementById('curLab');
  let mx = innerWidth/2, my = innerHeight/2, rx = mx, ry = my, hoverEl = null;

  addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px)`;
    dot.classList.add('on'); ring.classList.add('on');
  });
  addEventListener('mousedown', () => ring.classList.add('down'));
  addEventListener('mouseup',   () => ring.classList.remove('down'));
  document.addEventListener('mouseleave', () => ring.classList.remove('on'));
  document.addEventListener('mouseover', e => {
    hoverEl = e.target.closest('[data-cursor],a,button,.sl-body');
  });

  ticks.push(() => {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    ring.classList.toggle('hov', !!hoverEl);
    const t = hoverEl ? (hoverEl.dataset.cursor || '') : '';
    lab.textContent = t;
    lab.style.opacity = t ? 1 : 0;
  });
}