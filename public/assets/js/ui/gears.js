/* gears.js — engrenagens em line-art (giram mais rápido conforme o scroll) */
import { ticks } from '../loop.js';

function gearSVG(teeth, R, stroke, sw = 1.5){
  const ri = R * 0.8, hub = R * 0.22, rim = R * 0.6;
  const s = 2 * Math.PI / teeth;
  let d = '';
  for (let i = 0; i < teeth; i++){
    const a = i * s;
    [[ri,a],[R,a+s*0.14],[R,a+s*0.40],[ri,a+s*0.54]].forEach(([r,ang], j) => {
      const x = (r*Math.cos(ang)).toFixed(2), y = (r*Math.sin(ang)).toFixed(2);
      d += (i===0 && j===0 ? 'M' : 'L') + x + ' ' + y;
    });
  }
  d += 'Z';
  let sp = '';
  for (let i = 0; i < 5; i++){
    const a = i * 2 * Math.PI / 5 + 0.35;
    sp += `<line x1="${(hub*Math.cos(a)).toFixed(1)}" y1="${(hub*Math.sin(a)).toFixed(1)}" x2="${(rim*Math.cos(a)).toFixed(1)}" y2="${(rim*Math.sin(a)).toFixed(1)}"/>`;
  }
  const vb = R + sw * 2 + 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-vb} ${-vb} ${2*vb} ${2*vb}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"><path d="${d}"/><circle r="${rim}"/><circle r="${hub}"/><circle r="${(hub*0.35).toFixed(1)}"/>${sp}</svg>`;
}

export function initGears(){
  document.getElementById('gearHero').innerHTML = gearSVG(18, 200, 'rgba(122,26,20,.45)', 1.3);
  document.querySelector('.fg1').innerHTML = gearSVG(14, 54, 'rgba(255,176,58,.55)');
  document.querySelector('.fg2').innerHTML = gearSVG(9,  35, 'rgba(255,176,58,.45)');
  const rotators = [
    { el: document.getElementById('gearHero'),   a: 0, s: 0.020,  b:  0.10 },
    { el: document.querySelector('.fg1'),        a: 0, s: 0.080,  b:  0.30 },
    { el: document.querySelector('.fg2'),        a: 0, s: -0.124, b: -0.46 },
  ];
  ticks.push(({ vel }) => {
    for (const g of rotators){
      g.a += g.s + Math.min(Math.abs(vel) * 0.02, 1.4) * g.b;
      g.el.style.transform = `rotate(${g.a.toFixed(2)}deg)`;
    }
  });
}