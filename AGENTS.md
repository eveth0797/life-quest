# Guía de desarrollo de Life Quest (para LLMs y personas)

Lee este archivo completo antes de modificar el proyecto. Contiene todo lo necesario para continuar sin contexto previo.

## 1. Qué es
App web estática (HTML/CSS/JS sin build ni frameworks) para organizar el día y registrar el progreso personal con estética de videojuego retro y anime. Publicada con GitHub Pages en `https://eveth0797.github.io/life-quest/`, instalable como PWA. Todos los datos se guardan en el navegador (`localStorage`).

**Usuario/a:** Eveth, ingeniera/o de sistemas de potencia en Edmonton (University of Alberta). Hace consultoría de **estudios EMT** (transitorios electromagnéticos) para data centers e **investigación en RL** (Maskable PPO para restaurar cargas críticas con almacenamiento grid-forming en el IEEE 123-bus). Estudia **francés A1-A2**, entrena en el **gym** y le interesa la alimentación alta en proteína. Idioma de la interfaz: español.

## 2. Mapa de archivos
| Archivo | Responsabilidad |
|---|---|
| `index.html` | Pestañas: `home`, `agenda`, `focus`, `gym`, `french`, `emt` (EMT y ruta RL), `food`, `journal`, `stats`, `trophies`, `ai` (Oráculo), `settings`. Botón flotante ⚡ (registro rápido, tecla Q). |
| `css/styles.css` | 7 temas con variables CSS bajo `[data-theme="…"]`: arcade, sakura, cyber, gameboy, rpg, vapor, shonen. Al final están los estilos de Agenda y Focus. |
| `js/data.js` | **Contenido editable** (`window.LQ_DATA`): skills, misiones por defecto, acciones rápidas, rutinas de gym, rutas (EMT, investigación, francés), flashcards, frases, side quests, logros y prompts del Oráculo. |
| `js/app.js` | Núcleo: estado `S`, XP y niveles, registros, pestañas, gym, francés (repetición espaciada), EMT, comida, diario, stats (Chart.js), logros, tienda, Oráculo, ajustes y export/import. **Expone `window.LQ`** para los módulos. |
| `js/agenda.js` | Agenda: línea de tiempo por día (bloques), tareas con prioridad y fecha, hábitos de 7 días y metas semanales. Resumen "Ahora/Siguiente" en Inicio. |
| `js/focus.js` | Temporizador de enfoque con 3 escenas en canvas que se construyen con el progreso: 🌲 bosque fractal (amanecer→noche), 🪐 sistema planetario (disco→planetas con profundidad) y ⚛️ doble rendija (impactos muestreados de \|ψ\|², histograma suavizado y curva teórica). |
| `sw.js`, `manifest.json`, `icon.svg` | PWA. Sube la versión `C` en `sw.js` si cambias la lista de archivos. |
| `data/` | Respaldos JSON exportados por la persona usuaria. |

## 3. API `window.LQ` (definida en app.js, antes de INIT)
```js
LQ = { state(), save(), addLog({skill,xp,minutes,note,type,ref,date}, event?), removeLog(id),
       toast(msg), skillById(id), today(), dkey(date), addDays(date,n), uid(), esc(str),
       D /* LQ_DATA */, showTab(name), hooks: [] /* se llaman al final de renderAll() */,
       onTab: [] /* se llaman con el nombre de la pestaña al cambiarla */ }
```
Patrón para un módulo nuevo: crea `js/mimodulo.js` (IIFE), léelo con `const LQ = window.LQ`, guarda su estado en `LQ.state().miClave`, registra `LQ.hooks.push(render)` y añade el `<script>` **después** de `app.js` en `index.html`.

## 4. Modelo de datos (`localStorage["lifequest.v1"]`)
```
profile {name, cls, avatar, theme, sound, fx, goals{prot,kcal,water}}
quests [{id,text,skill,xp}]          questDone {fecha:[questId]}
logs [{id,ts,date,skill,xp,minutes,note,type,ref}]   ← fuente de verdad del XP
water {fecha: ml}   workouts [...]   weights [...]   meals [...]   journal {fecha:{...}}
cards {fr: {box,due}}  customCards  cardsReviewed   emtDone{} frDone{} resDone{} emtSessions[]
rewards [] spent  unlocked {logro: fecha}
agenda {blocks:{fecha:[{id,title,s,e,skill,done}]}, tasks:[{id,text,prio,due,skill,done}], targets:{skill:min}}
focus {scene,dur,skill,running,endAt,left,seed,sessions,totalMin}
```
- El XP total y por área **se calcula desde `logs`**. Para dar XP, llama siempre a `addLog`; para retirarlo, a `removeLog`.
- Fechas en formato local `YYYY-MM-DD` (`LQ.today()`).
- Si añades campos al estado, dales un valor por defecto en `defaults()` y fusiónalos al cargar (como `S.resDone = S.resDone || {}`).

## 5. Integraciones
- **Oráculo IA**: `buildContext()` resume el progreso y abre `https://claude.ai/new?q=…` (además lo copia al portapapeles). Sin API keys.
- **RIFTVOLT** (el videojuego, mismo origen `eveth0797.github.io`): Life Quest lee `riftvolt.meta.v1` y `riftvolt.nexus.v1` para mostrar estadísticas. El juego lee `lifequest.v1` y da bonus si completaste tus misiones del día.
- **Chart.js 4.4.1** desde cdnjs. Todas las gráficas se protegen con `if (!window.Chart) return`.

## 6. Cómo probar
`python3 -m http.server` en la carpeta y abre `http://localhost:8000`. Para pruebas automáticas con Playwright: navega por las pestañas, usa la plantilla de la agenda, ajusta `LQ.state().focus` para avanzar el temporizador y busca `pageerror`. Verifica a 390 px de ancho que `document.documentElement.scrollWidth === 390`.

**Error común:** un overlay con `display:grid` y el atributo `hidden` sigue bloqueando clics. Añade una regla `[hidden]{display:none}` específica.

## 7. Roadmap sugerido
1. **Sincronización entre dispositivos**: guardar el JSON en un Gist privado de GitHub con un token pegado por la persona usuaria, o en un archivo del repo vía la API de GitHub.
2. **Recordatorios**: notificaciones al iniciar cada bloque de la agenda (Notification API + comprobar cada minuto).
3. **Plantillas de semana** y arrastrar y soltar bloques en la línea de tiempo.
4. **Módulo English**: flashcards académicas como las de francés (reutiliza `nextCard`).
5. **Escenas Focus nuevas**: aurora boreal (Edmonton), red eléctrica que se energiza (EMT), agente RL que aprende un laberinto. Sigue el patrón `SCENES[id] = {icon,name,desc,seed,draw(c,w,h,p,t,dt)}` en `focus.js`: `p` ∈ [0,1] es el progreso.
6. **Revisión semanal automática**: un botón que genere un prompt con los datos de la semana para el Oráculo.
7. Tests automáticos E2E en `tools/` con Playwright.

## 8. Convenciones
Español en la interfaz. Sin build. CDN con versión fija. Envuelve cada acceso a `localStorage` en try/catch. Escapa todo HTML que provenga de la persona usuaria con `esc()`. Mobile-first: comprueba siempre el ancho de 390 px.
