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
let currentBets = {}; 
let totalPlayers = 0;

setInterval(() => {
    timer--;
    if (timer < 0) {
        // 🏆 6 UNIQUE LUCKY NUMBERS
        let luckyNumbers = [];
        while(luckyNumbers.length < 6) {
            let r = Math.floor(Math.random() * 25) + 1;
            if(!luckyNumbers.includes(r)) luckyNumbers.push(r);
        }
        
        let winnersList = [];
        for (let id in currentBets) {
            const userPicks = currentBets[id].numbers;
            const hasMatched = userPicks.some(num => luckyNumbers.includes(num));
            if (hasMatched) {
                winnersList.push(currentBets[id].name);
            }
        }

        io.emit('gameResult', { 
            winningNumbers: luckyNumbers, 
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
        currentBets[socket.id] = { name: data.name, numbers: data.numbers };
        io.emit('updateLiveBets', Object.keys(currentBets).length);
    });

    socket.on('disconnect', () => {
        totalPlayers--;
        delete currentBets[socket.id];
        io.emit('playerCount', totalPlayers);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Jackpot Server Live on Port ${PORT}`));
