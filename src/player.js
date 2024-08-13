import { GameScene } from "./index";

export class Player {
  constructor(sprite, tilePos) {
    this.sprite = sprite;
    this.tilePos = tilePos;
    const offsetX = GameScene.TILE_SIZE / 2;
    const offsetY = GameScene.TILE_SIZE;
    console.log(sprite, this.sprite);

    this.sprite.setOrigin(0.5, 1);
    console.log("New Player at:", tilePos);
    this.sprite.setPosition(
      tilePos.x * GameScene.TILE_SIZE + offsetX,
      tilePos.y * GameScene.TILE_SIZE + offsetY
    );
    this.sprite.setFrame(5);
  }
  getPosition() {
    return this.sprite.getBottomCenter();
  }

  setPosition(position) {
    this.sprite.setPosition(position.x, position.y);
  }
  updateTilePosition(delta) {
    this.tilePos.add(delta);
  }

  stopAnimation() {
    if (this.sprite.anims.currentAnim) {
      const standingFrame = this.sprite.anims.currentAnim.frames[1].frame.name;
      this.sprite.anims.stop();
      this.sprite.setFrame(standingFrame);
    }
  }

  startAnimation(direction) {
    this.sprite.anims.play(direction);
  }
}
