const { GRID_SIZE } = require('./constants');

function initGame() {
    const state = createGameState()
    ///randomFood(state);
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
          x: 1,
          y: 0,
        },
        snake: [
          {x: 1, y: 10},
          {x: 2, y: 10},
          {x: 3, y: 10},
        ],
      }, {
        pos: {
          x: 18,
          y: 10,
        },
        vel: {
          x: 0,
          y: 0,
        },
        snake: [
          {x: 20, y: 10},
          {x: 19, y: 10},
          {x: 18, y: 10},
        ],
      }],
      food: {x: 10, y: 5},
      gridsize: GRID_SIZE,
    };
  }

