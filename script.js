let chats = {};
let currentChat = null;
let selectedModel = "phoenix";

const MODELS = {
  phoenix: {
    name: "Phoenix 1.0",
    model: "llama-3.3-70b-versatile",
    role: `
Eres experto absoluto en:
- Roblox LuaU
- Sistemas de juego
- Optimización Roblox
- RemoteEvents
- UI Roblox
- Scripts completos y funcionales
`
  },
  meta: {
    name: "Meta 1.0",
    model: "llama-3.3-70b-versatile",
    role: `
Eres experto absoluto en:
- Python
- JavaScript
- APIs
- Backend
- Frontend
- Automatización
- Inteligencia artificial
`
  }
};

const MASTER_PROMPT = `
Eres CodeAI Ultimate.

OBJETIVOS:
- Resolver problemas con precisión
- Generar código profesional
- Explicar claramente
- Detectar errores automáticamente
- Optimizar scripts
- Mantener memoria contextual

COMPORTAMIENTO:
- Responde estructuradamente
- Usa títulos si ayuda
- Usa bloques de código limpios
- Piensa antes de responder
- Evita respuestas vagas
- Explica errores
- Mantén continuidad del chat

CUANDO GENERES CÓDIGO:
- Haz scripts completos
- Optimiza rendimiento
- Detecta bugs
- Usa buenas prácticas
- Hazlo listo para usar

ESTILO:
- Profesional
- Inteligente
- Técnico
- Natural
`;

window.onload = () => {
  loadMemory();
  newChat();
};

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const input = document.getElementById("prompt");
    if (document.activeElement === input) send();
  }
});

window.setModel = function(model, el) {
  selectedModel = model;
  document.querySelectorAll(".model-card").forEach(c => c.classList.remove("active"));
  if (el) el.classList.add("active");
  localStorage.setItem("selectedModel", model);
};

function newChat() {
  const id = "chat-" + Date.now();
  chats[id] = { messages: [] };
  currentChat = id;
  saveMemory();
  renderChatList();
  renderChat();
}

window.newChat = newChat;

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
    btn.textContent = "💬 " + id.slice(-4);
    btn.onclick = () => switchChat(id);
    list.appendChild(btn);
  });
}

function saveMemory() {
  localStorage.setItem("codeai_chats", JSON.stringify(chats));
}

function loadMemory() {
  const saved = localStorage.getItem("codeai_chats");
  if (saved) chats = JSON.parse(saved);
  const savedModel = localStorage.getItem("selectedModel");
  if (savedModel) selectedModel = savedModel;
}

window.copyCode = function(btn) {
  const code = btn.parentElement.querySelector("code");
  if (!code) return;
  navigator.clipboard.writeText(code.innerText);
  btn.textContent = "✔";
  setTimeout(() => { btn.textContent = "📋"; }, 1000);
};

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatText(text = "") {
  if (!text) return "";
  const parts = text.split("```");
  let result = "";
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      let txt = escapeHtml(parts[i]);
      txt = txt.replace(/\*\*\*(.*?)\*\*\*/g, "<div class='big-title'>$1</div>");
      txt = txt.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      txt = txt.replace(/\*(.*?)\*/g, "<em>$1</em>");
      txt = txt.replace(/^- (.*)$/gm, "<div class='list-item'>• $1</div>");
      txt = txt.replace(/\n/g, "<br>");
      result += `<div class="text-block">${txt}</div>`;
    } else {
      let code = parts[i].replace(/^(lua|python|javascript|js|html|css)\n?/i, "").trim();
      result += `<pre class="code-block"><button class="copy-btn" onclick="copyCode(this)">📋</button><code>${escapeHtml(code)}</code></pre>`;
    }
  }
  return result;
}

function getThinkingText(text) {
  text = text.toLowerCase();
  if (text.includes("roblox")) return "Analizando entorno Roblox y preparando solución LuaU...";
  if (text.includes("python")) return "Preparando solución Python optimizada...";
  if (text.includes("html")) return "Generando estructura frontend moderna...";
  if (text.includes("script")) return "Analizando lógica y optimizando código...";
  return "Procesando intención del usuario...";
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
    progress += Math.random() * 10;
    if (progress > 100) progress = 100;
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
  const el = document.getElementById("thinking");
  if (el) el.remove();
}

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
    const history = chats[currentChat].messages.map(m => ({
      role: m.role === "ai" ? "assistant" : "user",
      content: m.raw
    }));

    const modelData = MODELS[selectedModel];
    const systemPrompt = MASTER_PROMPT + "\n\n" + modelData.role;

    const response = await fetch("https://codeai-pgko.onrender.com/chat", {
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

window.openModal = function(type) {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");
  modal.classList.remove("hidden");
  if (type === "plans") {
    content.innerHTML = `
      <h2>💎 CodeAI Plans</h2>
      <div style="margin-top:15px;padding:15px;border-radius:12px;background:#0f1629;border:1px solid #1c2a4a;">
        <h3>CodeAI Plus</h3>
        <p style="opacity:0.8;margin-top:10px;">
          ✔ Modelos experimentales<br>
          ✔ Respuestas más rápidas<br>
          ✔ Prioridad en servidores
        </p>
        <h2 style="margin-top:15px;">4,99$ / Mes</h2>
        <button onclick="buyPlan()" style="width:100%;padding:10px;margin-top:15px;border:none;border-radius:10px;background:#2d6cdf;color:white;">
          💳 Comprar ahora
        </button>
      </div>
      <p style="font-size:12px;opacity:0.6;margin-top:10px;">Pago seguro vía Stripe</p>
    `;
  }
  if (type === "settings") {
    content.innerHTML = `
      <h2>⚙ Configuración</h2>
      <button onclick="clearChats()" style="width:100%;padding:10px;margin-top:10px;border:none;border-radius:10px;background:#2d6cdf;color:white;">🗑 Borrar chats</button>
      <button onclick="resetAll()" style="width:100%;padding:10px;margin-top:10px;border:none;border-radius:10px;background:#1f3b6b;color:white;">♻ Reset completo</button>
    `;
  }
};

window.closeModal = function() {
  document.getElementById("modal").classList.add("hidden");
};

window.buyPlan = async function() {
  try {
    const res = await fetch("https://codeai-pgko.onrender.com/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: "plus" })
    });
    if (!res.ok) {
      const err = await res.json();
      alert("Error del servidor: " + err.error);
      return;
    }
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert("Error creando pago");
  } catch(err) {
    alert("Error de conexión: " + err.message);
  }
};

window.resetAll = function() {
  localStorage.clear();
  location.reload();
};

async function checkUserPlan() {
  try {
    const res = await fetch("https://codeai-pgko.onrender.com/get-plan");
    const data = await res.json();
    if (data.plan) {
      userPlan = data.plan;
      applyPlanUI();
    }
  } catch(err) {
    console.log("Backend no conectado, modo free");
  }
}

function applyPlanUI() {
  const el = document.querySelector(".account-plan");
  if (el && userPlan === "plus") el.textContent = "CodeAI Plus 💎";
}