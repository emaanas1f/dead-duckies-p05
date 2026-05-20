import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_IMAGES, TILE_SIZE,
         UI_FACTOR, HOTBAR_HEIGHT, HOTBAR_WIDTH } from './constants.js'

import Map from './map.js'
import Player from './player.js';
import Time from './time.js';
import NPC from './npc.js';
import Shop from './shop.js';
import MouseHandler from './mouse.js';
import Stamina from './stamina.js';
import Gold from "./gold.js";

class InputHandler {
  constructor(game) {
    this.keys = {};
    window.addEventListener('keydown', e => {
      if (game.menu == "map") {
        if (['W', 'w', 'A', 'a', 'S', 's', 'D', 'd'].includes(e.key)) {
          this.keys[e.key] = true;
          e.preventDefault();
        } else if (Number.isInteger(parseInt(e.key))) {
          if (parseInt(e.key) == 0) {
            game.player.inventory.selectSlot(9);
          } else {
            game.player.inventory.selectSlot(e.key - 1);
          }
          game.player.inventory.renderHotbar(game.hotbarCtx, game.hotbarCanvas);
        } else if (e.key == "-") {
          game.player.inventory.selectSlot(10);
          game.player.inventory.renderHotbar(game.hotbarCtx, game.hotbarCanvas);
        } else if (e.key == "=") {
          game.player.inventory.selectSlot(11);
          game.player.inventory.renderHotbar(game.hotbarCtx, game.hotbarCanvas);
        } else if (e.key == "c" || e.key == "C") {
          game.player.interact(game.map, game.stamina);
        } else if (e.key == "e" || e.key == "E") {
          game.clearMenus();
          game.player.inventory.open = true;
          game.menu = "inventory";
        }
      }
      if (game.menu == "shop") {
        if (e.key == "ArrowUp") {
          game.player.currentShop.moveUp();
        }
        else if (e.key == "ArrowDown") {
          game.player.currentShop.moveDown();
        }
        else if (e.key == "Shift") {
          // console.log("shift")
          game.player.quantity = 5;
        }
        else if (e.key == "Control") {
          game.player.quantity = 25;
        }
        else {
          game.player.quantity = 1;
        }
      }
      if (e.key == "Escape") {
        game.clearMenus();
        game.mouseToggled = false;
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key] = false;
      game.player.quantity = 1;
    });
  }
}

//doesn't need to be a class, but doing it for organizasation
class StardewValley {
  constructor(canvas, hotbarCanvas, overlayCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    //ui canvas to stop redrawing
    this.hotbarCanvas = hotbarCanvas;
    this.hotbarCtx = this.hotbarCanvas.getContext('2d');
    this.hotbarCtx.imageSmoothingEnabled = false;

    this.overlayCanvas = overlayCanvas;
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    this.overlayCtx.imageSmoothingEnabled = false;

    this.mouse = new MouseHandler(this);
    this.mouseToggled = false; // for one-time mouse inputs to prevent them from firing every frame
    this.maps = {
      farm: new Map('farm'),
      // town: new Map('town'),
      // seedshop: new Map('seedshop'),
      // farmhouse: new Map('farmhouse'),
      // beach: new Map('beach'),
      // fishshop: new Map('fishshop')
    };
    this.currentMap = 'farm';
    this.map = this.maps['farm'];
    //so player isnt js teleported back and forth on a warp tile
    this.justTeleported = false;

    this.input = new InputHandler(this);
    this.player = new Player("Kiran", this);
    this.time = new Time();
    this.stamina = new Stamina(100); //in game it is 270, but doubt we need that much

    this.menu = "map";
    this.currentNpc;

    //npcs and shops
    // let pierre = this.map.addNPC(5, 5, "Pierre")

    this.pierreShop = new Shop("pierre");

    this.player.inventory.addItem("axe", 1);
    this.player.inventory.addItem("hoe", 1);
    this.player.inventory.addItem("pickaxe", 1);
    this.player.inventory.addItem("watering_can", 1);
    this.player.inventory.addItem("parsnip_seeds", 5);

    this.player.inventory.renderHotbar(this.hotbarCtx, this.hotbarCanvas);

    this.maps['farm'].loadTiles('farm').then(() => {
      this.initializeFarm();
      this.loop();
    });

    //i think this loads both maps at the same time before game starts
    //MAKE IT LOAD WHEN ACTUALLY TELEPORTED
    // Promise.all([
    //   this.maps['farm'].loadTiles('farm'),
    //   this.maps['town'].loadTiles('town'),
    //   this.maps['seedshop'].loadTiles('seedshop')
    // ]).then(() => {
    //   this.initializeFarm();
    //   this.loop();
    // });
  }

  initializeFarm() {
    for (let x = 0; x < this.map.tiles.length; x++) {
      for (let y = 0; y < this.map.tiles[x].length; y++) {
        if (!this.map.tiles[x][y].tillable) continue;
        const randomNum = Math.floor(Math.random() * 100);
        if (randomNum < 2) {
          this.map.addBigEntity(x, y, "tree");
        } else if (randomNum < 7) {
          this.map.tiles[x][y].add("stone", "middle");
        } else if (randomNum < 12) {
          this.map.tiles[x][y].add("twig", "middle");
        } else if (randomNum < 17) {
          this.map.tiles[x][y].add("weed", "middle");
        }
      }
    }
    let playerTile = this.map.getTile(this.player.x, this.player.y + 23);
    playerTile.remove("middle");
    this.map.removeBigEntity(playerTile.x, playerTile.y);
  }

  checkTeleport() {
    const tile = this.map.getTile(this.player.x, this.player.y + 23);
    if (tile && tile.teleporter && tile.destination) {
      if (!this.justTeleported) {
        const teleport = () => {
          this.justTeleported = true;
          this.currentMap = tile.destination.map;
          this.map = this.maps[tile.destination.map];
          this.player.x = tile.destination.x * TILE_SIZE;
          this.player.y = tile.destination.y * TILE_SIZE;
        }

        if (!Object.hasOwn(this.maps, tile.destination.map)) {
          this.maps[tile.destination.map] = new Map(tile.destination.map);
          this.maps[tile.destination.map].loadTiles(tile.destination.map).then(teleport);
        } else {
          teleport();
        }

        // if (this.maps[tile.destination.map].tiles) {
        //   teleport();
        // }
        // else {
          
      }
    } else {
      this.justTeleported = false;
    }
  }

  clearMenus() {
    this.hotbarCtx.clearRect(0, 0, HOTBAR_WIDTH * UI_FACTOR, HOTBAR_HEIGHT * UI_FACTOR);
    this.overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    this.player.inventory.open = false;
    this.menu = "map";
  }

  loop() {
    switch (this.menu) {
      case "map":
        //this.player.move(this.input.keys, this.map, this.stamina);
        this.checkTeleport();

        this.map.follow(this.player);

        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        let npcsToDraw = this.map.render(this.ctx, this.player);
        this.player.render(this.ctx, this.map);

        // console.log(npcsToDraw);

        npcsToDraw.forEach((npc) => {
          npc.render(this.ctx, this.map)
        });

        this.time.update(this);
        // let scaleFactor = .19 * CANVAS_WIDTH / 72;
        let scaleFactor = 2.5;
        this.time.render(this.ctx, scaleFactor);

        this.player.gold.render(this.ctx,
          .8 * CANVAS_WIDTH + 8 * scaleFactor, .01 * CANVAS_HEIGHT + 40 * scaleFactor,
          scaleFactor
        );

        this.stamina.render(this.ctx);

        //redraw since it won't show up otherwise

       // this.player.inventory.renderDraggedItem(this.overlayCtx, this.mouseHandler.mouseX, this.mouseHandler.mouse);
        break;
      case "inventory":
        this.overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.player.inventory.renderInventory(this.overlayCtx, 150, 150, UI_FACTOR);
        this.player.inventory.renderDraggedItem(this.overlayCtx, this.mouse.mouseX, this.mouse.mouseY);
        break;
      case "shop":
        this.map.follow(this.player);
        let NPCs = this.map.render(this.ctx, this.player);
        this.player.render(this.ctx, this.map);
        NPCs.forEach((npc) => npc.render(this.ctx, this.map));
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        this.player.currentShop.render(this.overlayCtx, this.player);
        if (this.mouse.isDown && !this.mouseToggled) {
          // console.log("down")
          this.player.currentShop.mouseInput(this, this.mouse.mouseX, this.mouse.mouseY);
          this.mouseToggled = true;
        }

        if (!this.mouse.isDown && this.mouseToggled) {
          this.mouseToggled = false;
        }
        break;
      case "dialogue":
        this.currentNpc.renderDialogue(this.overlayCtx, this.player.name)
        if (this.mouse.isDown) {
          this.clearMenus();
        }

    }
    this.player.inventory.renderHotbar(this.hotbarCtx);
    // this.updateHotbarInput();
    this.player.move(this.input.keys, this.map, this.stamina);
    this.checkTeleport();

    //

    requestAnimationFrame(() => this.loop());
  };
}

// window.addEventListener('load', function() {
  const canvas = document.getElementById('main-canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  // StardewValley.create(canvas);

  const hotbarCanvas = document.getElementById('hotbar-canvas');
  hotbarCanvas.width = HOTBAR_WIDTH * UI_FACTOR;
  hotbarCanvas.height = HOTBAR_HEIGHT * UI_FACTOR;

  // const inventoryCanvas = document.getElementById('inventory-canvas');
  // inventoryCanvas.width = ;

  const overlayCanvas = document.getElementById('overlay-canvas');
  overlayCanvas.width = CANVAS_WIDTH;
  overlayCanvas.height = CANVAS_HEIGHT;

  new StardewValley(canvas, hotbarCanvas, overlayCanvas);
// });
