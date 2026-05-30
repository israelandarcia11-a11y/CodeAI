let chats = {};
let currentChat = null;
let selectedModel = "phoenix";

let userPlan = "free";

const MODELS = {
  phoenix: {
    name: "Phoenix 1.0",
    model: "llama-3.3-70b-versatile",
    role: `Eres experto en Roblox LuaU. Generas scripts optimizados.`
  },
  meta: {
    name: "Meta 1.0",
    model: "llama-3.3-70b-versatile",
    role: `Eres experto en Python, JS, HTML y APIs.`
  }
};

window.addEventListener("DOMContentLoaded", () => {
  loadMemory();
  if (Object.keys(chats).length === 0) newChat();
  else currentChat = Object.keys(chats)[0];
  renderChatList();
  renderChat();
  checkUserPlan();
  initAccountMenu();
});

window.newChat = function () {
  const id = "chat-" + Date.now();
  chats[id] = { messages: [] };
  currentChat = id;
  saveMemory();
  renderChatList();
  renderChat();
};

function saveMemory() {
  localStorage.setItem("codeai_chats", JSON.stringify(chats));
}

function loadMemory() {
  const data = localStorage.getItem("codeai_chats");
  if (data) chats = JSON.parse(data);
}

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

window.openModal = function (type) {
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
        <button onclick="buyPlan()"
          style="width:100%;padding:10px;margin-top:15px;border:none;border-radius:10px;background:#2d6cdf;color:white;">
          💳 Comprar ahora
        </button>
      </div>
      <p style="font-size:12px;opacity:0.6;margin-top:10px;">Pago seguro vía Stripe</p>
    `;
  }

  if (type === "settings") {
    content.innerHTML = `
      <h2>⚙ Configuración</h2>
      <button onclick="clearChats()"
        style="width:100%;padding:10px;margin-top:10px;border:none;border-radius:10px;background:#2d6cdf;color:white;">
        🗑 Borrar chats
      </button>
      <button onclick="resetAll()"
        style="width:100%;padding:10px;margin-top:10px;border:none;border-radius:10px;background:#1f3b6b;color:white;">
        ♻ Reset completo
      </button>
    `;
  }
};

window.closeModal = function () {
  document.getElementById("modal").classList.add("hidden");
};

window.buyPlan = async function () {
  try {
    const res = await fetch("https://codeai-pgko.onrender.com/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ plan: "plus" })
    });

    if (!res.ok) {
      const err = await res.json();
      alert("Error del servidor: " + err.error);
      return;
    }

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Error creando pago");
    }
  } catch (err) {
    alert("Error de conexión: " + err.message);
  }
};

async function checkUserPlan() {
  try {
    const res = await fetch("https://codeai-pgko.onrender.com/get-plan");
    const data = await res.json();
    if (data.plan) {
      userPlan = data.plan;
      applyPlanUI();
    }
  } catch (err) {
    console.log("Backend no conectado, modo free");
  }
}

function applyPlanUI() {
  const el = document.querySelector(".account-plan");
  if (el && userPlan === "plus") {
    el.textContent = "CodeAI Plus 💎";
  }
}

window.resetAll = function () {
  localStorage.clear();
  location.reload();
};

function renderChat() {
  const chat = document.getElementById("chat");
  chat.innerHTML = "";
  if (!currentChat) return;
  chats[currentChat].messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "msg " + m.role;
    div.textContent = m.text;
    chat.appendChild(div);
  });
  chat.scrollTop = chat.scrollHeight;
}

window.send = function () {
  const input = document.getElementById("prompt");
  const text = input.value.trim();
  if (!text) return;
  if (!chats[currentChat]) newChat();
  chats[currentChat].messages.push({ role: "user", text });
  renderChat();
  input.value = "";
};
