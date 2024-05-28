import Phaser from 'phaser';
import io from 'socket.io-client';
import { v4 } from 'uuid';
import correctImage from './image.json'

console.log('Phaser:', Phaser);
console.log('Socket.IO:', io);
console.log({ correctImage });

// Import assets
import sky from '../assets/sky.png';
import platform from '../assets/platform.png';
import star from '../assets/star.png';
import bomb from '../assets/bomb.png';
import dude from '../assets/dude.png';
import tiles from '../assets/tilemap.png';



var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const uuid = v4();
const players = { [uuid]: undefined }
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;


var game = new Phaser.Game(config);
let socket;

function preload() {
    this.load.image('sky', sky);
    this.load.image('ground', platform);
    this.load.image('star', star);
    this.load.image('bomb', bomb);
    this.load.spritesheet('dude', dude, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('tiles', tiles, { frameWidth: 15, frameHeight: 15 });
}

function create() {
    socket = io();
    console.log({ socket });
    // Handle messages from the server
    socket.on('message', (data) => {
        console.log('Message from server:', data);
        // You can handle game state updates here
    });

    socket.on('Move', (data) => {
        if (data.left === 'down') {
            players[1].setVelocity(-160)
            players[1].anims.play('left', true);
        }
    });

    // Send a test message to the server

    socket.on('UserJoined', (data) => {
        console.log(data)
        if (data.uuid !== uuid) {
            console.log('new user joined!', data);
            players[data.uuid] = this.physics.add.sprite(data.x, data.y, 'dude');
            players[data.uuid].setBounce(0.2);
            players[data.uuid].setCollideWorldBounds(true);
            this.physics.add.collider(players[data.uuid], platforms);
        }
    });

    const map = this.make.tilemap({ width: 10, height: 10, tileWidth: 15, tileHeight: 15 });
    const tileset = map.addTilesetImage('tiles');
    const layer = map.createBlankLayer('layer1', tileset, 0, 0);
    console.log(correctImage.board);
    for (let y = 0; y < correctImage.board.length; y++) {
        for (let x = 0; x < correctImage.board[y].length; x++) {
            const tileIndex = correctImage.board[y][x] ? 2 : 1; // Assuming 0 is the first image, 1 is the second
            console.log({ tileIndex, x, y })
            layer.putTileAt(tileIndex, x, y);
        }
    }

    socket.emit('UserJoined', { uuid, x: 100, y: 450 });
    console.log(uuid);
}

function update() {
    if (gameOver) {
        return;
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);

    //  Add and update the score
    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        //  A new batch of stars to collect
        stars.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
        bomb.allowGravity = false;

    }
}

function hitBomb(player, bomb) {
    this.physics.pause();

    player.setTint(0xff0000);

    player.anims.play('turn');

    gameOver = true;
}
