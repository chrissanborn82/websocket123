import Phaser from "phaser";
import io from "socket.io-client";
import { v4 } from "uuid";
import correctImage from "./image.json";
import { Player } from "./player";
import { GridControls } from "./GridControls";
import { GridPhysics } from "./GridPhysics";
import { Direction } from "./Direction";

console.log("Phaser:", Phaser);
console.log("Socket.IO:", io);
console.log({ correctImage });

// Import assets
import sky from "../assets/sky.png";
import platform from "../assets/platform.png";
import star from "../assets/star.png";
import bomb from "../assets/bomb.png";
import dude from "../assets/dude.png";
import tiles from "../assets/tilemap.png";
import adam from "../assets/adam_run_16x16.png";

const sceneConfig = {
  active: false,
  visible: false,
  key: "Game",
};

const uuid = v4();

const CANVAS_WIDTH = 720;
const CANVAS_HEIGHT = 528;
const players = { [uuid]: undefined };
const allGridPhysics = { [uuid]: undefined };

export class GameScene extends Phaser.Scene {
  constructor() {
    super(sceneConfig);
  }
  static TILE_SIZE = 30;

  create() {
    socket = io();
    // Handle messages from the server
    socket.on("message", (data) => {
      console.log("Message from server:", data);
      // You can handle game state updates here
    });

    // Send a test message to the server

    socket.on("UserJoined", (socketData) => {
      const data = socketData.data;
      const socketPlayers = socketData.players;
      console.log(socketPlayers);
      if (data.uuid !== uuid && players) {
        console.log("new user joined!", data);
        players[data.uuid] = this.add.sprite(50, 50, "player");
        players[data.uuid].scale = 2;
        const newPlayer = new Player(
          players[data.uuid],
          new Phaser.Math.Vector2(6, 6)
        );
        allGridPhysics[data.uuid] = new GridPhysics(newPlayer);
      } else {
        console.log("I Joined!", socketPlayers);
        Object.keys(socketPlayers).forEach((socketuuid) => {
          if (!players[socketuuid] && socketuuid != uuid) {
            console.log("Loading Player:", socketuuid);
            console.log({ uuid, tileX: socketPlayers[socketuuid].x });
            players[socketuuid] = this.add.sprite(50, 50, "player");
            players[socketuuid].scale = 2;
            const newPlayer = new Player(
              players[socketuuid],
              new Phaser.Math.Vector2(
                socketPlayers[socketuuid].x || 6,
                socketPlayers[socketuuid].y || 6
              )
            );
            allGridPhysics[socketuuid] = new GridPhysics(newPlayer);
          }
        });
      }
    });

    socket.on("UserMoved", (data) => {
      if (data.user !== uuid) {
        console.log({ Move: data });

        if (data.direction === "left") {
          allGridPhysics[data.user].movePlayer(Direction.LEFT);
        } else if (data.direction === "right") {
          allGridPhysics[data.user].movePlayer(Direction.RIGHT);
        } else if (data.direction === "up") {
          allGridPhysics[data.user].movePlayer(Direction.UP);
        } else if (data.direction === "down") {
          allGridPhysics[data.user].movePlayer(Direction.DOWN);
        }
      }
    });

    const map = this.make.tilemap({
      width: 10,
      height: 10,
      tileWidth: 15,
      tileHeight: 15,
    });
    const tileset = map.addTilesetImage("tiles");
    const layer = map.createBlankLayer("layer1", tileset, 0, 0);
    for (let y = 0; y < correctImage.board.length; y++) {
      for (let x = 0; x < correctImage.board[y].length; x++) {
        const tileIndex = correctImage.board[y][x] ? 2 : 1; // Assuming 0 is the first image, 1 is the second
        layer.putTileAt(tileIndex, x, y);
      }
    }

    const playerSprite = this.add.sprite(300, 300, "player", 2);
    playerSprite.setDepth(2);
    playerSprite.scale = 2;
    this.cameras.main.roundPixels = true;
    console.log({ playerSprite });
    const player = new Player(playerSprite, new Phaser.Math.Vector2(6, 6));

    this.gridPhysics = new GridPhysics(player);
    this.gridControls = new GridControls(
      this.input,
      this.gridPhysics,
      socket,
      uuid
    );

    this.createPlayerAnimation(Direction.UP, 7, 12);
    this.createPlayerAnimation(Direction.RIGHT, 1, 6);
    this.createPlayerAnimation(Direction.DOWN, 19, 24);
    this.createPlayerAnimation(Direction.LEFT, 13, 18);
    socket.emit("UserJoined", { uuid, tileX: 6, tileY: 6, x: 100, y: 450 });
    //end movement tutorial
    // console.log(uuid);
    // players[uuid] = this.physics.add.sprite(15, 15, 'adam');

    // //  Our player animations, turning, walking left and walking right.
    // this.anims.create({
    //     key: 'left',
    //     frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
    //     frameRate: 10,
    //     repeat: -1
    // });
  }

  createPlayerAnimation(name, startFrame, endFrame) {
    this.anims.create({
      key: name,
      frames: this.anims.generateFrameNumbers("player", {
        start: startFrame,
        end: endFrame,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
  update(_time, delta) {
    this.gridControls.update();
    this.gridPhysics.update(delta);
    Object.keys(allGridPhysics).forEach((key) => {
      if (allGridPhysics[key] && key !== uuid) {
        allGridPhysics[key].update(delta);
      }
    });
  }

  preload() {
    this.load.image("sky", sky);
    this.load.image("ground", platform);
    this.load.image("star", star);
    this.load.image("bomb", bomb);
    this.load.spritesheet("dude", dude, { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet("tiles", tiles, { frameWidth: 15, frameHeight: 15 });
    this.load.spritesheet("player", adam, {
      frameWidth: 16,
      frameHeight: 32,
    });
  }
}

const gameConfig = {
  title: "Sample",
  render: {
    antialias: false,
  },
  type: Phaser.AUTO,
  scene: GameScene,
  scale: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  parent: "game",
  backgroundColor: "#48C4F8",
};

var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(gameConfig);
let socket;
function collectStar(player, star) {
  star.disableBody(true, true);

  //  Add and update the score
  score += 10;
  scoreText.setText("Score: " + score);

  if (stars.countActive(true) === 0) {
    //  A new batch of stars to collect
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });

    var x =
      player.x < 400
        ? Phaser.Math.Between(400, 800)
        : Phaser.Math.Between(0, 400);

    var bomb = bombs.create(x, 16, "bomb");
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    bomb.allowGravity = false;
  }
}

function hitBomb(player, bomb) {
  this.physics.pause();

  player.setTint(0xff0000);

  player.anims.play("turn");

  gameOver = true;
}
