const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const coordsRoutes = require('./src/routes/coordsRoutes');
const usersRoutes = require('./src/routes/authRoutes');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server,{
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});


app.use(bodyParser.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas
app.use('/api/v1/coords', coordsRoutes);
app.use('/api/v1/auth', usersRoutes);

// Conexión socket.io
io.on('connection', socket => {
  console.log('Cliente conectado vía WebSocket');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

server.listen(process.env.HOST_PORT, () => {
  console.log(`API corriendo en ${process.env.HOST_NAME}:${process.env.HOST_PORT}`);
});
