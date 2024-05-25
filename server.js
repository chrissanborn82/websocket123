// server.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle messages from the client
    socket.on('message', (data) => {
        console.log('Message received:', data);
        // Broadcast the message to all connected clients
        io.emit('message', data);
    });

    // Handle messages from the client
    socket.on('UserJoined', (data) => {
        console.log('UserJoined:', data);
        // Broadcast the message to all connected clients
        io.emit('UserJoined', data);
    });

    socket.on('Move', (data) => {
        console.log('move received', data);
        io.emit('Move', data);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});