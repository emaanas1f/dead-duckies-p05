import {TILE_SIZE, ITEMS, HOTBAR_HEIGHT, HOTBAR_WIDTH, UI_FACTOR, HOTBAR_SIZE, INVENTORY_HEIGHT, INVENTORY_WIDTH} from "../constants.js";

let loadedItems = {};
const INVENTORY_SCALE = 3;

export class Inventory {
  constructor(size = 36) {
    this.slots = [];
    this.selectedSlot = 0;
    this.open = false;
    this.draggingSlot = null;
    this.draggingItem = null;
    this.inventoryX = 0;
    this.inventoryY = 0;
    this.inventorySlotX = 0;
    this.inventorySlotY = 0;
    this.hotbar = new Image();
    this.hotbar.src = '/static/images/ui/hotbar.png';
    this.inventoryMenu = new Image();
    this.inventoryMenu.src = '/static/images/ui/inventory.png';
    this.select = new Image();
    this.select.src = '/static/images/ui/select.png';

    for (let i = 0; i < size; i += 1) {
      this.slots[i] = {itemID: null, count: 0};
    }
  }

  selectSlot(index) {
    if (index >= 0 && index < HOTBAR_SIZE) {
      this.selectedSlot = parseInt(index);
    }
  }

  getSelectedSlot() {
    return this.slots[this.selectedSlot];
  }

  getSelectedItemID() {
    return this.slots[this.selectedSlot].itemID;
  }

  getSlot(index) {
    return this.slots[index];
  }

  addItem(itemID, amount) {
    if (!Object.hasOwn(loadedItems, itemID)) {
      let asset = new Image();
      asset.src = `/static/images/items/${ITEMS[itemID]["category"]}/${itemID}.png`;
      loadedItems[itemID] = asset;
    }

    let remaining = amount;
    for (let i = 0; i < this.slots.length; i += 1) {
      let slot = this.slots[i];
      if (slot.itemID === itemID) {
        let max = 99;
        if (ITEMS[itemID].hasOwnProperty("maxStack")) {
          max = ITEMS[itemID].maxStack;
        }
        let space = max - slot.count;
        if (space > 0) {
          let add = Math.min(space, remaining);
          slot.count += add;
          remaining -= add;
        }
      }
    }

    for (let i = 0; i < this.slots.length; i += 1) {
      let slot = this.slots[i];
      if (slot.itemID === null) {
        let max = 99;
        if (ITEMS[itemID].hasOwnProperty("maxStack")) {
          max = ITEMS[itemID].maxStack;
        }
        let add = Math.min(max, remaining);
        slot.itemID = itemID;
        slot.count = add;
        remaining -= add;
      }
      if (remaining === 0) {
        break;
      }
    }
    return remaining === 0;
  }

  removeItem(itemID, amount) {
    let remaining = amount;
    for (let i = 0; i < this.slots.length; i += 1) {
      let slot = this.slots[i];
      if (slot.itemID === itemID) {
        let remove = Math.min(slot.count, remaining);
        slot.count -= remove;
        remaining -= remove;
        if (slot.count === 0) {
          slot.itemID = null;
        }
      }
      if (remaining === 0) {
        break;
      }
    }
    return remaining === 0;
  }

  countItem(item) {
    let total = 0;
    for (let slot of this.inventory) {
      if (!slot) continue;
      if (slot.item === item) {
        total += slot.amount;
      }
    }
    return total;
  }

  getSlotAtPosition(mouseX, mouseY, columns, rows, overlayScale) {
    let scaledTile = TILE_SIZE * overlayScale;

    if (mouseX < this.inventorySlotX || mouseY < this.inventorySlotY || mouseX > this.inventorySlotX + columns * scaledTile || mouseY > this.inventorySlotY + rows * scaledTile) {
      return null;
    }

    let x = Math.floor((mouseX - this.inventorySlotX) / scaledTile);
    let y = Math.floor((mouseY - this.inventorySlotY) / scaledTile);

    return y * columns + x;
  }

  startDrag(index) {
    let slot = this.slots[index];
    if (slot.itemID === null) {
      return;
    }
    this.draggingSlot = index;
    this.draggingItem = {
      itemID: slot.itemID,
      count: slot.count
    };
    slot.itemID = null;
    slot.count = 0;
  }

  endDrag(index) {
    if (this.draggingItem === null) {
      return;
    }
    let target = this.slots[index];
    if (target.itemID === null) {
      target.itemID = this.draggingItem.itemID;
      target.count = this.draggingItem.count;
    }
    else if (target.itemID === this.draggingItem.itemID) {
      let max = 99;
      if (ITEMS[target.itemID].hasOwnProperty("maxStack")) {
        max = ITEMS[target.itemID].maxStack;
      }
      let space = max - target.count;
      let add = Math.min(space, this.draggingItem.count);
      target.count += add;
      this.draggingItem.count -= add;
      if (this.draggingItem.count > 0) {
        this.slots[this.draggingSlot] = {
          itemID: this.draggingItem.itemID,
          count: this.draggingItem.count
        };
      }
    }
    else {
      let temp = {itemID: target.itemID, count: target.count};
      target.itemID = this.draggingItem.itemID;
      target.count = this.draggingItem.count;
      this.slots[this.draggingSlot] = temp;
    }
    this.draggingItem = null;
    this.draggingSlot = null;
  }

  render(ctx, startX, startY, columns, rows, scale, selected = true) {
    for (let i = 0; i < columns * rows; i += 1) {
      let slot = this.getSlot(i);
      let col = i % columns;
      let row = Math.floor(i / columns);

      let x = startX + col * TILE_SIZE * scale;
      let y = startY + row * (TILE_SIZE + 1) * scale;
      if (rows > 1) {
        y -= scale;
      }

      if (selected && i === this.selectedSlot) {
        ctx.drawImage(this.select, x, y, 48 * scale / UI_FACTOR, 48 * scale / UI_FACTOR);
      }
      if (slot.itemID === null) {
        continue;
      }

      let imageName = slot.itemID.replaceAll(" ", "_");

      if (loadedItems[imageName]) {
        ctx.drawImage(loadedItems[imageName], x + 8 * scale / UI_FACTOR, y + 8 * scale / UI_FACTOR, 32 * scale / UI_FACTOR, 32 * scale / UI_FACTOR);
      }

      ctx.fillStyle = 'white';
      ctx.font = `${14 * scale / UI_FACTOR}px Arial`;
      ctx.fillText(slot.count, x + 10 * scale, y + 14 * scale);
    }
  }

  renderHotbar(hotbarCtx) {
    hotbarCtx.clearRect(0, 0, HOTBAR_WIDTH * UI_FACTOR, HOTBAR_HEIGHT * UI_FACTOR);
    hotbarCtx.drawImage(this.hotbar, 0, 0, HOTBAR_WIDTH * UI_FACTOR, HOTBAR_HEIGHT * UI_FACTOR);
    this.render(hotbarCtx, 9, 9, HOTBAR_SIZE, 1, UI_FACTOR);
  }

  renderInventory(overlayCtx, startX, startY, overlayScale) {
    this.inventoryX = startX;
    this.inventoryY = startY;

    let width = INVENTORY_WIDTH * overlayScale;
    let height = INVENTORY_HEIGHT * overlayScale;

    overlayCtx.drawImage(this.inventoryMenu, startX, startY, width, height);

    let slotAreaWidth = 12 * TILE_SIZE * overlayScale;
    let slotAreaHeight = 3 * TILE_SIZE * overlayScale;

    let slotStartX = startX + (width - slotAreaWidth) / 2;
    let slotStartY = startY + (height - slotAreaHeight) / 2;

    this.inventorySlotX = slotStartX;
    this.inventorySlotY = slotStartY;

    this.render(overlayCtx, slotStartX, slotStartY, 12, 3, overlayScale, false);
  }

  renderDraggedItem(ctx, mouseX, mouseY) {
    if (this.draggingItem === null) {
      return;
    }

    let width = INVENTORY_WIDTH * INVENTORY_SCALE;
    let height = INVENTORY_HEIGHT * INVENTORY_SCALE;

    if (mouseX < this.inventoryX || mouseY < this.inventoryY ||
        mouseX > this.inventoryX + width ||  mouseY > this.inventoryY + height) {
      return;
    }

    let imageName = this.draggingItem.itemID.replaceAll(" ", "_");

    ctx.drawImage(loadedItems[imageName], mouseX - TILE_SIZE, mouseY - TILE_SIZE, 32 * INVENTORY_SCALE / UI_FACTOR, 32 * INVENTORY_SCALE / UI_FACTOR);
    ctx.fillStyle = 'white';
    ctx.font = `${14 * INVENTORY_SCALE / UI_FACTOR}px Arial`;
    ctx.fillText(this.draggingItem.count, mouseX - TILE_SIZE + 22, mouseY - TILE_SIZE + 34);
  }
}
