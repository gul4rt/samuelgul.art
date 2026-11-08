/* loop.js — o ÚNICO requestAnimationFrame da página.
   Módulos registram seus ticks aqui e recebem { y, vel, progress }. */
export const ticks = [];

export function startLoop(){
  let lastY = scrollY, vel = 0;
  requestAnimationFrame(function frame(){
    requestAnimationFrame(frame);
    const y = scrollY;
    vel = vel * 0.9 + (y - lastY) * 0.1;
    lastY = y;
    const max = document.documentElement.scrollHeight - innerHeight;
    const state = { y, vel, progress: max > 0 ? y / max : 0 };
    for (const f of ticks) f(state);
  });
}