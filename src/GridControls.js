import { Direction } from "./Direction";

export class GridControls {
  constructor(input, gridPhysics, socket, uuid) {
    this.input = input;
    this.gridPhysics = gridPhysics;
    this.socket = socket;
    this.uuid = uuid;
  }

  update() {
    const cursors = this.input.keyboard.createCursorKeys();
    if (cursors.left.isDown) {
      this.socket.emit("UserMoved", {
        user: this.uuid,
        direction: "left",
        x: -1,
        y: 0,
      });
      this.gridPhysics.movePlayer(Direction.LEFT);
    } else if (cursors.right.isDown) {
      this.socket.emit("UserMoved", {
        user: this.uuid,
        direction: "right",
        x: 1,
        y: 0,
      });
      this.gridPhysics.movePlayer(Direction.RIGHT);
    } else if (cursors.up.isDown) {
      this.socket.emit("UserMoved", {
        user: this.uuid,
        direction: "up",
        x: 0,
        y: -1,
      });
      this.gridPhysics.movePlayer(Direction.UP);
    } else if (cursors.down.isDown) {
      this.socket.emit("UserMoved", {
        user: this.uuid,
        direction: "down",
        x: 0,
        y: 1,
      });
      this.gridPhysics.movePlayer(Direction.DOWN);
    }
  }
}
