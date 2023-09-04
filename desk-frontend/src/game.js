import Phaser from 'phaser';
import { joystick, joystickPosition } from './joystick';
import { connectWallet, fetchNFTS, mintToken } from './metamask.js';


export function joinGame(roomCode) {
    // window.addEventListener('load', () => {
    const isMobile = 'ontouchstart' in window;

    if (isMobile) {
        joystick()
    }

    // })

    const config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            parent: 'body',
            width: '100%',
            height: '100%',
        },
        resolution: window.devicePixelRatio,
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };

    const fullscreenButton = document.getElementById('fullscreen-button');
    const editorButton = document.getElementById('editor-button')

    const deleteButton = document.getElementById('delete-button')
    const rotateButton = document.getElementById('rotate-button')
    const connectMetamask = document.getElementById('connect-metamask');
    const mint = document.getElementById('mint');
    let userAddress;

    // Add a click event listener to the button
    function start() {
        fullscreenButton.addEventListener('click', toggleFullScreen);
        editorButton.addEventListener('click', toggleEditorMode);

        deleteButton.addEventListener('click', deleteSelectedSprite);
        rotateButton.addEventListener('click', handleSpriteInvert);

        mint.addEventListener('click', handleMint)
        connectMetamask.addEventListener('click', () => {

            connectWallet()
                .then((user) => {
                    connectMetamask.style.display = 'none'
                    mint.style.display = 'block'
                    let formatedAddress = formatWalletAddress(user)
                    const addressElement = document.getElementById('address')
                    addressElement.textContent = formatedAddress;
                    addressElement.style.display = 'block';
                    const customSprites = document.getElementById('custom-sprite-options')
                    customSprites.style.backgroundImage = "url('./images/loading.gif')"
                    populateCustomNFTs(user)
                    userAddress = user

                })
        });
        populateSpritesEditor()
    }

    function handleMint() {
        mintToken()
            .then(() => {
                setTimeout(populateCustomNFTs(userAddress, 9000))
            })
    }
    function populateCustomNFTs(user) {
        let errorMessage = document.getElementById('error')
        errorMessage.style.display = 'none'
        fetchNFTS(user)
            .then((nftList) => {
                if (nftList.status === 500) {
                    setTimeout(populateCustomNFTs(user), 1000)
                }
                else {
                    const customSprites = document.getElementById('custom-sprite-options')
                    const elements = customSprites.querySelectorAll('div');
                    if (elements) {
                        elements.forEach((element) => {
                            element.remove()
                        })
                    }
                    customSprites.style.backgroundImage = 'none'

                    if (!nftList) {

                        console.log('no NFT found')
                        let errorMessage = document.getElementById('error')
                        errorMessage.style.display = 'block'
                    } else {
                        loopPremiumSprites(nftList, customSprites)

                    }

                }
            })
    }
    function formatWalletAddress(walletAddress) {
        const firstThree = walletAddress.slice(0, 2); // Extract the first three characters
        const lastThree = walletAddress.slice(-3); // Extract the last three characters

        const formattedAddress = `${firstThree}...${lastThree}`;

        return formattedAddress;
    }


    function populateSpritesEditor() {

        const spriteOptionsUI = document.getElementById('sprite-options');

        const spriteOptions = ['green-chair', 'long-table', 'computer', 'retro-computer', 'white-chair', 'plant', 'soda-machine', 'bookshelf', 'window', 'coffe-cup', 'blue-sofa'];


        loopSprites(spriteOptions, spriteOptionsUI)
    }

    function loopSprites(sprites, folder) {

        sprites.forEach((key) => {
            spritesAdded[key] = true;
            const spriteOption = document.createElement('div');
            spriteOption.classList.add('sprite-option');
            spriteOption.style.backgroundImage = `url(images/${key}.png)`;
            spriteOption.setAttribute('data-key', key);
            spriteOption.alt = key.replace('-', ' ');

            spriteOption.addEventListener('click', (event) => {
                selectedSpriteKey = event.target.getAttribute('data-key');

                 if (selectedSpriteOption){
                    selectedSpriteOption.style.backgroundColor = '';
                    selectedSpriteOption.style.borderRadius= '';
                    selectedSpriteOption = null
                }
                spriteOption.style.backgroundColor = '#ffffff91'
                spriteOption.style.borderRadius= '5px';
                selectedSpriteOption = spriteOption

            });

            folder.appendChild(spriteOption);
        });
    }

    function loopPremiumSprites(sprites, folder) {

        sprites.forEach((key) => {
            // spritesAdded[key] = true;
            // let spritePath = `https://virtual-office-blockchain-6ac32a3631d5.herokuapp.com/images/${key}.png`
            // gameScene.load.image(key, spritePath);
            const spriteOption = document.createElement('div');
            spriteOption.classList.add('sprite-option');

            spriteOption.style.backgroundImage = `url('https://virtual-office-blockchain-6ac32a3631d5.herokuapp.com/sprites/${key}.png')`;
            spriteOption.setAttribute('data-key', key);
            spriteOption.alt = key.replace('-', ' ');

            spriteOption.addEventListener('click', (event) => {
                selectedSpriteKey = event.target.getAttribute('data-key');

                if (selectedSpriteOption){
                    selectedSpriteOption.style.backgroundColor = '';
                    selectedSpriteOption.style.borderRadius= '';
                    selectedSpriteOption = null
                }
                spriteOption.style.backgroundColor = '#ffffff91'
                spriteOption.style.borderRadius= '5px';
                selectedSpriteOption = spriteOption
            });

            folder.appendChild(spriteOption);
        });
    }
    window.addEventListener('resize', () => {
        // Get the updated canvas dimensions
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        // Update the game canvas size
        game.scale.resize(newWidth, newHeight);




    });
    // Create the Phaser.Game instance
    const game = new Phaser.Game(config);

    // Keep a reference to the scene for later use
    let gameScene;
    let cursors;
    let spriteOptionsUI;
    let spriteDepth = {};

    let spritesAdded = {};
    let editorMode = true;
    let selectedSpriteKey = null;
    let selectedSpriteOption = null;
    let selectedSprite = null;
    let selectedSpriteClicked = null;

    let playerId;
    const players = new Map();

    function preload() {
        this.load.image('default', 'images/default.png');
        this.load.image('default-front', 'images/default-front.png');
        this.load.image('default-back', 'images/default-back.png');
        this.load.image('wooden-floor', 'images/wooden-floor.png');


        this.load.image('green-chair', 'images/green-chair.png');
        this.load.image('long-table', 'images/long-table.png');
        this.load.image('computer', 'images/computer.png');
        this.load.image('retro-computer', 'images/retro-computer.png');
        this.load.image('white-chair', 'images/white-chair.png');
        this.load.image('plant', 'images/plant.png');
        this.load.image('soda-machine', 'images/soda-machine.png');
        this.load.image('bookshelf', 'images/bookshelf.png');
        this.load.image('window', 'images/window.png');
        this.load.image('coffe-cup', 'images/coffe-cup.png');
        this.load.image('blue-sofa', 'images/blue-sofa.png');

        spriteDepth['green-chair'] = 2
        spriteDepth['long-table'] = 3
        spriteDepth['computer'] = 4
        spriteDepth['retro-computer'] = 4
        spriteDepth['white-chair'] = 2
        spriteDepth['plant'] = 2
        spriteDepth['soda-machine'] = 3
        spriteDepth['bookshelf'] = 2
        spriteDepth['window'] = 1
        spriteDepth['coffe-cup'] = 5
        spriteDepth['blue-sofa'] = 2



        this.load.spritesheet('default-animation', 'images/default-animation.png', { frameWidth: 78, frameHeight: 78 });
        this.load.spritesheet('default-animation-left', 'images/default-animation-left.png', { frameWidth: 78, frameHeight: 78 });
        this.load.spritesheet('default-animation-right', 'images/default-animation-right.png', { frameWidth: 78, frameHeight: 78 });
        this.load.spritesheet('default-animation-top', 'images/default-animation-top.png', { frameWidth: 78, frameHeight: 78 });
    }
    let animationPlaying;

    let ws;
    function create() {
        gameScene = this; // Assign the scene to the global variable
        // Initialize game objects here if needed



        const backgroundImage = this.add.image(0, 0, 'wooden-floor');
        backgroundImage.setOrigin(0, 0); // Set the origin to top-left corner
        backgroundImage.setDepth = 0
        backgroundImage.spriteId = '-1'
        this.cameras.main.setBackgroundColor(0x545252);

        ws = new WebSocket('wss://virtual-office-game-server-f73e8697642f.herokuapp.com/')

        ws.onopen = () => {
            console.log('WebSocket connection opened');



        }
        function pong() {
            ws.send(JSON.stringify({ type: 'ping' }));
        }
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'pong') {
                setTimeout(pong, 10000)
            }

            if (data.type === 'playerId') {
                playerId = data.playerId;
                console.log('Player ID:', playerId);
                ws.send(JSON.stringify({ type: 'roomCode', roomCode: roomCode, playerId: playerId }));

                ws.send(JSON.stringify({ type: 'ping' }));
            }

            if (data.type === 'newPlayer') {
                players.set(data.playerId, createPlayerSprite.call(data.playerId, data.x, data.y));
                let player = players.get(data.playerId);
                player.play('default-animation');
                player.x = data.x;
                player.y = data.y;

                if (data.playerId == playerId) {

                    const mainPlayer = players.get(playerId)
                    this.cameras.main.startFollow(mainPlayer);
                }

            }

            if (data.type === 'updatePosition') {
                if (players.has(data.playerId)) {
                    let player = players.get(data.playerId);

                    if (data.vectorX < 0 && data.vectorX != 0) {
                        if (animationPlaying != 1) {
                            animationPlaying = 1;
                            player.play('default-animation-left');
                        }
                        // player.setScale(-1, 1);
                    } else if (data.vectorX != 0) {
                        if (animationPlaying != 2) {
                            animationPlaying = 2;
                            player.play('default-animation-right');
                        }
                    }
                    if (data.vectorY < 0 && data.vectorX == 0) {
                        if (animationPlaying != 3) {
                            animationPlaying = 3;
                            player.play('default-animation-top');
                        }
                    } else if (data.vectorY > 0 && data.vectorX == 0) {
                        if (animationPlaying != 0) {
                            animationPlaying = 0;
                            player.play('default-animation');
                        }
                    }
                    player.x = data.x;
                    player.y = data.y;

                }
            }

            if (data.type === 'playerDisconnected') {
                if (players.has(data.playerId)) {
                    players.get(data.playerId).destroy();
                    players.delete(data.playerId);
                }
            }

            if (data.type === 'addSprite') {
                const { spriteId, key, x, y, scaleX, scaleY } = data;

                if (!spritesAdded[key]) {
                
                    spritesAdded[key] = true;
                    loadDynamicImage(key, x, y, spriteId, scaleX, scaleY)
                        .then((response) => {
                            if (response === true) {
                                // while (!gameScene.textures.exists(key)) {
                                    setTimeout(function () {
                                        // if (gameScene.textures.exists(key)) {
                                            const newSprite = gameScene.add.sprite(x, y, key);
                                            newSprite.setDepth(5)
                                            newSprite.spriteId = spriteId
                                            newSprite.addIndicator = addSpriteOutline;
                                            newSprite.removeIndicator = removeSpriteOutline;
                                            newSprite.setScale(scaleX, scaleY)
                                            newSprite.setInteractive();
                                        // }
                                    }, 1000)
                                // }
                            } else {
                                console.error('failed to load sprites')
                            }
                        })
                } else {
                    const newSprite = gameScene.add.sprite(x, y, key);
                    newSprite.setDepth(spriteDepth[key])
                    newSprite.spriteId = spriteId
                    newSprite.addIndicator = addSpriteOutline;
                    newSprite.removeIndicator = removeSpriteOutline;
                    newSprite.setScale(scaleX, scaleY)
                    newSprite.setInteractive();
                }

            }

            if (data.type === 'updateSprite') {
                const targetSprite = findSpriteBySpriteId(data.spriteId); // Implement this function
                if (targetSprite) {
                    // Update the identified sprite
                    targetSprite.x = data.x;
                    targetSprite.y = data.y;
                    targetSprite.scaleX = data.scaleX;
                    targetSprite.scaleY = data.scaleY;

                    // Broadcast the updated sprite information to other clients if needed
                }
            }
            if (data.type === 'deleteSprite') {
                const targetSprite = findSpriteBySpriteId(data.spriteId); // Implement this function
                if (targetSprite) {
                    // Update the identified sprite
                    targetSprite.destroy();
                    targetSprite = null;
                    // Broadcast the updated sprite information to other clients if needed
                }
            }



        };
        this.input.enabled = true;
        this.input.on('pointerdown', handlePointerDown);
        this.input.keyboard.on('keydown-E', toggleEditorMode);
        this.input.on('pointerup', handlePointerUp);
        this.input.on('pointermove', handlePointerMove);
        this.input.keyboard.on('keydown-DELETE', deleteSelectedSprite);
        this.input.keyboard.on('keydown-Q', handleSpriteInvert);


        cursors = gameScene.input.keyboard.createCursorKeys(); // Use the gameScene reference
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        async function loadDynamicImage(key) {

            let spritePath = `https://virtual-office-blockchain-6ac32a3631d5.herokuapp.com/sprites/${key}.png`;
            gameScene.load.image(key, spritePath)
            gameScene.load.start();

            gameScene.load.once('complete', subLoadCompleted, this);
            return true
            // Once the images are loaded, you can use them in the create function or elsewhere.
            // gameScene.load.on('complete', () => {
            //     return true
            // });
        }
        function subLoadCompleted(key) {
            console.log('Load Complete', key);

        }


        this.anims.create({
            key: 'default-animation',
            frames: this.anims.generateFrameNumbers('default-animation', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1 // -1 means loop indefinitely
        })
        this.anims.create({
            key: 'default-animation-left',
            frames: this.anims.generateFrameNumbers('default-animation-left', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1 // -1 means loop indefinitely
        })
        this.anims.create({
            key: 'default-animation-right',
            frames: this.anims.generateFrameNumbers('default-animation-right', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1 // -1 means loop indefinitely
        })
        this.anims.create({
            key: 'default-animation-top',
            frames: this.anims.generateFrameNumbers('default-animation-top', { start: 0, end: 11 }),
            frameRate: 10,
            repeat: -1 // -1 means loop indefinitely
        })


        start();
    }


    const speed = 5;
    function update() {
        // Handle player movement and send updates to the server


        if (cursors.left.isDown || this.keyA.isDown) {
            ws.send(JSON.stringify({ type: 'updatePosition', x: -speed, y: 0 }));
        }
        if (cursors.right.isDown || this.keyD.isDown) {
            ws.send(JSON.stringify({ type: 'updatePosition', x: speed, y: 0 }));
        }
        if (cursors.up.isDown || this.keyW.isDown) {
            ws.send(JSON.stringify({ type: 'updatePosition', x: 0, y: -speed }));
        }
        if (cursors.down.isDown || this.keyS.isDown) {
            ws.send(JSON.stringify({ type: 'updatePosition', x: 0, y: speed }));
        }

        if (joystickPosition.x !== 0 || joystickPosition.y !== 0) {
            ws.send(JSON.stringify({ type: 'updatePosition', x: joystickPosition.x / 12, y: joystickPosition.y / 12 }));
        }
    }

    function toggleFullScreen() {
        if (!document.fullscreenElement) {
            document.body.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }



    function addSpriteOutline() {
        // Create and add a border to indicate selection
        this.indicator = gameScene.add.rectangle(this.x, this.y, this.width + 20, this.height + 20);
        this.indicator.setOrigin(0.5);

        this.indicator.setStrokeStyle(2, 0x52b788); // Customize the border color and thickness
        this.indicator.setDepth(10); // Make sure the indicator is drawn above the sprite
    }

    function removeSpriteOutline() {
        if (this.indicator) {
            this.indicator.destroy();
            this.indicator = null;
        }
    }


    function findSpriteBySpriteId(targetSpriteId) {
        // Iterate through your sprite instances and find the one with the matching spriteId
        const spriteInstances = gameScene.children.getAll(); // Get all children in the scene

        for (const sprite of spriteInstances) {
            if (sprite.spriteId === targetSpriteId) {
                return sprite; // Return the sprite instance with the matching spriteId
            }
        }

        return null; // Return null if no matching sprite is found
    }

    function toggleEditorMode() {



        editorMode = !editorMode;
        console.log(`Editor mode: ${editorMode ? 'ON' : 'OFF'}`);
        const spriteOptionsUI = document.getElementById('sprite-container');
        const editorButton = document.getElementById('editor-button');
        if (!editorMode) {
            editorButton.className = "comms-button inactive"
            spriteOptionsUI.style.display = 'none';
            if (selectedSprite) {
                let editorButtons = document.getElementById('editor-wrapper')
                selectedSprite.removeIndicator();
                selectedSprite = null
                editorButtons.style.display = 'none';
            }
        } else {
            editorButton.className = "comms-button active"
            spriteOptionsUI.style.display = 'block';
        }

    }


    function handlePointerUp(pointer) {
        // Reset the selected sprite when the pointer is released
        if (selectedSpriteClicked && editorMode) {
            // Update sprite position and scale based on user input
            // ...

            // Send update event to server
            ws.send(JSON.stringify({
                type: 'updateSprite',
                spriteId: selectedSprite.spriteId,
                x: selectedSprite.x,
                y: selectedSprite.y,
                scaleX: selectedSprite.scaleX,
                scaleY: selectedSprite.scaleY
            }));
            selectedSpriteClicked = null;
        }
    }

    function handlePointerMove(pointer) {
        if (selectedSpriteClicked) {
            // Move the selected sprite with the pointer
            selectedSpriteClicked.x = pointer.worldX;
            selectedSpriteClicked.y = pointer.worldY;
            selectedSpriteClicked.removeIndicator();
            selectedSpriteClicked.addIndicator();
        }
    }
    function handleSpriteInvert() {

        if (selectedSprite) {
            if (selectedSprite.scaleX == 1) {
                selectedSprite.setScale(-1, 1);
            } else {
                selectedSprite.setScale(1, 1)
            }

        }
    }

    function deleteSelectedSprite() {

        if (editorMode && selectedSprite) {
            // Remove the selected sprite and reset the selection
            const buttons = document.getElementById('editor-wrapper');
            buttons.style.display = 'none';
            ws.send(JSON.stringify({
                type: 'deleteSprite',
                spriteId: selectedSprite.spriteId,
            }));
            selectedSprite.removeIndicator();
            selectedSprite.destroy();
            selectedSprite = null;


        }
    }
    function handlePointerDown(pointer, objects) {

        if (pointer.isDown && editorMode) {
            const worldX = pointer.worldX;
            const worldY = pointer.worldY;
            if (selectedSpriteOption) {
                selectedSpriteOption.style.backgroundColor = '';
                selectedSpriteOption.style.borderRadius= '';
                selectedSpriteOption = null
                 // You need to implement this method
            }



            if (selectedSpriteKey) {
                // Get the position in the world where the user clicked


                // selectedSpriteOption.removeIndicator();
                // Send the sprite placement data to the server
                ws.send(JSON.stringify({ type: 'addSprite', key: selectedSpriteKey, x: worldX, y: worldY }));
                selectedSpriteKey = null;

            } else if (objects[0]) {
                let editorButtons = document.getElementById('editor-wrapper')
                if (selectedSprite && selectedSprite !== objects[0]) {
                    selectedSprite.removeIndicator();
                    selectedSprite = null
                    editorButtons.style.display = 'none';
                }
                if (!selectedSprite) {
                    selectedSprite = objects[0];
                    selectedSprite.setInteractive();
                    objects[0].addIndicator();
                    editorButtons.style.display = 'flex';
                }
                selectedSpriteClicked = selectedSprite

            } else if (selectedSprite) {
                let editorButtons = document.getElementById('editor-wrapper')
                selectedSprite.removeIndicator();
                selectedSprite = null
                editorButtons.style.display = 'none';
            }

        }
    }







    // function createPlayerSprite(x, y) {
    //     return this.add.circle(x, y, 20, 0x00ff00); // Create a green circle for players
    // }
    function createPlayerSprite(playerId, x, y) {

        let playerSprite = gameScene.add.sprite(x, y, 'default'); // Initial position
        playerSprite.setDepth(8);
        return playerSprite
    }
};