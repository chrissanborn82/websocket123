import { Direction } from "./Direction";
import { GameScene } from "./index";
import { Player } from "./player";

const Vector2 = Phaser.Math.Vector2;

export class GridPhysics {
    movementDirectionVectors = {
        [Direction.UP]: Vector2.UP,
        [Direction.DOWN]: Vector2.DOWN,
        [Direction.LEFT]: Vector2.LEFT,
        [Direction.RIGHT]: Vector2.RIGHT,
    };

    constructor(player) {
        this.movementDirectionVectors = {
            [Direction.UP]: Vector2.UP,
            [Direction.DOWN]: Vector2.DOWN,
            [Direction.LEFT]: Vector2.LEFT,
            [Direction.RIGHT]: Vector2.RIGHT,
        };
        this.movementDirection = Direction.NONE
        this.player = player;
        this.tileSizePixelsWalked = 0;
    }

    speedPixelsPerSecond = GameScene.TILE_SIZE * 4;

    movePlayer(direction) {
        if (!this.isMoving()) {
            this.startMoving(direction);
        }
    }
    isMoving() {
        return this.movementDirection != Direction.NONE;
    }

    startMoving(direction) {
        this.player.startAnimation(direction);
        this.movementDirection = direction;
    }

    update(delta) {
        if (this.isMoving()) {
            this.updatePlayerPosition(delta);
        }
    }

    updatePlayerPosition(delta) {
        const pixelsToWalkThisUpdate = this.getPixelsToWalkThisUpdate(delta);
        if (this.willCrossTileBorderThisUpdate(pixelsToWalkThisUpdate)) {
            this.movePlayerSprite(GameScene.TILE_SIZE - this.tileSizePixelsWalked);
            this.stopMoving();
        } else {
            this.movePlayerSprite(pixelsToWalkThisUpdate);
        }

        // ...
    }

    movePlayerSprite(pixelsToMove) {
        const directionVec = this.movementDirectionVectors[
            this.movementDirection
        ].clone();
        const movementDistance = directionVec.multiply(new Vector2(pixelsToMove));
        const newPlayerPos = this.player.getPosition().add(movementDistance);
        this.player.setPosition(newPlayerPos);
        this.tileSizePixelsWalked += pixelsToMove;
        this.tileSizePixelsWalked %= GameScene.TILE_SIZE;
    }

    willCrossTileBorderThisUpdate(
        pixelsToWalkThisUpdate
    ) {
        return (
            this.tileSizePixelsWalked + pixelsToWalkThisUpdate >= GameScene.TILE_SIZE
        );
    }

    stopMoving() {
        this.player.stopAnimation();
        this.movementDirection = Direction.NONE;
    }

    getPixelsToWalkThisUpdate(delta) {
        const deltaInSeconds = delta / 1000;
        return this.speedPixelsPerSecond * deltaInSeconds;
    }
}