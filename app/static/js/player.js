import BigEntity from "./map/big-entity.js";
import { TILE_SIZE, ENTITIES, SCALE_FACTOR, CANVAS_WIDTH, CANVAS_HEIGHT, FRAME_RATE, ITEMS } from "./constants.js";
import { Inventory } from './menus/inventory.js';
import NPC from "./npc.js"
import Crop from "./map/crop.js"
import Gold from "./ui/gold.js"

// Correspond with rows in player.png
const DOWN = 0;
const RIGHT = 1;
const UP = 2;
const LEFT = 3;
var MOVEMENT_SPEED = 2;

function passable(tile) {
  return tile != null && tile.passable;
}

export default class Player {
  constructor(name, game) {
    this.x = TILE_SIZE * 9;
    this.y = TILE_SIZE * 10;

    this.game = game;

    this.name = name;
    this.facing = DOWN;
    this.moving = false;
    this.frame = 0;

    this.inventory = new Inventory();
    this.gold = new Gold(game, this);

    this.sprite = new Image();
    this.sprite.src = '/static/images/player.png';

    this.currentShop;
    this.quantity = 1;

    this.unlockedRecipes = ["woodFence", "chest"];
  }

  move(keys, map, stamina) {
    if (stamina.isEmpty()) {
      MOVEMENT_SPEED = 0.5;
    }
    else {
      MOVEMENT_SPEED = 2;
    }
    if (!this.moving) {
      this.frame += FRAME_RATE;
    } else {
      this.frame = (this.frame + 1) % (4 * FRAME_RATE);
    }

    let x = this.x, y = this.y;

    this.moving = true;
    if (keys['a'] || keys['A']) {
      this.facing = LEFT;
      x -= MOVEMENT_SPEED;

      if (!passable(map.getTile(x - TILE_SIZE * 0.25, y + TILE_SIZE)) ||
          !passable(map.getTile(x - TILE_SIZE * 0.25, y + 23))) return;
    } else if (keys['d'] || keys['D']) {
      this.facing = RIGHT;
      x += MOVEMENT_SPEED;

      if (!passable(map.getTile(x + TILE_SIZE * 0.25, y + TILE_SIZE)) ||
          !passable(map.getTile(x + TILE_SIZE * 0.25, y + 23))) return;
    } else if (keys['w'] || keys['W']) {
      this.facing = UP;
      y -= MOVEMENT_SPEED;

      if (!passable(map.getTile(x - TILE_SIZE * 0.25, y + TILE_SIZE)) ||
          !passable(map.getTile(x + TILE_SIZE * 0.25, y + TILE_SIZE))) return;
    } else if (keys['s'] || keys['S']) {
      this.facing = DOWN;
      y += MOVEMENT_SPEED;

      if (!passable(map.getTile(x - TILE_SIZE * 0.25, y + 23)) ||
          !passable(map.getTile(x + TILE_SIZE * 0.25, y + 23))) return;
    } else { // No Longer Moving
      this.frame = 0;
      this.moving = false;
    }

    // if (this.moving && map.getTile(x, y + TILE_SIZE).passable) {
      this.x = x;
      this.y = y;
    // }
  }

  interact(map, stamina) {
    let item = this.inventory.getSelectedItemID();
    let tile = this.getTile(map);

    let back = tile.layers["back"];
    let entity = tile.layers["middle"];
    let front = tile.layers["front"];

    // console.log(`${tile.x}, ${tile.y}`)

    if (entity instanceof NPC) {
      if (ITEMS[item]["reaction"] != null && entity.giftNumber[this.name] < 2 && !entity.gifted[this.name]) {
        if (entity.gift(this.name, item)) {
          this.inventory.removeItem(item, 1);
        }
      }
      else {
        // console.log("A")
        entity.talk(this.name);
      }
      this.game.menu = "dialogue";
      this.game.currentNpc = entity;
    }

    else if (tile && tile.interactable) {
      this.game.startSleep();
    }

    else if (map.name == "seedshop" && tile.x >= 3 && tile.x <= 8 && tile.y == 18) {
      this.game.clearMenus();
      this.game.menu = "shop";
      this.currentShop = this.game.pierreShop;
    }

    else if (map.name == "farm" && tile.x == 9 && tile.y == 10) {
      console.log("HERE");
      this.game.clearMenus();
      this.game.menu = "shop";
      this.currentShop = this.game.pierreShop;
    }

    else if (front instanceof BigEntity) {
      if (ENTITIES[front.type]["tools"].includes(item)) {
        map.removeBigEntity(tile.x, tile.y);
        for (const [key, value] of Object.entries(ENTITIES[front.type]["drops"])) {
          this.inventory.addItem(key, value);
        }
        stamina.useEnergy(5);
      }
    }

    else if (item == null) {
      if (entity instanceof Crop && entity.matured) {
        entity.harvest(this.inventory);
      }
    }

    else {
      if (item == "pickaxe" && entity instanceof Crop) {
        entity.remove();
        stamina.useEnergy(5);
      }

      else if (item == "hoe" && entity == null && tile.tillable) {
        map.crops.push(new Crop(tile.x, tile.y, map));
        stamina.useEnergy(5);
      }

      else if (item == "watering_can" && entity instanceof Crop) {
        entity.water();
        stamina.useEnergy(2);
      }

      else if (entity instanceof Crop && item && item.includes("seeds")) {
        if (entity.type == null) {
          entity.plant(item.split("_")[0]);
          this.inventory.removeItem(item, 1);
        }
      }

      else if (entity != null && ENTITIES[entity]["tools"].includes(item)) {
          tile.remove("middle");
          for (const [key, value] of Object.entries(ENTITIES[entity]["drops"])) {
            this.inventory.addItem(key, value);
          }
          stamina.useEnergy(5);
        }
      }
    }

//adding crafting helpers in here
  countItem(itemID) {
    let total = 0;
    for (let slot of this.inventory.slots) {
      if (slot.itemID === itemID) {
        total += slot.count;
      }
    }
    return total;
  }

  hasItems(requirements) {
    for (let ingredient of requirements) {
      let owned =
        this.countItem(ingredient.item);
      if (owned < ingredient.amount) {
        return false;
      }
    }
    return true;
  }

  removeItems(requirements) {
    for (let ingredient of requirements) {
      let remaining = ingredient.amount;
      for (let slot of this.inventory.slots) {
        if (slot.itemID === ingredient.item) {
          let removed =
            Math.min(slot.count, remaining);
          slot.count -= removed;
          remaining -= removed;
          if (slot.count <= 0) {
            slot.itemID = null;
            slot.count = 0;
          }
          if (remaining <= 0) {
            break;
          }
        }
      }
    }
  }

  craft(recipe) {
    if (!this.hasItems(recipe.ingredients)) {
      return false;
    }
    this.removeItems(recipe.ingredients);
    this.inventory.addItem(
      recipe.output.item,
      recipe.output.amount
    );
    return true;
  }

  sleep() {
    this.game.time.nextDay(this.game);
  }

  getTile(map) {
    let tile;
    switch (this.facing) {
      case LEFT:
        tile = map.getTile(this.x - TILE_SIZE * 0.5, this.y + TILE_SIZE * 1.25);
        break;
      case RIGHT:
        tile = map.getTile(this.x + TILE_SIZE * 0.5, this.y + TILE_SIZE * 1.25);
        break;
      case UP:
        tile = map.getTile(this.x, this.y);
        break;
      case DOWN:
        tile = map.getTile(this.x, this.y + TILE_SIZE * 1.5 + MOVEMENT_SPEED);
        break;
    }
    return tile;
  }

  render(ctx, map) {
    ctx.drawImage(this.sprite,
      Math.trunc(this.frame / FRAME_RATE) * TILE_SIZE, this.facing * TILE_SIZE * 2, // Original Image
      TILE_SIZE, TILE_SIZE * 2,
      (this.x - map.x) * SCALE_FACTOR, (this.y - map.y) * SCALE_FACTOR,
      TILE_SIZE * SCALE_FACTOR, TILE_SIZE * 2 * SCALE_FACTOR
    )
    let tile = this.getTile(map);
    if (tile) tile.highlight(ctx, map);
  }
}
