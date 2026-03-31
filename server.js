const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 🎰 GAME SETTINGS
let timer = 60; 
let currentBets = {}; // { socketId: { name, number } }
let totalPlayers = 0;

setInterval(() => {
    timer--;
    if (timer < 0) {
        // 🏆 6 UNIQUE LUCKY NUMBERS (1 to 25)
        let luckyNumbers = [];
        while(luckyNumbers.length < 6) {
            let r = Math.floor(Math.random() * 25) + 1;
            if(luckyNumbers.indexOf(r) === -1) luckyNumbers.push(r);
        }
        
        // Winner Check Logic
        let winnersList = [];
        for (let id in currentBets) {
            if (luckyNumbers.includes(currentBets[id].number)) {
                winnersList.push(currentBets[id].name);
            }
        }

        // Send Result to All
        io.emit('gameResult', { 
            numbers: luckyNumbers, // Array of 6 numbers
            winners: winnersList, 
            totalBets: Object.keys(currentBets).length 
        });

        timer = 60; 
        currentBets = {}; 
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
server.listen(PORT, () => console.log(`Jackpot Server Live: 1-25 Range | 6 Winners`));
