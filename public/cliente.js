let translations = {
    "es": {
        "title": "Chat",
        "placeholder": "Escribe un mensaje...",
        "reply": "Respondiendo a",
        "cancel": "Cancelar"
    },
    "ru": {
        "title": "Чат",
        "placeholder": "Напишите сообщение...",
        "reply": "Ответ на",
        "cancel": "Отмена"
    }
};
let replyTo = null;

function updateLanguage() {
    const lang = document.getElementById("language").value;
    document.getElementById("title").innerText = translations[lang].title;
    document.getElementById("input-message").placeholder = translations[lang].placeholder;
    document.getElementById("reply-box").querySelector("button").innerText = translations[lang].cancel;
    if (replyTo) {
        document.getElementById("reply-text").innerText = `${translations[lang].reply}: ${replyTo.content}`;
    }
}

function loadMessages() {
    fetch('/messages')
        .then(response => response.json())
        .then(messages => {
            const messagesDiv = document.getElementById("messages");
            messagesDiv.innerHTML = "";
            messages.forEach((msg, index) => {
                const div = document.createElement("div");
                div.className = "message";
                if (msg.replyTo !== undefined) {
                    div.className += " reply";
                    div.innerHTML = `<div class="reply-content">${messages[msg.replyTo]?.content || "Mensaje eliminado"}</div>`;
                }
                if (msg.type === "text") {
                    div.innerHTML += `<p>${msg.content}</p>`;
                } else if (msg.type === "image") {
                    div.innerHTML += `<img src="${msg.content}" alt="Imagen">`;
                }
                div.onclick = () => startReply(index, msg.content);
                messagesDiv.appendChild(div);
            });
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
}

function startReply(index, content) {
    replyTo = { index, content };
    const lang = document.getElementById("language").value;
    document.getElementById("reply-text").innerText = `${translations[lang].reply}: ${content}`;
    document.getElementById("reply-box").style.display = "block";
}

function cancelReply() {
    replyTo = null;
    document.getElementById("reply-box").style.display = "none";
}

function sendMessage() {
    const input = document.getElementById("input-message");
    const fileInput = document.getElementById("input-file");

    if (input.value) {
        const message = { type: "text", content: input.value };
        if (replyTo) message.replyTo = replyTo.index;
        fetch('/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        }).then(() => {
            input.value = "";
            cancelReply();
            loadMessages();
        });
    }

    if (fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const message = { type: "image", content: e.target.result };
            if (replyTo) message.replyTo = replyTo.index;
            fetch('/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            }).then(() => {
                fileInput.value = "";
                cancelReply();
                loadMessages();
            });
        };
        reader.readAsDataURL(fileInput.files[0]);
    }
}

updateLanguage();
loadMessages();
setInterval(loadMessages, 5000);
