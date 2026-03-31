const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 🎰 GAME ENGINE VARIABLES
let timer = 60; 
let currentBets = {}; // { socketId: { name, number } }
let totalPlayers = 0;

setInterval(() => {
    timer--;
    if (timer < 0) {
        const winningNumber = Math.floor(Math.random() * 100) + 1;
        
        // Winner Check Logic
        let winners = [];
        for (let id in currentBets) {
            if (currentBets[id].number === winningNumber) {
                winners.push(currentBets[id].name);
            }
        }

        // Result Broadcast
        io.emit('gameResult', { 
            number: winningNumber, 
            winners: winners, 
            totalBets: Object.keys(currentBets).length 
        });

        timer = 60; 
        currentBets = {}; // Reset for next round
    }
    io.emit('timer', timer);
}, 1000);

io.on('connection', (socket) => {
    totalPlayers++;
    io.emit('playerCount', totalPlayers);

    socket.on('placeBet', (data) => {
        currentBets[socket.id] = { name: data.name, number: data.number };
        io.emit('updateLiveBets', Object.keys(currentBets).length);
    });

    socket.on('disconnect', () => {
        totalPlayers--;
        delete currentBets[socket.id];
        io.emit('playerCount', totalPlayers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Jackpot Server live on ${PORT}`));
