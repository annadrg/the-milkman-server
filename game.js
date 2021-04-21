const { GRID_SIZE } = require('./constants');

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}

function initGame() {
  const state = createGameState()
  randomFood(state);
  return state;
}

function createGameState() {
  return {
    players: [{
      pos: {
        x: 3,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 1, y: 10},
        {x: 2, y: 10},
        {x: 3, y: 10},
      ],
      score: 0,
    }, {
      pos: {
        x: 16,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 18, y: 10},
        {x: 17, y: 10},
        {x: 16, y: 10},
      ],
      score: 0
    }],
    food: {},
    gridsize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
    return 2;
  }

  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    return 1;
  }

  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    playerOne.score += 1
    randomFood(state);
  }

  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    playerTwo.score += 1
    randomFood(state);
  }

  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        return 2;
      }
    }

    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        return 1;
      }
    }

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  return false;
}

function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  }

  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }


  state.food = food;
}


function getUpdatedVelocity(keyCode, state, roomName) {
  //console.log('this is the state',state[roomName].players)
  switch (keyCode) {
    case 37: { // left
      for (let player of state[roomName].players){
        //console.log('players Vel:', player.vel, player.vel.x === 1 && player.vel.y === 0 )
        if (player.vel.x === 1 && player.vel.y === 0 ){
          return { x: 1, y: 0 }
        } else {
          return { x: -1, y: 0 };
        }
      } 
    }
    case 38: { // down
      for (let player of state[roomName].players){
        if(player.vel.x === 0 && player.vel.y === 1){
          return { x: 0, y: 1 }
        } else {
          return { x: 0, y: -1 };
        }
      }
    } 
    case 39: { // right
      for (let player of state[roomName].players){
        if(player.vel.x === -1 && player.vel.y === 0){
          return {x:-1, y:0}
        } else {
          return { x: 1, y: 0 };
        }
      }
    }
    case 40: { // up
        for (let player of state[roomName].players){
        if(player.vel.x === 0 && player.vel.y === -1){
          return {x:0, y:-1}
        } else {
          return { x: 0, y: 1 };
        }
      }
    }
  }
}

