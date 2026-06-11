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
  });

    canvas.addEventListener("mousedown", (e) => {
      const inv = this.game.player.inventory;
      if (inv.open) {
        let index = inv.getSlotAtPosition(this.mouseX, this.mouseY, 12, 3, 3);
        if (index !== null) inv.startDrag(index);
      }

      if (this.game.menu == "playerMenu" && !this.isDown) {
        this.game.playerMenu.click(this.mouseX, this.mouseY);
      }

      if (this.game.menu == "shop" && !this.isDown) {
        this.game.player.currentShop.mouseInput(
          this.game, this.mouseX, this.mouseY,
          e.ctrlKey, e.shiftKey);
      }

      if (this.game.menu == null && !this.isDown) {
        this.game.player.interact(this.game.map, this.game.stamina)
      }
      this.isDown = true;
    });

    canvas.addEventListener("mouseup", () => {
      this.isDown = false;

      const inv = this.game.player.inventory;
      if (inv.open) {
        let index = inv.getSlotAtPosition(this.mouseX, this.mouseY, 12, 3, 3);
        if (index !== null) {
          inv.endDrag(index);
        } else if (inv.draggingItem !== null) {
          inv.slots[inv.draggingSlot] = {
            itemID: inv.draggingItem.itemID,
            count: inv.draggingItem.count
          };
          inv.draggingItem = null;
          inv.draggingSlot = null;
        }
      }
    });
/*
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left);
      this.mouseY = (e.clientY - rect.top);

      if (this.game.menu == "playerMenu" &&
          this.game.playerMenu.currTab == "crafting") {
        this.game.playerMenu.craftingMenu.update(
          this.mouseX,
          this.mouseY
        );
      }
    }); */
  }
}
