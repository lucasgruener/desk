const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors')
const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIO(server);

// Set up CORS middleware to allow requests from any origin

let userSettings = {};
const connectedClients = {};
const rooms = new Map();
let roomsPlayer = {};

io.on('connection', socket => {


    console.log('User connected:', socket.id);



    socket.on('roomCode', data => {
        roomCode = data.roomCode;
        console.log('new room code:', roomCode);
        if (!rooms.get(roomCode)) {
            rooms.set(roomCode, { players: new Map() });
        }

        rooms.get(roomCode).players.set(socket.id,
            socket
        );


        userSettings[socket.id] = { audio: data.audio, video: data.video };
        roomsPlayer[socket.id] = roomCode;

        let players = rooms.get(roomCode).players.entries()

        // connectedClients[socket.id] = socket;


        let serializedConnectedClients = {};
        let i = 0;

        for (const [clientId, client] of players) {
            console.log('clientID', clientId)
            serializedConnectedClients[clientId] = true// You can use a simplified structure here
            if (clientId !== socket.id) {
                client.emit('userJoined', JSON.stringify({ clientId: socket.id, settings: userSettings[socket.id] }));
                socket.emit('userIn', JSON.stringify({ clientId: clientId, settings: userSettings[clientId] }));
            
        
            }
        }


        socket.emit('joined', serializedConnectedClients);


    });

    socket.on('offer', offer => {
        console.log('Received offer from:', socket.id);

        roomCode = roomsPlayer[socket.id];
        let players = rooms.get(roomCode).players.entries()
        for (const [clientId, client] of players) {
            if (clientId == offer.target) {
                client.emit('offer', offer);
            }
        }
    });

    socket.on('answer', answer => {
        console.log('Received answer from:', socket.id);
        roomCode = roomsPlayer[socket.id];
        let players = rooms.get(roomCode).players.entries()
        for (const [clientId, client] of players) {
            if (clientId == answer.target) {
                client.emit('answer', answer);
            }
        }
    });

    socket.on('ice-candidate', candidate => {
        console.log('Received ICE candidate from:', socket.id);
        roomCode = roomsPlayer[socket.id];
        if (roomCode) {
            let players = rooms.get(roomCode).players.entries()
            for (const [clientId, client] of players) {
                if (clientId == candidate.target) {
                    client.emit('ice-candidate', candidate);
                }
            }
        }
    });
    socket.on('join', message => {
        roomCode = roomsPlayer[socket.id];
        let players = rooms.get(roomCode).players.entries()
        for (const [clientId, client] of players) {
            client.emit('join', message);

        }
        console.log('User joined with ID:', socket.id)
    });


    socket.on('toggle-audio', data => {
        roomCode = roomsPlayer[socket.id];
        let players = rooms.get(roomCode).players.entries()
        for (const [clientId, client] of players) {
            client.emit('toggle-audio', data);

        }
        userSettings[socket.id].audio = !userSettings[socket.id].audio

    });
    socket.on('toggle-video', data => {
        roomCode = roomsPlayer[socket.id];
        let players = rooms.get(roomCode).players.entries()
        for (const [clientId, client] of players) {
            client.emit('toggle-video', data);

        }
        userSettings[socket.id].video = !userSettings[socket.id].video
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        roomCode = roomsPlayer[socket.id];

        if (rooms.get(roomCode)) {
            rooms.get(roomCode).players.delete(socket.id);
            let players = rooms.get(roomCode).players.entries()

            for (const [clientId, client] of players) {
                if (clientId !== socket.id) {
                    client.emit('user-disconnected', socket.id);
                }
            }


        }
        if (rooms.get(roomCode)) {
            if (rooms.get(roomCode).players.size === 0) {
                rooms.delete(roomCode)
                console.log('room deleted')
            }
        }
    });
});

server.listen(process.env.PORT || 8080, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});