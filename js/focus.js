/* =========================================================
   LIFE QUEST — FOCUS: temporizador con escenas animadas
   Escenas: 🌲 Bosque que crece · 🪐 Sistema planetario que se forma
            ⚛️ Experimento de doble rendija (la interferencia emerge)
   El progreso del temporizador (0→1) "construye" la escena.
   Estado persistente en S.focus (sobrevive a recargar la página).
   ========================================================= */
(() => {
  "use strict";
  const LQ = window.LQ; if (!LQ) return;
  const $ = s => document.querySelector(s);
  const TAU = Math.PI * 2;
  const S = () => LQ.state();
  const F = () => (S().focus = S().focus || { scene: "forest", dur: 25 * 60, skill: "emt", running: false, endAt: 0, left: 25 * 60, seed: 1, sessions: 0, totalMin: 0 });

  const cv = $("#focusCanvas"), ctx = cv.getContext("2d");
  const mini = $("#focusMini"), mctx = mini ? mini.getContext("2d") : null;
  let W = 0, H = 0, dpr = 1;
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = cv.getBoundingClientRect(); W = Math.max(300, r.width); H = Math.max(260, r.height);
    cv.width = W * dpr; cv.height = H * dpr;
    if (mini) { const m = mini.getBoundingClientRect(); mini.width = Math.max(200, m.width) * dpr; mini.height = Math.max(120, m.height) * dpr; }
  }
  addEventListener("resize", resize);

  /* ---------- tiempo ---------- */
  const leftSec = () => { const f = F(); return f.running ? Math.max(0, (f.endAt - Date.now()) / 1000) : f.left; };
  const progress = () => { const f = F(); return Math.min(1, Math.max(0, 1 - leftSec() / f.dur)); };
  const fmt = s => { s = Math.ceil(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) + ":" + String(ss).padStart(2, "0"); };

  function start() { const f = F(); if (f.running) return; if (f.left <= 0) f.left = f.dur; f.endAt = Date.now() + f.left * 1000; f.running = true; LQ.save(); try { Notification?.permission === "default" && Notification.requestPermission(); } catch {} ui(); }
  function pause() { const f = F(); if (!f.running) return; f.left = leftSec(); f.running = false; LQ.save(); ui(); }
  function reset() { const f = F(); f.running = false; f.left = f.dur; f.seed = (Math.random() * 1e9) | 0; LQ.save(); seedScene(); ui(); }
  function setDur(min) { const f = F(); f.dur = min * 60; f.left = f.dur; f.running = false; LQ.save(); ui(); }
  function complete() {
    const f = F(); f.running = false; f.left = 0; f.sessions++; const min = Math.round(f.dur / 60); f.totalMin += min; LQ.save();
    LQ.addLog({ skill: f.skill, xp: Math.round(min * 1.1), minutes: min, note: `Focus ${min} min · ${SCENES[f.scene].name}`, type: "focus" });
    LQ.toast(`${SCENES[f.scene].icon} ¡Sesión de enfoque completada! +${Math.round(min * 1.1)} XP`);
    celebrate = 3;
    try { if (Notification?.permission === "granted") new Notification("Life Quest", { body: `Sesión de ${min} min completada. ¡Descansa 5 minutos!` }); } catch {}
    ui();
  }

  /* ---------- UI ---------- */
  function ui() {
    const f = F();
    $("#focusTime").textContent = fmt(leftSec());
    $("#focusPct").textContent = Math.floor(progress() * 100) + "%";
    $("#focusStart").textContent = f.running ? "⏸ Pausa" : (f.left < f.dur && f.left > 0 ? "▶ Reanudar" : "▶ Iniciar");
    document.querySelectorAll("[data-scene]").forEach(b => b.classList.toggle("sel", b.dataset.scene === f.scene));
    document.querySelectorAll("[data-fdur]").forEach(b => b.classList.toggle("sel", +b.dataset.fdur * 60 === f.dur));
    $("#focusSkill").value = f.skill;
    $("#focusStats").textContent = `Sesiones: ${f.sessions} · Total enfocado: ${(f.totalMin / 60).toFixed(1)} h`;
    $("#focusSceneName").textContent = SCENES[f.scene].icon + " " + SCENES[f.scene].name + " — " + SCENES[f.scene].desc;
    const mt = $("#focusMiniTime"); if (mt) mt.textContent = f.running ? fmt(leftSec()) : "Focus";
  }
  $("#focusSkill").innerHTML = LQ.D.skills.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join("");
  $("#focusStart").onclick = () => (F().running ? pause() : start());
  $("#focusReset").onclick = reset;
  $("#focusSkill").onchange = e => { F().skill = e.target.value; LQ.save(); };
  document.querySelectorAll("[data-fdur]").forEach(b => (b.onclick = () => setDur(+b.dataset.fdur)));
  $("#focusCustom").onchange = e => { const v = +e.target.value; if (v > 0 && v <= 300) setDur(v); };
  document.querySelectorAll("[data-scene]").forEach(b => (b.onclick = () => { F().scene = b.dataset.scene; LQ.save(); seedScene(); ui(); }));
  $("#focusFull").onclick = () => { const el = $("#focusStage"); (el.requestFullscreen || el.webkitRequestFullscreen || (() => {})).call(el); };
  document.addEventListener("fullscreenchange", () => setTimeout(resize, 50));

  /* ---------- RNG ---------- */
  let rs = 1; const rnd = () => ((rs = (rs * 16807) % 2147483647) / 2147483647);
  let scene = {}; let celebrate = 0;

  /* =====================================================
     ESCENA 1: BOSQUE — árboles fractales crecen con el progreso,
     el cielo pasa del amanecer a la noche estrellada
     ===================================================== */
  function seedForest() {
    const trees = [];
    for (let i = 0; i < 28; i++) trees.push({ x: rnd(), layer: rnd() < 0.4 ? 0 : rnd() < 0.6 ? 1 : 2, h: 0.5 + rnd() * 0.5, at: i / 28 * 0.92 + rnd() * 0.04, hue: 90 + rnd() * 60, ang: 0.35 + rnd() * 0.2, seed: (rnd() * 1e6) | 0 });
    trees.sort((a, b) => a.layer - b.layer);
    scene = { trees, stars: Array.from({ length: 120 }, () => ({ x: rnd(), y: rnd() * 0.6, s: rnd() })), flies: Array.from({ length: 30 }, () => ({ x: rnd(), y: 0.55 + rnd() * 0.4, p: rnd() * TAU })), birds: Array.from({ length: 5 }, () => ({ x: rnd(), y: 0.15 + rnd() * 0.2, v: 0.02 + rnd() * 0.03 })) };
  }
  function lerpC(a, b, t) { return a.map((v, i) => Math.round(v + (b[i] - v) * t)); }
  function skyAt(p) {
    const K = [[0, [255, 160, 120], [120, 90, 160]], [0.25, [130, 200, 255], [210, 235, 255]], [0.6, [90, 160, 240], [255, 210, 160]], [0.8, [60, 40, 110], [255, 120, 90]], [1, [8, 10, 35], [30, 30, 80]]];
    for (let i = 0; i < K.length - 1; i++) if (p <= K[i + 1][0]) { const t = (p - K[i][0]) / (K[i + 1][0] - K[i][0]); return [lerpC(K[i][1], K[i + 1][1], t), lerpC(K[i][2], K[i + 1][2], t)]; }
    return [K[4][1], K[4][2]];
  }
  function branch(c, x, y, len, ang, depth, grow, sway, hue, t, seed) {
    if (depth === 0 || grow <= 0) return;
    const g = Math.min(1, grow);
    const x2 = x + Math.cos(ang) * len * g, y2 = y + Math.sin(ang) * len * g;
    c.strokeStyle = depth > 2 ? `hsl(25,35%,${18 + depth * 2}%)` : `hsl(${hue},45%,30%)`; c.lineWidth = Math.max(0.6, depth * 1.1);
    c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke();
    if (depth <= 2 && g >= 1) { c.fillStyle = `hsla(${hue + Math.sin(seed + depth) * 15},60%,${38 + (seed % 20)}%,0.85)`; c.beginPath(); c.arc(x2, y2, len * 0.55, 0, TAU); c.fill(); }
    const s = Math.sin(t * 1.2 + seed) * sway * (6 - depth) * 0.02;
    branch(c, x2, y2, len * 0.74, ang - 0.42 + s, depth - 1, (grow - 1) * 1.6, sway, hue, t, seed + 1);
    branch(c, x2, y2, len * 0.7, ang + 0.38 + s, depth - 1, (grow - 1) * 1.6, sway, hue, t, seed + 2);
  }
  function drawForest(c, w, h, p, t) {
    const [top, bot] = skyAt(p);
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, `rgb(${top})`); g.addColorStop(1, `rgb(${bot})`); c.fillStyle = g; c.fillRect(0, 0, w, h);
    // estrellas al anochecer
    const night = Math.max(0, (p - 0.7) / 0.3);
    if (night > 0) scene.stars.forEach(s => { c.globalAlpha = night * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + s.s * 20))); c.fillStyle = "#fff"; c.fillRect(s.x * w, s.y * h, 1.5, 1.5); });
    c.globalAlpha = 1;
    // sol / luna en arco
    const a = Math.PI * (1 - p), cx = w / 2 + Math.cos(a) * w * 0.42, cy = h * 0.75 - Math.sin(a) * h * 0.6;
    const isMoon = p > 0.82; const sg = c.createRadialGradient(cx, cy, 0, cx, cy, 60); sg.addColorStop(0, isMoon ? "rgba(230,240,255,0.9)" : "rgba(255,240,180,1)"); sg.addColorStop(0.3, isMoon ? "rgba(200,220,255,0.3)" : "rgba(255,200,120,0.5)"); sg.addColorStop(1, "rgba(255,200,120,0)");
    c.fillStyle = sg; c.beginPath(); c.arc(cx, cy, 60, 0, TAU); c.fill(); c.fillStyle = isMoon ? "#eef" : "#fff6d5"; c.beginPath(); c.arc(cx, cy, 14, 0, TAU); c.fill();
    // montañas en capas (parallax)
    [[0.55, "rgba(70,60,110,0.55)", 0.18], [0.62, "rgba(40,50,80,0.7)", 0.12], [0.7, "rgba(25,35,50,0.85)", 0.09]].forEach(([base, col, amp], i) => {
      c.fillStyle = col; c.beginPath(); c.moveTo(0, h);
      for (let x = 0; x <= w; x += 8) c.lineTo(x, h * base - Math.sin(x * 0.01 * (i + 1) + i * 2) * h * amp * 0.5 - Math.sin(x * 0.037 + i) * h * amp * 0.25);
      c.lineTo(w, h); c.fill();
    });
    // pájaros
    if (p < 0.8) scene.birds.forEach(b => { const bx = ((b.x + t * b.v) % 1.2 - 0.1) * w, by = b.y * h + Math.sin(t * 2 + b.x * 9) * 4, f = Math.sin(t * 10 + b.x * 30) * 3; c.strokeStyle = "rgba(30,30,50,0.7)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx - 5, by - f); c.lineTo(bx, by); c.lineTo(bx + 5, by - f); c.stroke(); });
    // suelo
    const gg = c.createLinearGradient(0, h * 0.78, 0, h); gg.addColorStop(0, `hsl(110,${30 + 30 * p}%,${16 - night * 8}%)`); gg.addColorStop(1, "#0b1a0d"); c.fillStyle = gg; c.fillRect(0, h * 0.78, w, h * 0.22);
    // árboles
    scene.trees.forEach(tr => {
      const grow = Math.max(0, Math.min(6.2, (p - tr.at) * 14 + (p >= 1 ? 6 : 0)));
      if (grow <= 0) { if (p > tr.at - 0.05) { c.fillStyle = "#6b4"; c.beginPath(); c.arc(tr.x * w, h * (0.8 + tr.layer * 0.06), 2, 0, TAU); c.fill(); } return; }
      const scale = [0.55, 0.75, 1][tr.layer], baseY = h * (0.8 + tr.layer * 0.06);
      c.globalAlpha = [0.65, 0.85, 1][tr.layer];
      branch(c, tr.x * w, baseY, h * 0.11 * tr.h * scale, -Math.PI / 2, 6, grow, 1, tr.hue - night * 40, t, tr.seed);
      c.globalAlpha = 1;
    });
    // luciérnagas de noche / polen de día
    scene.flies.forEach(f => { const x = (f.x + Math.sin(t * 0.3 + f.p) * 0.03) * w, y = (f.y + Math.cos(t * 0.4 + f.p) * 0.02) * h; const al = night > 0 ? night * (0.5 + 0.5 * Math.sin(t * 3 + f.p * 5)) : 0.25 * p; c.fillStyle = night > 0 ? `rgba(220,255,120,${al})` : `rgba(255,255,220,${al})`; c.beginPath(); c.arc(x, y, night > 0 ? 2.2 : 1.2, 0, TAU); c.fill(); });
  }

  /* =====================================================
     ESCENA 2: COSMOS — nace una estrella y se forman planetas
     en órbitas elípticas con profundidad (pseudo-3D)
     ===================================================== */
  function seedCosmos() {
    const hues = [30, 200, 20, 260, 160, 45, 190, 0];
    scene = {
      stars: Array.from({ length: 220 }, () => ({ x: rnd(), y: rnd(), s: rnd(), z: rnd() })),
      planets: Array.from({ length: 8 }, (_, i) => ({ r: 0.12 + i * 0.075, size: [3, 4.5, 5, 3.5, 11, 9, 7, 6.5][i], hue: hues[i], speed: 1.2 / Math.pow(i + 1, 1.2), ph: rnd() * TAU, at: 0.08 + i * 0.11, ring: i === 5, moons: i === 4 ? 3 : i === 2 ? 1 : 0 })),
      belt: Array.from({ length: 260 }, () => ({ a: rnd() * TAU, r: 0.43 + rnd() * 0.05, s: 0.25 + rnd() * 0.1 })),
      comet: { t: rnd() * 10 }
    };
  }
  function drawCosmos(c, w, h, p, t) {
    c.fillStyle = "#03030c"; c.fillRect(0, 0, w, h);
    // nebulosas
    [[0.2, 0.3, "rgba(120,40,160,0.18)"], [0.8, 0.7, "rgba(30,120,200,0.15)"], [0.6, 0.2, "rgba(200,60,120,0.1)"]].forEach(([x, y, col], i) => { const r = Math.max(w, h) * (0.35 + 0.05 * Math.sin(t * 0.2 + i)); const gr = c.createRadialGradient(x * w, y * h, 0, x * w, y * h, r); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    scene.stars.forEach(s => { c.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * (0.5 + s.z) + s.s * 30)); c.fillStyle = s.z > 0.9 ? "#bde" : "#fff"; c.fillRect(s.x * w, s.y * h, s.z > 0.8 ? 2 : 1, s.z > 0.8 ? 2 : 1); });
    c.globalAlpha = 1;
    const cx = w / 2, cy = h / 2, R = Math.min(w, h * 2.2) * 0.5, tilt = 0.38;
    // disco protoplanetario (se disipa al formarse planetas)
    const disk = Math.max(0, 1 - p * 1.3);
    if (disk > 0) for (let i = 0; i < 300; i++) { const a = i * 2.39996 + t * (0.3 + (i % 7) * 0.05), r = (0.05 + (i % 97) / 97 * 0.5) * R; c.fillStyle = `rgba(255,${150 + (i % 80)},${100 + (i % 120)},${0.35 * disk})`; c.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r * tilt, 1.5, 1.5); }
    // objetos ordenados por profundidad (z = sin(a))
    const objs = [];
    scene.planets.forEach(pl => {
      const vis = Math.min(1, Math.max(0, (p - pl.at) * 8));
      // órbita
      c.strokeStyle = `rgba(150,180,255,${0.08 + 0.12 * vis})`; c.lineWidth = 1; c.beginPath(); c.ellipse(cx, cy, pl.r * R, pl.r * R * tilt, 0, 0, TAU); c.stroke();
      if (vis <= 0) return;
      const a = pl.ph + t * pl.speed * 0.4;
      objs.push({ z: Math.sin(a), draw: () => drawPlanet(c, cx + Math.cos(a) * pl.r * R, cy + Math.sin(a) * pl.r * R * tilt, pl.size * (0.85 + 0.15 * Math.sin(a)) * (R / 260) * vis, pl, a, t, vis) });
    });
    // cinturón de asteroides
    const beltVis = Math.min(1, Math.max(0, (p - 0.5) * 3));
    if (beltVis > 0) scene.belt.forEach(b => { const a = b.a + t * b.s * 0.15; c.fillStyle = `rgba(200,190,170,${0.5 * beltVis})`; c.fillRect(cx + Math.cos(a) * b.r * R, cy + Math.sin(a) * b.r * R * tilt, 1.2, 1.2); });
    // estrella central
    const sunR = R * (0.03 + 0.05 * Math.min(1, p * 2.5)) * (1 + 0.03 * Math.sin(t * 3));
    objs.push({ z: 0, draw: () => {
      const gr = c.createRadialGradient(cx, cy, 0, cx, cy, sunR * 5); gr.addColorStop(0, "rgba(255,240,200,1)"); gr.addColorStop(0.15, "rgba(255,200,90,0.9)"); gr.addColorStop(0.4, "rgba(255,120,40,0.25)"); gr.addColorStop(1, "rgba(255,80,0,0)");
      c.fillStyle = gr; c.beginPath(); c.arc(cx, cy, sunR * 5, 0, TAU); c.fill();
      c.strokeStyle = "rgba(255,180,80,0.25)"; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.2; c.beginPath(); c.moveTo(cx + Math.cos(a) * sunR * 1.2, cy + Math.sin(a) * sunR * 1.2); c.lineTo(cx + Math.cos(a) * sunR * (2 + Math.sin(t * 2 + i)), cy + Math.sin(a) * sunR * (2 + Math.sin(t * 2 + i))); c.stroke(); }
    } });
    objs.sort((a, b) => a.z - b.z).forEach(o => o.draw());
    // cometa
    const ct = (t * 0.07 + scene.comet.t) % 1.4; if (ct < 1) { const x = w * (1.1 - ct * 1.3), y = h * (0.1 + ct * 0.5); const gr = c.createLinearGradient(x, y, x + 90, y - 35); gr.addColorStop(0, "rgba(200,240,255,0.9)"); gr.addColorStop(1, "rgba(200,240,255,0)"); c.strokeStyle = gr; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 90, y - 35); c.stroke(); c.fillStyle = "#fff"; c.beginPath(); c.arc(x, y, 2, 0, TAU); c.fill(); }
  }
  function drawPlanet(c, x, y, r, pl, a, t, vis) {
    if (r < 0.5) return;
    if (pl.ring) { c.strokeStyle = `hsla(${pl.hue},50%,75%,${0.6 * vis})`; c.lineWidth = r * 0.35; c.beginPath(); c.ellipse(x, y, r * 2.1, r * 0.6, -0.3, Math.PI, TAU); c.stroke(); }
    const gr = c.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r);
    gr.addColorStop(0, `hsla(${pl.hue},70%,75%,${vis})`); gr.addColorStop(0.6, `hsla(${pl.hue},60%,45%,${vis})`); gr.addColorStop(1, `hsla(${pl.hue},60%,12%,${vis})`);
    c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    if (pl.size > 8) { c.strokeStyle = `hsla(${pl.hue + 20},50%,65%,${0.35 * vis})`; c.lineWidth = 1; for (let i = -2; i <= 2; i++) { c.beginPath(); c.ellipse(x, y + i * r * 0.3, r * Math.sqrt(1 - (i * 0.3) ** 2), r * 0.08, 0, 0, TAU); c.stroke(); } }
    if (pl.ring) { c.strokeStyle = `hsla(${pl.hue},50%,75%,${0.6 * vis})`; c.lineWidth = r * 0.35; c.beginPath(); c.ellipse(x, y, r * 2.1, r * 0.6, -0.3, 0, Math.PI); c.stroke(); }
    for (let m = 0; m < pl.moons; m++) { const ma = t * (1.5 + m) + m * 2; c.fillStyle = `rgba(220,220,230,${vis})`; c.beginPath(); c.arc(x + Math.cos(ma) * r * (1.8 + m * 0.5), y + Math.sin(ma) * r * 0.6 * (1.8 + m * 0.5), Math.max(1, r * 0.18), 0, TAU); c.fill(); }
  }

  /* =====================================================
     ESCENA 3: CUÁNTICA — doble rendija.
     Cada partícula pasa como onda (frentes circulares desde las
     rendijas) y colapsa en la pantalla según |ψ|². Con el progreso
     se acumulan impactos y emergen las franjas de interferencia.
     I(y) ∝ cos²(π d y / λL) · sinc²(π a y / λL)
     ===================================================== */
  function seedQuantum() {
    scene = { hits: [], flying: [], waves: [], hist: new Float32Array(120), emitted: 0, orbit: rnd() * TAU };
  }
  function sampleY() { // muestreo por rechazo de la distribución de intensidad
    for (let i = 0; i < 200; i++) {
      const y = (Math.random() * 2 - 1), k = 9.5, a = 2.2;
      const s = a * y; const sinc = s === 0 ? 1 : Math.sin(s) / s;
      const I = Math.pow(Math.cos(k * y), 2) * sinc * sinc;
      if (Math.random() < I) return y;
    }
    return 0;
  }
  function drawQuantum(c, w, h, p, t, dt) {
    c.fillStyle = "#02040a"; c.fillRect(0, 0, w, h);
    // rejilla de fondo
    c.strokeStyle = "rgba(60,120,255,0.07)"; c.lineWidth = 1; for (let x = 0; x < w; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } for (let y = 0; y < h; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    const ex = w * 0.08, bx = w * 0.38, sx = w * 0.82, cy = h / 2, slitGap = h * 0.11, slitH = h * 0.035;
    // emisor
    const eg = c.createRadialGradient(ex, cy, 0, ex, cy, 30); eg.addColorStop(0, "rgba(120,220,255,0.9)"); eg.addColorStop(1, "rgba(120,220,255,0)"); c.fillStyle = eg; c.beginPath(); c.arc(ex, cy, 30, 0, TAU); c.fill();
    c.fillStyle = "#9fe8ff"; c.fillRect(ex - 10, cy - 8, 12, 16);
    // barrera con 2 rendijas
    c.fillStyle = "#1c2a4a"; c.fillRect(bx - 3, 0, 6, cy - slitGap - slitH); c.fillRect(bx - 3, cy - slitGap + slitH, 6, 2 * slitGap - 2 * slitH); c.fillRect(bx - 3, cy + slitGap + slitH, 6, h);
    c.fillStyle = "#4cc9f0"; [cy - slitGap, cy + slitGap].forEach(y => { c.fillRect(bx - 4, y - slitH - 1, 8, 1); c.fillRect(bx - 4, y + slitH, 8, 1); });
    // pantalla detectora
    c.fillStyle = "#0b1226"; c.fillRect(sx, 0, 8, h); c.fillStyle = "rgba(120,200,255,0.3)"; c.fillRect(sx, 0, 1, h);
    // emitir partículas según progreso: el total de impactos ~ progreso
    const target = Math.floor(p * 1400);
    const rate = F().running ? 1 : 0.15;
    while (scene.emitted < target && scene.flying.length < 6) { scene.flying.push({ x: ex, y: cy, ph: 0, y2: sampleY() }); scene.emitted++; }
    if (scene.hits.length < target - 12) { // ponerse al día (recarga o salto de tiempo)
      for (let i = scene.hits.length; i < target - 6; i++) { addHit(sampleY()); scene.emitted = Math.max(scene.emitted, scene.hits.length); }
    }
    // partículas en vuelo: emisor → rendijas (onda) → pantalla (colapso)
    scene.flying.forEach(f => {
      f.ph += dt * (0.9 + rate * 0.6);
      if (f.ph < 0.45) { const k = f.ph / 0.45; f.x = ex + (bx - ex) * k; f.y = cy + Math.sin(f.ph * 40) * 3; const gr = c.createRadialGradient(f.x, f.y, 0, f.x, f.y, 14); gr.addColorStop(0, "rgba(170,240,255,0.9)"); gr.addColorStop(1, "rgba(170,240,255,0)"); c.fillStyle = gr; c.beginPath(); c.arc(f.x, f.y, 14, 0, TAU); c.fill(); }
      else if (f.ph < 1) { const k = (f.ph - 0.45) / 0.55, r = (sx - bx) * k; c.lineWidth = 1.5; [cy - slitGap, cy + slitGap].forEach(sy => { c.strokeStyle = `rgba(120,220,255,${0.5 * (1 - k)})`; c.beginPath(); c.arc(bx, sy, r, -1.1, 1.1); c.stroke(); }); }
      else { f.done = true; addHit(f.y2); const yy = cy + f.y2 * h * 0.48; const fl = c.createRadialGradient(sx, yy, 0, sx, yy, 16); fl.addColorStop(0, "rgba(255,255,255,1)"); fl.addColorStop(1, "rgba(120,220,255,0)"); c.fillStyle = fl; c.beginPath(); c.arc(sx, yy, 16, 0, TAU); c.fill(); }
    });
    scene.flying = scene.flying.filter(f => !f.done);
    // impactos acumulados en la pantalla
    c.globalCompositeOperation = "lighter";
    scene.hits.forEach(hh => { c.fillStyle = `rgba(${hh.c},0.55)`; c.fillRect(sx + 1 + hh.dx, cy + hh.y * h * 0.48, 1.6, 1.6); });
    c.globalCompositeOperation = "source-over";
    // histograma = |ψ|² emergiendo
    const N = scene.hist.length, sm = new Float32Array(N);
    for (let i = 0; i < N; i++) { let a = 0, wsum = 0; for (let k = -3; k <= 3; k++) { const j = i + k; if (j < 0 || j >= N) continue; const wk = Math.exp(-k * k / 4); a += scene.hist[j] * wk; wsum += wk; } sm[i] = a / wsum; }
    const max = Math.max(1e-6, ...sm);
    // curva teórica |ψ|² (referencia tenue)
    c.strokeStyle = "rgba(255,214,10,0.35)"; c.setLineDash([4, 4]); c.beginPath();
    for (let i = 0; i <= 200; i++) { const yy = i / 200 * 2 - 1, s2 = 2.2 * yy, sinc = s2 === 0 ? 1 : Math.sin(s2) / s2, I = Math.cos(9.5 * yy) ** 2 * sinc * sinc; const py = cy + yy * h * 0.48; i ? c.lineTo(sx + 12 + I * (w - sx - 18), py) : c.moveTo(sx + 12 + I * (w - sx - 18), py); }
    c.stroke(); c.setLineDash([]);
    c.beginPath(); c.moveTo(sx + 12, cy - h * 0.48);
    for (let i = 0; i < N; i++) { const y = cy + ((i / (N - 1)) * 2 - 1) * h * 0.48, v = sm[i] / max; c.lineTo(sx + 12 + v * (w - sx - 18), y); }
    c.lineTo(sx + 12, cy + h * 0.48);
    c.lineTo(sx + 12, h); c.closePath();
    const hg = c.createLinearGradient(sx, 0, w, 0); hg.addColorStop(0, "rgba(76,201,240,0.15)"); hg.addColorStop(1, "rgba(199,125,255,0.6)"); c.fillStyle = hg; c.fill(); c.strokeStyle = "rgba(200,240,255,0.7)"; c.stroke();
    // átomo/orbital decorativo (nube de probabilidad)
    const ox = w * 0.22, oy = h * 0.2; c.globalAlpha = 0.6;
    for (let i = 0; i < 3; i++) { c.strokeStyle = ["#4cc9f0", "#c77dff", "#06d6a0"][i]; c.beginPath(); c.ellipse(ox, oy, 28, 9, i * 1.047 + t * 0.3, 0, TAU); c.stroke(); const a = t * (2 + i) + i; c.fillStyle = "#fff"; c.beginPath(); c.arc(ox + Math.cos(a) * 28 * Math.cos(i * 1.047 + t * 0.3) - Math.sin(a) * 9 * Math.sin(i * 1.047 + t * 0.3), oy + Math.cos(a) * 28 * Math.sin(i * 1.047 + t * 0.3) + Math.sin(a) * 9 * Math.cos(i * 1.047 + t * 0.3), 2, 0, TAU); c.fill(); }
    c.fillStyle = "#c77dff"; c.beginPath(); c.arc(ox, oy, 4, 0, TAU); c.fill(); c.globalAlpha = 1;
    // fórmulas
    c.fillStyle = "rgba(200,230,255,0.75)"; c.font = `${Math.max(11, w * 0.014)}px monospace`;
    c.fillText("iħ ∂ψ/∂t = Ĥψ", w * 0.04, h * 0.93);
    c.fillText("P(y) = |ψ₁ + ψ₂|²", bx + 12, h * 0.07);
    c.fillText(`detecciones: ${scene.hits.length}`, bx + 12, h * 0.93);
  }
  function addHit(y) {
    if (scene.hits.length < 3000) scene.hits.push({ y, dx: Math.random() * 6, c: Math.random() < 0.5 ? "120,220,255" : "199,150,255" });
    const i = Math.round((y + 1) / 2 * (scene.hist.length - 1)); if (i >= 0 && i < scene.hist.length) scene.hist[i]++;
  }

  const SCENES = {
    forest: { icon: "🌲", name: "Bosque", desc: "un bosque crece del amanecer a la noche", seed: seedForest, draw: drawForest },
    cosmos: { icon: "🪐", name: "Cosmos", desc: "nace una estrella y se forman sus planetas", seed: seedCosmos, draw: drawCosmos },
    quantum: { icon: "⚛️", name: "Cuántica", desc: "doble rendija: la interferencia emerge partícula a partícula", seed: seedQuantum, draw: drawQuantum }
  };
  function seedScene() { rs = (F().seed || 1) % 2147483646 + 1; SCENES[F().scene].seed(); }

  /* ---------- overlay de progreso ---------- */
  function overlay(c, w, h, p) {
    // anillo de progreso
    const r = Math.min(w, h) * 0.12, x = w - r - 18, y = r + 18;
    c.lineWidth = 6; c.strokeStyle = "rgba(255,255,255,0.15)"; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
    const gr = c.createLinearGradient(x - r, y, x + r, y); gr.addColorStop(0, "#4cc9f0"); gr.addColorStop(1, "#c77dff"); c.strokeStyle = gr; c.lineCap = "round";
    c.beginPath(); c.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + TAU * p); c.stroke(); c.lineCap = "butt";
    c.fillStyle = "#fff"; c.font = `bold ${Math.max(12, r * 0.38)}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(Math.floor(p * 100) + "%", x, y); c.textAlign = "left"; c.textBaseline = "alphabetic";
    // barra inferior
    c.fillStyle = "rgba(0,0,0,0.35)"; c.fillRect(0, h - 5, w, 5); c.fillStyle = gr; c.fillRect(0, h - 5, w * p, 5);
    if (celebrate > 0) { c.fillStyle = `rgba(255,255,255,${Math.min(0.5, celebrate * 0.2)})`; c.fillRect(0, 0, w, h); c.fillStyle = "#fff"; c.font = `bold ${Math.max(18, w * 0.04)}px system-ui`; c.textAlign = "center"; c.fillText("✨ ¡Sesión completada! ✨", w / 2, h / 2); c.textAlign = "left"; }
  }

  /* ---------- loop ---------- */
  let last = performance.now(), lastUi = 0;
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
    const f = F();
    if (f.running && leftSec() <= 0) complete();
    if (celebrate > 0) celebrate -= dt;
    const p = progress();
    const visible = $("#tab-focus").classList.contains("active");
    if (visible && W) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      SCENES[f.scene].draw(ctx, W, H, p, t, dt); overlay(ctx, W, H, p);
    }
    if (mctx && $("#tab-home").classList.contains("active") && mini.width) {
      const mw = mini.width / dpr, mh = mini.height / dpr; mctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      SCENES[f.scene].draw(mctx, mw, mh, p, t, visible ? 0 : dt);
      mctx.fillStyle = "rgba(0,0,0,0.35)"; mctx.fillRect(0, mh - 4, mw, 4); mctx.fillStyle = "#4cc9f0"; mctx.fillRect(0, mh - 4, mw * p, 4);
    }
    if (now - lastUi > 250) { lastUi = now; ui(); if (f.running) document.title = `${fmt(leftSec())} · ${SCENES[f.scene].icon} Life Quest`; else if (document.title.includes("·")) document.title = "Life Quest"; }
    requestAnimationFrame(frame);
  }
  LQ.onTab = LQ.onTab || []; LQ.onTab.push(name => { if (name === "focus" || name === "home") setTimeout(resize, 30); });
  seedScene(); resize(); ui(); requestAnimationFrame(frame);
  $("#focusMiniOpen") && ($("#focusMiniOpen").onclick = () => LQ.showTab("focus"));
})();
