const {gameLoop, getUpdatedVelocity, initGame} = require('./game')
const {FRAME_RATE} = require('./constants')

const express = require('express')
const http = require('http')
const { makeid } = require('./utils')

const app = express()
const server = http.createServer(app)
const options = {
  cors: {
    origin: 'http://127.0.0.1:8080',
    methods: ['GET', 'POST']
  }
}

const io = require('socket.io')(server, options)


function onConnect (socket) {
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('message', message => {
    io.emit('message', message)
  })
}

const state = {};
const clientRooms = {};

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);

  function handleJoinGame(roomName) {
    console.log(roomName)
    const room = io.sockets.adapter.rooms[roomName];
    console.log('this is room', io.sockets.adapter.rooms[roomName])
    console.log('room is:', room)
    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    
    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

const port = 3000

function onListen () {
  console.log(`Listening on ${port}`)
}
// Start the app
server.listen(port, onListen)