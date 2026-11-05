/* =========================================================
   LIFE QUEST — AGENDA
   · Línea de tiempo del día (bloques horarios) con "ahora"
   · Tareas con prioridad, fecha y área (dan XP al completarlas)
   · Semana: hábitos (misiones) x 7 días + metas de minutos por área
   Estado: S.agenda = { blocks: {fecha: [..]}, tasks: [..], targets: {skill: min} }
   ========================================================= */
(() => {
  "use strict";
  const LQ = window.LQ; if (!LQ) return;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = LQ.esc, D = LQ.D;
  const A = () => { const S = LQ.state(); S.agenda = S.agenda || { blocks: {}, tasks: [], targets: { gym: 240, french: 150, emt: 300, research: 600, learn: 120 } }; return S.agenda; };
  let day = LQ.today();
  const START_H = 5, END_H = 24, PX_H = 44;
  const toMin = s => { const [h, m] = s.split(":").map(Number); return h * 60 + (m || 0); };
  const hhmm = m => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  const sk = id => LQ.skillById(id);
  const dateLabel = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("es", { weekday: "long", day: "numeric", month: "short" }); };

  /* ---------- opciones ---------- */
  const opts = D.skills.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join("");
  $("#blkSkill").innerHTML = opts; $("#taskSkill").innerHTML = `<option value="">— área —</option>` + opts;
  $("#taskDue").value = LQ.today();

  /* ---------- navegación de días ---------- */
  $("#agPrev").onclick = () => { day = LQ.dkey(LQ.addDays(new Date(day + "T12:00"), -1)); render(); };
  $("#agNext").onclick = () => { day = LQ.dkey(LQ.addDays(new Date(day + "T12:00"), 1)); render(); };
  $("#agToday").onclick = () => { day = LQ.today(); render(); };

  /* ---------- bloques ---------- */
  $("#blkAdd").onclick = () => {
    const title = $("#blkTitle").value.trim(); if (!title) return LQ.toast("Escribe un título para el bloque");
    const s = toMin($("#blkStart").value || "09:00"), e = toMin($("#blkEnd").value || "10:00");
    if (e <= s) return LQ.toast("La hora final debe ser posterior");
    const a = A(); (a.blocks[day] = a.blocks[day] || []).push({ id: LQ.uid(), title, s, e, skill: $("#blkSkill").value, done: false });
    $("#blkTitle").value = ""; LQ.save(); render(); LQ.toast("🗓️ Bloque añadido");
  };
  $("#blkTemplate").onclick = () => {
    const a = A(); if ((a.blocks[day] || []).length && !confirm("¿Añadir la plantilla a los bloques existentes?")) return;
    const T = [["Gym", "06:30", "07:30", "gym"], ["Deep work · Investigación RL", "08:30", "11:00", "research"], ["Estudio / proyecto EMT", "11:15", "12:45", "emt"], ["Almuerzo alto en proteína", "13:00", "13:45", "food"], ["Trabajo / reuniones", "14:00", "17:00", "emt"], ["Francés", "18:00", "18:30", "french"], ["Lectura", "21:30", "22:00", "learn"], ["Desconexión y dormir", "22:30", "23:00", "mind"]];
    a.blocks[day] = (a.blocks[day] || []).concat(T.map(([title, s, e, skill]) => ({ id: LQ.uid(), title, s: toMin(s), e: toMin(e), skill, done: false })));
    LQ.save(); render(); LQ.toast("✨ Plantilla de día ideal aplicada");
  };
  $("#timeline").addEventListener("click", ev => {
    const del = ev.target.closest("[data-bdel]"), blk = ev.target.closest("[data-bid]"); if (!blk) return;
    const a = A(), list = a.blocks[day] || [], b = list.find(x => x.id === blk.dataset.bid); if (!b) return;
    if (del) { a.blocks[day] = list.filter(x => x !== b); LQ.save(); return render(); }
    b.done = !b.done;
    if (b.done) LQ.addLog({ skill: b.skill, xp: Math.max(5, Math.round((b.e - b.s) * 0.5)), minutes: b.e - b.s, note: "Bloque: " + b.title, type: "block", ref: b.id, date: day }, ev);
    else { const lg = LQ.state().logs.find(l => l.type === "block" && l.ref === b.id); if (lg) LQ.removeLog(lg.id); }
    LQ.save(); render();
  });

  function renderTimeline() {
    const list = (A().blocks[day] || []).slice().sort((x, y) => x.s - y.s);
    const tl = $("#timeline"); const total = (END_H - START_H) * PX_H;
    let html = `<div class="tl-grid" style="height:${total}px">`;
    for (let h = START_H; h <= END_H; h++) html += `<div class="tl-hour" style="top:${(h - START_H) * PX_H}px"><span>${String(h % 24).padStart(2, "0")}:00</span></div>`;
    // columnas para solapamientos
    const cols = []; list.forEach(b => { let c = 0; while (cols[c] && cols[c] > b.s) c++; cols[c] = b.e; b._c = c; });
    const nC = Math.max(1, cols.length);
    list.forEach(b => {
      const top = (b.s - START_H * 60) / 60 * PX_H, hgt = Math.max(18, (b.e - b.s) / 60 * PX_H - 2), s = sk(b.skill);
      html += `<div class="tl-block ${b.done ? "done" : ""}" data-bid="${b.id}" style="top:${top}px;height:${hgt}px;left:calc(56px + (100% - 60px) * ${b._c / nC});width:calc((100% - 60px) / ${nC} - 4px);--c:${s.color}">
        <b>${s.icon} ${esc(b.title)}</b><small>${hhmm(b.s)}–${hhmm(b.e)} · ${b.e - b.s} min</small><span class="tl-x" data-bdel="1" title="Borrar">✕</span></div>`;
    });
    if (day === LQ.today()) { const n = new Date(), m = n.getHours() * 60 + n.getMinutes(); if (m >= START_H * 60) html += `<div class="tl-now" style="top:${(m - START_H * 60) / 60 * PX_H}px"><span>${hhmm(m)}</span></div>`; }
    html += `</div>`;
    tl.innerHTML = html;
    const done = list.filter(b => b.done), planned = list.reduce((a, b) => a + b.e - b.s, 0), dm = done.reduce((a, b) => a + b.e - b.s, 0);
    $("#agSummary").innerHTML = list.length ? `Planificado: <b>${(planned / 60).toFixed(1)} h</b> · Cumplido: <b>${(dm / 60).toFixed(1)} h</b> (${planned ? Math.round(dm / planned * 100) : 0}%) · Toca un bloque para marcarlo como hecho.` : "Día sin planificar. Añade bloques o aplica la plantilla de día ideal.";
    $("#agDate").textContent = (day === LQ.today() ? "Hoy · " : "") + dateLabel(day);
  }

  /* ---------- tareas ---------- */
  $("#taskAdd").onclick = () => {
    const text = $("#taskText").value.trim(); if (!text) return;
    A().tasks.push({ id: LQ.uid(), text, prio: $("#taskPrio").value, due: $("#taskDue").value || "", skill: $("#taskSkill").value, done: false, created: LQ.today() });
    $("#taskText").value = ""; LQ.save(); render(); LQ.toast("✅ Tarea añadida");
  };
  $("#taskText").addEventListener("keydown", e => { if (e.key === "Enter") $("#taskAdd").click(); });
  $("#taskFilter").onchange = render;
  $("#taskList").addEventListener("click", ev => {
    const li = ev.target.closest("[data-tid]"); if (!li) return;
    const a = A(), t = a.tasks.find(x => x.id === li.dataset.tid); if (!t) return;
    if (ev.target.closest("[data-tdel]")) { a.tasks = a.tasks.filter(x => x !== t); LQ.save(); return render(); }
    if (ev.target.closest("[data-tchk]")) {
      t.done = !t.done; t.doneAt = t.done ? LQ.today() : null;
      const xp = { alta: 25, media: 15, baja: 8 }[t.prio] || 10;
      if (t.done) LQ.addLog({ skill: t.skill || "learn", xp, note: "Tarea: " + t.text, type: "task", ref: t.id }, ev);
      else { const lg = LQ.state().logs.find(l => l.type === "task" && l.ref === t.id); if (lg) LQ.removeLog(lg.id); }
      LQ.save(); render();
    }
  });
  function renderTasks() {
    const f = $("#taskFilter").value, td = LQ.today(), a = A();
    const order = { alta: 0, media: 1, baja: 2 };
    let list = a.tasks.slice();
    if (f === "pending") list = list.filter(t => !t.done); else if (f === "today") list = list.filter(t => !t.done && t.due && t.due <= td); else if (f === "done") list = list.filter(t => t.done);
    list.sort((x, y) => (x.done - y.done) || ((x.due || "9999") .localeCompare(y.due || "9999")) || order[x.prio] - order[y.prio]);
    $("#taskList").innerHTML = list.length ? list.map(t => {
      const s = t.skill ? sk(t.skill) : null, over = !t.done && t.due && t.due < td, isToday = t.due === td;
      return `<li data-tid="${t.id}" class="task p-${t.prio} ${t.done ? "done" : ""} ${over ? "over" : ""}">
        <button class="chk" data-tchk="1">${t.done ? "✓" : ""}</button>
        <span class="tt">${s ? s.icon + " " : ""}${esc(t.text)}</span>
        <span class="tm">${t.due ? (over ? "⚠️ " : isToday ? "📌 " : "") + t.due.slice(5) : ""}</span>
        <span class="tp">${{ alta: "🔴", media: "🟡", baja: "🟢" }[t.prio]}</span>
        <button class="tx" data-tdel="1">✕</button></li>`;
    }).join("") : `<li class="small">Nada por aquí. ✨</li>`;
    const pend = a.tasks.filter(t => !t.done).length, over = a.tasks.filter(t => !t.done && t.due && t.due < td).length;
    $("#taskSummary").textContent = `${pend} pendientes${over ? ` · ${over} atrasadas` : ""} · ${a.tasks.filter(t => t.done).length} completadas`;
  }

  /* ---------- semana ---------- */
  function renderWeek() {
    const S = LQ.state(), days = Array.from({ length: 7 }, (_, i) => LQ.dkey(LQ.addDays(new Date(), i - 6)));
    let html = `<table class="habit"><tr><th></th>${days.map(d => `<th>${new Date(d + "T12:00").toLocaleDateString("es", { weekday: "narrow" })}<br><small>${d.slice(8)}</small></th>`).join("")}<th>%</th></tr>`;
    S.quests.forEach(q => {
      const row = days.map(d => (S.questDone[d] || []).includes(q.id));
      html += `<tr><td>${sk(q.skill).icon} ${esc(q.text)}</td>${row.map((v, i) => `<td><i class="hb ${v ? "on" : ""}" style="--c:${sk(q.skill).color}"></i></td>`).join("")}<td><b>${Math.round(row.filter(Boolean).length / 7 * 100)}</b></td></tr>`;
    });
    html += `</table>`;
    $("#habitGrid").innerHTML = html;
    // metas de minutos por área
    const a = A(), from = days[0];
    $("#weekGoals").innerHTML = D.skills.map(s => {
      const goal = a.targets[s.id] || 0, got = S.logs.filter(l => l.skill === s.id && l.date >= from).reduce((x, l) => x + (l.minutes || 0), 0), pct = goal ? Math.min(100, got / goal * 100) : 0;
      return `<div class="wg"><span>${s.icon} ${s.name}</span><div class="bar"><div class="fill" style="width:${pct}%;background:${s.color}"></div><span>${got} / ${goal || "—"} min</span></div><input type="number" min="0" step="30" value="${goal}" data-goal="${s.id}" title="Meta semanal (min)"></div>`;
    }).join("");
  }
  $("#weekGoals").addEventListener("change", e => { const i = e.target.closest("[data-goal]"); if (!i) return; A().targets[i.dataset.goal] = +i.value || 0; LQ.save(); renderWeek(); });

  /* ---------- resumen en Inicio ---------- */
  function renderHomeAgenda() {
    const el = $("#homeAgenda"); if (!el) return;
    const n = new Date(), m = n.getHours() * 60 + n.getMinutes();
    const list = (A().blocks[LQ.today()] || []).slice().sort((x, y) => x.s - y.s);
    const cur = list.find(b => b.s <= m && b.e > m), next = list.find(b => b.s > m);
    const td = LQ.today(), urgent = A().tasks.filter(t => !t.done && t.due && t.due <= td).slice(0, 4);
    el.innerHTML = `${cur ? `<div class="now-blk" style="--c:${sk(cur.skill).color}">▶ AHORA: <b>${sk(cur.skill).icon} ${esc(cur.title)}</b> <small>hasta ${hhmm(cur.e)}</small><div class="bar"><div class="fill" style="width:${(m - cur.s) / (cur.e - cur.s) * 100}%"></div></div></div>` : ""}
      ${next ? `<div class="small">Siguiente: ${sk(next.skill).icon} ${esc(next.title)} a las ${hhmm(next.s)}</div>` : list.length ? `<div class="small">No quedan bloques hoy 🎉</div>` : `<div class="small">Sin bloques hoy. <a href="#" data-goag="1">Planifica tu día →</a></div>`}
      ${urgent.length ? `<ul class="urg">${urgent.map(t => `<li>${t.due < td ? "⚠️" : "📌"} ${esc(t.text)}</li>`).join("")}</ul>` : ""}`;
  }
  document.addEventListener("click", e => { if (e.target.closest("[data-goag]")) { e.preventDefault(); LQ.showTab("agenda"); } });

  function render() { renderTimeline(); renderTasks(); renderWeek(); renderHomeAgenda(); }
  LQ.hooks.push(render);
  setInterval(() => { if ($("#tab-agenda").classList.contains("active")) renderTimeline(); renderHomeAgenda(); }, 60000);
  render();
  LQ.onTab.push(name => { if (name === "agenda") { render(); const tl = $("#timeline"); const n = new Date(); if (day === LQ.today()) tl.scrollTop = Math.max(0, (n.getHours() - START_H - 1) * PX_H); } });
})();
