const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const coordsRoutes = require('./src/routes/coordsRoutes');
const usersRoutes = require('./src/routes/authRoutes');
const { swaggerUi, specs } = require('./src/docs/swagger');
const socketStore = require('./src/socketStorage');
const cors = require('cors');
require('dotenv').config();
require('./src/jobs/scheduler'); // Job para guardar coordenadas cuando tiene x tiempo de inactividad

const app = express();
const server = http.createServer(app);

//ESTABLECER AQUI SOLO LAS RUTAS AUTORIZADAS PARA PARA EL API
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));

//ESTABLECER AQUI SOLO LAS RUTAS AUTORIZADAS PARA LA RESPUESTA DEL SOCKET
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/v1/coords', coordsRoutes);
app.use('/api/v1/auth', usersRoutes);

// Conexión socket.io
io.on('connection', socket => {
   const sessionId = socket.handshake.query.session;
  console.log(`Cliente conectado vía WebSocket - sesión ${sessionId}`);

  if(!socketStore.getSocket(sessionId)){
      socketStore.setSocket(sessionId, socket);
  }

  socket.on('disconnect', () => {
       console.log(`Cliente desconectado vía WebSocket - sesión ${sessionId}`);
       socketStore.deleteSocket(sessionId);
  });
});

server.listen(process.env.HOST_PORT, () => {
  console.log(`API corriendo en ${process.env.HOST_NAME}:${process.env.HOST_PORT}`);
});
