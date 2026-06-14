// Multi-tile objects; e.g. trees
import { BIG_ENTITIES, TILE_SIZE, getTileImage, SCALE_FACTOR, FRAME_RATE, /*FURNACE_RECIPES*/ } from "../constants.js";

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
    this.data = BIG_ENTITIES[type]; 

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

    this.processing = false;
    this.daysRemaining = 0;

    this.outputItem = null;
    this.outputAmount = 0;

  }

  render(ctx, map, player) {
    const x = (this.x - this.image_x) * TILE_SIZE * SCALE_FACTOR;
    const y = (this.y - this.image_y) * TILE_SIZE * SCALE_FACTOR;

    const w = TILE_SIZE * SCALE_FACTOR;
    const h = 2 * TILE_SIZE * SCALE_FACTOR; 

    ctx.drawImage(this.image, x - map.x * SCALE_FACTOR, y - map.y * SCALE_FACTOR, w, h);
  }

  interact(player, item) {
    if (!this.processing) { 
      let recipe = this.data.processing[item];

      if (!recipe) return;

      if (player.inventory.countItem(item) < recipe.inputAmount) return;

      player.inventory.removeItem(item, recipe.inputAmount);

      this.processing = true;
      this.daysRemaining = recipe.days;

      this.outputItem = recipe.output;
      this.outputAmount = recipe.outputAmount;

      return;
    }

    /*if (this.processing && this.daysRemaining <= 0) {
      player.inventory.addItem(this.outputItem, this.outputAmount);

      this.processing = false;
      this.daysRemaining = 0;
      this.outputItem = null;
      this.outputAmount = 0;
    }*/
  }

  nextDay() {
    if (!this.processing) return;

    this.daysRemaining--;

    if (this.daysRemaining <= 0) {
      player.inventory.addItem(this.outputItem, this.outputAmount);

      this.processing = false;
      this.outputItem = null;
      this.outputAmount = 0;
    }
  }
}

export class Chest extends BigEntity {
  constructor(x, y, type, map) {
    super(x, y, type, map);

    this.inventory = [];
    this.size = 24;
  }

  render(ctx, map, player) {
    const x = (this.x - this.image_x) * TILE_SIZE * SCALE_FACTOR;
    const y = (this.y - this.image_y) * TILE_SIZE * SCALE_FACTOR;

    const w = TILE_SIZE * SCALE_FACTOR;
    const h = 2 * TILE_SIZE * SCALE_FACTOR; 

    ctx.drawImage(this.image, x - map.x * SCALE_FACTOR, y - map.y * SCALE_FACTOR, w, h);
  }

  interact(player, item) {
    player.openChest = this;
  }

  addItem(itemID, amount) {
    let remaining = amount;

    for (let slot of this.inventory) {
      if (slot.itemID === itemID) {
        let space = 99 - slot.count;
        let add = Math.min(space, remaining);
        slot.count += add;
        remaining -= add;
        if (remaining <= 0) return 0;
      }
    }

    while (remaining > 0 && this.inventory.length < this.size) {
      let add = Math.min(99, remaining);
      this.inventory.push({ itemID, count: add });
      remaining -= add;
    }

    return remaining;
  }

  removeItem(itemID, amount) {
    let remaining = amount;

    for (let i = 0; i < this.inventory.length; i++) {
      let slot = this.inventory[i];
      if (slot.itemID !== itemID) continue;

      let remove = Math.min(slot.count, remaining);
      slot.count -= remove;
      remaining -= remove;

      if (slot.count <= 0) {
        this.inventory.splice(i, 1);
        i--;
      }

      if (remaining <= 0) break;
    }

    return remaining === 0;
  }
}

export class PreservedJar extends BigEntity {
  constructor(x, y, type, map) {
    super(x, y, type, map);

    this.processing = false;
    this.daysRemaining = 0;

    this.inputItem = null;
    this.outputItem = null;
    this.outputAmount = 0;
  }

  render(ctx, map, player) {
    const x = (this.x - this.image_x) * TILE_SIZE * SCALE_FACTOR;
    const y = (this.y - this.image_y) * TILE_SIZE * SCALE_FACTOR;

    const w = TILE_SIZE * SCALE_FACTOR;
    const h = 2 * TILE_SIZE * SCALE_FACTOR; 

    ctx.drawImage(this.image, x - map.x * SCALE_FACTOR, y - map.y * SCALE_FACTOR, w, h);
  }

  interact(player, item) {
    if (!this.processing) {
      let recipe = this.data.processing?.[item];
      if (!recipe) return;

      if (player.inventory.countItem(item) < recipe.inputAmount) return;

      player.inventory.removeItem(item, recipe.inputAmount);

      this.processing = true;
      this.daysRemaining = recipe.days;

      this.inputItem = item;
      this.outputItem = recipe.output;
      this.outputAmount = recipe.outputAmount;
    }
  }

  nextDay(player) {
    if (!this.processing) return;

    this.daysRemaining--;

    if (this.daysRemaining <= 0) {
      player.inventory.addItem(this.outputItem, this.outputAmount);

      this.processing = false;
      this.inputItem = null;
      this.outputItem = null;
      this.outputAmount = 0;
    }
  }
}