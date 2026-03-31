const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Static files (index.html, etc.) ke liye
app.use(express.static(path.join(__dirname, 'public')));

// 🎰 GAME LOGIC VARIABLES
let timer = 180; // 3 Minutes (180 Seconds)
let lastWinnerNumber = null;

// 🕒 GLOBAL TIMER (Har 1 second mein chalega)
setInterval(() => {
    timer--;

    if (timer < 0) {
        // 🏆 WINNER SELECTION (Timer khatam hote hi)
        lastWinnerNumber = Math.floor(Math.random() * 100) + 1;
        
        // Sabhi users ko result bhejo
        io.emit('gameResult', { 
            number: lastWinnerNumber,
            message: "Round Ended! New Round Starting..."
        });

        // Timer reset karo 3 minute par
        timer = 180; 
    }

    // Sabhi users ko current time bhejo
    io.emit('timer', timer);
}, 1000);

// User Connect hone par
io.on('connection', (socket) => {
    console.log('A user connected');
    
    // Naye user ko turant current timer bhej do
    socket.emit('timer', timer);

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Render ya Local port handle karo
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
