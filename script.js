let chats = {};
let currentChat = null;
let selectedModel = "phoenix";

let memory = {
  facts:[]
};

/* ---------------- INIT ---------------- */

window.onload = () => {
    newChat();
};

/* ---------------- ENTER ---------------- */

document.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        const input=document.getElementById("prompt");

        if(document.activeElement===input){
            send();
        }

    }

});

/* ---------------- MODELS ---------------- */

window.setModel=function(model,el){

    selectedModel=model;

    document.querySelectorAll(".model-card")
    .forEach(c=>c.classList.remove("active"));

    el.classList.add("active");

};

/* ---------------- CHAT ---------------- */

function newChat(){

    const id="chat-"+Date.now();

    chats[id]={
        messages:[]
    };

    currentChat=id;

    renderChatList();
    renderChat();

}

window.newChat=newChat;

function switchChat(id){

    currentChat=id;

    renderChat();

}

function renderChatList(){

    const list=document.getElementById("chatList");

    if(!list) return;

    list.innerHTML="";

    Object.keys(chats).forEach(id=>{

        const btn=document.createElement("button");

        btn.textContent="💬 "+id.slice(-4);

        btn.onclick=()=>switchChat(id);

        list.appendChild(btn);

    });

}

/* ---------------- COPY ---------------- */

window.copyCode=function(btn){

    const code=btn.parentElement.querySelector("code");

    if(!code) return;

    navigator.clipboard.writeText(
        code.innerText
    );

    btn.textContent="✔";

    setTimeout(()=>{

        btn.textContent="📋";

    },1000);

};

/* ---------------- SAFE HTML ---------------- */

function escapeHtml(str=""){

    return str
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;");

}

/* ---------------- FORMAT ---------------- */

function formatText(text=""){

    if(!text) return "";

    const parts=text.split("```");

    let result="";

    for(let i=0;i<parts.length;i++){

        if(i%2===0){

            let txt=escapeHtml(parts[i]);

            // titulo grande
            txt=txt.replace(
                /\*\*\*(.*?)\*\*\*/g,
                "<div class='big-title'>$1</div>"
            );

            // negrita
            txt=txt.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );

            // cursiva
            txt=txt.replace(
                /\*(.*?)\*/g,
                "<em>$1</em>"
            );

            // listas
            txt=txt.replace(
                /^- (.*)$/gm,
                "<div class='list-item'>• $1</div>"
            );

            txt=txt.replace(
                /\n/g,
                "<br>"
            );

            result+=`
            <div class="text-block">
                ${txt}
            </div>
            `;

        }

        else{

            let code=parts[i]
            .replace(
                /^(lua|python|javascript|js)\n?/i,
                ""
            )
            .trim();

            if(!code) continue;

            result+=`

<pre class="code-block">

<button
class="copy-btn"
onclick="copyCode(this)"
>

📋

</button>

<code>

${escapeHtml(code)}

</code>

</pre>

`;

        }

    }

    return result;

}

/* ---------------- THINKING ---------------- */

function showThinking(){

    const chat=document.getElementById(
        "chat"
    );

    const div=document.createElement(
        "div"
    );

    div.className="msg ai";

    div.id="thinking";

    div.innerHTML=`

<div>

Pensando
<span id="dots">

...

</span>

</div>

<div class="progress-bar">

<div class="progress-fill">

</div>

</div>

`;

    chat.appendChild(div);

    chat.scrollTop=
    chat.scrollHeight;

    let dots=0;

    const dotsInt=
    setInterval(()=>{

        const el=
        document.getElementById(
            "dots"
        );

        if(!el) return;

        dots=(dots+1)%4;

        el.innerText=
        ".".repeat(dots);

    },400);

    let progress=0;

    const progInt=
    setInterval(()=>{

        const fill=
        document.querySelector(
            ".progress-fill"
        );

        if(!fill) return;

        progress+=
        Math.random()*8;

        if(progress>100)
        progress=100;

        fill.style.width=
        progress+"%";

    },200);

    return{
        dotsInt,
        progInt
    };

}

function removeThinking(obj){

    clearInterval(obj.dotsInt);

    clearInterval(obj.progInt);

    const el=
    document.getElementById(
        "thinking"
    );

    if(el) el.remove();

}

/* ---------------- RENDER ---------------- */

function renderChat(){

    const chat=
    document.getElementById(
        "chat"
    );

    if(!chat) return;

    chat.innerHTML="";

    if(!currentChat) return;

    chats[currentChat]
    .messages
    .forEach(m=>{

        const div=
        document.createElement(
            "div"
        );

        div.className=
        "msg "+m.role;

        div.innerHTML=
        m.text;

        chat.appendChild(div);

    });

    chat.scrollTop=
    chat.scrollHeight;

}

/* ---------------- SEND ---------------- */

window.send=async function(){

    const input=
    document.getElementById(
        "prompt"
    );

    if(!input) return;

    const text=
    input.value.trim();

    if(!text) return;

    memory.facts.push(text);

    if(memory.facts.length>10)
    memory.facts.shift();

    chats[currentChat]
    .messages.push({

        role:"user",

        text:
        escapeHtml(text)

    });

    renderChat();

    input.value="";

    const thinking=
    showThinking();

    try{

        const res=
        await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json",

                "Authorization":
                "Bearer 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"

            },

            body:
            JSON.stringify({

                model:
                "llama-3.3-70b-versatile",

                messages:[

                    {
                        role:"system",

                        content:
                        selectedModel==="phoenix"

                        ?

                        "Experto Roblox LuaU"

                        :

                        "Experto Python"

                    },

                    {
                        role:"user",

                        content:text
                    }

                ]

            })

        });

        const data=
        await res.json();

        removeThinking(
            thinking
        );

        let reply=
        data
        ?.choices?.[0]
        ?.message
        ?.content

        ||

        "Sin respuesta";

        chats[currentChat]
        .messages.push({

            role:"ai",

            text:
            formatText(reply)

        });

        renderChat();

    }

    catch(err){

        removeThinking(
            thinking
        );

        chats[currentChat]
        .messages.push({

            role:"ai",

            text:
            "Error: "+
            err.message

        });

        renderChat();

    }

};