import { CANVAS_WIDTH, TILE_SIZE, UI_FACTOR } from "../constants.js";
import { loadedItems } from "./inventory.js";

export default class ChestMenu {
  constructor(game) {
    this.game = game;
    this.player = game.player;

    this.inventory = new Inventory(24);
  }

  render(overlayCtx) {
    let chest = this.player.openChest;
    if (!chest) return;

    let cols = 12;
    let rows = 2;

    let left = (CANVAS_WIDTH - cols * TILE_SIZE * UI_FACTOR) / 2;

    let chestY = TILE_SIZE * UI_FACTOR;
    let inventoryY = chestY + 8 * TILE_SIZE * UI_FACTOR;

    this.renderChestInventory(overlayCtx, chest, left, chestY, cols, rows);

    this.player.inventory.renderInventory(overlayCtx, left, inventoryY, UI_FACTOR);
  }

  renderChestInventory(ctx, chest, startX, startY, cols, rows) {
    ctx.drawImage(this.player.inventory.inventoryMenu, startX, startY, cols * TILE_SIZE * UI_FACTOR, rows * TILE_SIZE * UI_FACTOR);

    let slotStartX = startX + TILE_SIZE * UI_FACTOR / 2;
    let slotStartY = startY + TILE_SIZE * UI_FACTOR * 1.5;

    for (let i = 0; i < chest.inventory.length; i++) {
      let slot = chest.inventory[i];
      if (!slot || slot.itemID == null) continue;

      let col = i % cols;
      let row = Math.floor(i / cols);

      let x = slotStartX + col * TILE_SIZE * UI_FACTOR;
      let y = slotStartY + row * TILE_SIZE * UI_FACTOR;

      let image = loadedItems[slot.itemID];

      if (image) {
        ctx.drawImage(image, x + 8 * UI_FACTOR, y + 8 * UI_FACTOR, 32 * UI_FACTOR, 32 * UI_FACTOR);
      }

      ctx.fillStyle = "white";
      ctx.font = `${14 * UI_FACTOR}px Arial`;
      ctx.fillText(slot.count, x + 10 * UI_FACTOR, y + 14 * UI_FACTOR);
    }
  }
}