index.html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Chat</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
    <div id="chat">
        <h1 id="title">Chat</h1>
        <select id="language" onchange="updateLanguage()">
            <option value="es">Español</option>
            <option value="ru">Русский</option>
        </select>
        <div id="messages"></div>
        <div id="reply-box" style="display: none;">
            <p id="reply-text"></p>
            <button onclick="cancelReply()">Cancelar</button>
        </div>
        <input type="text" id="input-message" placeholder="Escribe un mensaje...">
        <input type="file" id="input-file" accept="image/*">
        <button onclick="sendMessage()">Enviar</button>
    </div>
    <script src="/client.js"></script>
</body>
</html>

client.js
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

styles.css
body {
    background-color: #1a1a1a;
    color: #ffffff;
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
}
#chat {
    max-width: 600px;
    margin: auto;
}
#title {
    font-size: 24px;
    text-align: center;
    margin-bottom: 10px;
}
#messages {
    height: 400px;
    overflow-y: auto;
    background-color: #2a2a2a;
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 10px;
}
.message {
    margin: 5px 0;
    padding: 10px;
    background-color: #333;
    border-radius: 5px;
    cursor: pointer;
}
.message.reply {
    border-left: 3px solid #4a4a4a;
    padding-left: 15px;
    margin-left: 10px;
}
.message .reply-content {
    font-size: 12px;
    color: #aaa;
    margin-bottom: 5px;
}
.message img {
    max-width: 100%;
    border-radius: 5px;
}
#reply-box {
    background-color: #4a4a4a;
    padding: 10px;
    border-radius: 5px;
    margin-bottom: 10px;
}
#reply-text {
    margin: 0;
    font-size: 14px;
    color: #ccc;
}
#input-message, #input-file, button, #language {
    width: 70%;
    padding: 10px;
    margin: 5px 0;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 5px;
}
button {
    width: auto;
    padding: 10px 20px;
    background-color: #4a4a4a;
    cursor: pointer;
}

messages.json
[]

package.json
  {
    "name": "mi-chat",
    "version": "1.0.0",
    "main": "server.js",
    "scripts": {
        "start": "node server.js"
    },
    "dependencies": {
        "express": "^4.17.1"
    }
}

server.js
const express = require('express');
const fs = require('fs');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

app.get('/messages', (req, res) => {
    try {
        const messages = JSON.parse(fs.readFileSync('messages.json'));
        res.json(messages);
    } catch (error) {
        res.status(500).send('Error al leer mensajes');
    }
});

app.post('/messages', (req, res) => {
    try {
        const messages = JSON.parse(fs.readFileSync('messages.json'));
        messages.push(req.body);
        fs.writeFileSync('messages.json', JSON.stringify(messages));
        res.send('Mensaje guardado');
    } catch (error) {
        res.status(500).send('Error al guardar mensaje');
    }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));
