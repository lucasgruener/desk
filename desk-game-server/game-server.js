const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const fs = require('fs');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());



const rooms = new Map();
const roomsPlayer = {};

wss.on('connection', (ws) => {
    const playerId = Math.random().toString(36).substring(7);
    ws.send(JSON.stringify({ type: 'playerId', playerId }));

    ws.on('message', (message) => {

        const data = JSON.parse(message);

        if (data.type === 'ping') {
            ws.send(JSON.stringify({
                type: 'pong'
            }));
        }
        if (data.type === 'roomCode') {
            roomCode = data.roomCode;
            console.log('new room code:', roomCode);
            if (!rooms.get(roomCode)) {

                const readJsonData = fs.readFileSync('mapData.json', 'utf8');
                const readMapAsObject = JSON.parse(readJsonData);


                const spritesMap = new Map(Object.entries(readMapAsObject));
                rooms.set(roomCode, { players: new Map(), sprites: spritesMap });
            }
            rooms.get(roomCode).players.set(data.playerId, {
                ws,
                x: 200,
                y: 200,
            });;


            roomsPlayer[playerId] = roomCode;
            let room = rooms.get(roomCode)

            for (const [existingPlayerId, existingPlayer] of room.players.entries()) {
                if (existingPlayerId !== playerId) {
                    let player = room.players.get(existingPlayerId);

                    ws.send(JSON.stringify({
                        type: 'newPlayer',
                        playerId: existingPlayerId,
                        x: player.x,
                        y: player.y,
                    }));
                }
            }
            for (const [spriteId, spriteInfo] of room.sprites.entries()) {
                ws.send(JSON.stringify({
                    type: 'addSprite',
                    spriteId,
                    key: spriteInfo.key,
                    x: spriteInfo.x,
                    y: spriteInfo.y,
                    scaleX: spriteInfo.scaleX,
                    scaleY: spriteInfo.scaleY
                }));
            }

            broadcast(roomCode, {
                type: 'newPlayer',
                playerId,
                x: rooms.get(roomCode).players.get(data.playerId).x,
                y: rooms.get(roomCode).players.get(data.playerId).y,
            });

        }
        if (data.type === 'updatePosition') {

            roomCode = roomsPlayer[playerId];
            let player = rooms.get(roomCode).players.get(playerId);
            player.x += data.x;
            player.y += data.y

            // rooms.get(roomCode).players.set(playerId, updatedP\layer); // Update the map with the clone
            broadcast(roomCode, {
                type: 'updatePosition',
                playerId,
                x: player.x,
                y: player.y,
                vectorX: data.x,
                vectorY: data.y
            });
        }
        if (data.type === 'addSprite') {
            roomCode = roomsPlayer[playerId];
            const spriteId = generateCode(); // Generate a unique ID
            rooms.get(roomCode).sprites.set(spriteId, {
                key: data.key,
                x: data.x,
                y: data.y,
                scaleX: 1,
                scaleY: 1,
            });

            let sprites = rooms.get(roomCode).sprites
            const mapAsObject = Object.fromEntries(sprites);
            const jsonData = JSON.stringify(mapAsObject, null, 2);
            fs.writeFileSync('mapData.json', jsonData);

            broadcast(roomCode, {
                type: 'addSprite',
                spriteId,
                key: data.key,
                x: data.x,
                y: data.y,
                scaleX: 1,
                scaleY: 1
            });
        }
        if (data.type === 'updateSprite') {
            roomCode = roomsPlayer[playerId];
            const { spriteId, x, y, scaleX, scaleY } = data;
            const updatedSprite = rooms.get(roomCode).sprites.get(spriteId);
            if (updatedSprite) {
                updatedSprite.x = x;
                updatedSprite.y = y;
                updatedSprite.scaleX = scaleX;
                updatedSprite.scaleY = scaleY;
                broadcast(roomCode, {
                    type: 'updateSprite',
                    spriteId,
                    x,
                    y,
                    scaleX,
                    scaleY,
                });


                let sprites = rooms.get(roomCode).sprites
                const mapAsObject = Object.fromEntries(sprites);
                const jsonData = JSON.stringify(mapAsObject, null, 2);
                fs.writeFileSync('mapData.json', jsonData);
            }
        }


        if (data.type === 'deleteSprite') {

            roomCode = roomsPlayer[playerId];
            rooms.get(roomCode).sprites.delete(data.spriteId)

            let sprites = rooms.get(roomCode).sprites
            const mapAsObject = Object.fromEntries(sprites);
            const jsonData = JSON.stringify(mapAsObject, null, 2);
            fs.writeFileSync('mapData.json', jsonData);


            broadcast(roomCode, {
                type: 'deleteSprite',
                spriteId: data.spriteId,
            });
        }
    });

    ws.on('close', () => {
        roomCode = roomsPlayer[playerId];
        if (rooms.get(roomCode)) {
            rooms.get(roomCode).players.delete(playerId);
            if (rooms.get(roomCode).players.size === 0) {
                rooms.delete(roomCode)
                console.log('room deleted')
            }
        }
        broadcast(roomCode, { type: 'playerDisconnected', playerId });
    });
});

function generateCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';

    for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }

    return code;
}


function broadcast(roomCode, data) {
    let room = rooms.get(roomCode);

    if (room) {
        for (const [playerId, player] of room.players.entries()) {
            if (player.ws.readyState === WebSocket.OPEN) {
                player.ws.send(JSON.stringify(data));
            }
        }
    }
}

server.listen(process.env.PORT || 8081, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
