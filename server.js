const {createGameState, gameLoop, getUpdatedVelocity} = require('./game')
const {FRAME_RATE} = require('./constants')


const express = require('express')
const http = require('http')
const socketIo = require('socket.io')

const app = express()
const server = http.createServer(app)
const options = {
  cors: {
    origin: 'http://127.0.0.1:8080',
    methods: ['GET', 'POST']
  }
}

const io = socketIo(server, options)

function onConnect (socket) {
  socket.on('disconnect', () => {
    console.log('user disconnected')
  })

  socket.on('message', message => {
    io.emit('message', message)
  })
}

//io.on('connection', onConnect)

io.on('connection', client => {
    const state = createGameState()

    client.on('keydown', handleKeyDown)

    function handleKeyDown (keyCode) {
        try {
            keyCode = parseInt(keyCode)
        } catch(e){
            console.error(e)
        }

        const vel = getUpdatedVelocity(keyCode)

        if(vel) {
            state.player.vel = vel
        }
    }
    startGameInterval(client, state)
})

function startGameInterval (client, state){
    const intervalId = setInterval(()=>{
        const winner = gameLoop(state)

        if(!winner){
            client.emit('gameState', JSON.stringify(state))
            //console.log('game state')
        } else {
            client.emit('gameOver')
            clearInterval(intervalId)
        }
    }, 1000/FRAME_RATE)
}

const port = 3000

function onListen () {
  console.log(`Listening on ${port}`)
}

// Start the app
server.listen(port, onListen)