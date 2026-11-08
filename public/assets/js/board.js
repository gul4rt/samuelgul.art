/* board.js — cena 3D: microcontrolador com explosion view.
   Autocontida: se o CDN do three.js cair, o resto da página segue intacto. */
import { mcuSliders } from './ui/sliders.js';

(async () => {
  const wrap    = document.getElementById('mcuWrap');
  const hudName = document.getElementById('hudName');
  const hudDesc = document.getElementById('hudDesc');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  let THREE, RoomEnvironment = null;
  try { THREE = await import('three'); }
  catch { wrap.classList.add('no3d'); return; }
  /* fix do bug da placa invisível: o import opcional acontece AQUI,
     no contexto async certo — o init() abaixo permanece síncrono */
  try { ({ RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js')); }
  catch { RoomEnvironment = null; }

  try { init(); }
  catch (e) { console.warn('3D init failed:', e); wrap.classList.add('no3d'); }

  function init(){
    /* --- renderer / cena / câmera --- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.touchAction = 'none';
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const tgt = new THREE.Vector3(0, 1.05, 0);

    if (RoomEnvironment) {
      try {
        const pm = new THREE.PMREMGenerator(renderer);
        scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
      } catch {}
    }

    scene.add(new THREE.HemisphereLight(0x38130f, 0x0b0b0c, 0.9));
    const key = new THREE.DirectionalLight(0xffd9a0, 2.3); key.position.set(6, 10, 6);  scene.add(key);
    const rim = new THREE.DirectionalLight(0xff3b30, 1.3); rim.position.set(-8, 4, -7); scene.add(rim);
    const fil = new THREE.DirectionalLight(0xff3b30, 0.4); fil.position.set(0, -5, 5);  scene.add(fil);

    const resize = () => {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    new ResizeObserver(resize).observe(wrap);
    resize();

    /* --- material padrão (emissivo de latão p/ highlight de hover) --- */
    const mat = o => new THREE.MeshStandardMaterial(Object.assign(
      { emissive: 0xffb03a, emissiveIntensity: 0, roughness: .5, metalness: .1, envMapIntensity: .55 }, o));

    /* --- placa com cantos arredondados --- */
    function roundedRect(w, h, r){
      const s = new THREE.Shape(), x = -w/2, y = -h/2;
      s.moveTo(x+r, y); s.lineTo(x+w-r, y); s.quadraticCurveTo(x+w, y, x+w, y+r);
      s.lineTo(x+w, y+h-r); s.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
      s.lineTo(x+r, y+h); s.quadraticCurveTo(x, y+h, x, y+h-r);
      s.lineTo(x, y+r); s.quadraticCurveTo(x, y, x+r, y);
      return s;
    }

    /* --- texturas procedurais em canvas --- */
    function pcbTexture(){
      const W = 1120, H = 720, PX = 200; // 200px por unidade
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      const g = c.getContext('2d');
      const X = x => (x + 2.8) * PX, Y = z => (z + 1.8) * PX;
      const rand = (a, b) => a + Math.random() * (b - a);
      g.lineCap = g.lineJoin = 'round';
      const dirs = [0,1,2,3,4,5,6,7].map(i => i * Math.PI / 4 + Math.PI);
      for (let i = 0; i < 26; i++){
        const a = rand(0, Math.PI * 2);
        let x = Math.cos(a) * rand(0.9, 1.5), z = Math.sin(a) * rand(0.5, 0.95);
        g.strokeStyle = 'rgba(255,59,48,.5)';
        g.lineWidth = rand(3, 5);
        g.beginPath(); g.moveTo(X(x), Y(z));
        const steps = 2 + (Math.random() * 3 | 0);
        for (let s = 0; s < steps; s++){
          const ang = dirs[(Math.random() * 8) | 0];
          const len = rand(0.5, 1.5);
          x = clamp(x + Math.cos(ang) * len, -2.55, 2.55);
          z = clamp(z + Math.sin(ang) * len, -1.55, 1.55);
          g.lineTo(X(x), Y(z));
        }
        g.stroke();
        g.beginPath(); g.arc(X(x), Y(z), 7, 0, 7); g.stroke();
        g.fillStyle = 'rgba(255,59,48,.75)';
        g.beginPath(); g.arc(X(x), Y(z), 2.5, 0, 7); g.fill();
      }
      for (const zz of [1.45, -1.45]) for (let i = 0; i < 10; i++){
        const xx = -1.9 + i * 0.4222;
        g.fillStyle = 'rgba(255,176,58,.85)';
        g.beginPath(); g.arc(X(xx), Y(zz), 8, 0, 7); g.fill();
        g.fillStyle = 'rgba(11,11,12,.9)';
        g.beginPath(); g.arc(X(xx), Y(zz), 3.5, 0, 7); g.fill();
      }
      for (const [hx, hz] of [[2.45,1.55],[2.45,-1.55],[-2.45,1.55],[-2.45,-1.55]]){
        g.strokeStyle = 'rgba(245,245,245,.65)'; g.lineWidth = 2.5;
        g.beginPath(); g.arc(X(hx), Y(hz), 10, 0, 7); g.stroke();
        g.strokeStyle = 'rgba(255,176,58,.55)';
        g.beginPath(); g.arc(X(hx), Y(hz), 16, 0, 7); g.stroke();
      }
      const silk = 'rgba(245,245,245,.85)';
      g.strokeStyle = silk; g.lineWidth = 2;
      if (g.roundRect){ g.beginPath(); g.roundRect(14, 14, W-28, H-28, 26); g.stroke(); }
      else g.strokeRect(14, 14, W-28, H-28);
      g.setLineDash([7, 7]);
      g.strokeRect(X(-1.05), Y(-0.5), 2.3 * PX, 1.0 * PX);
      g.setLineDash([]);
      g.fillStyle = silk;
      g.font = '500 26px "IBM Plex Mono", monospace';
      g.fillText('GUL4RT-IND   REV.A', X(-2.5), Y(1.02));
      g.fillText('SEC.BLOG // MCU DEV BOARD', X(-2.5), Y(1.28));
      g.fillText('TX', X(-1.98), Y(-0.68)); g.fillText('RX', X(-1.63), Y(-0.68));
      g.fillText('G-328P', X(-0.5), Y(-0.62));
      g.font = '500 20px "IBM Plex Mono", monospace';
      g.fillText('C1', X(1.72), Y(-0.18)); g.fillText('C2', X(2.16), Y(0.12));
      g.fillText('R4', X(-1.1), Y(1.32));  g.fillText('Y1', X(0.95), Y(1.12));
      g.fillText('J1', X(-2.6), Y(-0.45)); g.fillText('J2', X(-2.6), Y(1.2));
      g.save(); g.translate(X(1.95), Y(-1.05)); g.strokeStyle = silk; g.lineWidth = 2;
      for (let i = 0; i < 10; i++){
        g.save(); g.rotate(i * Math.PI / 5);
        g.strokeRect(-5, -44, 10, 12); g.restore();
      }
      g.beginPath(); g.arc(0, 0, 34, 0, 7); g.stroke();
      g.beginPath(); g.arc(0, 0, 9, 0, 7); g.stroke();
      g.restore();
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      return t;
    }

    function chipTexture(){
      const c = document.createElement('canvas'); c.width = 640; c.height = 240;
      const g = c.getContext('2d');
      g.fillStyle = '#131316'; g.fillRect(0, 0, 640, 240);
      g.fillStyle = '#e8e8ea'; g.textBaseline = 'middle';
      g.font = '600 46px "IBM Plex Mono", monospace';
      g.fillText('G-328P-PU', 74, 72);
      g.font = '500 30px "IBM Plex Mono", monospace';
      g.fillStyle = 'rgba(232,232,235,.7)';
      g.fillText('1634Q · 16MHz', 74, 128);
      g.fillText('GUL4RT-IND', 74, 180);
      g.fillStyle = '#55555a';
      g.beginPath(); g.arc(40, 200, 12, 0, 7); g.fill();
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    function dialTexture(){
      const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
      const g = c.getContext('2d'), cx = S / 2;
      g.fillStyle = '#0d0d0f'; g.fillRect(0, 0, S, S);
      const ring = (r, w, col) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); g.arc(cx, cx, r, 0, 7); g.stroke(); };
      ring(470, 2, 'rgba(255,107,107,.16)'); ring(300, 1.5, 'rgba(255,107,107,.2)'); ring(180, 1.5, 'rgba(255,107,107,.14)');
      for (let i = 0; i < 72; i++){
        const a = i * Math.PI / 36, maj = i % 6 === 0, br = i % 18 === 0;
        const r1 = maj ? 436 : 448;
        g.strokeStyle = br ? 'rgba(255,176,58,.8)' : maj ? 'rgba(255,107,107,.5)' : 'rgba(255,107,107,.26)';
        g.lineWidth = br ? 3 : maj ? 2 : 1;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r1, cx + Math.sin(a) * r1);
        g.lineTo(cx + Math.cos(a) * 462, cx + Math.sin(a) * 462);
        g.stroke();
      }
      g.font = '500 26px "IBM Plex Mono", monospace';
      g.fillStyle = 'rgba(138,138,142,.75)';
      g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let i = 0; i < 12; i++){
        const a = i * Math.PI / 6;
        g.fillText(String(i * 30).padStart(3, '0'), cx + Math.cos(a) * 390, cx + Math.sin(a) * 390);
      }
      g.strokeStyle = 'rgba(255,107,107,.12)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(cx, 36); g.lineTo(cx, S - 36); g.moveTo(36, cx); g.lineTo(S - 36, cx); g.stroke();
      ring(486, 4, 'rgba(255,176,58,.5)');
      g.fillStyle = 'rgba(138,138,142,.6)';
      g.font = '500 22px "IBM Plex Mono", monospace';
      g.fillText('GUL4RT · TECHNICAL DIAL · REV.A', cx, cx + 336);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      return t;
    }

    /* --- registro de partes (hover) + grupos de explosão --- */
    const rig = new THREE.Group(); scene.add(rig);
    const exps = [], hoverables = [], rayMeshes = [];
    function expGroup(dir){
      const g = new THREE.Group(); rig.add(g);
      exps.push({ g, dir });
      return g;
    }
    function part(name, desc){
      const p = { name, desc, mats: [], glow: 0 };
      hoverables.push(p);
      return p;
    }
    function reg(mesh, p){
      mesh.userData.part = p;
      rayMeshes.push(mesh);
      (Array.isArray(mesh.material) ? mesh.material : [mesh.material]).forEach(m => {
        if (!m.userData.noHL && !p.mats.includes(m)) p.mats.push(m);
      });
    }

    /* --- PCB --- */
    const shape = roundedRect(5.6, 3.6, 0.24);
    const pcbP = part('PCB · GUL4RT-IND REV.A', 'the foundation — hand-routed green sandbox');
    const gPcb = expGroup(new THREE.Vector3(0, 0, 0));
    const pcb = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.16, bevelEnabled: false }),
      mat({ color: 0x0e0e10, roughness: .55, metalness: .06 }));
    pcb.geometry.rotateX(-Math.PI / 2);
    gPcb.add(pcb); reg(pcb, pcbP);

    const silGeo = new THREE.ShapeGeometry(shape);
    { // normalizar UVs para o canvas
      const pos = silGeo.attributes.position, uv = silGeo.attributes.uv;
      for (let i = 0; i < pos.count; i++)
        uv.setXY(i, (pos.getX(i) + 2.8) / 5.6, (pos.getY(i) + 1.8) / 3.6);
    }
    silGeo.rotateX(-Math.PI / 2);
    const sil = new THREE.Mesh(silGeo, mat({ map: pcbTexture(), transparent: true, roughness: .62, metalness: 0 }));
    sil.position.y = 0.166;
    gPcb.add(sil); reg(sil, pcbP);

    /* --- MCU (DIP) --- */
    const chipP = part('MCU · G-328P', 'the brain — 8-bit microcontroller, 16 MHz of stubborn willpower');
    const gChip = expGroup(new THREE.Vector3(0, 3.15, 0));
    const chipM = mat({ color: 0x131316, roughness: .42, metalness: .15 });
    const chipTop = mat({ map: chipTexture(), roughness: .42, metalness: .1 });
    const chip = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.34, 0.86),
      [chipM, chipM, chipTop, chipM, chipM, chipM]);
    chip.position.set(0.1, 0.33, 0);
    gChip.add(chip); reg(chip, chipP);
    const legM = mat({ color: 0x8f979b, metalness: .9, roughness: .3 });
    const legG = new THREE.BoxGeometry(0.07, 0.3, 0.15);
    for (const sz of [1, -1]) for (let i = 0; i < 12; i++){
      const leg = new THREE.Mesh(legG, legM);
      leg.position.set(-1.0 + i * (2.0 / 11), 0.26, sz * 0.51);
      leg.rotation.x = sz * 0.7;
      gChip.add(leg); reg(leg, chipP);
    }

    /* --- headers de pinos --- */
    const hdrP = part('GPIO HEADERS', 'where the world plugs in — 10 pins per side');
    for (const sz of [1, -1]){
      const g = expGroup(new THREE.Vector3(0, 1.75, 0));
      const base = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.2, 0.4), mat({ color: 0x121214, roughness: .5 }));
      base.position.set(0, 0.26, sz * 1.45);
      g.add(base); reg(base, hdrP);
      const pinM = mat({ color: 0x9aa0a5, metalness: .88, roughness: .32 });
      for (let i = 0; i < 10; i++){
        const pin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.85, 0.09), pinM);
        pin.position.set(-1.9 + i * 0.4222, 0.72, sz * 1.45);
        g.add(pin); reg(pin, hdrP);
      }
    }

    /* --- componentes "tall": USB, jack, cristal, capacitores --- */
    const gTall = expGroup(new THREE.Vector3(0, 2.35, 0));
    const usbP = part('USB PORT', 'power & serial — the board\u2019s front door');
    const usb = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.8), mat({ color: 0xaeb6ba, metalness: .92, roughness: .28 }));
    usb.position.set(-2.42, 0.385, -0.75);
    gTall.add(usb); reg(usb, usbP);

    const jackP = part('POWER JACK', '9V in — the magic smoke stays inside');
    const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 20), mat({ color: 0x0d100d, roughness: .5 }));
    jack.rotation.z = Math.PI / 2; jack.position.set(-2.4, 0.4, 0.85);
    const jring = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.07, 20), mat({ color: 0x9aa0a5, metalness: .88, roughness: .32 }));
    jring.rotation.z = Math.PI / 2; jring.position.set(-2.66, 0.4, 0.85);
    gTall.add(jack, jring); reg(jack, jackP); reg(jring, jackP);

    const cryP = part('16 MHz CRYSTAL', 'the heartbeat — every loop starts here');
    const cry = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.72, 16), mat({ color: 0xaeb6ba, metalness: .92, roughness: .25 }));
    cry.rotation.z = Math.PI / 2; cry.position.set(1.1, 0.29, 0.85);
    gTall.add(cry); reg(cry, cryP);

    const capP = part('ELECTROLYTIC CAPS', 'power smoothing & decoupling — calm under load');
    const capTopM = mat({ color: 0x1a1d1a, roughness: .6 });
    for (const [cx2, cz2] of [[1.75, -0.7], [2.2, -0.3]]){
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.7, 24), mat({ color: 0x8f2019, metalness: .85, roughness: .3 }));
      cap.position.set(cx2, 0.51, cz2);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 24), capTopM);
      top.position.set(cx2, 0.885, cz2);
      gTall.add(cap, top); reg(cap, capP); reg(top, capP);
    }

    /* --- SMD: resistores, cerâmicos, LEDs --- */
    const gSmd = expGroup(new THREE.Vector3(0, 0.95, 0));
    const resP = part('SMD RESISTORS', 'current diplomacy — 220Ω of negotiation');
    const resBodyM = mat({ color: 0xd3bd8e, roughness: .85 });
    const resCapM  = mat({ color: 0x8f979b, metalness: .9, roughness: .3 });
    for (const [rx, rz] of [[-1.0, 1.0], [-0.4, 1.08], [0.95, 1.05]]){
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.16, 0.3), resBodyM);
      b.position.set(rx, 0.24, rz);
      const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.32), resCapM);
      c1.position.set(rx - 0.31, 0.24, rz);
      const c2 = c1.clone(); c2.position.x = rx + 0.31;
      gSmd.add(b, c1, c2); reg(b, resP); reg(c1, resP); reg(c2, resP);
    }
    const cerP = part('CERAMIC CAPS', 'high-frequency noise silencers');
    const cerM = mat({ color: 0x8a3a2e, roughness: .7 });
    for (const [kx, kz] of [[0.35, -1.05], [-0.65, -1.08]]){
      const k = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.14, 0.22), cerM);
      k.position.set(kx, 0.23, kz);
      gSmd.add(k); reg(k, cerP);
    }
    /* LEDs TX/RX — espelham a atividade da página */
    const ledP = part('TX / RX LEDS', 'they mirror your activity on this page — scroll & watch');
    const ledGM = mat({ color: 0x123f22, emissive: 0x5bba6f, emissiveIntensity: .25, roughness: .4 }); ledGM.userData.noHL = true;
    const ledAM = mat({ color: 0x4a3410, emissive: 0xffc24d, emissiveIntensity: .25, roughness: .4 }); ledAM.userData.noHL = true;
    const ledT = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 12), ledGM);
    ledT.position.set(-1.9, 0.26, -0.95);
    const ledR = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.2, 12), ledAM);
    ledR.position.set(-1.55, 0.26, -0.95);
    gSmd.add(ledT, ledR); reg(ledT, ledP); reg(ledR, ledP);

    /* --- standoffs de latão (abaixo da placa) --- */
    const stfP = part('MOUNTING STANDOFFS', 'hex steel — the steampunk tax still applies');
    const gStf = expGroup(new THREE.Vector3(0, -0.85, 0));
    const stfM = mat({ color: 0x9aa0a5, metalness: .88, roughness: .32 });
    for (const [sx, sz] of [[2.45,1.55],[2.45,-1.55],[-2.45,1.55],[-2.45,-1.55]]){
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 6), stfM);
      s.position.set(sx, -0.25, sz);
      gStf.add(s); reg(s, stfP);
    }

    /* --- dial técnico sob o conjunto --- */
    const dialSide = mat({ color: 0x111113, roughness: .6 });
    const dialTopM = mat({ map: dialTexture(), roughness: .85, metalness: .05 });
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(4.7, 4.7, 0.08, 96), [dialSide, dialTopM, dialSide]);
    dial.position.y = -1.72;
    scene.add(dial);

    /* --- controles de câmera (órbita própria, com inércia) --- */
    let theta = 0.6 - 1.4, phi = 1.08, rad = 16; // entra com um giro/zoom de apresentação
    let thetaT = 0.6, phiT = 1.08, radT = 12, thetaV = 0;
    let explodeT = 0, explodeCur = 0;
    let lastPointer = performance.now();
    const DEF = { theta: 0.6, phi: 1.08, rad: 12 };

    const canvas = renderer.domElement;
    const pts = new Map();
    let lastPinch = 0, dragging = false, lx = 0, ly = 0;

    canvas.addEventListener('pointerdown', e => {
      canvas.setPointerCapture(e.pointerId);
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1){ dragging = true; lx = e.clientX; ly = e.clientY; }
      if (pts.size === 2){
        const [a, b] = [...pts.values()];
        lastPinch = Math.hypot(a.x - b.x, a.y - b.y);
      }
      lastPointer = performance.now();
    });
    canvas.addEventListener('pointermove', e => {
      if (pts.has(e.pointerId)) pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2){
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (lastPinch > 0 && d > 0) radT = clamp(radT * (lastPinch / d), 6.5, 17);
        lastPinch = d;
      } else if (dragging){
        const dx = e.clientX - lx, dy = e.clientY - ly;
        thetaT -= dx * 0.0055;
        phiT = clamp(phiT + dy * 0.0045, 0.3, 1.5);
        thetaV = -dx * 0.0045;
        lx = e.clientX; ly = e.clientY;
        lastPointer = performance.now();
      } else if (e.pointerType === 'mouse'){
        pick(e);
      }
    });
    const endPtr = e => {
      pts.delete(e.pointerId);
      if (pts.size < 2) lastPinch = 0;
      if (pts.size === 0) dragging = false;
    };
    canvas.addEventListener('pointerup', endPtr);
    canvas.addEventListener('pointercancel', endPtr);
    canvas.addEventListener('pointerleave', () => { hovered = null; setHud(null); });
    canvas.addEventListener('dblclick', () => {
      thetaT = DEF.theta; phiT = DEF.phi; radT = DEF.rad; explodeT = 0;
    });

    /* --- raycast: inspetor de componentes --- */
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    let hovered = null;
    function setHud(p){
      if (p){
        hudName.textContent = p.name;
        hudDesc.textContent = p.desc;
        wrap.dataset.cursor = 'INSPECT';
      } else {
        hudName.textContent = '— HOVER A COMPONENT —';
        hudDesc.textContent = '';
        wrap.dataset.cursor = 'ROTATE';
      }
    }
    function pick(e){
      const r = canvas.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(rayMeshes, false)[0];
      const p = hit && hit.object.userData.part;
      if (p !== hovered){ hovered = p; setHud(p); }
    }

    /* --- UI: sliders / botões (vêm de ui/sliders.js) --- */
    if (mcuSliders.explode) mcuSliders.explode.onChange(v => { explodeT = v; lastPointer = performance.now(); });
    if (mcuSliders.zoom)    mcuSliders.zoom.onChange(v => { radT = 17 - v * 10.5; lastPointer = performance.now(); });
    document.getElementById('zoomIn').addEventListener('click', () => { radT = clamp(radT - 1.5, 6.5, 17); });
    document.getElementById('zoomOut').addEventListener('click', () => { radT = clamp(radT + 1.5, 6.5, 17); });
    document.getElementById('viewReset').addEventListener('click', () => {
      thetaT = DEF.theta; phiT = DEF.phi; radT = DEF.rad; explodeT = 0;
    });

    /* --- LEDs refletem a página --- */
    let tx = 0, rxL = 0, lastSY = scrollY;
    document.addEventListener('mcu:rx', () => { rxL = 1; });

    /* --- visibilidade + introdução automática --- */
    let running = false, started = false;
    new IntersectionObserver(es => {
      running = es[0].isIntersecting;
      if (running && !started){
        started = true;
        if (!RM) setTimeout(() => { explodeT = 0.55; }, 700); // explosão de boas-vindas
      }
    }, { threshold: 0.15 }).observe(wrap);

    /* --- loop --- */
    function frame(){
      requestAnimationFrame(frame);
      if (!running) return;
      const now = performance.now();

      /* LEDs: TX = velocidade do scroll · RX = eventos (toasts, carrossel) */
      const dv = scrollY - lastSY; lastSY = scrollY;
      tx = Math.min(1, tx * 0.9 + Math.abs(dv) * 0.02);
      rxL *= 0.94;
      ledGM.emissiveIntensity = 0.25 + tx * 2.6;
      ledAM.emissiveIntensity = 0.25 + rxL * 2.6;

      /* inércia + auto-rotação em idle */
      thetaT += thetaV; thetaV *= 0.93;
      if (!RM && now - lastPointer > 4000) thetaT += 0.0012;

      theta += (thetaT - theta) * 0.1;
      phi   += (phiT - phi) * 0.1;
      rad   += (radT - rad) * 0.1;
      tgt.y += ((1.05 + explodeCur * 1.05) - tgt.y) * 0.08;

      camera.position.set(
        tgt.x + rad * Math.sin(phi) * Math.sin(theta),
        tgt.y + rad * Math.cos(phi),
        tgt.z + rad * Math.sin(phi) * Math.cos(theta)
      );
      camera.lookAt(tgt);

      /* explosion view */
      explodeCur += (explodeT - explodeCur) * 0.07;
      for (const e of exps) e.g.position.copy(e.dir).multiplyScalar(explodeCur);

      /* flutuação sutil do conjunto */
      if (!RM) rig.position.y = Math.sin(now * 0.0011) * 0.1;
      dial.rotation.y -= 0.0012;

      /* highlight das partes sob o cursor */
      for (const p of hoverables){
        const t = p === hovered ? 1 : 0;
        p.glow += (t - p.glow) * 0.15;
        if (p.glow > 0.002 || t) for (const m of p.mats) m.emissiveIntensity = p.glow * 0.45;
      }

      /* sliders refletem o estado real */
      if (mcuSliders.explode && !mcuSliders.explode.isDrag()) mcuSliders.explode.set(explodeCur);
      if (mcuSliders.zoom && !mcuSliders.zoom.isDrag()) mcuSliders.zoom.set(clamp((17 - rad) / 10.5, 0, 1));

      renderer.render(scene, camera);
    }
    frame();
  }
})();