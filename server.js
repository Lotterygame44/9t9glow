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
let currentBets = {}; // { socketId: { name, numbers: [] } }
let totalPlayers = 0;

setInterval(() => {
    timer--;
    if (timer < 0) {
        // 🏆 GENERATE 6 UNIQUE LUCKY NUMBERS (1-25)
        let luckyNumbers = [];
        while(luckyNumbers.length < 6) {
            let r = Math.floor(Math.random() * 25) + 1;
            if(!luckyNumbers.includes(r)) luckyNumbers.push(r);
        }
        
        // Winner Check: Agar user ke 6 picks mein se KOI BHI lucky numbers mein hai
        let winnersList = [];
        for (let id in currentBets) {
            const userPicks = currentBets[id].numbers;
            const hasMatched = userPicks.some(num => luckyNumbers.includes(num));
            
            if (hasMatched) {
