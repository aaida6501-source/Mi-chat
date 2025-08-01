async function sendMessage() {
  const input = document.getElementById('message-input');
  const fileInput = document.getElementById('file-input');
  let messages = JSON.parse(localStorage.getItem('messages') || '[]');

  // Enviar texto
  if (input.value) {
    messages.push({ type: 'text', content: input.value });
    input.value = '';
  }

  // Enviar archivo
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      messages.push({ type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'file', content: e.target.result, name: file.name });
      localStorage.setItem('messages', JSON.stringify(messages));
      loadMessages();
    };
    reader.readAsDataURL(file);
    fileInput.value = '';
  } else {
    localStorage.setItem('messages', JSON.stringify(messages));
    loadMessages();
  }
}

async function loadMessages() {
  const messages = JSON.parse(localStorage.getItem('messages') || '[]');
  const chat = document.getElementById('chat');
  chat.innerHTML = messages.map(msg => {
    if (msg.type === 'text') {
      return `<div class="message">${msg.content}</div>`;
    } else if (msg.type === 'image') {
      return `<div class="message"><img src="${msg.content}" alt="${msg.name}"></div>`;
    } else if (msg.type === 'video') {
      return `<div class="message"><video src="${msg.content}" controls></video></div>`;
    } else {
      return `<div class="message"><a href="${msg.content}" download="${msg.name}">${msg.name}</a></div>`;
    }
  }).join('');
  chat.scrollTop = chat.scrollHeight;
}

document.getElementById('language').addEventListener('change', (e) => {
  const lang = e.target.value;
  document.getElementById('message-input').placeholder = lang === 'es' ? 'Escribe un mensaje' : 'Напишите сообщение';
});

// Cargar mensajes al iniciar
loadMessages();
