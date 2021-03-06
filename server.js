const { gameLoop, getUpdatedVelocity, initGame } = require("./game");
const { FRAME_RATE } = require("./constants");
const formatMessage = require("./messages");
const {
  playerJoin,
  playerLeave,
  getCurrentplayer,
  getRoomplayers,
  playerWon,
} = require("./players");

const express = require("express");
const http = require("http");
const { makeid } = require("./utils");

const app = express();
const server = http.createServer(app);
const options = {
  cors: {
    // origin: "http://127.0.0.1:8080",
    origin: "https://themilkmangame.netlify.app",
    methods: ["GET", "POST"],
  },
};

const io = require("socket.io")(server, options);

const state = {};
const clientRooms = {};

const botName = "The Milkman Bot";

io.on("connection", (client) => {
  client.on("keydown", handleKeydown);
  client.on("newGame", handleNewGame);
  client.on("joinGame", handleJoinGame);
  client.on("chatMessage", handleChatMessage);
  client.on("winnerMessage", handleWinnerMessage);
  client.on("disconnect", handleDisconnect);
  client.on("restartGame", handleRestartGame);
  client.on("playerWon", handlePlayerWon);

  function handleJoinGame(playerName, roomName) {
    const room = io.of("/").adapter.rooms.get(roomName);

    let allUsers;

    if (room) {
      allUsers = room.size;
    }

    if (allUsers === 0) {
      client.emit("unknownCode");
      return;
    } else if (allUsers > 1) {
      client.emit("tooManyPlayers");
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit("init", 2);

    const player = playerJoin(client.id, playerName, roomName);
    const players = getRoomplayers(roomName);
    io.sockets.in(roomName).emit("playersNames", JSON.stringify(players));

    // Broadcast when a player connects
    io.in(player.room).emit(
      "message",
      formatMessage(botName, `${player.playername} has joined the game`)
    );

    startGameInterval(roomName);
  }

  function handleNewGame(playerName) {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit("gameCode", roomName);

    state[roomName] = initGame();
    state[roomName].gameActive = true;

    client.join(roomName);
    client.number = 1;
    client.emit("init", 1);

    const player = playerJoin(client.id, playerName, roomName);
    const players = getRoomplayers(roomName);
    console.log("players new game ", players);
    io.sockets.in(roomName).emit("playersNames", JSON.stringify(players));
    // Welcome current player
    client.emit(
      "message",
      formatMessage(botName, `${player.playername} has joined the game`)
    );
  }

  function handleRestartGame() {
    const roomName = clientRooms[client.id];
    state[roomName] = initGame();
    io.sockets.in(roomName).emit("gameActive");
    state[roomName].gameActive = true;
    startGameInterval(roomName);
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!state[roomName]) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch (e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode, state, roomName, client.number);

    if (vel) {
      state[roomName].players[client.number - 1].vel = vel;
    }
  }

  function handleChatMessage(message) {
    const player = getCurrentplayer(client.id);

    io.to(player.room).emit(
      "message",
      formatMessage(player.playername, message)
    );
  }

  function handlePlayerWon() {
    playerWon(client.id);
    const player = getCurrentplayer(client.id);
    const players = getRoomplayers(player.room);
    io.to(player.room).emit("playerWins", JSON.stringify(players));
  }

  function handleWinnerMessage() {
    const player = getCurrentplayer(client.id);
    io.to(player.room).emit(
      "message",
      formatMessage(botName, `${player.playername} won!`)
    );
  }

  function handleDisconnect() {
    const player = playerLeave(client.id);

    if (player) {
      io.to(player.room).emit(
        "message",
        formatMessage(botName, `${player.playername} has left the game`)
      );
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);

    if (!winner) {
      emitGameState(roomName, state[roomName]);
      emitScore(roomName, state[roomName].players);
    } else {
      emitGameOver(roomName, winner, state[roomName]);
      //state[roomName] = null;
      clearInterval(intervalId);
    }
  }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room).emit("gameState", JSON.stringify(gameState));
}

function emitGameOver(room, winner, state) {
  state.gameActive = false;
  io.sockets.in(room).emit("gameOver", JSON.stringify({ winner }));
}

function emitScore(room, players) {
  io.sockets.in(room).emit("gameScore", JSON.stringify(players));
}

const PORT = process.env.PORT || 3000;

function onListen() {
  console.log(`Listening on ${PORT}`);
}
// Start the app
server.listen(PORT, onListen);
