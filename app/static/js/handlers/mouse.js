import { INVENTORY_WIDTH, INVENTORY_HEIGHT, UI_FACTOR } from "../constants.js";

//mouse.js exists for inventory click and drag
export default class MouseHandler {
  constructor(game) {
    this.game = game;

    this.mouseX = 0;
    this.mouseY = 0;

    this.isDown = false;

    const canvas = game.overlayCanvas;

    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();

      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;

      if (this.game.menu == "playerMenu" && this.game.playerMenu.currTab == "crafting") {
        this.game.playerMenu.craftingMenu.update(
          this.mouseX,
          this.mouseY
        );
      }
    });

  canvas.addEventListener("mousedown", (e) => {
    const inv = this.game.player.inventory;
    const chest = this.game.player.openChest;
    if (chest) {
      let chestIndex = inv.getSlotAtPosition(this.mouseX, this.mouseY, 12, 2, UI_FACTOR);
      if (chestIndex !== null) {
        inv.startDrag(chestIndex, chest.slots);
        this.isDown = true;
        return;
      }
    }
    if (inv.open) {
      let index = inv.getSlotAtPosition( this.mouseX, this.mouseY, 12, 3, UI_FACTOR);
      if (index !== null) {
        inv.startDrag(index, inv.slots);
        this.isDown = true;
        return;
      }
    }
    if (this.game.menu == "playerMenu" && !this.isDown) {
      this.game.playerMenu.click(this.mouseX, this.mouseY);
    }
    if (this.game.menu == "shop" && !this.isDown) {
      this.game.player.currentShop.mouseInput(this.game, this.mouseX, this.mouseY, e.ctrlKey, e.shiftKey);
    }
    if (this.game.menu == null && !this.isDown) {this.game.player.interact(this.game.map, this.game.stamina);}
    this.isDown = true;
  });

  canvas.addEventListener("mouseup", () => {
    this.isDown = false;
    const inv = this.game.player.inventory;
    const chest = this.game.player.openChest;
    if (inv.draggingItem === null) return;
    if (chest) {
      let chestIndex = inv.getSlotAtPosition(this.mouseX, this.mouseY, 12,  2, UI_FACTOR);
      if (chestIndex !== null) {
        inv.endDrag(chestIndex, chest.slots);
        return;
      }
    }
      if (this.game.menu == "cooking" && !this.isDown) {
        this.game.cookingMenu.click(this.mouseX, this.mouseY);
      }

      if (this.game.menu == null && !this.isDown) {
        this.game.player.interact(this.game.map, this.game.stamina)
    }
    if (inv.open) {
      let index = inv.getSlotAtPosition(this.mouseX, this.mouseY, 12, 3, UI_FACTOR );
      if (index !== null) {
        inv.endDrag(index, inv.slots);
        return;
      }
    }
    if (inv.draggingItem !== null) {
      inv.slots[inv.draggingSlot] = { itemID: inv.draggingItem.itemID,count: inv.draggingItem.count };
      inv.draggingItem = null;
      inv.draggingSlot = null;
    }
  });
  }
}
