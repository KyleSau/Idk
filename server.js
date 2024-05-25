const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('A user connected');

    // Emit the 'playAnimation' event every 5 seconds
    const interval = setInterval(() => {
        socket.emit('playAnimation');
        console.log('playAnimation event sent');
    }, 5000);

    socket.on('button', () => {
        console.log('button pressed');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        clearInterval(interval);
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});