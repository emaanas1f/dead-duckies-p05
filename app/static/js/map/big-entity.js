// Multi-tile objects; e.g. trees
import { BIG_ENTITIES, TILE_SIZE, getTileImage, SCALE_FACTOR, FRAME_RATE } from "../constants.js";

export default class BigEntity {
  constructor(x, y, type, map) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.image = getTileImage("front", type);
    this.image_x = BIG_ENTITIES[type]["x"];
    this.image_y = BIG_ENTITIES[type]["y"];

    this.width = BIG_ENTITIES[type]["width"] || 1;
    this.height = BIG_ENTITIES[type]["height"] || 1;

    this.durability = BIG_ENTITIES[type]["destructionTime"];
    this.frame = 0;

    for (let dx = 0; dx < this.width; dx++) {
      for (let dy = 0; dy < this.height; dy++) {
        let tx = x - this.image_x + dx;
        let ty = y - this.image_y + dy;

        if (map.tiles[tx]?.[ty]) {
          map.tiles[tx][ty].add(this, "front");
        }
      }
    }
  }

  hit() {
    this.durability--;
    this.frame++;
  }

  destroy(map) {
    for (let dx = 0; dx < this.width; dx++) {
      for (let dy = 0; dy < this.height; dy++) {
        let tx = this.x - this.image_x + dx;
        let ty = this.y - this.image_y + dy;

        if (map.tiles[tx] && map.tiles[tx][ty]) {
          map.tiles[tx][ty].remove("front");
        }
      }
    }
    map.removeBigEntity(this.x, this.y);
  }

render(ctx, map, player) {
  const tileSize = TILE_SIZE * SCALE_FACTOR;

  const drawX = (this.x - this.image_x) * tileSize - map.x * SCALE_FACTOR;
  const drawY = (this.y - this.image_y) * tileSize - map.y * SCALE_FACTOR;

  const width = this.image.width * SCALE_FACTOR;
  const height = this.image.height * SCALE_FACTOR;

  if (drawX < player.x + TILE_SIZE && drawX + width > player.x && drawY < player.y + 2 * TILE_SIZE && drawY + height > player.y) {
    ctx.globalAlpha = 0.5;
  }

  if (this.durability > 0) {
    ctx.drawImage(this.image, drawX, drawY, width, height);
  } else {
    for (const [key, value] of Object.entries(BIG_ENTITIES[this.type]["drops"])) {
      player.inventory.addItem(key, value);
    }
    this.destroy(map);
  }
  ctx.globalAlpha = 1.0;
}
}
