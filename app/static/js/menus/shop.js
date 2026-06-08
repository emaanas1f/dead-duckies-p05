import { ITEMS, UI_FACTOR, CANVAS_HEIGHT, CANVAS_WIDTH, SHOPS } from '../constants.js';
import { renderWrappedText, getItemTitle } from '../ui/text.js';
import { Inventory } from './inventory.js';
import Gold from '../ui/gold.js';

const overlayScale = 2;
const xStart = (CANVAS_WIDTH / 2) - 375;
const yStart = (CANVAS_HEIGHT / 2) - 136;

export default class Shop {
    constructor (npc) {
      this.shopInventory = {}; // {String item: INT cost}
      this.itemNames = {};
      this.npc = npc;
      this.shopText = SHOPS[npc]["text"]

      this.display = new Image();
      this.display.src = "/static/images/ui/shop.png";
      this.portrait = new Image();
      this.portrait.src = `/static/images/npcs/portraits/${npc}.png`;

      this.itemNames = [];
      this.itemsStart = 0; // starting index for 4 displayed items
      this.sprites = {};

      this.restock();
    }

    restock(npcs=[], player=null) {
      this.shopInventory = {};
      if (this.npc == "pierre") {
        npcs.forEach((npc) => {
          let hearts = Math.floor(npc.points[player.name] / 250);
          if (hearts >= 8) {
            this.shopInventory["bouquet"] = ITEMS["bouquet"]["buyPrice"];
          }
        })
      }
      SHOPS[this.npc]["inventory"].forEach((item, i) => {
        this.shopInventory[item] = ITEMS[item]["buyPrice"];
      });
      let shuffled = SHOPS[this.npc]["rotating_inventory"].sort(() => 0.5 - Math.random())
      shuffled.slice(0,4).forEach((item, i) => {
        this.shopInventory[item] = ITEMS[item]["buyPrice"];
      });
      this.itemNames = [];
      for (const [item, value] of Object.entries(this.shopInventory)) {
        if (!(item in this.sprites)) {
          let newSprite = new Image();
          newSprite.src = `/static/images/items/${ITEMS[item]["category"]}/${item}.png`;
          this.sprites[item] = newSprite
        }
        this.itemNames.push(item);
      }
    }

    buy(itemID, player, quantity) {
      if (!(itemID in ITEMS)) {
        return false;
      }
      if (!(itemID in this.shopInventory)){
        return false;
      }
      let cost = this.shopInventory[itemID]
      if (player.gold.amount < cost * quantity) {
        return false;
      }
      if (player.inventory.addItem(itemID, quantity)) {
        player.gold.amount -= cost * quantity;
        return true;
      }
      return false;
    }

    sell(itemID, player, quantity) {
      if (!(itemID in ITEMS)) {
        return false;
      }
      if (ITEMS[itemID].sellPrice == null) {
        return false;
      }

      player.inventory.removeItem(itemID, quantity)
      player.gold.amount += ITEMS[itemID].sellPrice * quantity;

      return true;
    }

    moveUp() {
      if (this.itemsStart > 0) {
        this.itemsStart--;
      }
    }

    moveDown() {
      if (this.itemsStart < this.itemNames.length - 4) {
        this.itemsStart++;
      }
    }

    mouseInput(game, x, y, ctrl, shift) {
      let quantity = 1;
      if (ctrl) quantity = 25;
      if (shift) quantity = 5;
      if (x > xStart + 351 * overlayScale && x <= xStart + 362 * overlayScale && y >= yStart && y <= yStart + 11 * overlayScale) {
        game.clearMenus();
      }
      else if (x >= xStart + 89 * overlayScale && x <= xStart + 354 * overlayScale && y > yStart + 7 * overlayScale && y <= yStart + 114 * overlayScale) {
        let selectionNumber = Math.floor((y - yStart - 7 * overlayScale) / (27 * overlayScale));
        this.buy(Object.keys(this.shopInventory)[selectionNumber + this.itemsStart], game.player, quantity);
      }
      else if (x > xStart + 364 * overlayScale && x <= xStart + 375 * overlayScale && y > yStart + 3 * overlayScale && y <= yStart + 15 * overlayScale) {
        this.moveUp();
      }
      else if (x > xStart + 364 * overlayScale && x <= xStart + 375 * overlayScale && y > yStart + 25 * overlayScale && y <= yStart + 38 * overlayScale) {
        this.moveDown();
      }
      else {
        let inventory = game.player.inventory;
        let slot = inventory.getSlotAtPosition(x, y, 12, 3, overlayScale);
        if (slot != null && inventory.getSlot(slot)["count"] >= game.player.quantity) {
          this.sell(game.player.inventory.getSlot(slot)["itemID"], game.player, quantity);
        }
      }
    }

    render(ctx, player) {
      // top left corner for shop menu render
      const fontSize = 12 * overlayScale;

      ctx.globalAlpha = 1;
      ctx.drawImage(this.display,
        xStart, yStart,
        375 * overlayScale, 136 * overlayScale
      );
      ctx.drawImage(this.portrait,
        xStart + 10 * overlayScale, yStart + 7 * overlayScale,
        64 * overlayScale, 64 * overlayScale
      );

      player.inventory.renderInventory(ctx, xStart + 148 * overlayScale, yStart + 121 * overlayScale, overlayScale);

      ctx.textAlign = "left";
      ctx.letterSpacing = "1px";
      ctx.font = `${fontSize}px thin`
      ctx.fillStyle = "black";
      renderWrappedText(ctx, this.shopText, xStart + 5 * overlayScale, yStart + 85 * overlayScale + fontSize / 2 + 2, 63 * overlayScale, 10 * overlayScale)

      ctx.font = `${fontSize}px bold`
      ctx.fillStyle = "#56160c";
      ctx.letterSpacing = "2px";

      player.gold.render(ctx, xStart + 81 * overlayScale, yStart + 119 * overlayScale, overlayScale);
      for (let i = 0; i < Math.min(Object.keys(this.shopInventory).length, 4); i++) {

        ctx.textAlign = "left";

        let itemName = this.itemNames[this.itemsStart + i];

        ctx.drawImage(this.sprites[itemName],
          xStart + 94 * overlayScale, yStart + 12 * overlayScale + i * 27 * overlayScale,
          16 * overlayScale, 16 * overlayScale
        )
        ctx.fillText(getItemTitle(itemName),
          xStart + 114 * overlayScale, yStart + 23 * overlayScale + i * 27 * overlayScale
        )

        ctx.textAlign = "right";

        let price = Object.values(this.shopInventory)[this.itemsStart + i]
        if (player.gold.amount < price) {
          ctx.globalAlpha = .5;
        }
        ctx.fillText(price,
          xStart + 340 * overlayScale, yStart + 23 * overlayScale + i * 27 * overlayScale
        )
        ctx.globalAlpha = 1;
      }

    }
  }
