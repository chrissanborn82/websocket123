import Phaser from 'phaser';
import io from 'socket.io-client';
import { v4 } from 'uuid';

console.log('Phaser:', Phaser);
console.log('Socket.IO:', io);
console.log('uiud', v4);

// Import assets
import sky from '../assets/sky.png';
import platform from '../assets/platform.png';
import star from '../assets/star.png';
import bomb from '../assets/bomb.png';
import dude from '../assets/dude.png';

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


    socket.emit('UserJoined', { uuid, x: 100, y: 450 });
    console.log(uuid);
    //  A simple background for our game
    this.add.image(400, 300, 'sky');

    //  The platforms group contains the ground and the 2 ledges we can jump on
    platforms = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    //  Now let's create some ledges
    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    players[uuid] = this.physics.add.sprite(100, 450, 'dude');
    //  Player physics properties. Give the little guy a slight bounce.
    players[uuid].setBounce(0.2);
    players[uuid].setCollideWorldBounds(true);

    //  Our player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    bombs = this.physics.add.group();

    //  The score
    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    //  Collide the player and the stars with the platforms

    this.physics.add.collider(players[uuid], platforms);

    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
}

function update() {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        // Send a test message to the server
        players[uuid].setVelocityX(-160);

        players[uuid].anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        players[uuid].setVelocityX(160);

        players[uuid].anims.play('right', true);
    }
    else {
        players[uuid].setVelocityX(0);

        players[uuid].anims.play('turn');
    }

    if (cursors.up.isDown && players[uuid].body.touching.down) {
        players[uuid].setVelocityY(-330);
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
