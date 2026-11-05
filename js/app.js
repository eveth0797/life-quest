/* =========================================================
   LIFE QUEST — lógica de la app (sin dependencias salvo Chart.js)
   Todos los datos se guardan en localStorage ("lifequest.v1").
   ========================================================= */
(() => {
  "use strict";
  const D = window.LQ_DATA;
  const KEY = "lifequest.v1";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const pad = n => String(n).padStart(2, "0");
  const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today = () => dkey();
  const skillById = id => D.skills.find(s => s.id === id) || { id, name: id, icon: "✨", color: "#888" };

  /* ---------------- STATE ---------------- */
  const defaults = () => ({
    version: 1,
    profile: { name: "Eveth", cls: "Power Systems & RL Researcher", avatar: "🧙", theme: "arcade", sound: true, fx: true,
      goals: { prot: 140, kcal: 2400, water: 2500 } },
    quests: structuredClone(D.defaultQuests),
    questDone: {}, logs: [], water: {}, workouts: [], weights: [],
    cards: {}, customCards: [], cardsReviewed: 0,
    emtDone: {}, frDone: {}, resDone: {}, emtSessions: [], meals: [], journal: {},
    rewards: [ { name: "Noche de anime 🍿", cost: 50 }, { name: "Comida libre 🍕", cost: 80 }, { name: "Videojuego 1h 🎮", cost: 40 } ],
    spent: 0, sideDone: 0, unlocked: {}
  });
  let S;
  try { S = Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { S = defaults(); }
  S.profile = Object.assign(defaults().profile, S.profile);
  S.profile.goals = Object.assign(defaults().profile.goals, S.profile.goals);
  S.resDone = S.resDone || {};
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("⚠️ No se pudo guardar"); } };

  /* ---------------- XP / LEVELS ---------------- */
  const levelFrom = (xp, base = 100, step = 50) => {
    let lvl = 1, need = base, rest = xp;
    while (rest >= need) { rest -= need; lvl++; need = base + (lvl - 1) * step; }
    return { lvl, cur: rest, need };
  };
  const totalXP = () => S.logs.reduce((a, l) => a + (l.xp || 0), 0);
  const skillXP = id => S.logs.filter(l => l.skill === id).reduce((a, l) => a + (l.xp || 0), 0);
  const minutesBy = (id, days) => {
    const from = days ? dkey(addDays(new Date(), -days + 1)) : "0000";
    return S.logs.filter(l => l.skill === id && l.date >= from).reduce((a, l) => a + (l.minutes || 0), 0);
  };
  const xpOnDay = d => S.logs.filter(l => l.date === d).reduce((a, l) => a + (l.xp || 0), 0);
  const streak = () => {
    const days = new Set(S.logs.map(l => l.date));
    let d = new Date(); if (!days.has(dkey(d))) d = addDays(d, -1);
    let n = 0; while (days.has(dkey(d))) { n++; d = addDays(d, -1); }
    return n;
  };

  function addLog({ skill, xp = 0, minutes = 0, note = "", type = "log", ref = null, date = today() }, ev) {
    const before = levelFrom(totalXP()).lvl;
    const log = { id: uid(), ts: Date.now(), date, skill, xp, minutes, note, type, ref };
    S.logs.push(log); save();
    if (xp) xpPop(`+${xp} XP`, ev);
    sfx("coin");
    const after = levelFrom(totalXP()).lvl;
    if (after > before) levelUp(after);
    renderAll();
    return log;
  }
  function removeLog(id) { S.logs = S.logs.filter(l => l.id !== id); save(); renderAll(); }

  /* ---------------- FX ---------------- */
  let actx;
  function sfx(kind) {
    if (!S.profile.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = { coin: [988, 1319], up: [523, 659, 784, 1047, 1319], click: [660], bad: [200, 150], done: [784, 1047] }[kind] || [660];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = "square"; o.frequency.value = f;
        const t = actx.currentTime + i * 0.08;
        g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 0.13);
      });
    } catch {}
  }
  function toast(msg) {
    const t = document.createElement("div"); t.className = "toast"; t.textContent = msg;
    $("#toasts").appendChild(t); setTimeout(() => t.remove(), 2700);
  }
  function xpPop(text, ev) {
    const p = document.createElement("div"); p.className = "xp-pop"; p.textContent = text;
    const x = ev?.clientX ?? innerWidth / 2, y = ev?.clientY ?? innerHeight / 2;
    p.style.left = x + "px"; p.style.top = y + "px"; document.body.appendChild(p); setTimeout(() => p.remove(), 1100);
  }
  function levelUp(lvl) {
    sfx("up"); $("#levelUpText").textContent = `Ahora eres nivel ${lvl} ✨`;
    const el = $("#levelUp"); el.hidden = false; confetti();
    setTimeout(() => (el.hidden = true), 2200); el.onclick = () => (el.hidden = true);
  }
  function confetti() {
    const cs = getComputedStyle(document.documentElement);
    const cols = [cs.getPropertyValue("--accent"), cs.getPropertyValue("--accent2"), cs.getPropertyValue("--ok")];
    for (let i = 0; i < 60; i++) {
      const c = document.createElement("div");
      c.style.cssText = `position:fixed;z-index:210;width:8px;height:8px;left:${Math.random() * 100}vw;top:-10px;background:${cols[i % 3]};pointer-events:none;transition:transform ${1 + Math.random() * 1.5}s linear,opacity 2s`;
      document.body.appendChild(c);
      requestAnimationFrame(() => { c.style.transform = `translate(${(Math.random() - .5) * 200}px, ${innerHeight + 20}px) rotate(${Math.random() * 720}deg)`; c.style.opacity = "0.2"; });
      setTimeout(() => c.remove(), 2600);
    }
  }

  /* starfield */
  const cv = $("#stars"), cx = cv.getContext("2d"); let stars = [];
  function sizeStars() { cv.width = innerWidth; cv.height = innerHeight; stars = Array.from({ length: 90 }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, s: Math.random() * 2 + .5, v: Math.random() * .4 + .1 })); }
  function drawStars() {
    if (S.profile.fx && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const theme = document.documentElement.dataset.theme;
      cx.clearRect(0, 0, cv.width, cv.height);
      const sakura = theme === "sakura", light = ["sakura", "shonen", "gameboy", "rpg"].includes(theme);
      if (!light || sakura) {
        stars.forEach(st => {
          st.y += st.v * (sakura ? 1.5 : 1); if (sakura) st.x += Math.sin(st.y / 40) * .5;
          if (st.y > cv.height) { st.y = -5; st.x = Math.random() * cv.width; }
          if (sakura) { cx.fillStyle = "#ffb3cf"; cx.beginPath(); cx.ellipse(st.x, st.y, st.s * 2.4, st.s * 1.4, st.y / 30, 0, 7); cx.fill(); }
          else { cx.fillStyle = theme === "cyber" ? "#00f0ff" : theme === "vapor" ? "#ff71ce" : "#ffffff"; cx.fillRect(st.x, st.y, st.s, st.s); }
        });
      }
    }
    requestAnimationFrame(drawStars);
  }

  /* ---------------- THEME / PROFILE ---------------- */
  function applyTheme() {
    document.documentElement.dataset.theme = S.profile.theme;
    $("#themeSelect").value = S.profile.theme;
    document.body.classList.toggle("nofx", !S.profile.fx);
    const bg = getComputedStyle(document.documentElement).getPropertyValue("--bg2").trim();
    $('meta[name="theme-color"]').setAttribute("content", bg || "#0b0b1e");
  }
  $("#themeSelect").addEventListener("change", e => { S.profile.theme = e.target.value; save(); applyTheme(); sfx("click"); renderCharts(); toast("🎨 Tema: " + e.target.selectedOptions[0].text); });
  const AVATARS = ["🧙", "🦸", "🥷", "🧝", "🧛", "🤖", "👾", "🐉", "🦊", "🐱", "🐼", "🧑‍🚀", "⚡", "🌸", "👑"];
  $("#avatarBtn").onclick = () => { const i = (AVATARS.indexOf(S.profile.avatar) + 1) % AVATARS.length; S.profile.avatar = AVATARS[i]; save(); renderHUD(); sfx("click"); };

  /* ---------------- TABS ---------------- */
  function showTab(name) {
    $$(".tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    $$(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
    try { localStorage.setItem(KEY + ".tab", name); } catch {}
    renderCharts(); if (name === "ai") renderCtx();
    scrollTo({ top: 0, behavior: "smooth" });
  }
  $("#tabs").addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (b) { sfx("click"); showTab(b.dataset.tab); } });

  /* ---------------- HUD ---------------- */
  function renderHUD() {
    const xp = totalXP(), L = levelFrom(xp);
    $("#lvlNum").textContent = L.lvl;
    $("#xpFill").style.width = (L.cur / L.need * 100) + "%";
    $("#xpText").textContent = `${L.cur} / ${L.need} XP`;
    $("#heroName").textContent = S.profile.name;
    $("#heroClass").textContent = S.profile.cls;
    $("#avatarBtn").textContent = S.profile.avatar;
    $("#spriteChar").textContent = S.profile.avatar;
    $("#streakNum").textContent = streak();
    $("#coinNum").textContent = Math.max(0, Math.floor(xp / 10) - S.spent);
  }

  /* ---------------- HOME ---------------- */
  const dayHash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  function renderHome() {
    const now = new Date();
    $("#todayLabel").textContent = now.toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    $("#quote").textContent = D.quotes[dayHash(today()) % D.quotes.length];
    // quests
    const done = S.questDone[today()] || [];
    $("#questList").innerHTML = S.quests.map(q => {
      const sk = skillById(q.skill), isDone = done.includes(q.id);
      return `<li data-q="${q.id}" class="${isDone ? "done" : ""}"><span class="box">${isDone ? "✓" : ""}</span><span>${sk.icon}</span><span class="txt">${esc(q.text)}</span><span class="xp">+${q.xp}</span></li>`;
    }).join("");
    $("#questProgress").textContent = `${done.length}/${S.quests.length} completadas`;
    // skills
    $("#skillBars").innerHTML = D.skills.map(s => {
      const L = levelFrom(skillXP(s.id), 50, 25);
      return `<div class="skill" style="--c:${s.color}"><div class="skill-head"><span>${s.icon} ${s.name}</span><b>LV ${L.lvl}</b></div>
        <div class="bar"><div class="fill" style="width:${L.cur / L.need * 100}%"></div></div></div>`;
    }).join("");
    // water
    const ml = S.water[today()] || 0, goal = S.profile.goals.water, cups = Math.ceil(goal / 250);
    $("#waterView").innerHTML = Array.from({ length: cups }, (_, i) => `<span class="${i < ml / 250 ? "on" : ""}">💧</span>`).join("") + `<div class="small" style="width:100%">${ml} / ${goal} ml</div>`;
    renderHeatmap(); renderRecent(); renderRift();
  }
  $("#questList").addEventListener("click", e => {
    const li = e.target.closest("li[data-q]"); if (!li) return;
    const id = li.dataset.q, q = S.quests.find(x => x.id === id); if (!q) return;
    const t = today(), arr = S.questDone[t] = S.questDone[t] || [];
    if (arr.includes(id)) {
      S.questDone[t] = arr.filter(x => x !== id);
      const lg = [...S.logs].reverse().find(l => l.type === "quest" && l.ref === id && l.date === t);
      if (lg) removeLog(lg.id); else { save(); renderAll(); }
    } else {
      arr.push(id);
      addLog({ skill: q.skill, xp: q.xp, note: "Misión: " + q.text, type: "quest", ref: id }, e);
      if (S.questDone[t].length === S.quests.length) { toast("🎯 ¡Todas las misiones completadas! +50 XP bonus"); addLog({ skill: "mind", xp: 50, note: "Bonus día perfecto", type: "bonus" }); confetti(); }
    }
  });
  function rollSide() { const i = Math.floor(Math.random() * D.sideQuests.length); $("#sideQuest").textContent = D.sideQuests[i]; }
  $("#rollSideBtn").onclick = () => { rollSide(); sfx("click"); };
  $("#doneSideBtn").onclick = e => { S.sideDone++; addLog({ skill: "learn", xp: 20, note: "Side quest: " + $("#sideQuest").textContent, type: "side" }, e); rollSide(); };
  $$("[data-water]").forEach(b => b.onclick = e => {
    const v = +b.dataset.water, t = today(); S.water[t] = Math.max(0, (S.water[t] || 0) + v); save();
    if (v > 0) addLog({ skill: "food", xp: Math.round(v / 125), note: `Agua +${v} ml`, type: "water" }, e); else renderAll();
  });

  function renderRift() {
    try {
      const m = JSON.parse(localStorage.getItem("riftvolt.meta.v1") || "null"), n = JSON.parse(localStorage.getItem("riftvolt.nexus.v1") || "null");
      if (!m) return;
      const done = (S.questDone[today()] || []).length, tot = S.quests.length;
      const bonus = done >= tot ? "🌟 Bonus activo: +1 ♥ y +1 re-tirada" : done >= tot / 2 ? "✨ Bonus activo: +1 re-tirada" : `Completa ${Math.ceil(tot / 2) - done} misión(es) más para activar bonus`;
      $("#riftStats").innerHTML = `Runs: <b>${m.runs}</b> · Eliminaciones: <b>${m.kills}</b> · Villanos vencidos: <b>${Object.keys(m.bosses || {}).length}</b> · Récord: <b>${m.highScore}</b><br>
        NEXUS: rating <b>${n ? Math.round(n.skill) : "—"}</b> · piso de entropía <b>${n ? Math.round(n.floor) : "—"}</b><br>${bonus}`;
    } catch {}
  }
  function renderHeatmap() {
    const weeks = 20, end = new Date(), start = addDays(end, -(weeks * 7 - 1) - end.getDay());
    let html = ""; const t = today();
    for (let d = new Date(start); dkey(d) <= t; d = addDays(d, 1)) {
      const k = dkey(d), xp = xpOnDay(k);
      const lv = xp === 0 ? 0 : xp < 40 ? 1 : xp < 90 ? 2 : xp < 160 ? 3 : 4;
      html += `<i class="l${lv}${k === t ? " today" : ""}" title="${k}: ${xp} XP"></i>`;
    }
    $("#heatmap").innerHTML = html;
  }
  function renderRecent() {
    const items = [...S.logs].sort((a, b) => b.ts - a.ts).slice(0, 25);
    $("#recentLog").innerHTML = items.length ? items.map(l => {
      const s = skillById(l.skill), dt = new Date(l.ts);
      return `<li><span>${s.icon}</span><span>${esc(l.note || s.name)}${l.minutes ? ` · ${l.minutes} min` : ""}</span>
        <span class="t">${l.date === today() ? dt.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" }) : l.date}</span>
        <span class="x">+${l.xp}</span><button data-del="${l.id}" title="Borrar">✕</button></li>`;
    }).join("") : `<li class="small">Aún no hay registros. Pulsa ⚡ para empezar tu aventura.</li>`;
  }
  $("#recentLog").addEventListener("click", e => { const b = e.target.closest("[data-del]"); if (b && confirm("¿Borrar este registro?")) removeLog(b.dataset.del); });

  /* ---------------- POMODORO ---------------- */
  let pomoLen = 25 * 60, pomoLeft = pomoLen, pomoTimer = null;
  const fmt = s => `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
  $("#pomoSkill").innerHTML = D.skills.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join("");
  $("#pomoSkill").value = "emt";
  function pomoTick() {
    pomoLeft--; $("#pomoTime").textContent = fmt(pomoLeft); document.title = `${fmt(pomoLeft)} · Life Quest`;
    if (pomoLeft <= 0) {
      clearInterval(pomoTimer); pomoTimer = null; $("#pomoStart").textContent = "▶ Start"; document.title = "Life Quest";
      const min = Math.round(pomoLen / 60), sk = $("#pomoSkill").value;
      addLog({ skill: sk, xp: min, minutes: min, note: `Pomodoro ${min} min`, type: "pomo" });
      sfx("up"); toast("⏰ ¡Pomodoro completado!"); pomoLeft = pomoLen; $("#pomoTime").textContent = fmt(pomoLeft);
      try { if (Notification?.permission === "granted") new Notification("Life Quest", { body: "¡Pomodoro completado! Tómate un descanso." }); } catch {}
    }
  }
  $("#pomoStart").onclick = () => {
    if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; $("#pomoStart").textContent = "▶ Start"; }
    else { try { Notification?.permission === "default" && Notification.requestPermission(); } catch {} pomoTimer = setInterval(pomoTick, 1000); $("#pomoStart").textContent = "⏸ Pausa"; }
    sfx("click");
  };
  $("#pomoReset").onclick = () => { clearInterval(pomoTimer); pomoTimer = null; pomoLeft = pomoLen; $("#pomoTime").textContent = fmt(pomoLeft); $("#pomoStart").textContent = "▶ Start"; document.title = "Life Quest"; };
  $$("[data-pomo]").forEach(b => b.onclick = () => { pomoLen = +b.dataset.pomo * 60; $("#pomoReset").click(); });

  /* ---------------- QUICK LOG ---------------- */
  $("#quickGrid").innerHTML = D.quickActions.map((a, i) => `<button type="button" data-qa="${i}"><span class="e">${a.icon}</span>${esc(a.label)}<small>+${a.xp} XP</small></button>`).join("");
  $("#quickGrid").addEventListener("click", e => {
    const b = e.target.closest("[data-qa]"); if (!b) return;
    const a = D.quickActions[+b.dataset.qa];
    if (a.water) { S.water[today()] = (S.water[today()] || 0) + a.water; }
    addLog({ skill: a.skill, xp: a.xp, minutes: a.minutes, note: a.label, type: "quick" }, e);
    toast(`${a.icon} ${a.label} registrado`);
  });
  const skillOpts = D.skills.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join("");
  $("#customSkill").innerHTML = skillOpts; $("#newQuestSkill").innerHTML = skillOpts;
  $("#customLogBtn").onclick = e => {
    const min = +$("#customMin").value || 0, note = $("#customNote").value.trim();
    addLog({ skill: $("#customSkill").value, xp: Math.max(5, Math.round(min * 0.8)), minutes: min, note: note || "Registro libre", type: "custom" }, e);
    $("#customMin").value = ""; $("#customNote").value = ""; toast("✅ Registrado");
  };
  const openQuick = () => { $("#quickDialog").showModal(); sfx("click"); };
  $("#fab").onclick = openQuick;
  document.addEventListener("keydown", e => {
    if (e.key.toLowerCase() === "q" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) && !$("#quickDialog").open) { e.preventDefault(); openQuick(); }
  });
  $("#quickDialog").addEventListener("click", e => { if (e.target === $("#quickDialog")) $("#quickDialog").close(); });

  /* ---------------- GYM ---------------- */
  $("#routineSelect").innerHTML = Object.keys(D.routines).map(r => `<option>${r}</option>`).join("") + `<option value="__custom">Personalizada</option>`;
  function exRow(name = "", sets = 3, reps = 10, w = "") {
    const d = document.createElement("div"); d.className = "ex-row";
    d.innerHTML = `<input class="ex-n" value="${esc(name)}" placeholder="Ejercicio"><input class="ex-s" type="number" value="${sets}" title="Series"><input class="ex-r" type="number" value="${reps}" title="Reps"><input class="ex-w" type="number" step="0.5" value="${w}" placeholder="kg" title="Peso kg"><button title="Quitar">✕</button>`;
    d.querySelector("button").onclick = () => d.remove(); return d;
  }
  function loadRoutine() {
    const r = $("#routineSelect").value, box = $("#exerciseRows");
    box.innerHTML = `<div class="ex-row ex-head"><span>Ejercicio</span><span>Series</span><span>Reps</span><span>kg</span><span></span></div>`;
    (D.routines[r] || ["", "", ""]).forEach(n => {
      const last = lastWeight(n); box.appendChild(exRow(n, 3, 10, last ?? ""));
    });
  }
  const lastWeight = name => { for (let i = S.workouts.length - 1; i >= 0; i--) { const e = S.workouts[i].exercises.find(x => x.name === name && x.weight); if (e) return e.weight; } return null; };
  $("#routineSelect").onchange = loadRoutine;
  $("#addExerciseBtn").onclick = () => $("#exerciseRows").appendChild(exRow());
  $("#saveWorkoutBtn").onclick = e => {
    const exercises = $$("#exerciseRows .ex-row:not(.ex-head)").map(r => ({
      name: $(".ex-n", r).value.trim(), sets: +$(".ex-s", r).value || 0, reps: +$(".ex-r", r).value || 0, weight: +$(".ex-w", r).value || 0
    })).filter(x => x.name);
    if (!exercises.length) return toast("Añade al menos un ejercicio");
    const min = +$("#workoutMin").value || 0, routine = $("#routineSelect").value;
    const prsBefore = prMap();
    const w = { id: uid(), date: today(), routine: routine === "__custom" ? "Personalizada" : routine, exercises, minutes: min, notes: $("#workoutNotes").value.trim() };
    S.workouts.push(w);
    const newPRs = exercises.filter(x => x.weight && x.weight > (prsBefore[x.name]?.weight || 0) && prsBefore[x.name]);
    const vol = exercises.reduce((a, x) => a + x.sets * x.reps * x.weight, 0);
    addLog({ skill: "gym", xp: 40 + newPRs.length * 15, minutes: min, note: `Gym: ${w.routine} (${Math.round(vol)} kg vol.)`, type: "workout", ref: w.id }, e);
    newPRs.forEach(p => toast(`🏅 ¡Nuevo PR en ${p.name}: ${p.weight} kg!`));
    $("#workoutNotes").value = ""; loadRoutine();
  };
  function prMap() {
    const m = {};
    S.workouts.forEach(w => w.exercises.forEach(x => { if (x.weight && (!m[x.name] || x.weight > m[x.name].weight)) m[x.name] = { weight: x.weight, reps: x.reps, date: w.date }; }));
    return m;
  }
  function renderGym() {
    const prs = prMap(), names = Object.keys(prs).sort();
    $("#prTable").innerHTML = names.length ? `<tr><th>Ejercicio</th><th>PR</th><th>1RM est.</th><th>Fecha</th></tr>` +
      names.map(n => `<tr><td>${esc(n)}</td><td>${prs[n].weight} kg × ${prs[n].reps}</td><td>${Math.round(prs[n].weight * (1 + prs[n].reps / 30))} kg</td><td>${prs[n].date}</td></tr>`).join("")
      : `<tr><td class="small">Registra entrenamientos con peso para ver tus PRs.</td></tr>`;
    const sel = $("#prChartSelect"), prev = sel.value;
    sel.innerHTML = names.map(n => `<option>${esc(n)}</option>`).join(""); if (names.includes(prev)) sel.value = prev;
    $("#workoutHistory").innerHTML = S.workouts.length ? [...S.workouts].reverse().slice(0, 30).map(w => `
      <details class="workout"><summary><b>${w.date}</b> · ${esc(w.routine)} · ${w.minutes} min · ${w.exercises.length} ejercicios</summary>
      <table class="table">${w.exercises.map(x => `<tr><td>${esc(x.name)}</td><td>${x.sets}×${x.reps}</td><td>${x.weight || "-"} kg</td></tr>`).join("")}</table>
      ${w.notes ? `<p class="small">📝 ${esc(w.notes)}</p>` : ""}<button class="btn ghost" data-delw="${w.id}">🗑️ Borrar</button></details>`).join("")
      : `<p class="small">Sin entrenamientos aún. ¡El primer paso es el más importante!</p>`;
  }
  $("#prChartSelect").onchange = () => renderCharts();
  $("#workoutHistory").addEventListener("click", e => {
    const b = e.target.closest("[data-delw]"); if (!b || !confirm("¿Borrar entrenamiento?")) return;
    S.workouts = S.workouts.filter(w => w.id !== b.dataset.delw); S.logs = S.logs.filter(l => l.ref !== b.dataset.delw); save(); renderAll();
  });
  $("#saveWeightBtn").onclick = e => {
    const kg = +$("#bodyWeight").value; if (!kg) return;
    S.weights = S.weights.filter(w => w.date !== today()); S.weights.push({ date: today(), kg }); S.weights.sort((a, b) => a.date.localeCompare(b.date));
    addLog({ skill: "mind", xp: 5, note: `Peso: ${kg} kg`, type: "weight" }, e); $("#bodyWeight").value = "";
  };

  /* ---------------- FRENCH ---------------- */
  const allCards = () => [...D.frenchCards, ...S.customCards];
  let curCard = null;
  function nextCard() {
    const t = today(), cards = allCards();
    const due = cards.filter(c => !S.cards[c[0]] || S.cards[c[0]].due <= t);
    const pool = due.length ? due : cards;
    // prioritize seen-but-due, then new
    pool.sort((a, b) => (S.cards[a[0]]?.box ?? 99) - (S.cards[b[0]]?.box ?? 99));
    curCard = pool[Math.floor(Math.random() * Math.min(pool.length, 8))];
    $("#flash").classList.remove("flipped");
    $("#flashFront").textContent = curCard[0]; $("#flashBack").textContent = curCard[1];
    const learned = cards.filter(c => (S.cards[c[0]]?.box || 0) >= 3).length;
    $("#flashStats").textContent = `Pendientes hoy: ${due.length} · Dominadas: ${learned}/${cards.length} · Repasos totales: ${S.cardsReviewed}`;
  }
  $("#flash").onclick = $("#flipBtn").onclick = () => { $("#flash").classList.toggle("flipped"); sfx("click"); };
  $$("[data-grade]").forEach(b => b.onclick = e => {
    if (!curCard) return;
    const g = +b.dataset.grade, st = S.cards[curCard[0]] || { box: 0 };
    st.box = g === 0 ? 0 : g === 1 ? Math.max(1, st.box) : st.box + 1;
    const interval = [0, 1, 3, 7, 14, 30, 60][Math.min(st.box, 6)];
    st.due = dkey(addDays(new Date(), interval)); S.cards[curCard[0]] = st; S.cardsReviewed++;
    if (S.cardsReviewed % 10 === 0) addLog({ skill: "french", xp: 10, minutes: 3, note: "10 flashcards repasadas", type: "cards" }, e);
    else { save(); sfx(g ? "done" : "bad"); }
    nextCard();
  });
  function speak(text) {
    try { const u = new SpeechSynthesisUtterance(text); u.lang = "fr-FR"; u.rate = .9; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch { toast("Tu navegador no soporta voz"); }
  }
  $("#speakBtn").onclick = () => curCard && speak(curCard[0]);
  $("#speakPhraseBtn").onclick = () => speak($("#phrase").textContent.split("—")[0]);
  $("#addCardBtn").onclick = () => {
    const fr = $("#newFr").value.trim(), es = $("#newEs").value.trim(); if (!fr || !es) return;
    S.customCards.push([fr, es]); save(); $("#newFr").value = $("#newEs").value = ""; toast("🃏 Tarjeta añadida"); nextCard();
  };
  $$("[data-fr]").forEach(b => b.onclick = e => {
    const m = +b.dataset.fr; addLog({ skill: "french", xp: m, minutes: m, note: `Francés: ${$("#frActivity").value}`, type: "french" }, e);
  });

  function renderRoad(container, groups, doneMap, skill, xp) {
    container.innerHTML = groups.map(g => {
      const n = g.items.filter(i => doneMap[i]).length;
      return `<div class="road-group"><h3>${esc(g.group)} · ${n}/${g.items.length}</h3>
        <div class="bar road-meter"><div class="fill" style="width:${n / g.items.length * 100}%"></div></div>
        ${g.items.map(i => `<div class="node ${doneMap[i] ? "done" : ""}" data-node="${esc(i)}"><span class="dot"></span><span>${esc(i)}</span></div>`).join("")}</div>`;
    }).join("");
    container.onclick = e => {
      const n = e.target.closest("[data-node]"); if (!n) return;
      const k = n.dataset.node;
      if (doneMap[k]) { delete doneMap[k]; const lg = S.logs.find(l => l.type === "node" && l.ref === k); if (lg) removeLog(lg.id); else { save(); renderAll(); } }
      else { doneMap[k] = today(); addLog({ skill, xp, note: "Dominado: " + k, type: "node", ref: k }, e); toast("🌟 Nodo desbloqueado"); }
    };
  }
  function renderFrench() {
    $("#phrase").textContent = D.frenchPhrases[dayHash(today()) % D.frenchPhrases.length];
    $("#frMinutes").textContent = minutesBy("french");
    renderRoad($("#frRoad"), D.frenchRoadmap, S.frDone, "french", 30);
  }

  /* ---------------- EMT ---------------- */
  function renderEMT() {
    renderRoad($("#emtRoad"), D.emtRoadmap, S.emtDone, "emt", 40);
    renderRoad($("#resRoad"), D.researchRoadmap, S.resDone, "research", 40);
    $("#resHours").textContent = (minutesBy("research") / 60).toFixed(1);
    const total = D.emtRoadmap.reduce((a, g) => a + g.items.length, 0), n = Object.keys(S.emtDone).length;
    const pct = Math.round(n / total * 100); $("#emtRing").style.setProperty("--p", pct); $("#emtPct").textContent = pct + "%";
    $("#emtHours").textContent = (minutesBy("emt") / 60).toFixed(1);
    $("#emtLog").innerHTML = S.emtSessions.length ? [...S.emtSessions].reverse().slice(0, 40).map(s =>
      `<div class="journal-entry"><b>${s.date}</b> · ${esc(s.type)} · ${s.minutes} min — <b>${esc(s.topic)}</b>${s.note ? "\n" + esc(s.note) : ""}</div>`).join("")
      : `<p class="small">Tu bitácora técnica aparecerá aquí. Ideal para tu yo del futuro (y para reportes).</p>`;
  }
  $("#saveEmtBtn").onclick = e => {
    const topic = $("#emtTopic").value.trim() || "Estudio EMT", minutes = +$("#emtMin").value || 0;
    const s = { id: uid(), date: today(), topic, minutes, type: $("#emtType").value, note: $("#emtNote").value.trim() };
    S.emtSessions.push(s);
    addLog({ skill: "emt", xp: Math.max(10, Math.round(minutes * 0.85)), minutes, note: `EMT: ${topic}`, type: "emt", ref: s.id }, e);
    $("#emtTopic").value = ""; $("#emtNote").value = "";
  };

  /* ---------------- FOOD ---------------- */
  function renderFood() {
    const t = today(), meals = S.meals.filter(m => m.date === t), g = S.profile.goals;
    const prot = meals.reduce((a, m) => a + m.prot, 0), kcal = meals.reduce((a, m) => a + m.kcal, 0), ml = S.water[t] || 0;
    $("#protFill").style.width = Math.min(100, prot / g.prot * 100) + "%"; $("#protText").textContent = `${prot} / ${g.prot} g`;
    $("#kcalFill").style.width = Math.min(100, kcal / g.kcal * 100) + "%"; $("#kcalText").textContent = `${kcal} / ${g.kcal} kcal`;
    $("#waterFill").style.width = Math.min(100, ml / g.water * 100) + "%"; $("#waterText").textContent = `${ml} / ${g.water} ml`;
    $("#mealsToday").innerHTML = meals.length ? meals.map(m => `<li><span>${["", "🔴", "🟡", "🟢"][m.q]}</span><span><b>${esc(m.type)}</b>: ${esc(m.text)}</span><span class="x">${m.prot}g · ${m.kcal}kcal</span><button data-delm="${m.id}">✕</button></li>`).join("")
      : `<li class="small">Nada registrado hoy.</li>`;
  }
  $("#saveMealBtn").onclick = e => {
    const text = $("#mealText").value.trim(); if (!text) return toast("Escribe qué comiste");
    const m = { id: uid(), date: today(), type: $("#mealType").value, text, prot: +$("#mealProt").value || 0, kcal: +$("#mealKcal").value || 0, q: +$("#mealQuality").value };
    S.meals.push(m);
    addLog({ skill: "food", xp: 5 + m.q * 3 + (m.prot >= 30 ? 5 : 0), note: `${m.type}: ${text}`, type: "meal", ref: m.id }, e);
    $("#mealText").value = ""; $("#mealProt").value = 0; $("#mealKcal").value = 0;
  };
  $("#mealsToday").addEventListener("click", e => {
    const b = e.target.closest("[data-delm]"); if (!b) return;
    S.meals = S.meals.filter(m => m.id !== b.dataset.delm); S.logs = S.logs.filter(l => l.ref !== b.dataset.delm); save(); renderAll();
  });

  /* ---------------- JOURNAL ---------------- */
  let mood = 3;
  $("#moodPick").addEventListener("click", e => { const b = e.target.closest("[data-mood]"); if (!b) return; mood = +b.dataset.mood; $$("#moodPick button").forEach(x => x.classList.toggle("sel", x === b)); sfx("click"); });
  function loadJournalForm() {
    const j = S.journal[today()];
    mood = j?.mood || 3; $$("#moodPick button").forEach(x => x.classList.toggle("sel", +x.dataset.mood === mood));
    $("#sleepH").value = j?.sleep ?? 7; $("#energy").value = j?.energy ?? 3;
    $("#gratitude").value = j?.gratitude || ""; $("#journalText").value = j?.text || ""; $("#tomorrow").value = j?.tomorrow || "";
  }
  $("#saveJournalBtn").onclick = e => {
    const first = !S.journal[today()];
    S.journal[today()] = { mood, sleep: +$("#sleepH").value, energy: +$("#energy").value, gratitude: $("#gratitude").value, text: $("#journalText").value, tomorrow: $("#tomorrow").value };
    if (first) addLog({ skill: "mind", xp: 20, note: "Entrada de diario", type: "journal" }, e); else { save(); renderAll(); }
    toast("📓 Diario guardado");
  };
  function renderJournal() {
    const keys = Object.keys(S.journal).sort().reverse();
    $("#journalList").innerHTML = keys.length ? keys.slice(0, 30).map(k => { const j = S.journal[k];
      return `<div class="journal-entry"><b>${k}</b> ${["", "😫", "😕", "😐", "🙂", "🤩"][j.mood]} · 💤 ${j.sleep}h · ⚡ ${j.energy}/5
${j.gratitude ? "🙏 " + esc(j.gratitude) + "\n" : ""}${esc(j.text)}${j.tomorrow ? "\n➡️ Mañana: " + esc(j.tomorrow) : ""}</div>`; }).join("")
      : `<p class="small">Aún no hay entradas.</p>`;
  }

  /* ---------------- STATS ---------------- */
  function statsObj() {
    const t = today();
    const perfectDays = Object.entries(S.questDone).filter(([, a]) => a.length >= S.quests.length && S.quests.length).length;
    return { totalLogs: S.logs.length, level: levelFrom(totalXP()).lvl, streak: streak(), workouts: S.workouts.length, cardsReviewed: S.cardsReviewed,
      minutes: Object.fromEntries(D.skills.map(s => [s.id, minutesBy(s.id)])), emtDone: Object.keys(S.emtDone).length, resDone: Object.keys(S.resDone).length,
      waterToday: S.water[t] || 0, perfectDays, journals: Object.keys(S.journal).length };
  }
  function renderStats() {
    const st = statsObj(), xp = totalXP();
    const tiles = [
      ["⭐", "Nivel", st.level], ["✨", "XP total", xp], ["🔥", "Racha", st.streak + " d"], ["🏋️", "Entrenos", st.workouts],
      ["🥐", "Francés", (st.minutes.french / 60).toFixed(1) + " h"], ["⚡", "EMT", (st.minutes.emt / 60).toFixed(1) + " h"],
      ["🃏", "Flashcards", st.cardsReviewed], ["📓", "Diarios", st.journals]
    ];
    $("#statTiles").innerHTML = tiles.map(([i, l, v]) => `<div class="card tile"><div>${i}</div><div class="v">${v}</div><div class="small">${l}</div></div>`).join("");
  }

  /* ---------------- TROPHIES & SHOP ---------------- */
  function checkAchievements() {
    const st = statsObj(); let changed = false;
    D.achievements.forEach(a => { if (!S.unlocked[a.id] && a.test(st)) { S.unlocked[a.id] = today(); changed = true; toast(`🏆 Logro: ${a.name}`); sfx("up"); } });
    if (changed) save();
  }
  function renderTrophies() {
    $("#trophyGrid").innerHTML = D.achievements.map(a => `<div class="trophy ${S.unlocked[a.id] ? "got" : ""}"><div class="i">${a.icon}</div><b>${a.name}</b><div class="small">${a.desc}</div>${S.unlocked[a.id] ? `<div class="small">✔ ${S.unlocked[a.id]}</div>` : ""}</div>`).join("");
    $("#shop").innerHTML = S.rewards.map((r, i) => `<div class="reward"><span>${esc(r.name)}</span><span>🪙 ${r.cost}</span><button class="btn" data-buy="${i}">Canjear</button><button class="btn ghost" data-rmr="${i}">✕</button></div>`).join("");
  }
  $("#shop").addEventListener("click", e => {
    const b = e.target.closest("[data-buy]"), r = e.target.closest("[data-rmr]");
    if (b) { const rw = S.rewards[+b.dataset.buy], coins = Math.floor(totalXP() / 10) - S.spent;
      if (coins < rw.cost) { sfx("bad"); return toast("🪙 Monedas insuficientes"); }
      S.spent += rw.cost; save(); sfx("up"); confetti(); toast(`🎁 ¡Disfruta: ${rw.name}!`); renderAll(); }
    if (r) { S.rewards.splice(+r.dataset.rmr, 1); save(); renderAll(); }
  });
  $("#addRewardBtn").onclick = () => { const n = $("#rewardName").value.trim(), c = +$("#rewardCost").value; if (!n || !c) return; S.rewards.push({ name: n, cost: c }); $("#rewardName").value = $("#rewardCost").value = ""; save(); renderAll(); };

  /* ---------------- AI ORACLE ---------------- */
  function buildContext() {
    const st = statsObj(), L = levelFrom(totalXP());
    const last7 = dkey(addDays(new Date(), -6));
    const recent = S.logs.filter(l => l.date >= last7);
    const bySkill = D.skills.map(s => `- ${s.name}: ${recent.filter(l => l.skill === s.id).reduce((a, l) => a + l.minutes, 0)} min, ${recent.filter(l => l.skill === s.id).length} registros (nivel ${levelFrom(skillXP(s.id), 50, 25).lvl})`).join("\n");
    const wk = S.workouts.filter(w => w.date >= last7).map(w => `- ${w.date} ${w.routine}: ${w.exercises.map(x => `${x.name} ${x.sets}x${x.reps}@${x.weight}kg`).join(", ")}`).join("\n") || "- (ninguno)";
    const prs = Object.entries(prMap()).slice(0, 12).map(([n, p]) => `${n} ${p.weight}kg×${p.reps}`).join("; ") || "(sin datos)";
    const meals = S.meals.filter(m => m.date >= last7).slice(-15).map(m => `- ${m.date} ${m.type}: ${m.text} (${m.prot}g prot, ${m.kcal} kcal)`).join("\n") || "- (ninguna)";
    const emtDone = Object.keys(S.emtDone); const emtSess = S.emtSessions.slice(-6).map(s => `- ${s.date} ${s.topic} (${s.minutes} min)${s.note ? ": " + s.note.slice(0, 120) : ""}`).join("\n") || "- (ninguna)";
    const frDone = Object.keys(S.frDone);
    const jr = Object.keys(S.journal).sort().slice(-5).map(k => `- ${k}: ánimo ${S.journal[k].mood}/5, sueño ${S.journal[k].sleep}h, energía ${S.journal[k].energy}/5`).join("\n") || "- (sin entradas)";
    const pendingQ = S.quests.filter(q => !(S.questDone[today()] || []).includes(q.id)).map(q => q.text).join("; ");
    return `## Contexto de mi tracker "Life Quest" (${today()})
Perfil: ${S.profile.name}, ingeniero/a de sistemas de potencia en Edmonton (University of Alberta). Consultoría de estudios EMT (transitorios electromagnéticos) para centros de datos. Investigación en aprendizaje por refuerzo (Maskable PPO) para restauración de cargas críticas con almacenamiento grid-forming (IEEE 123-bus). Francés nivel A1-A2. Entreno en gym (fuerza). Metas diarias: ${S.profile.goals.prot} g proteína, ${S.profile.goals.kcal} kcal, ${S.profile.goals.water} ml agua.
Nivel global ${L.lvl}, XP total ${totalXP()}, racha ${st.streak} días.

### Últimos 7 días por área
${bySkill}

### Entrenamientos (7 días)
${wk}
PRs: ${prs}

### Comidas recientes
${meals}

### EMT
Temas dominados (${emtDone.length}): ${emtDone.join("; ") || "ninguno"}
Sesiones recientes:
${emtSess}

### Investigación (RL)
Horas: ${(minutesBy("research") / 60).toFixed(1)}. Hitos completados: ${Object.keys(S.resDone).join("; ") || "ninguno"}

### Francés
Minutos totales: ${st.minutes.french}. Flashcards repasadas: ${S.cardsReviewed}. Temas completados: ${frDone.join("; ") || "ninguno"}

### Bienestar
${jr}

Misiones pendientes hoy: ${pendingQ || "ninguna 🎉"}`;
  }
  function renderCtx() { $("#ctxPreview").textContent = buildContext(); }
  $("#promptChips").innerHTML = D.llmPrompts.map((p, i) => `<button data-p="${i}">${esc(p.label)}</button>`).join("");
  $("#promptChips").addEventListener("click", e => { const b = e.target.closest("[data-p]"); if (b) { $("#aiQuestion").value = D.llmPrompts[+b.dataset.p].text; sfx("click"); } });
  function fullPrompt() {
    const q = $("#aiQuestion").value.trim() || "Analiza mi progreso y dime en qué enfocarme.";
    return $("#aiIncludeCtx").checked ? `${buildContext()}\n\n---\n## Mi pregunta\n${q}\n\nResponde en español, de forma concreta y motivadora.` : q;
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch {} ta.remove(); return ok; }
  }
  $("#askClaudeBtn").onclick = async () => {
    const p = fullPrompt(); await copy(p);
    const url = "https://claude.ai/new?q=" + encodeURIComponent(p.length > 6000 ? p.slice(0, 6000) : p);
    window.open(url, "_blank", "noopener");
    toast("🔮 Prompt copiado. Si no aparece en Claude, pega con Ctrl/Cmd+V");
  };
  $("#copyCtxBtn").onclick = async () => { toast((await copy(fullPrompt())) ? "📋 Copiado al portapapeles" : "No se pudo copiar"); };

  /* ---------------- SETTINGS ---------------- */
  function renderSettings() {
    $("#setName").value = S.profile.name; $("#setClass").value = S.profile.cls;
    $("#setProt").value = S.profile.goals.prot; $("#setKcal").value = S.profile.goals.kcal; $("#setWater").value = S.profile.goals.water;
    $("#setSound").checked = S.profile.sound; $("#setFx").checked = S.profile.fx;
    $("#avatarPick").innerHTML = AVATARS.map(a => `<button type="button" class="${a === S.profile.avatar ? "sel" : ""}" data-av="${a}">${a}</button>`).join("");
    $("#questEditor").innerHTML = S.quests.map(q => `<div class="q-edit"><span>${skillById(q.skill).icon} ${esc(q.text)}</span><small>+${q.xp}</small><button data-rmq="${q.id}">✕</button></div>`).join("");
  }
  $("#avatarPick").addEventListener("click", e => { const b = e.target.closest("[data-av]"); if (b) { S.profile.avatar = b.dataset.av; save(); renderAll(); } });
  $("#saveSettingsBtn").onclick = () => {
    Object.assign(S.profile, { name: $("#setName").value.trim() || "Héroe", cls: $("#setClass").value.trim() || "Aventurero",
      sound: $("#setSound").checked, fx: $("#setFx").checked });
    Object.assign(S.profile.goals, { prot: +$("#setProt").value || 140, kcal: +$("#setKcal").value || 2400, water: +$("#setWater").value || 2500 });
    save(); applyTheme(); renderAll(); toast("💾 Ajustes guardados");
  };
  $("#questEditor").addEventListener("click", e => { const b = e.target.closest("[data-rmq]"); if (b) { S.quests = S.quests.filter(q => q.id !== b.dataset.rmq); save(); renderAll(); } });
  $("#addQuestBtn").onclick = () => {
    const text = $("#newQuestText").value.trim(); if (!text) return;
    S.quests.push({ id: "q" + uid(), text, skill: $("#newQuestSkill").value, xp: +$("#newQuestXp").value || 10 });
    $("#newQuestText").value = ""; save(); renderAll();
  };
  $("#editQuestsBtn").onclick = () => { showTab("settings"); setTimeout(() => $("#questEditor").scrollIntoView({ behavior: "smooth" }), 100); };
  $("#exportBtn").onclick = () => {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `lifequest-${today()}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast("⬇️ Save file exportado");
  };
  $("#importFile").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    try { const data = JSON.parse(await f.text()); if (!data.logs) throw 0; S = Object.assign(defaults(), data); save(); applyTheme(); renderAll(); toast("⬆️ Datos importados"); }
    catch { toast("❌ Archivo inválido"); }
    e.target.value = "";
  };
  $("#resetBtn").onclick = () => { if (confirm("¿Seguro? Se borrarán TODOS tus datos de este navegador.") && confirm("Última oportunidad: ¿exportaste un respaldo?")) { localStorage.removeItem(KEY); location.reload(); } };

  /* ---------------- CHARTS ---------------- */
  const charts = {};
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function mkChart(id, cfg) {
    if (!window.Chart) return; const el = document.getElementById(id); if (!el || !el.offsetParent) return;
    charts[id]?.destroy();
    const text = css("--text"), muted = css("--muted"), grid = css("--border") + "44";
    Chart.defaults.color = muted; Chart.defaults.font.family = css("--font-body"); Chart.defaults.borderColor = grid;
    cfg.options = Object.assign({ responsive: true, maintainAspectRatio: true, plugins: { legend: { labels: { color: text } } } }, cfg.options || {});
    charts[id] = new Chart(el, cfg);
  }
  const lastNDays = n => Array.from({ length: n }, (_, i) => dkey(addDays(new Date(), i - n + 1)));
  function renderCharts() {
    const acc = css("--accent"), acc2 = css("--accent2"), ok = css("--ok");
    const tab = $(".tab-panel.active")?.id;
    if (tab === "tab-gym") {
      const ex = $("#prChartSelect").value;
      const pts = S.workouts.flatMap(w => w.exercises.filter(x => x.name === ex && x.weight).map(x => ({ d: w.date, w: x.weight })));
      mkChart("prChart", { type: "line", data: { labels: pts.map(p => p.d), datasets: [{ label: ex || "—", data: pts.map(p => p.w), borderColor: acc, backgroundColor: acc + "55", tension: .3, fill: true, stepped: false }] } });
      mkChart("weightChart", { type: "line", data: { labels: S.weights.map(w => w.date), datasets: [{ label: "Peso (kg)", data: S.weights.map(w => w.kg), borderColor: acc2, tension: .3 }] } });
    }
    if (tab === "tab-food") {
      const days = lastNDays(14);
      mkChart("protChart", { type: "bar", data: { labels: days.map(d => d.slice(5)), datasets: [
        { label: "Proteína (g)", data: days.map(d => S.meals.filter(m => m.date === d).reduce((a, m) => a + m.prot, 0)), backgroundColor: ok },
        { type: "line", label: "Meta", data: days.map(() => S.profile.goals.prot), borderColor: acc2, pointRadius: 0, borderDash: [6, 4] }] } });
    }
    if (tab === "tab-stats") {
      mkChart("radarChart", { type: "radar", data: { labels: D.skills.map(s => s.icon + " " + s.name), datasets: [{ label: "Nivel", data: D.skills.map(s => levelFrom(skillXP(s.id), 50, 25).lvl), borderColor: acc, backgroundColor: acc + "44", pointBackgroundColor: acc2 }] },
        options: { aspectRatio: 1.4, scales: { r: { beginAtZero: true, ticks: { display: false }, grid: { color: css("--border") + "55" }, angleLines: { color: css("--border") + "55" }, pointLabels: { color: css("--text") } } } } });
      mkChart("minutesChart", { type: "doughnut", data: { labels: D.skills.map(s => s.name), datasets: [{ data: D.skills.map(s => minutesBy(s.id, 30)), backgroundColor: D.skills.map(s => s.color), borderColor: css("--card") }] }, options: { aspectRatio: 1.4 } });
      const days = lastNDays(30);
      mkChart("xpChart", { type: "bar", data: { labels: days.map(d => d.slice(5)), datasets: D.skills.map(s => ({ label: s.icon, data: days.map(d => S.logs.filter(l => l.date === d && l.skill === s.id).reduce((a, l) => a + l.xp, 0)), backgroundColor: s.color, stack: "x" })) },
        options: { scales: { x: { stacked: true }, y: { stacked: true } } } });
      const jd = Object.keys(S.journal).sort().slice(-30);
      mkChart("moodChart", { type: "line", data: { labels: jd.map(d => d.slice(5)), datasets: [
        { label: "Ánimo (1-5)", data: jd.map(d => S.journal[d].mood), borderColor: acc, tension: .3 },
        { label: "Sueño (h)", data: jd.map(d => S.journal[d].sleep), borderColor: acc2, tension: .3 },
        { label: "Energía", data: jd.map(d => S.journal[d].energy), borderColor: ok, tension: .3 }] } });
    }
  }

  /* ---------------- RENDER ALL ---------------- */
  function renderAll() {
    checkAchievements();
    renderHUD(); renderHome(); renderGym(); renderFrench(); renderEMT(); renderFood(); renderJournal(); renderStats(); renderTrophies(); renderSettings();
    renderCharts();
  }

  /* ---------------- INIT ---------------- */
  applyTheme(); sizeStars(); addEventListener("resize", sizeStars); drawStars();
  loadRoutine(); rollSide(); nextCard(); loadJournalForm(); renderAll();
  let startTab = "home"; try { startTab = localStorage.getItem(KEY + ".tab") || "home"; } catch {}
  if (location.hash.length > 1) startTab = location.hash.slice(1);
  if ($("#tab-" + startTab)) showTab(startTab);
  if (location.hostname.endsWith("github.io")) {
    const user = location.hostname.split(".")[0], repo = location.pathname.split("/").filter(Boolean)[0] || "";
    $("#repoLink").href = `https://github.com/${user}/${repo}`;
  }
  // reset del día al pasar medianoche
  let lastDay = today();
  setInterval(() => { if (today() !== lastDay) { lastDay = today(); loadJournalForm(); renderAll(); } }, 60000);
  if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
