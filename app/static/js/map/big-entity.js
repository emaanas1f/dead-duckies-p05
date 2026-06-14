// Multi-tile objects; e.g. trees
import { BIG_ENTITIES, TILE_SIZE, getTileImage, SCALE_FACTOR, FRAME_RATE, /*FURNACE_RECIPES*/ } from "../constants.js";
import { Inventory } from "../menus/inventory.js";

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
      if (this.durability <= 0) {
        if (this instanceof Chest) {
          for (let slot of this.inventory.slots) {
            if (slot.itemID != null) {
              player.inventory.addItem(slot.itemID, slot.count);
            }
          }
        }
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

  interact(player, item) {
    if (!this.processing) { 
      let recipe = this.data.processing[item];

      if (!recipe) return;

      if (player.inventory.countItem(item) < recipe.inputAmount) return;

      for (const [key, value] of Object.entries(this.data.processing["additionalResources"])) {
        if (player.inventory.countItem(key) < value) return;
      }

      player.inventory.removeItem(item, recipe.inputAmount);

      for (const [key, value] of Object.entries(this.data.processing["additionalResources"])) {
        player.inventory.removeItem(key, value);
      }

      this.processing = true;
      this.image = getTileImage("front", "furnace_active");
      this.daysRemaining = recipe.days;

      this.outputItem = recipe.output;
      this.outputAmount = recipe.outputAmount;

      return;
    }

    else if (this.daysRemaining <= 0) {
      player.inventory.addItem(this.outputItem, this.outputAmount);
      this.image = getTileImage("front", "furnace");

      this.processing = false;
      this.daysRemaining = 0;
      this.outputItem = null;
      this.outputAmount = 0;
    }
  }

  nextDay() {
    if (!this.processing) return;
    this.daysRemaining--;
  }
}

export class Chest extends BigEntity {
  constructor(x, y, type, map) {
    super(x, y, type, map);
    this.inventory = new Inventory();
  }

  interact(player, item) {
    player.openChest = this;
    player.inventory.open = true;
    player.game.menu = "chest";
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

  interact(player, item) {
    console.log("JAR CALLED WITH:", item);
    if (!item) return;

    let recipe = this.data.processing?.[item];
    if (!recipe) return;

    if (this.processing) return;

    if (player.inventory.countItem(item) < recipe.inputAmount) return;

    player.inventory.removeItem(item, recipe.inputAmount);
    this.processing = true;
    this.daysRemaining = recipe.days;
    this.inputItem = item;
    this.outputItem = recipe.output.item;
    this.outputAmount = recipe.output.amount;
  }

  nextDay() {
    if (!this.processing) return;
    this.daysRemaining--;
    if (this.daysRemaining <= 0) {
      this.processing = false;
      this.daysRemaining = 0;
      player.inventory.addItem(this.outputItem, this.outputAmount);
    }
  }
}