const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const coordsRoutes = require('./src/routes/coordsRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;

// Middleware
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas
app.use('/api', coordsRoutes);

// Conectar a MongoDB
const mongoUri = 'mongodb://user:pass@localhost:27017/geoapi?authSource=admin';

mongoose.connect(mongoUri)
  .then(() => console.log('🟢 Conectado a MongoDB'))
  .catch(err => console.error('❌ Error conectando a MongoDB:', err));

// Conexión socket.io
io.on('connection', socket => {
  console.log('🟢 Cliente conectado vía WebSocket');

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado');
  });
});

// Iniciar servidor con socket
server.listen(PORT, () => {
  console.log(`🚀 API corriendo en http://localhost:${PORT}`);
});
