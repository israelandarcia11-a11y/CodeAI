/* =========================================================
   CODEAI - SCRIPT PRINCIPAL
========================================================= */

let chats = {};
let currentChat = null;
let selectedModel = "phoenix";
let userPlan = "free";

const BACKEND = "https://codeai-backend-yc0i.onrender.com";

/* =========================================================
   MODELS
========================================================= */

const MODELS = {
  phoenix: {
    name: "Phoenix 1.0",
    model: "llama-3.3-70b-versatile",
    role: `
Eres Phoenix 1.0, experto absoluto en Roblox LuaU.

CUANDO RESPONDAS SIEMPRE:
1. Explicá brevemente qué va a hacer el script
2. Generá el código completo y funcional
3. Especificá EXACTAMENTE dónde colocarlo:
   - Tipo de script (ServerScript, LocalScript, ModuleScript)
   - Ubicación en el árbol de Roblox Studio (ServerScriptService, ReplicatedStorage, StarterGui, etc)
4. Explicá paso a paso cómo configurarlo en Roblox Studio
5. Si necesita múltiples scripts, explicá cada uno por separado
6. Advertí sobre posibles errores comunes y cómo evitarlos

ESPECIALIDADES:
- Sistemas de juego completos
- DataStore y guardado de datos
- RemoteEvents y RemoteFunctions
- UI y GUIs
- Animaciones y efectos visuales
- Optimización de rendimiento
- Anti-exploit y seguridad
- Terreno y mapas
- Sistemas de combate
- Economía y tiendas
`
  },
  meta: {
    name: "Meta 1.0",
    model: "llama-3.3-70b-versatile",
    role: `
Eres Meta 1.0, experto absoluto en Python y VS Code.

CUANDO RESPONDAS SIEMPRE:
1. Explicá brevemente qué va a hacer el código
2. Generá el código completo y funcional
3. Especificá EXACTAMENTE cómo ejecutarlo:
   - Dependencias necesarias (pip install ...)
   - Cómo correrlo (python archivo.py)
   - Configuración necesaria
4. Explicá paso a paso cada parte importante
5. Si necesita múltiples archivos, explicá cada uno
6. Advertí sobre posibles errores comunes

ESPECIALIDADES:
- Automatización y scripting
- APIs y requests
- Backend con Flask/FastAPI
- Web scraping
- Inteligencia artificial
- Bases de datos
- Configuración de VS Code
- Extensiones y atajos útiles
- Debugging avanzado
`
  }
};

/* =========================================================
   MASTER PROMPT
========================================================= */

const MASTER_PROMPT = `
Eres CodeAI, una IA especializada exclusivamente en programación.

REGLAS GENERALES:
- Si el usuario saluda, respondé el saludo brevemente y preguntá en qué proyecto de código podés ayudar
- Si preguntan algo fuera de programación, redirige amablemente al tema de código
- Mantené el contexto completo del chat, recordá todo lo que se habló antes
- Nunca olvides el contexto anterior, usá el historial para dar respuestas coherentes
- Si el usuario menciona un error, analizalo y explicá la causa exacta

CUANDO GENERES CÓDIGO:
- Generá código completo y funcional, listo para usar
- Usá bloques de código siempre
- Explicá PASO A PASO qué hace cada parte
- Especificá EXACTAMENTE dónde colocar el código
- Si el proyecto necesita múltiples archivos, indicalo claramente con títulos
- Detectá y corregí errores automáticamente
- Optimizá el rendimiento cuando sea posible
- Usá buenas prácticas siempre

FORMATO DE RESPUESTA:
- Usá títulos para separar secciones
- Sé claro y directo
- No generes respuestas vagas
- Si falta información para completar la tarea, preguntá antes de generar código incompleto
`;

/* =========================================================
   INIT
========================================================= */

window.addEventListener("DOMContentLoaded", () => {
  loadMemory();
  if (Object.keys(chats).length === 0) newChat();
  else {
    currentChat = Object.keys(chats)[0];
    renderChatList();
    renderChat();
  }
  checkUserPlan();
  initAccountMenu();
});

/* =========================================================
   ENTER TO SEND
========================================================= */

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const input = document.getElementById("prompt");
    if (document.activeElement === input) send();
  }
});

/* =========================================================
   MODELS
========================================================= */

window.setModel = function(model, el) {
  selectedModel = model;
  document.querySelectorAll(".model-card").forEach(c => c.classList.remove("active"));
  if (el) el.classList.add("active");
  localStorage.setItem("selectedModel", model);
};

/* =========================================================
   CHAT SYSTEM
========================================================= */

window.newChat = function() {
  const id = "chat-" + Date.now();
  chats[id] = { messages: [] };
  currentChat = id;
  saveMemory();
  renderChatList();
  renderChat();
};

function switchChat(id) {
  currentChat = id;
  renderChat();
}

function renderChatList() {
  const list = document.getElementById("chatList");
  if (!list) return;
  list.innerHTML = "";
  Object.keys(chats).reverse().forEach(id => {
    const btn = document.createElement("button");
    btn.textContent = "💬 Chat " + id.slice(-4);
    btn.onclick = () => switchChat(id);
    list.appendChild(btn);
  });
}

/* =========================================================
   MEMORY
========================================================= */

function saveMemory() {
  localStorage.setItem("codeai_chats", JSON.stringify(chats));
}

function loadMemory() {
  const saved = localStorage.getItem("codeai_chats");
  if (saved) chats = JSON.parse(saved);
  const savedModel = localStorage.getItem("selectedModel");
  if (savedModel) selectedModel = savedModel;
}

/* =========================================================
   UTILS
========================================================= */

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

window.copyCode = function(btn) {
  const code = btn.parentElement.querySelector("code");
  if (!code) return;
  navigator.clipboard.writeText(code.innerText);
  btn.textContent = "✔";
  setTimeout(() => { btn.textContent = "📋"; }, 1000);
};

/* =========================================================
   FORMAT
========================================================= */

function formatText(text = "") {
  if (!text) return "";
  const parts = text.split("```");
  let result = "";
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      let txt = escapeHtml(parts[i]);
      txt = txt.replace(/^### (.*?)$/gm, "<div class='big-title'>$1</div>");
      txt = txt.replace(/^## (.*?)$/gm, "<div class='big-title'>$1</div>");
      txt = txt.replace(/^# (.*?)$/gm, "<div class='big-title'>$1</div>");
      txt = txt.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
      txt = txt.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      txt = txt.replace(/\*(.*?)\*/g, "<em>$1</em>");
      txt = txt.replace(/^- (.*)$/gm, "<div class='list-item'>• $1</div>");
      txt = txt.replace(/^\d+\. (.*)$/gm, "<div class='list-item'>$&</div>");
      txt = txt.replace(/\n/g, "<br>");
      result += `<div class="text-block">${txt}</div>`;
    } else {
      let code = parts[i].replace(/^(lua|python|javascript|js|html|css|bash|ts|json)\n?/i, "").trim();
      result += `
        <pre class="code-block">
          <button class="copy-btn" onclick="copyCode(this)">📋</button>
          <code>${escapeHtml(code)}</code>
        </pre>`;
    }
  }
  return result;
}

/* =========================================================
   THINKING
========================================================= */

function getThinkingText(text) {
  text = text.toLowerCase();
  if (text.includes("roblox") || text.includes("lua")) return "Analizando entorno Roblox y preparando solución LuaU...";
  if (text.includes("python")) return "Preparando solución Python optimizada...";
  if (text.includes("html") || text.includes("css")) return "Generando estructura frontend...";
  if (text.includes("error") || text.includes("bug")) return "Detectando y analizando el error...";
  if (text.includes("mapa") || text.includes("terreno")) return "Diseñando sistema de terreno para Roblox...";
  if (text.includes("api")) return "Preparando integración con API...";
  return "Analizando y preparando respuesta de código...";
}

function showThinking(userText) {
  const chat = document.getElementById("chat");
  const div = document.createElement("div");
  div.className = "msg ai";
  div.id = "thinking";
  div.innerHTML = `
    <div>Pensando <span id="dots">...</span></div>
    <div class="progress-bar"><div class="progress-fill"></div></div>
    <button class="thinking-btn" onclick="toggleThinkingPanel()">Ver proceso interno</button>
    <div id="thinking-panel" class="thinking-panel hidden">${getThinkingText(userText)}</div>
  `;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;

  let dots = 0;
  const dotsInt = setInterval(() => {
    const el = document.getElementById("dots");
    if (!el) return;
    dots = (dots + 1) % 4;
    el.innerText = ".".repeat(dots);
  }, 400);

  let progress = 0;
  const progInt = setInterval(() => {
    const fill = document.querySelector(".progress-fill");
    if (!fill) return;
    progress += Math.random() * 8;
    if (progress > 90) progress = 90;
    fill.style.width = progress + "%";
  }, 200);

  return { dotsInt, progInt };
}

window.toggleThinkingPanel = function() {
  const panel = document.getElementById("thinking-panel");
  if (panel) panel.classList.toggle("hidden");
};

function removeThinking(obj) {
  clearInterval(obj.dotsInt);
  clearInterval(obj.progInt);
  const fill = document.querySelector(".progress-fill");
  if (fill) fill.style.width = "100%";
  setTimeout(() => {
    const el = document.getElementById("thinking");
    if (el) el.remove();
  }, 300);
}

/* =========================================================
   RENDER CHAT
========================================================= */

function renderChat() {
  const chat = document.getElementById("chat");
  if (!chat) return;
  chat.innerHTML = "";
  if (!currentChat) return;
  chats[currentChat].messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "msg " + m.role;
    div.innerHTML = m.text;
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}

/* =========================================================
   SEND
========================================================= */

window.send = async function() {
  const input = document.getElementById("prompt");
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  if (!chats[currentChat]) newChat();

  chats[currentChat].messages.push({
    role: "user",
    text: escapeHtml(text),
    raw: text
  });

  saveMemory();
  renderChat();
  input.value = "";

  const thinking = showThinking(text);

  try {
    const history = chats[currentChat].messages
      .slice(-20)
      .map(m => ({
        role: m.role === "ai" ? "assistant" : "user",
        content: m.raw || m.text
      }));

    const modelData = MODELS[selectedModel];
    const systemPrompt = MASTER_PROMPT + "\n\n" + modelData.role;

    const response = await fetch(`${BACKEND}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: modelData.model,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: text }
        ]
      })
    });

    const data = await response.json();
    removeThinking(thinking);

    let reply = data?.choices?.[0]?.message?.content;
    if (!reply) reply = "Error: la IA no devolvió respuesta.";

    chats[currentChat].messages.push({
      role: "ai",
      text: formatText(reply),
      raw: reply
    });

    saveMemory();
    renderChat();

  } catch(err) {
    console.error(err);
    removeThinking(thinking);
    chats[currentChat].messages.push({
      role: "ai",
      text: "Error: " + err.message,
      raw: err.message
    });
    renderChat();
  }
};

/* =========================================================
   ACCOUNT MENU
========================================================= */

function initAccountMenu() {
  const panel = document.getElementById("accountPanel");
  const menu = document.getElementById("accountMenu");
  if (!panel || !menu) return;
  panel.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
  });
  document.addEventListener("click", () => {
    menu.classList.add("hidden");
  });
}

/* =========================================================
   MODAL
========================================================= */

window.openModal = function(type) {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");
  modal.classList.remove("hidden");

  if (type === "plans") {
    content.innerHTML = `
      <h2>💎 CodeAI Plus</h2>
      <div style="margin-top:15px;padding:15px;border-radius:12px;background:#0f1629;border:1px solid #1c2a4a;">
        <p style="opacity:0.8;margin-top:10px;">
          ✔ Modelos experimentales<br>
          ✔ Respuestas más rápidas<br>
          ✔ Prioridad en servidores
        </p>
        <h2 style="margin-top:15px;">4,99$ / Mes</h2>
        <button onclick="buyPlan()" style="width:100%;padding:10px;margin-top:15px;border:none;border-radius:10px;background:#2d6cdf;color:white;cursor:pointer;">
          💳 Comprar ahora
        </button>
      </div>
      <p style="font-size:12px;opacity:0.6;margin-top:10px;">Pago seguro vía Stripe</p>
    `;
  }

  if (type === "settings") {
    content.innerHTML = `
      <h2>⚙ Configuración</h2>
      <button onclick="resetAll()" style="width:100%;padding:10px;margin-top:10px;border:none;border-radius:10px;background:#1f3b6b;color:white;cursor:pointer;">
        ♻ Borrar todo y reiniciar
      </button>
    `;
  }
};

window.closeModal = function() {
  document.getElementById("modal").classList.add("hidden");
};

/* =========================================================
   STRIPE
========================================================= */

window.buyPlan = async function() {
  try {
    const res = await fetch(`${BACKEND}/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "plus" })
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Error creando sesión de pago");
  } catch(err) {
    alert("Error de conexión: " + err.message);
  }
};

/* =========================================================
   PLAN
========================================================= */

async function checkUserPlan() {
  try {
    const res = await fetch(`${BACKEND}/get-plan`);
    const data = await res.json();
    if (data.plan) {
      userPlan = data.plan;
      applyPlanUI();
    }
  } catch(err) {
    console.log("Modo free");
  }
}

function applyPlanUI() {
  const el = document.querySelector(".account-plan");
  if (el && userPlan === "plus") el.textContent = "CodeAI Plus 💎";
}

/* =========================================================
   RESET
========================================================= */

window.resetAll = function() {
  localStorage.clear();
  location.reload();
};