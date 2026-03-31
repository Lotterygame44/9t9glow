const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 🎰 GAME ENGINE SETTINGS
let timer = 60; 
let currentBets = {}; 
let totalPlayers = 0;

setInterval(() => {
    timer--;
    if (timer < 0) {
        // 🏆 GENERATE 6 UNIQUE WINNING NUMBERS (1-25)
        let winningNumbers = [];
        while(winningNumbers.length < 6) {
            let r = Math.floor(Math.random() * 25) + 1;
            if(!winningNumbers.includes(r)) winningNumbers.push(r);
        }
        
        // Winners check logic
        let winnersList = [];
        for (let id in currentBets) {
            const userPicks = currentBets[id].numbers;
            const matches = userPicks.filter(num => winningNumbers.includes(num)).length;
            
            // 🚨 STRICT RULE: Only 3 or more matches allowed in winner list
            if (matches >= 3) {
                winnersList.push({ name: currentBets[id].name, matches: matches });
            }
        }

        io.emit('gameResult', { 
            winningNumbers: winningNumbers, 
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
server.listen(PORT, () => console.log(`Jackpot Engine: 3-6 Match Only Rule Active`));
