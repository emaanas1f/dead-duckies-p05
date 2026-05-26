import { CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE,
         UI_FACTOR, HOTBAR_HEIGHT, HOTBAR_WIDTH, STARTING_STAMINA } from './constants.js'
import { initializeFarm, initializeMine } from './map/map.js';

import Map from './map/map.js'
import Player from './player.js';
import NPC from './npc.js';

import Time from './ui/time.js';
import Stamina from './ui/stamina.js';
import Gold from "./ui/gold.js";

import Shop from './menus/shop.js';
import PlayerMenu from './menus/player-menu.js';

import MouseHandler from './handlers/mouse.js';
import InputHandler from './handlers/keyboard.js';

class StardewValley {
  constructor(canvas, hotbarCanvas, overlayCanvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.hotbarCanvas = hotbarCanvas;
    this.hotbarCtx = this.hotbarCanvas.getContext('2d');
    this.hotbarCtx.imageSmoothingEnabled = false;

    this.overlayCanvas = overlayCanvas;
    this.overlayCtx = this.overlayCanvas.getContext('2d');
    this.overlayCtx.imageSmoothingEnabled = false;

    this.nightImage = new Image();
    this.nightImage.src = '/static/images/night.png'
    this.sleepAlpha = 0;
    this.sleepState = null; //null, fadein, fadeout

    this.maps = {
      farm: new Map('farm'),
    };
    this.map = this.maps['farm'];
    this.justTeleported = false;

    this.player = new Player("Kiran", this);
    this.time = new Time();
    this.stamina = new Stamina(STARTING_STAMINA); //in game it is 270, but doubt we need that much

    this.currentNpc;
    this.npcList = [];

    this.playerMenu = new PlayerMenu(this);
    this.menu = null;

    this.pierreShop = new Shop("pierre");

    this.player.inventory.addItem("axe", 1);
    this.player.inventory.addItem("hoe", 1);
    this.player.inventory.addItem("pickaxe", 1);
    this.player.inventory.addItem("watering_can", 1);
    this.player.inventory.addItem("parsnip_seeds", 5);
    this.player.inventory.addItem("cauliflower_seeds", 5);

    this.mouse = new MouseHandler(this);
    this.input = new InputHandler(this);

    this.maps['farm'].loadTiles('farm', this).then(() => {
      initializeFarm(this.map, this.player);
      this.loop();
    });
  }

  checkTeleport() {
    const tile = this.map.getTile(this.player.x, this.player.y + 23);
    if (tile && tile.teleporter && tile.destination) {
      if (!this.justTeleported) {
        const teleport = () => {
          this.justTeleported = true;
          this.map = this.maps[tile.destination.map];
          this.player.x = tile.destination.x * TILE_SIZE;
          this.player.y = tile.destination.y * TILE_SIZE;
        }

        if (!Object.hasOwn(this.maps, tile.destination.map)) {
          this.maps[tile.destination.map] = new Map(tile.destination.map);
          this.maps[tile.destination.map].loadTiles(tile.destination.map, this).then(() => {
            if (tile.destination.map.substring(0, 5) == "mines") {
              initializeMine(this.maps[tile.destination.map], this.player);
            }
            teleport();
          });
        } else {
          teleport();
        }
      }
    } else {
      this.justTeleported = false;
    }
  }

  clearMenus() {
    this.hotbarCtx.clearRect(0, 0, HOTBAR_WIDTH * UI_FACTOR, HOTBAR_HEIGHT * UI_FACTOR);
    this.overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    this.playerMenu.close();
    this.menu = null;
  }

  loop() {
    switch (this.menu) {
      case null:
        this.checkTeleport();

        this.map.follow(this.player);

        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        let npcsToDraw = this.map.render(this.ctx, this.player);
        this.player.render(this.ctx, this.map);
        npcsToDraw.forEach((npc) => {
          npc.render(this.ctx, this.map)
        });

        let scaleFactor = 2.5;

        this.time.update(this);
        this.time.render(this.ctx, scaleFactor);

        this.player.gold.render(this.ctx,
          .8 * CANVAS_WIDTH + 8 * scaleFactor,
          .01 * CANVAS_HEIGHT + 40 * scaleFactor,
          scaleFactor);

        this.stamina.render(this.ctx);
        break;
      case "playerMenu":
        this.overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.playerMenu.render(this.overlayCtx, this.mouse);
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
        break;
      case "sleeping":
        //world underneath
        //this is assuming the player chooses to sleep
        //will handle passing out later
        this.map.follow(this.player);
        this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.map.render(this.ctx, this.player);
        this.player.render(this.ctx, this.map);

        this.overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.overlayCtx.globalAlpha = this.sleepAlpha;
        this.overlayCtx.drawImage(this.nightImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.overlayCtx.globalAlpha = 1;

        if (this.sleepState === 'fadein') {
          this.sleepAlpha = Math.min(1, this.sleepAlpha + 0.005);
          if (this.sleepAlpha >= 1) {
            this.player.sleep(this.time, this.stamina); //need to implement
            this.sleepState = 'fadeout';
          }
        } else if (this.sleepState === 'fadeout') {
          this.sleepAlpha = Math.max(0, this.sleepAlpha - 0.005);
          if (this.sleepAlpha <= 0) {
            this.sleepState = null;
            this.menu = null;
            this.overlayCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
          }
        }
        break;
    }

    this.player.inventory.renderHotbar(this.hotbarCtx);
    this.player.move(this.input.keys, this.map, this.stamina);
    this.checkTeleport();

    requestAnimationFrame(() => this.loop());
  };

  startSleep() {
    this.menu = 'sleeping';
    this.sleepState = 'fadein';
    this.sleepAlpha = 0;
  }
}

// window.addEventListener('load', function() {
  const canvas = document.getElementById('main-canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  const hotbarCanvas = document.getElementById('hotbar-canvas');
  hotbarCanvas.width = HOTBAR_WIDTH * UI_FACTOR;
  hotbarCanvas.height = HOTBAR_HEIGHT * UI_FACTOR;

  const overlayCanvas = document.getElementById('overlay-canvas');
  overlayCanvas.width = CANVAS_WIDTH;
  overlayCanvas.height = CANVAS_HEIGHT;

  new StardewValley(canvas, hotbarCanvas, overlayCanvas);
// });
