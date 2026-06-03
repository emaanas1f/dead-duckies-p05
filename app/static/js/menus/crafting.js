import { RECIPES, ITEMS, TILE_SIZE, UI_FACTOR, INVENTORY_WIDTH, INVENTORY_HEIGHT, CANVAS_WIDTH } from "../constants.js";

export default class CraftingMenu {
  constructor(game, inventory) {
    this.game = game;
    this.inventory = inventory;
    this.open = false;

    this.startX = (CANVAS_WIDTH - (TILE_SIZE * UI_FACTOR * 13)) / 2;
    this.startY = TILE_SIZE * UI_FACTOR * 2;

    this.hoveredRecipe = null;

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
      img.src = `/static/images/items/${id}.png`;
      img.onerror = () => {};
      this.images[id] = img;
    }
    return this.images[id];
  }

  safeDraw(ctx, img, x, y, w, h) {
    if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, x, y, w, h);
  }

  countItem(itemID) {
    let total = 0;
    let slots = this.inventory?.slots || [];
    for (let slot of slots) if (slot && slot.itemID === itemID) total += slot.count;
    return total;
  }

  hasItems(req) {
    for (let ing of req) if (this.countItem(ing.item) < ing.amount) return false;
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

  update(mx, my) {
    if (!this.open) return;
    this.hoveredRecipe = null;
    let list = this.game.player?.unlockedRecipes || [];
    for (let i = 0; i < list.length; i++) {
      let y = this.startY + i * 80;
      if (mx > this.startX && mx < this.startX + 300 && my > y && my < y + 70) this.hoveredRecipe = list[i];
    }
  }

  click(mx, my) {
    if (!this.open) return;
    let list = this.game.player?.unlockedRecipes || [];
    for (let i = 0; i < list.length; i++) {
      let y = this.startY + i * 80;
      if (mx > this.startX && mx < this.startX + 300 && my > y && my < y + 70) {
        this.craft(RECIPES[list[i]]);
        return;
      }
    }
  }

  render(ctx) {
    if (!this.open) return;

    let list = this.game.player?.unlockedRecipes || [];
    let w = INVENTORY_WIDTH * UI_FACTOR;
    let h = INVENTORY_HEIGHT * UI_FACTOR;

    this.safeDraw(ctx, this.menuImg, this.startX, this.startY, w, h);

    for (let i = 0; i < list.length; i++) {
      let key = list[i];
      let r = RECIPES[key];
      if (!r || !r.ingredients || !r.output) continue;

      let x = this.startX;
      let y = this.startY + i * 80;

      this.safeDraw(ctx, this.getImage(r.output.item), x + 10, y + 10, 48, 48);

      for (let j = 0; j < r.ingredients.length; j++) {
        let ing = r.ingredients[j];
        let ix = x + 70 + j * 90;
        let iy = y + 22;
        this.safeDraw(ctx, this.getImage(ing.item), ix, iy, 24, 24);
      }

      if (this.hoveredRecipe === key) this.safeDraw(ctx, this.hoverImages[key], x + 330, y, 96, 96);
    }

    if (this.inventory) this.inventory.renderInventory(ctx, this.startX, this.startY + h, 3);
  }
}
