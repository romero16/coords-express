const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const coordsRoutes = require('./src/routes/coordsRoutes');
const usersRoutes = require('./src/routes/usersRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server,{
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Middleware
app.use(bodyParser.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas
app.use('/api/v1/coords', coordsRoutes);
app.use('/api/v1/users', usersRoutes);

// Conexión socket.io
io.on('connection', socket => {
  console.log('Cliente conectado vía WebSocket');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Iniciar servidor con socket
server.listen(PORT, () => {
  console.log(`API corriendo en http://localhost:${PORT}`);
});
