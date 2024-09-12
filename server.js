const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const tiktokUsername = 'dejw_judasz'; // Zastąp to nazwą użytkownika TikTok

const tiktokConnection = new WebcastPushConnection(tiktokUsername);

const userGifts = {};

tiktokConnection.connect().then(() => {
    console.log('Connected to TikTok live chat');
}).catch(err => {
    console.error('Failed to connect', err);
});

tiktokConnection.on('gift', (data) => {
    console.log('Received gift event:', data); // Log received gift event

    const userId = data.uniqueId;

    // Check if user already exists
    if (!userGifts[userId]) {
        userGifts[userId] = {
            profilePictureUrl: data.profilePictureUrl,
            gifts: {},
            total: 0
        };
    }

    // Update the gift count and value
    const giftName = data.giftName;
    const giftCount = data.repeatCount;
    const giftValue = data.diamondCount * data.repeatCount;

    if (!userGifts[userId].gifts[giftName]) {
        userGifts[userId].gifts[giftName] = {
            count: 0,
            value: 0,
            giftPictureUrl: data.giftPictureUrl
        };
    }

    userGifts[userId].gifts[giftName].count = giftCount;
    userGifts[userId].gifts[giftName].value = data.diamondCount * giftCount;
    userGifts[userId].total += giftValue;

    // Emit updated gift data
    io.emit('gift', {
        uniqueId: userId,
        profilePictureUrl: data.profilePictureUrl,
        giftName: giftName,
        giftPictureUrl: data.giftPictureUrl,
        repeatCount: userGifts[userId].gifts[giftName].count,
        value: userGifts[userId].gifts[giftName].value
    });
});

// Serwuj pliki statyczne z katalogu 'public'
app.use(express.static('public'));

// Nasłuchuj na porcie 3000
server.listen(3000, () => {
    console.log('Listening on *:3000');
});
