const express = require('express');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

let messages = []; // Lista en memoria (temporal)

app.get('/messages', (req, res) => {
  res.json(messages);
});

app.post('/messages', (req, res) => {
  messages.push(req.body);
  res.status(200).send('Mensaje guardado');
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));
