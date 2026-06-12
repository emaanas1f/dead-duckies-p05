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
    this.durability = BIG_ENTITIES[type]["destructionTime"];
    this.frame = 0;

    let tile = map.tiles[this.x][this.y];
    tile.add(this, "front");
  }

  hit() {
    this.durability--;
    this.frame++;
  }

  interact(player, item) {
    return;
  }

  destroy(map) {
    map.tiles[this.x][this.y].remove("front");
    map.removeBigEntity(this.x, this.y);
  }

  render(ctx, map, player) {
    // Check if has player
    if ((this.x - this.image_x) * TILE_SIZE < player.x + TILE_SIZE &&
        (this.x - this.image_x) * TILE_SIZE + this.image.width > player.x &&
        (this.y - this.image_y) * TILE_SIZE < player.y + 2 * TILE_SIZE &&
        (this.y - this.image_y) * TILE_SIZE + this.image.height > player.y + 2 * TILE_SIZE) {
      ctx.globalAlpha = 0.5;
    }

    if (!this.frame == 0) {
      ctx.save();
      ctx.translate(((this.x - this.image_x) * TILE_SIZE - map.x) * SCALE_FACTOR,
                    ((this.y - this.image_y) * TILE_SIZE - map.y) * SCALE_FACTOR);

      ctx.translate((this.image_x * TILE_SIZE + TILE_SIZE / 2) * SCALE_FACTOR,
                    (this.image_y * TILE_SIZE + TILE_SIZE / 2) * SCALE_FACTOR);

      if (this.frame < FRAME_RATE) {
        ctx.rotate(Math.PI / 20);
      } else if (this.frame < FRAME_RATE * 2) {
        ctx.rotate(-Math.PI / 20);
      }

      ctx.translate(-(this.image_x * TILE_SIZE + TILE_SIZE / 2) * SCALE_FACTOR,
                    -(this.image_y * TILE_SIZE + TILE_SIZE / 2) * SCALE_FACTOR);

      ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height,
        0, 0, this.image.width * SCALE_FACTOR, this.image.height * SCALE_FACTOR);
      ctx.restore();

      this.frame++;
      this.frame %= FRAME_RATE * 2;
    } else {
      if (this.durability == 0) {
        for (const [key, value] of Object.entries(BIG_ENTITIES[this.type]["drops"])) {
          player.inventory.addItem(key, value);
        }
        this.destroy(map);
      }
      ctx.drawImage(this.image, 0, 0, this.image.width, this.image.height,
        ((this.x - this.image_x) * TILE_SIZE - map.x) * SCALE_FACTOR,
        ((this.y - this.image_y) * TILE_SIZE - map.y) * SCALE_FACTOR,
        this.image.width * SCALE_FACTOR, this.image.height * SCALE_FACTOR)
    }
    ctx.globalAlpha = 1.0;
  }
}

export class Furnace extends BigEntity {
  constructor(x, y, type, map) {
    super(x, y, type, map);
    this.heldItem = null;
  }

  interact(player, item) {
    return;
  }
}
