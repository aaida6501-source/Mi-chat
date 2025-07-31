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
