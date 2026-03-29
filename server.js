const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const DB_URI = "mongodb://9t9glow:QWERASDFZXCV-OO@ac-o4cawd9-shard-00-00.s8c4t4z.mongodb.net:27017,ac-o4cawd9-shard-00-01.s8c4t4z.mongodb.net:27017,ac-o4cawd9-shard-00-02.s8c4t4z.mongodb.net:27017/?ssl=true&replicaSet=atlas-uzabw3-shard-0&authSource=admin&appName=Cluster0";
mongoose.connect(DB_URI)
    .then(() => console.log("✅ Database Connected!"))
    .catch(err => console.log("❌ DB Error:", err));

// 📝 PLAYER SCHEMA (Data ka Naksha)
const playerSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    coins: { type: Number, default: 1000 }
});
const Player = mongoose.model('Player', playerSchema);

// 🎰 GAME LOGIC
let timer = 300;
let winningNumber = Math.floor(Math.random() * 100) + 1;

setInterval(async () => {
    timer--;
    if (timer <= 0) {
        io.emit('round_ended', { winNum: winningNumber });
        winningNumber = Math.floor(Math.random() * 100) + 1;
        timer = 300;
    }
    io.emit('tick', timer);
}, 1000);

io.on('connection', (socket) => {
    // LOGIN: Database se coins uthao
    socket.on('login', async (data) => {
        try {
            let user = await Player.findOne({ name: data.name });
            if (!user) {
                user = new Player({ name: data.name, coins: 1000 });
                await user.save();
            }
            socket.playerName = user.name;
            socket.emit('update_balance', user.coins);
            console.log(`👤 ${user.name} logged in with ${user.coins} coins`);
        } catch (err) { console.log(err); }
    });

    // BET: Database mein coins minus karo
    socket.on('place_bet', async (data) => {
        try {
            let user = await Player.findOne({ name: socket.playerName });
            if (user && user.coins >= 10) {
                user.coins -= 10;
                await user.save();
                socket.emit('update_balance', user.coins);
                console.log(`💰 ${user.name} bet on ${data.guess}. New Balance: ${user.coins}`);
            }
        } catch (err) { console.log(err); }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Game Live on Port ${PORT}`));