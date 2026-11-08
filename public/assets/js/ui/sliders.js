/* sliders.js — sliders customizados (explode/zoom do 3D).
   Exporta mcuSliders porque board.js lê daqui. */
export const mcuSliders = { explode: null, zoom: null };

export function initSliders(){
  mcuSliders.explode = makeSlider(document.getElementById('slExplode'));
  mcuSliders.zoom    = makeSlider(document.getElementById('slZoom'));
}

function makeSlider(root){
  const body  = root.querySelector('.sl-body'),
        fill  = root.querySelector('.sl-fill'),
        thumb = root.querySelector('.sl-thumb');
  let v = 0, cb = null, drag = false;

  const draw = () => {
    const p = (v * 100).toFixed(1) + '%';
    fill.style.width = p; thumb.style.left = p;
    body.setAttribute('aria-valuenow', Math.round(v * 100));
  };
  const api = {
    get: () => v, isDrag: () => drag,
    set(x){ v = Math.max(0, Math.min(1, x)); draw(); },
    onChange(f){ cb = f; },
  };
  const fromX = x => {
    const r = body.getBoundingClientRect();
    api.set((x - r.left) / r.width);
    cb && cb(v);
  };
  body.addEventListener('pointerdown', e => { drag = true; body.setPointerCapture(e.pointerId); fromX(e.clientX); });
  body.addEventListener('pointermove', e => { if (drag) fromX(e.clientX); });
  body.addEventListener('pointerup',   () => drag = false);
  body.addEventListener('pointercancel', () => drag = false);
  body.addEventListener('keydown', e => {
    let d = 0;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') d = .05;
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowDown') d = -.05;
    if (d){ e.preventDefault(); api.set(v + d); cb && cb(v); }
  });
  draw();
  return api;
}