/* scramble.js — efeito decode/decodificação de texto */
const CH = '!<>-_\\/[]{}=+*^?#01';
const escC = c => c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

export function scramble(el, text, dur = 700){
  if (RM) { el.textContent = text; return; }
  if (el._scr) cancelAnimationFrame(el._scr);
  const n = text.length, t0 = performance.now();
  const start = [], end = [];
  for (let i = 0; i < n; i++){
    start[i] = Math.random() * dur * 0.35;
    end[i]   = start[i] + dur * 0.65 * (0.4 + Math.random() * 0.6);
  }
  const frame = () => {
    const now = performance.now() - t0;
    let out = '', done = true;
    for (let i = 0; i < n; i++){
      const ch = text[i];
      if (/\s/.test(ch)) { out += ch; continue; }
      if (now >= end[i]) out += '<span class="sc-ok">' + escC(ch) + '</span>';
      else { done = false; out += '<span class="sc-rnd">' + escC(CH[(Math.random()*CH.length)|0]) + '</span>'; }
    }
    el.innerHTML = out;
    if (!done) el._scr = requestAnimationFrame(frame);
    else el.textContent = text;
  };
  el._scr = requestAnimationFrame(frame);
}