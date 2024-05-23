// public/game.js
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let socket;

function preload() {
    this.load.image('logo', 'path/to/phaser-logo.png');
}

function create() {
    socket = io();

    // Handle messages from the server
    socket.on('message', (data) => {
        console.log('Message from server:', data);
        // You can handle game state updates here
    });

    const logo = this.add.image(400, 300, 'logo');
    this.tweens.add({
        targets: logo,
        y: 450,
        duration: 2000,
        ease: 'Power2',
        yoyo: true,
        loop: -1
    });

    // Send a test message to the server
    socket.emit('message', 'Hello, server!');
}

function update() {
    // Game logic goes here
}