// Multi-tile objects; e.g. trees
import { BIG_ENTITIES, TILE_SIZE, getTileImage, SCALE_FACTOR } from "../constants.js";

export default class BigEntity {
  constructor(x, y, type, map) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.image = getTileImage("front", type);
    this.image_x = BIG_ENTITIES[type]["x"];
    this.image_y = BIG_ENTITIES[type]["y"];
    this.durability = BIG_ENTITIES[type]["destructionTime"];

    if (BIG_ENTITIES[type]["breakable"]) {
      let tile = map.tiles[this.x][this.y];
      tile.add(this, "front");
    }
  }

  hit(map, player) {
    this.durability--;
    if (this.durability == 0) {
      for (const [key, value] of Object.entries(ENTITIES[front.type]["drops"])) {
        this.inventory.addItem(key, value);
      }
      this.destroy(map);
      return true;
    }
    return false;
  }

  destroy(map) {
    map.tiles[this.x][this.y].remove("front");
    for (const [key, value] of Object.entries(ENTITIES[front.type]["drops"])) {
      this.inventory.addItem(key, value);
    }
  }

  render(ctx, map, player) {
    // Check if has player
    if ((this.x - this.image_x) * TILE_SIZE < player.x + TILE_SIZE &&
        (this.x - this.image_x) * TILE_SIZE + this.image.width > player.x &&
        (this.y - this.image_y) * TILE_SIZE < player.y + 2 * TILE_SIZE &&
        (this.y - this.image_y) * TILE_SIZE + this.image.height > player.y + 2 * TILE_SIZE) {
      ctx.globalAlpha = 0.5;
    }

    ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height,
      ((this.x - this.image_x) * TILE_SIZE - map.x) * SCALE_FACTOR,
      ((this.y - this.image_y) * TILE_SIZE - map.y) * SCALE_FACTOR,
      this.image.width * SCALE_FACTOR, this.image.height * SCALE_FACTOR
    )

    ctx.globalAlpha = 1.0;
  }
}
