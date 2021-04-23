const players = [];

//Join player to room
function playerJoin(id, playername, room) {
  const player = { id, playername, room, timesWon: 0 };

  players.push(player);

  return player;
}

// Get current player
function getCurrentplayer(id) {
  return players.find((player) => player.id === id);
}

// player leaves room
function playerLeave(id) {
  const index = players.findIndex((player) => player.id === id);

  if (index !== -1) {
    return players.splice(index, 1)[0];
  }
}

// Get room players
function getRoomplayers(room) {
  return players.filter((player) => player.room === room);
}

function playerWon(id) {
  const playerWon = players.findIndex((player) => player.id === id);
  players[playerWon] = {
    ...players[playerWon],
    timesWon: players[playerWon].timesWon + 1,
  };
}

module.exports = {
  playerJoin,
  getCurrentplayer,
  playerLeave,
  getRoomplayers,
  playerWon,
};
