const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

let timer = 60; 
let currentBets = {}; 
let activeUsers = {}; 

setInterval(() => {
    timer--;
    if (timer < 0) {
        let winningNumbers = [];
        while(winningNumbers.length < 6) {
            let r = Math.floor(Math.random() * 25) + 1;
            if(!winningNumbers.includes(r)) winningNumbers.push(r);
        }
        
        let winnersList = [];
        for (let id in currentBets) {
            const userPicks = currentBets[id].numbers;
            const matches = userPicks.filter(num => winningNumbers.includes(num)).length;
            if (matches >= 3) {
                winnersList.push({ name: currentBets[id].name, matches: matches });
            }
        }

        io.emit('gameResult', { 
            winningNumbers: winningNumbers, 
            winners: winnersList 
        });

        timer = 60; 
        currentBets = {}; 
    }
    io.emit('timer', timer);
}, 1000);

io.on('connection', (socket) => {
    socket.on('joinGame', (userName) => {
        activeUsers[socket.id] = userName;
        io.emit('updateUserList', Object.values(activeUsers));
    });

    socket.on('placeBet', (data) => {
        currentBets[socket.id] = { name: data.name, numbers: data.numbers };
    });

    socket.on('disconnect', () => {
        delete activeUsers[socket.id];
        delete currentBets[socket.id];
        io.emit('updateUserList', Object.values(activeUsers));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server live on ${PORT}`));
