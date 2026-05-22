import { CANVAS_HEIGHT, CANVAS_WIDTH, SCALE_FACTOR, TILE_SIZE, UI_FACTOR} from "../constants.js";
import CraftingMenu from "./crafting.js";

const UI_TILE_SIZE = TILE_SIZE * UI_FACTOR
const MENU_WIDTH = UI_TILE_SIZE * 13;
const LEFT_BOUND = (CANVAS_WIDTH - MENU_WIDTH) / 2;
const TABS = ["inventory", "relationships", "crafting"];

export default class PlayerMenu {
  constructor(game) {
    this.currTab = "inventory";
    this.tabIcons = [];
    TABS.forEach((tab) => {
      let icon = new Image();
      icon.src = `/static/images/ui/tabs/${tab}.png`;
      this.tabIcons.push(icon);
    })

    this.inventoryMenu = game.player.inventory;
    this.craftingMenu = new CraftingMenu(game);
    this.ctx = game.overlayCtx;
  }

  close() {
    this.inventoryMenu.open = false;
    this.craftingMenu.open = false;
  }

  // In terms of canvas coordinates
  click(x, y) {
    if (y < UI_TILE_SIZE) return;

    if (y < UI_TILE_SIZE * 2) { // Swap Menu
      let index = (x - LEFT_BOUND - UI_TILE_SIZE) / UI_TILE_SIZE;
      if (index >= 0 && index < TABS.length) {
        this.currTab = TABS[Math.floor(index)];
      }
    } else {
      if (this.currTab == "crafting") {
        this.craftingMenu.click(x, y);
      }
    }
  }

  renderTabs(overlayCtx) {
    let y = UI_TILE_SIZE;
    let x = LEFT_BOUND + UI_TILE_SIZE;
    TABS.forEach((tab, i) => {
      if (tab == this.currTab) {
        overlayCtx.drawImage(this.tabIcons[i], x, y + 2 * UI_FACTOR, TILE_SIZE * UI_FACTOR, TILE_SIZE * UI_FACTOR);
      } else {
        overlayCtx.drawImage(this.tabIcons[i], x, y, TILE_SIZE * UI_FACTOR, TILE_SIZE * UI_FACTOR);
      }
      x += UI_TILE_SIZE
    })
  }

  render(overlayCtx, mouse) {
    let top = UI_TILE_SIZE * 2;
    let left = LEFT_BOUND;
    switch(this.currTab) {
      case "inventory":
        this.inventoryMenu.open = true;
        this.inventoryMenu.renderInventory(overlayCtx, left, top, UI_FACTOR);
        this.inventoryMenu.renderDraggedItem(this.ctx, mouse.mouseX, mouse.mouseY);
        break;
      case "relationships":
        // to be Implemented;
        break;
      case "crafting":
        this.craftingMenu.open = true;
        this.craftingMenu.render(overlayCtx);
        break;
    }
    this.renderTabs(overlayCtx);
  }
}
