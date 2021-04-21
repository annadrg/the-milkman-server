const players = [];

//Join player to chat
function playerJoin(id, playername, room) {
  const player = { id, playername, room };

  players.push(player);

  return player;
}

// Get current player
function getCurrentplayer(id) {
  return players.find((player) => player.id === id);
}

// player leaves chat
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

module.exports = {
  playerJoin,
  getCurrentplayer,
  playerLeave,
  getRoomplayers,
};
