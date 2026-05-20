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
      this.mouseX = (e.clientX - rect.left);
      this.mouseY = (e.clientY - rect.top);
    });

    canvas.addEventListener("mousedown", () => {
      this.isDown = true;
      const inv = this.game.player.inventory;

      if (!inv.open) {
        return;
      }

      let index = inv.getSlotAtPosition(this.mouseX, this.mouseY, 12, 3, 3);
      if (index !== null) {
        inv.startDrag(index);
      }
    });

    canvas.addEventListener("mouseup", () => {
      this.isDown = false;
      const inv = this.game.player.inventory;

      if (!inv.open) {
        return;
      }

      let index = inv.getSlotAtPosition(this.mouseX, this.mouseY, 12, 3, 3);

      if (index !== null) {
        inv.endDrag(index);
      }
      else if (inv.draggingItem !== null) {
        inv.slots[inv.draggingSlot] = {
          itemID: inv.draggingItem.itemID,
          count: inv.draggingItem.count
        };
        inv.draggingItem = null;
        inv.draggingSlot = null;
      }
    });
  }
}