/* toast.js — avisos estilo terminal (e pisca o LED RX da placa 3D via evento) */
const toastsEl = document.getElementById('toasts');

export function toast(msg){
  document.dispatchEvent(new CustomEvent('mcu:rx'));
  while (toastsEl.children.length >= 3) toastsEl.firstChild.remove();
  const t = document.createElement('div');
  t.className = 'toast';
  const pre = document.createElement('span'); pre.className = 't-pre'; pre.textContent = '//';
  const txt = document.createElement('span'); txt.textContent = msg;
  t.append(pre, txt); toastsEl.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 380); }, 3000);
}