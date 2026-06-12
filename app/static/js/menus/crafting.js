import { RECIPES, ITEMS, TILE_SIZE, UI_FACTOR, INVENTORY_WIDTH, INVENTORY_HEIGHT, CANVAS_WIDTH } from "../constants.js";

export default class CraftingMenu {
  constructor(game, inventory) {
    this.game = game;
    this.inventory = inventory;
    this.open = false;

    this.startX = (CANVAS_WIDTH - (TILE_SIZE * UI_FACTOR * 13)) / 2;
    this.startY = TILE_SIZE * UI_FACTOR * 2;

    this.hoveredRecipe = null;

    this.SLOT_W = 48;
    this.SLOT_H = 96;
    this.GAP = 75;

    this.hoverImages = {};
    for (let key in RECIPES) {
      this.hoverImages[key] = new Image();
      this.hoverImages[key].src = `/static/images/items/crafting/${key}_hover.png`;
    }

    this.images = {};
    this.menuImg = new Image();
    this.menuImg.src = "/static/images/ui/menu.png";
  }

  getImage(id) {
    if (!id) return null;
    if (!this.images[id]) {
      let img = new Image();
      img.src = `/static/images/items/crafting/${id}.png`;
      img.onerror = () => {};
      this.images[id] = img;
    }
    return this.images[id];
  }

  safeDraw(ctx, img, x, y, w, h) {
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, x, y, w, h);
    }
  }

  countItem(itemID) {
    let total = 0;
    let slots = this.inventory?.slots || [];
    for (let slot of slots) {
      if (slot && slot.itemID === itemID) total += slot.count;
    }
    return total;
  }

  hasItems(req) {
    for (let ing of req) {
      if (this.countItem(ing.item) < ing.amount) return false;
    }
    return true;
  }

  removeItems(req) {
    let slots = this.inventory?.slots || [];
    for (let ing of req) {
      let remaining = ing.amount;
      for (let slot of slots) {
        if (slot.itemID === ing.item) {
          let removed = Math.min(slot.count, remaining);
          slot.count -= removed;
          remaining -= removed;
          if (slot.count <= 0) {
            slot.itemID = null;
            slot.count = 0;
          }
          if (remaining <= 0) break;
        }
      }
    }
  }

  craft(recipe) {
    if (!recipe || !this.hasItems(recipe.ingredients)) return;
    this.removeItems(recipe.ingredients);
    this.inventory.addItem(recipe.output.item, recipe.output.amount);
  }

  getSlot(i) {
    return {x: this.startX + this.GAP * i, y: this.startY, w: this.SLOT_W, h: this.SLOT_H};
  }

  update(mx, my) {
    if (!this.open) return;
    this.hoveredRecipe = null;
    let list = this.game.player?.unlockedRecipes || [];
    for (let i = 0; i < list.length; i++) {
      let key = list[i];
      let slot = this.getSlot(i);
      if (mx >= slot.x && mx <= slot.x + slot.w && my >= slot.y && my <= slot.y + slot.h) {
        this.hoveredRecipe = key;
        return;
      }
    }
  }

  click(mx, my) {
    if (!this.open) return;
    let list = this.game.player?.unlockedRecipes || [];
    for (let i = 0; i < list.length; i++) {
      let key = list[i];
      let slot = this.getSlot(i);

      if (mx >= slot.x && mx <= slot.x + slot.w && my >= slot.y && my <= slot.y + slot.h) {
        this.craft(RECIPES[key]);
        return;
      }
    }
  }

  render(ctx, mouse) {
    if (!this.open) return;
    let list = this.game.player?.unlockedRecipes || [];
    let w = INVENTORY_WIDTH * UI_FACTOR;
    let h = INVENTORY_HEIGHT * UI_FACTOR;

    if (this.inventory) {
      this.inventory.renderInventory(ctx, this.startX, this.startY + h, 3);
      this.inventory.renderDraggedItem(ctx, mouse.mouseX, mouse.mouseY);
    }

    this.safeDraw(ctx, this.menuImg, this.startX, this.startY, w, h);

    for (let i = 0; i < list.length; i++) {
      let key = list[i];
      let r = RECIPES[key];
      if (!r || !r.output) continue;
      let slot = this.getSlot(i);
      this.safeDraw(ctx, this.getImage(r.output.item), slot.x, slot.y, this.SLOT_W, this.SLOT_H);
    }

    if (this.hoveredRecipe && this.hoverImages[this.hoveredRecipe]) {
      this.safeDraw(ctx, this.hoverImages[this.hoveredRecipe], this.startX + 20, this.startY, 562 / 1.5, 402 / 1.5);
    }
  }
}
