const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

let timer = 300; // 5 Minutes
let winningNumber = Math.floor(Math.random() * 100) + 1;
let allBets = {}; // Sabki bets: { socketId: { name: 'Gaurav', guess: 55 } }

setInterval(() => {
    timer--;
    if (timer <= 0) {
        // Result Declare Karo
        io.emit('round_ended', { winNum: winningNumber });
        
        // Reset Everything
        winningNumber = Math.floor(Math.random() * 100) + 1;
        timer = 300;
        allBets = {}; 
    }
    io.emit('tick', timer);
}, 1000);

io.on('connection', (socket) => {
    // Jab naya player login karega
    socket.on('login', (data) => {
        socket.playerName = data.name;
        console.log(`🚀 ${data.name} joined the game!`);
    });

    socket.on('place_bet', (data) => {
        allBets[socket.id] = { name: socket.playerName || "Guest", guess: data.guess };
        console.log(`${socket.playerName} bet on ${data.guess}`);
    });

    socket.on('disconnect', () => {
        delete allBets[socket.id];
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Game Live on Port ${PORT}`));