const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// 🎰 GAME SETTINGS
let timer = 60; // 1 Minute = 60 Seconds
let winningNumber = null;

// 🕒 SERVER TIMER LOGIC
setInterval(() => {
    timer--;

    if (timer < 0) {
        // 🏆 Winner Choose Karo (1-100)
        winningNumber = Math.floor(Math.random() * 100) + 1;
        
        // Sabko Result Bhejo
        io.emit('gameResult', { 
            number: winningNumber,
            message: "Round Ended!" 
        });

        // Timer Reset to 1 minute
        timer = 60; 
    }

    // Har second timer update bhejo
    io.emit('timer', timer);
}, 1000);

io.on('connection', (socket) => {
    socket.emit('timer', timer); // Naye bande ko current time dikhao
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
