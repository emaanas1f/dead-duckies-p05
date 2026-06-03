import BigEntity from "./map/big-entity.js";
import { TILE_SIZE, ENTITIES, SCALE_FACTOR, CANVAS_WIDTH, CANVAS_HEIGHT,
         FRAME_RATE, MINES, ITEMS, DEFAULT_MOVEMENT_SPEED,
         BIG_ENTITIES} from "./constants.js";
import { Inventory } from './menus/inventory.js';
import NPC from "./npc.js"
import Crop from "./map/crop.js"
import Gold from "./ui/gold.js"
import Map from "./map/map.js";
import { initializeMine } from "./map/map.js";
import Fish from "./menus/fish.js"

// Correspond with rows in player.png
const DOWN = 0;
const RIGHT = 1;
const UP = 2;
const LEFT = 3;
var MOVEMENT_SPEED = DEFAULT_MOVEMENT_SPEED;

function passable(tile) {
  return tile != null && tile.passable;
}

export default class Player {
  constructor(name, game) {
    this.x = TILE_SIZE * 64;
    this.y = TILE_SIZE * 15;

    this.game = game;

    this.name = name;
    this.facing = DOWN;
    this.moving = false;
    this.frame = 0;

    this.inventory = new Inventory();
    this.gold = new Gold(game, this);
    this.fish = new Fish(game, this.inventory)

    this.sprite = new Image();
    this.sprite.src = '/static/images/player.png';

    this.currentShop;
    this.quantity = 1;

    this.unlockedRecipes = ["furnace", "chest", "preserved_jar"];
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
    if (["training_rod", "bamboo_pole", "fiberglass_rod", "iridium_rod", "advanced_iridium_rod"].includes(item) && tile.water) {
      if (stamina.isEmpty()) return;
      let location = ""
      if (tile.forest_lake) {
        location = "forest_lake"
      }
      switch (map.name) {
        case "forest":
          location = "forest_river"
          break;
        case "beach":
          location = "ocean"
          break;
        default:
          location = "town"
          break;
      }
      console.log(location, this.game.time.currTime);
      let caught = this.fish.getFish(location, this.game.time.currTime);
      console.log(caught);
      this.game.menu = "fishing";
      this.fish.currentFish = caught;
      this.fish.currentRod = item;
      this.inventory.addItem(caught, 1);
      stamina.useEnergy(10);
    }
    if (entity instanceof NPC) { // NPC INTERACTIONS
      if (ITEMS[item]["reaction"] != null && entity.giftNumber[this.name] < 2 && !entity.gifted[this.name]) {
        if (entity.gift(this.name, item)) {
          this.inventory.removeItem(item, 1);
          this.game.menu = "dialogue";
          this.game.currentNpc = entity;
        }
      }
      else if (!entity.talked[this.name]) {
        entity.talk(this.name);
        this.game.menu = "dialogue";
        this.game.currentNpc = entity;
      }
    }

    else if (map.name == "seedshop" && tile.x >= 3 && tile.x <= 8 && tile.y == 18) { // PIERRE'S
      this.game.clearMenus();
      this.game.menu = "shop";
      this.currentShop = this.game.shop["pierre"];
    }

    else if (tile && tile.interactable) { // SLEEP
      this.game.startSleep();
    }

    else if (back == "ladder" && entity == null) { // MINE LADDERS
      let nextIndex = parseInt(this.game.map.name.split("/")[1]) + 1;
      let nextMap = "mines/" + nextIndex;
      if (!Object.hasOwn(this.game.maps, nextMap)) {
        this.game.maps[nextMap] = new Map(nextMap);
        this.game.maps[nextMap].loadTiles(nextMap, this.game).then(() => {
          initializeMine(this.game.maps[nextMap]);
          this.game.map = this.game.maps[nextMap];
          this.x = MINES[nextIndex - 1]["spawnX"] * TILE_SIZE;
          this.y = MINES[nextIndex - 1]["spawnY"] * TILE_SIZE;
        })
      } else {
        this.game.map = this.game.maps[nextMap];
        this.x = MINES[nextIndex - 1]["spawnX"] * TILE_SIZE;
        this.y = MINES[nextIndex - 1]["spawnY"] * TILE_SIZE;
      }
    }

    if (item == "hoe" && entity == null && tile.tillable) { // TILLING TILES
      if (stamina.isEmpty()) return;
      map.crops.push(new Crop(tile.x, tile.y, map));
      stamina.useEnergy(5);
    }

    else if (entity instanceof Crop) { // CROP HANDLING
      if (item && (item.includes("seeds") || item.includes("starter")) && entity.type == null) {
        let lastIndex = item.lastIndexOf('_');
        entity.plant(item.slice(0, lastIndex));
        this.inventory.removeItem(item, 1);
      }
      if (item == "watering_can") {
        if (stamina.isEmpty()) return;
        entity.water();
        stamina.useEnergy(2);
      }
      if (item == "pickaxe") {
        if (stamina.isEmpty()) return;
        entity.remove();
        stamina.useEnergy(5);
      }
      if (entity.type != null) {
        entity.harvest(this.inventory);
      }
    }

    else if (front instanceof BigEntity) { // CHOPPING TREES
      if (BIG_ENTITIES[front.type]["tools"].includes(item)) {
        if (stamina.isEmpty()) return;
        front.hit();
        stamina.useEnergy(5);
      }
    }

    else if (entity != null &&
        (ENTITIES[entity]["tools"].includes(item) ||
        ENTITIES[entity]["tools"].includes("all"))) { // CHOPPING EVERYTHING ELSE
      if (stamina.isEmpty()) return;
      tile.remove("middle");
      for (const [key, value] of Object.entries(ENTITIES[entity]["drops"])) {
        if (ENTITIES[entity]["tools"].includes("all")) {
          if (Math.random() < 0.2) this.inventory.addItem(key, value * 2);
          else this.inventory.addItem(key, value);
        }
        else {
          this.inventory.addItem(key, value);
        }
      }
      stamina.useEnergy(5);
    }
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

  sleep(time, stamina) {
    // IMPLEMENT STAMINA RESTORATION
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
