/* ==========================================================
   LIFE QUEST — contenido base (edítalo libremente)
   ========================================================== */
window.LQ_DATA = {
  skills: [
    { id: "gym",      name: "Fuerza / Gym",        icon: "💪", color: "#ff4d6d" },
    { id: "cardio",   name: "Cardio / Movilidad",   icon: "🏃", color: "#ff9f1c" },
    { id: "french",   name: "Français",             icon: "🥐", color: "#4cc9f0" },
    { id: "emt",      name: "EMT / Power Systems",  icon: "⚡", color: "#ffd60a" },
    { id: "research", name: "Investigación / RL",   icon: "🤖", color: "#00b4ff" },
    { id: "english",  name: "English",              icon: "🍁", color: "#e63946" },
    { id: "learn",    name: "Aprendizaje",          icon: "📚", color: "#9b5de5" },
    { id: "food",     name: "Alimentación",         icon: "🍱", color: "#06d6a0" },
    { id: "mind",     name: "Mente / Sueño",        icon: "🧘", color: "#f15bb5" }
  ],

  /* Misiones diarias por defecto (puedes editarlas desde la app) */
  defaultQuests: [
    { id: "q1", text: "Entrenar (gym o cardio)",          skill: "gym",    xp: 30 },
    { id: "q2", text: "15 min de francés",                skill: "french", xp: 20 },
    { id: "q3", text: "Repasar 10 flashcards FR",         skill: "french", xp: 10 },
    { id: "q4", text: "30 min de estudio EMT / técnico",  skill: "emt",    xp: 25 },
    { id: "q9", text: "1 bloque de deep work de investigación (paper / código RL)", skill: "research", xp: 30 },
    { id: "q5", text: "Proteína en cada comida",          skill: "food",   xp: 15 },
    { id: "q6", text: "2+ litros de agua",                skill: "food",   xp: 10 },
    { id: "q7", text: "Leer 10 páginas",                  skill: "learn",  xp: 15 },
    { id: "q8", text: "Dormir 7h+ / sin pantalla 30 min", skill: "mind",   xp: 15 }
  ],

  /* Acciones rápidas del botón ⚡ */
  quickActions: [
    { label: "Gym 60 min",       skill: "gym",    xp: 40, minutes: 60, icon: "🏋️" },
    { label: "Cardio 30 min",    skill: "cardio", xp: 25, minutes: 30, icon: "🚴" },
    { label: "Caminar 10k pasos",skill: "cardio", xp: 20, minutes: 60, icon: "👟" },
    { label: "Francés 15 min",   skill: "french", xp: 15, minutes: 15, icon: "🗣️" },
    { label: "Francés 30 min",   skill: "french", xp: 30, minutes: 30, icon: "📖" },
    { label: "EMT 30 min",       skill: "emt",    xp: 25, minutes: 30, icon: "⚡" },
    { label: "EMT 1 h (deep)",   skill: "emt",    xp: 50, minutes: 60, icon: "🔬" },
    { label: "Research 1 h",     skill: "research", xp: 50, minutes: 60, icon: "🤖" },
    { label: "Escribir paper 30m",skill: "research", xp: 30, minutes: 30, icon: "📝" },
    { label: "Entrenar agente RL",skill: "research", xp: 25, minutes: 30, icon: "🧠" },
    { label: "English 15 min",   skill: "english", xp: 15, minutes: 15, icon: "🍁" },
    { label: "Leer 20 min",      skill: "learn",  xp: 15, minutes: 20, icon: "📚" },
    { label: "PyQuest nivel",    skill: "learn",  xp: 25, minutes: 30, icon: "🐍" },
    { label: "Curso / video",    skill: "learn",  xp: 20, minutes: 30, icon: "🎓" },
    { label: "Comida sana",      skill: "food",   xp: 10, minutes: 0,  icon: "🥗" },
    { label: "Vaso de agua",     skill: "food",   xp: 2,  minutes: 0,  icon: "💧", water: 250 },
    { label: "Meditar 10 min",   skill: "mind",   xp: 10, minutes: 10, icon: "🧘" }
  ],

  /* Rutinas de gym (Push / Pull / Legs + Full body) */
  routines: {
    "Push": ["Press banca", "Press militar", "Press inclinado mancuernas", "Elevaciones laterales", "Fondos / Dips", "Extensión tríceps polea"],
    "Pull": ["Dominadas / Jalón", "Remo con barra", "Remo mancuerna", "Face pulls", "Curl bíceps", "Curl martillo"],
    "Legs": ["Sentadilla", "Peso muerto rumano", "Prensa", "Zancadas", "Curl femoral", "Elevación de talones"],
    "Full body": ["Sentadilla goblet", "Press banca", "Remo con barra", "Press militar", "Hip thrust", "Plancha"],
    "Core & Movilidad": ["Plancha", "Dead bug", "Pallof press", "Movilidad cadera 90/90", "Cat-cow", "Estiramiento isquios"]
  },

  /* Ruta EMT — transitorios electromagnéticos en data centers */
  emtRoadmap: [
    { group: "Fundamentos", items: [
      "Ondas viajeras y modelos de línea (Bergeron, J. Marti, ULM)",
      "Integración numérica: trapezoidal, paso de tiempo y oscilaciones numéricas",
      "Modelado de transformadores (saturación, histéresis, capacitancias)",
      "Modelado de cables subterráneos y pantallas (bonding)",
      "Modelado de interruptores: TRV, reencendido, corte de corriente (chopping)"
    ]},
    { group: "Fenómenos clave en Data Centers", items: [
      "Energización de transformadores: corriente de inrush y sympathetic inrush",
      "Switching de bancos de capacitores y back-to-back",
      "Ferroresonancia en transformadores MT",
      "Transitorios de maniobra en cables MT y VFT en GIS",
      "Armónicos de UPS / rectificadores y resonancias (IEEE 519)",
      "Ride-through de cargas IT ante huecos (curva ITIC/CBEMA)",
      "Coordinación de aislamiento y pararrayos (IEC 60071 / IEEE C62)"
    ]},
    { group: "Recursos basados en inversores (IBR)", items: [
      "Modelos EMT de inversores grid-following vs grid-forming",
      "BESS en data centers: control, protección y modos de operación",
      "Interacciones de control / SSCI y estabilidad con red débil (SCR bajo)",
      "Requisitos IEEE 2800 / códigos de red para IBR",
      "Fault ride-through (LVRT/HVRT) y respuesta de corriente reactiva",
      "Validación de modelos: benchmarking vs datos de campo (OEM black-box)"
    ]},
    { group: "Herramientas", items: [
      "PSCAD/EMTDC: buenas prácticas, scripting con Python (mhi-pscad)",
      "EMTP / ATP: comparativa y casos tipo",
      "Simulink / Simscape Electrical para control",
      "Automatización de estudios: casos masivos, post-proceso con Python/pandas",
      "Co-simulación RMS–EMT (PSS/E ↔ PSCAD) e iniciación de casos"
    ]},
    { group: "Consultoría & Carrera", items: [
      "Plantilla de reporte de estudio EMT (alcance, supuestos, resultados)",
      "Interconexión de grandes cargas (large load interconnection) y requisitos del operador",
      "Estudios de calidad de energía para hyperscalers",
      "Publicar 1 artículo / post técnico (LinkedIn, IEEE PES)",
      "Certificación PE / P.Eng (si aplica)"
    ]}
  ],

  /* Ruta de investigación: RL para sistemas de potencia */
  researchRoadmap: [
    { group: "Paper actual · Maskable PPO (IEEE 123-bus)", items: [
      "Responder a revisores (Response to Reviewers) completo",
      "Tablas de recompensa e hiperparámetros finales",
      "Sección 5.3: benchmark de switching con el mismo modelo de flujo de carga",
      "Alt-text de figuras y verificación de formato (≤15 páginas)",
      "Camera-ready enviado 🎉",
      "Preparar presentación / póster del paper"
    ]},
    { group: "Siguiente nivel en RL", items: [
      "Seeds múltiples + intervalos de confianza en todas las curvas",
      "Comparar con un baseline de optimización (MILP / heurística)",
      "Restauración multi-paso con incertidumbre de carga y PV",
      "Seguridad: restricciones duras vs action masking vs Lagrangian PPO",
      "Generalización a otro feeder (IEEE 8500 / topologías aleatorias)",
      "Multi-agente: coordinación de varios almacenamientos grid-forming",
      "Puente RMS→EMT: validar las acciones del agente en PSCAD"
    ]},
    { group: "Herramientas", items: [
      "Stable-Baselines3 / sb3-contrib (MaskablePPO) dominado",
      "OpenDSS + py_dss_toolkit para entornos Gymnasium",
      "Seguimiento de experimentos (W&B / TensorBoard) ordenado",
      "Repos reproducibles: requirements, seeds, README, scripts de figuras"
    ]},
    { group: "Carrera académica", items: [
      "Publicar 1 artículo de revista (IEEE Trans. / Applied Energy)",
      "Presentar en una conferencia (IEEE PES GM / ISGT)",
      "Actualizar CV y página personal (eveth-gonzalez.github.io)",
      "Escribir un post técnico explicando el paper en lenguaje simple"
    ]}
  ],

  /* Ruta de francés A1 → B1 */
  frenchRoadmap: [
    { group: "A1", items: [
      "Saludos, presentarte, números 0-100", "Verbos être / avoir / aller / faire en presente",
      "Artículos y género", "Pedir comida en un café", "Días, meses, la hora"
    ]},
    { group: "A2", items: [
      "Passé composé (avoir / être)", "Imparfait básico", "Futur proche (aller + inf.)",
      "Pronombres COD / COI", "Hablar de tu trabajo y rutina", "Llamar por teléfono / hacer una cita"
    ]},
    { group: "B1", items: [
      "Subjonctif présent básico", "Conditionnel y hipótesis (si…)", "Pronombres y / en",
      "Escribir un correo formal", "Ver una serie en francés con subtítulos FR", "Conversación de 15 min con nativo"
    ]}
  ],

  /* Flashcards francés A1-A2 (fr | es) */
  frenchCards: [
    ["bonjour","hola / buenos días"],["merci beaucoup","muchas gracias"],["s'il vous plaît","por favor (formal)"],
    ["je m'appelle…","me llamo…"],["je suis ingénieur","soy ingeniero/a"],["je travaille dans l'énergie","trabajo en energía"],
    ["un centre de données","un centro de datos"],["l'électricité","la electricidad"],["le courant","la corriente"],
    ["la tension","el voltaje / la tensión"],["le réseau électrique","la red eléctrica"],["un disjoncteur","un interruptor automático"],
    ["un transformateur","un transformador"],["la salle de sport","el gimnasio"],["je m'entraîne","entreno"],
    ["la musculation","las pesas / musculación"],["courir","correr"],["fatigué(e)","cansado/a"],
    ["j'ai faim","tengo hambre"],["j'ai soif","tengo sed"],["le petit-déjeuner","el desayuno"],
    ["le déjeuner","el almuerzo"],["le dîner","la cena"],["le poulet","el pollo"],["les œufs","los huevos"],
    ["les légumes","las verduras"],["l'eau","el agua"],["le pain","el pan"],["le fromage","el queso"],
    ["aujourd'hui","hoy"],["demain","mañana"],["hier","ayer"],["maintenant","ahora"],["toujours","siempre"],
    ["souvent","a menudo"],["parfois","a veces"],["jamais","nunca"],["beaucoup","mucho"],["un peu","un poco"],
    ["Où est… ?","¿Dónde está…?"],["Combien ça coûte ?","¿Cuánto cuesta?"],["Je ne comprends pas","No entiendo"],
    ["Pouvez-vous répéter ?","¿Puede repetir?"],["Parlez plus lentement","Hable más despacio"],
    ["j'aime","me gusta"],["je voudrais","quisiera"],["il fait froid","hace frío"],["il fait chaud","hace calor"],
    ["la semaine","la semana"],["le week-end","el fin de semana"],["le matin","la mañana"],["le soir","la tarde-noche"],
    ["être","ser / estar"],["avoir","tener"],["aller","ir"],["faire","hacer"],["pouvoir","poder"],["vouloir","querer"],
    ["savoir","saber"],["prendre","tomar"],["venir","venir"],["voir","ver"],["dire","decir"],
    ["une réunion","una reunión"],["un rapport","un reporte"],["une étude","un estudio"],["le client","el cliente"],
    ["le projet","el proyecto"],["la date limite","la fecha límite"],["Bonne journée !","¡Buen día!"],
    ["À bientôt","Hasta pronto"],["D'accord","De acuerdo"],["C'est génial !","¡Es genial!"],
    ["Je suis en train de…","Estoy (haciendo)…"],["J'ai mangé","He comido / comí"],["Je vais étudier","Voy a estudiar"],
    ["la santé","la salud"],["le sommeil","el sueño (dormir)"],["dormir","dormir"],["se réveiller","despertarse"],
    ["vite","rápido"],["lentement","despacio"],["facile","fácil"],["difficile","difícil"],["la vie","la vida"]
  ],

  frenchPhrases: [
    "Petit à petit, l'oiseau fait son nid. — Poco a poco el pájaro hace su nido.",
    "Qui ne risque rien n'a rien. — Quien no arriesga no gana.",
    "Vouloir, c'est pouvoir. — Querer es poder.",
    "Il n'est jamais trop tard pour apprendre. — Nunca es tarde para aprender.",
    "Aujourd'hui, je m'entraîne et j'étudie le français. — Hoy entreno y estudio francés.",
    "Je travaille sur des études de transitoires électromagnétiques. — Trabajo en estudios de transitorios electromagnéticos.",
    "Après l'effort, le réconfort. — Después del esfuerzo, la recompensa.",
    "Mieux vaut tard que jamais. — Más vale tarde que nunca.",
    "L'appétit vient en mangeant. — El apetito viene comiendo.",
    "Chaque jour est une nouvelle aventure. — Cada día es una nueva aventura."
  ],

  /* Side quests: cosas interesantes que hacer */
  sideQuests: [
    "🎬 Ve un episodio de anime con audio en francés",
    "🍳 Cocina una receta francesa sencilla: omelette aux fines herbes",
    "🧪 Simula en PSCAD un caso de inrush con distintos ángulos de cierre y compáralos",
    "📈 Escribe un script en Python que grafique un CSV de PSCAD automáticamente",
    "🏔️ Sal a caminar 1 hora sin teléfono y piensa en tus metas del mes",
    "🎧 Escucha un podcast en francés (InnerFrench, Coffee Break French)",
    "🏋️ Prueba un nuevo ejercicio que nunca hayas hecho",
    "✍️ Escribe 5 frases en francés sobre tu día",
    "📖 Lee un capítulo de un libro técnico (Greenwood – Electrical Transients in Power Systems)",
    "🗺️ Planea un viaje soñado a Francia / Québec en francés",
    "🥗 Meal prep para 3 días con 30g+ de proteína por comida",
    "🎮 Juega un videojuego cambiando el idioma a francés",
    "🔌 Explica un fenómeno EMT a alguien sin formación técnica (técnica Feynman)",
    "🧘 10 minutos de respiración box breathing antes de dormir",
    "📝 Haz un post en LinkedIn sobre una lección técnica de la semana",
    "🚴 Descubre una ruta nueva en bici o corriendo",
    "🎨 Dibuja tu personaje de Life Quest en estilo pixel art",
    "🧠 Aprende un atajo nuevo de VS Code / Python",
    "🥐 Ve a una panadería y pide en francés (aunque sea en tu cabeza 😄)",
    "📚 Revisa un paper de IEEE Transactions on Power Delivery sobre data centers",
    "💤 Noche sin pantallas: lee en papel 30 min",
    "🤝 Busca un intercambio de idiomas (Tandem / HelloTalk) y agenda una llamada",
    "🏆 Bate un PR en un ejercicio básico (con buena técnica)",
    "🧩 Resume en una página una norma (IEEE 519 / IEEE 2800)",
    "🤖 Entrena una variante de tu agente con otra semilla y compara curvas",
    "📊 Rehaz una figura del paper para que se entienda en 5 segundos",
    "🍁 Explora un parque del River Valley de Edmonton caminando 45 min",
    "⛸️ Prueba patinar en hielo (temporada de invierno en Edmonton)",
    "🎤 Practica 3 min explicando tu paper en inglés y luego en francés",
    "🕹️ Juega una run de RIFTVOLT y mira qué aprendió NEXUS de ti",
    "🐍 Vence un nivel de PyQuest (eveth0797.github.io/pyquest)",
    "🧠 Implementa multi-head attention desde cero en PyQuest (Mundo 8)"
  ],

  quotes: [
    "「一歩一歩」 Paso a paso se llega lejos.",
    "Level up no es un evento, es un hábito.",
    "El jefe final es tu yo de ayer.",
    "La disciplina es el power-up que nunca se acaba.",
    "Guarda tu progreso: la constancia es tu save point.",
    "Plus Ultra — ¡ve más allá!",
    "No grindear es la forma más rápida de quedarse en nivel 1.",
    "Hoy es un buen día para ganar XP."
  ],

  achievements: [
    { id: "first",   icon: "🌱", name: "Primer paso",      desc: "Registra tu primera actividad",  test: s => s.totalLogs >= 1 },
    { id: "log50",   icon: "📜", name: "Cronista",         desc: "50 registros",                   test: s => s.totalLogs >= 50 },
    { id: "lvl5",    icon: "⭐", name: "Aventurero",       desc: "Nivel global 5",                 test: s => s.level >= 5 },
    { id: "lvl10",   icon: "🌟", name: "Héroe",            desc: "Nivel global 10",                test: s => s.level >= 10 },
    { id: "lvl25",   icon: "👑", name: "Leyenda",          desc: "Nivel global 25",                test: s => s.level >= 25 },
    { id: "streak3", icon: "🔥", name: "En racha",         desc: "Racha de 3 días",                test: s => s.streak >= 3 },
    { id: "streak7", icon: "☄️", name: "Semana perfecta",  desc: "Racha de 7 días",                test: s => s.streak >= 7 },
    { id: "streak30",icon: "🐉", name: "Dragón",           desc: "Racha de 30 días",               test: s => s.streak >= 30 },
    { id: "gym10",   icon: "🏋️", name: "Gym rat",          desc: "10 entrenamientos registrados",  test: s => s.workouts >= 10 },
    { id: "fr100",   icon: "🥐", name: "Francophile",      desc: "100 flashcards repasadas",       test: s => s.cardsReviewed >= 100 },
    { id: "frh10",   icon: "🗼", name: "Parisien",         desc: "10 horas de francés",            test: s => s.minutes.french >= 600 },
    { id: "emt10",   icon: "⚡", name: "Transient Hunter",  desc: "10 horas de estudio EMT",        test: s => s.minutes.emt >= 600 },
    { id: "emtroad", icon: "🔬", name: "Wave Master",      desc: "10 temas de la ruta EMT",        test: s => s.emtDone >= 10 },
    { id: "res20",   icon: "🤖", name: "Agente entrenado",  desc: "20 horas de investigación",      test: s => (s.minutes.research || 0) >= 1200 },
    { id: "resroad", icon: "📄", name: "Camera-ready",      desc: "5 hitos de investigación",       test: s => (s.resDone || 0) >= 5 },
    { id: "water",   icon: "💧", name: "Hidratado",        desc: "2 L de agua en un día",          test: s => s.waterToday >= 2000 },
    { id: "allq",    icon: "🎯", name: "Completista",      desc: "Todas las misiones de un día",   test: s => s.perfectDays >= 1 },
    { id: "journal", icon: "📓", name: "Diario",           desc: "7 entradas de diario",           test: s => s.journals >= 7 }
  ],

  /* Plantillas de preguntas para el LLM */
  llmPrompts: [
    { label: "📊 Analiza mi semana", text: "Analiza mi progreso de la última semana y dame 3 recomendaciones concretas para mejorar." },
    { label: "🏋️ Ajusta mi rutina", text: "Según mis entrenamientos registrados, propón mi rutina de gym para la próxima semana (progresión de cargas incluida)." },
    { label: "🥐 Clase de francés", text: "Soy nivel A1-A2. Dame una mini clase de 15 minutos con vocabulario de mi día a día (ingeniería eléctrica, gym, comida) y 5 ejercicios." },
    { label: "⚡ Plan de estudio EMT", text: "Soy ingeniero/a de sistemas de potencia haciendo estudios EMT para data centers. Según mis temas completados, ¿qué debería estudiar esta semana? Incluye referencias." },
    { label: "🤖 Mi investigación", text: "Investigo RL (Maskable PPO) para restauración de cargas críticas en redes de distribución con almacenamiento grid-forming (IEEE 123-bus). Según mis hitos completados, ¿cuáles son los 3 siguientes pasos de mayor impacto para publicar en revista? Sé específico." },
    { label: "🍁 English pro", text: "Ayúdame a practicar inglés académico: dame 5 frases útiles para presentar mi investigación en una conferencia y corrígeme si te respondo." },
    { label: "🍱 Plan de comidas", text: "Diseña un plan de comidas de 3 días alto en proteína, sencillo de preparar, según lo que he registrado." },
    { label: "🧭 Plan de mañana", text: "Con base en mis misiones y lo que he hecho, arma un horario realista para mañana con bloques de tiempo." }
  ]
};
