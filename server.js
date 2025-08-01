const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

let messages = []; // Lista en memoria (temporal)

app.get('/messages', (req, res) => {
  try {
    res.json(messages);
  } catch (error) {
    console.error('Error en GET /messages:', error);
    res.status(500).send('Error al obtener mensajes');
  }
});

app.post('/messages', (req, res) => {
  try {
    console.log('Recibido POST /messages:', req.body);
    messages.push(req.body);
    res.status(200).send('Mensaje guardado');
  } catch (error) {
    console.error('Error en POST /messages:', error);
    res.status(500).send('Error al guardar mensaje');
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Servidor en puerto ${port}`));
