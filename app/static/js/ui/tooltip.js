import { Inventory } from '../menus/inventory.js';
import CraftingMenu from '../menus/crafting.js';
import { getItemTitle, getNumLines, renderWrappedText } from './text.js';
import { DESCRIPTIONS, CANVAS_HEIGHT, CANVAS_WIDTH, RECIPES, ITEMS, COOKING_RECIPES } from '../constants.js';

export default class Tooltip {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.inventory = this.player.inventory;

        this.width = 0;
        this.topHeight = 0;
        this.bottomHeight = 0;
        this.components = {};
        this.title = "";
        this.description = "";

        this.boxMade = false;

        this.border = new Image();
        this.border.src = "/static/images/ui/tooltip_borders.png";
        this.divider = new Image();
        this.divider.src = "/static/images/ui/tooltip_divider.png";
        this.background = new Image();
        this.background.src = "/static/images/ui/tooltip_background.png";

        this.stamina = new Image();
        this.stamina.src = "/static/images/ui/stamina_icon.png"
    }

    checkTriggers(ctx) {
        if (this.game.playerMenu.craftingMenu.hoveredRecipe != null) {
            this.title = getItemTitle(this.game.playerMenu.craftingMenu.hoveredRecipe);
            this.description = DESCRIPTIONS[this.title.replaceAll(" ", "") + "_Description"];
            this.components["recipe"] = RECIPES[this.game.playerMenu.craftingMenu.hoveredRecipe]["ingredients"];
            if (!this.boxMade) {
                this.constructBox(ctx);
            }
            return true;
        }
        else if (this.game.menu == "playerMenu" &&
            (this.game.playerMenu.currTab == "inventory" || this.game.playerMenu.currTab == "crafting")) {
            let slot = this.inventory.getSlotAtPosition(this.game.mouse.mouseX, this.game.mouse.mouseY, 12, 3, 3);
            if (slot == null) {
                return false;
            }
            let item = this.inventory.slots[slot];
            // console.log(item)
            if (item == null || item["itemID"] == null) {
                return false;
            }
            this.components = {}
            if (this.title != getItemTitle(item["itemID"])) {
                this.boxMade = false;
            }
            this.title = getItemTitle(item["itemID"]);
            this.description = DESCRIPTIONS[this.title.replaceAll(" ", "") + "_Description"];
            
            if ("effects" in ITEMS[item["itemID"]]) {
                this.components["stamina"] = ITEMS[item["itemID"]]["effects"]["stamina"];
            }

            // console.log(this.title)
            if (!this.boxMade) {
                this.constructBox(ctx);
            }
            return true;
        }
        else if (this.game.cookingMenu.hoveredRecipe != null) {
            let dish = this.game.cookingMenu.hoveredRecipe;
            console.log(dish)
            this.title = getItemTitle(dish);
            this.description = DESCRIPTIONS[this.title.replaceAll(" ", "") + "_Description"];
            if ("effects" in ITEMS[dish]) {
                this.components["stamina"] = ITEMS[dish]["effects"]["stamina"];
            }
            this.components["recipe"] = COOKING_RECIPES[dish]["ingredients"];
            if (!this.boxMade) {
                console.log("a")
                this.constructBox(ctx);
            }
            return true;
        }
        return false;
    }

    constructBox(ctx) {
        // 4 slots wide min, longer if item name exceeds that
        this.width = Math.max(4 * 16, ctx.measureText(this.title).width / 3 + 3);
        this.spriteArray = []
        if ("recipe" in this.components) {
            this.components["recipe"].forEach(ingredient => {
                if (!("category" in ingredient)) {
                    let category = ITEMS[ingredient["item"]]["category"]
                    let sprite = new Image();
                    // console.log(category, ingredient["item"])
                    sprite.src = `/static/images/items/${category}/${ingredient["item"]}.png`
                    // console.log(sprite)
                    this.spriteArray.push(sprite)
                }
            });
        }

        this.topHeight = 14;
        ctx.font = `${8 * 3}px thin`;
        this.descriptionHeight = getNumLines(ctx, this.description, (this.width - 2) * 3) * 6 + 6;
        this.bottomHeight = this.descriptionHeight;
        if ("recipe" in this.components) {
            this.bottomHeight += this.components["recipe"].length * 8 + 14
        }
        if ("stamina" in this.components) {
            this.bottomHeight += 9;
        }
        this.boxMade = true;
    }

    render(ctx, scaleFactor) {
        ctx.font = `${12 * scaleFactor}px thin`;
        ctx.fillStyle = "black";
        ctx.letterSpacing = "1px";
        ctx.textAlign = "left";

        if (!this.checkTriggers(ctx)) {
            this.boxMade = false;
            return false;
        }

        if ("recipe" in this.components && this.components["recipe"].length != this.spriteArray.length) return false;

        ctx.font = `${12 * scaleFactor}px thin`;

        let xStart = this.game.mouse.mouseX + 5 * scaleFactor;
        let yStart = this.game.mouse.mouseY + 5 * scaleFactor;

        if (xStart + (this.width + 7 + 5) * scaleFactor >= CANVAS_WIDTH) {
            xStart = this.game.mouse.mouseX - (5 + this.width) * scaleFactor;
        }

        // console.log(xStart, yStart)
        // L top corner
        ctx.drawImage(this.border,
            0, 0,
            3, 3,
            xStart, yStart,
            3 * scaleFactor, 3 * scaleFactor
        );
        // top border
        ctx.drawImage(this.border,
            3, 0,
            1, 4,
            xStart + 3 * scaleFactor, yStart,
            this.width * scaleFactor, 4 * scaleFactor
        );
        // R top corner
        ctx.drawImage(this.border,
            4, 0,
            3, 3,
            xStart + (3 + this.width) * scaleFactor, yStart,
            3 * scaleFactor, 3 * scaleFactor
        );

        // L border top section
        ctx.drawImage(this.border,
            0, 3,
            3, 1,
            xStart, yStart + 3 * scaleFactor,
            3 * scaleFactor, this.topHeight * scaleFactor
        );
        // R border top section
        ctx.drawImage(this.border,
            3, 3,
            4, 1,
            xStart + (3 + this.width) * scaleFactor, yStart + 3 * scaleFactor,
            4 * scaleFactor, this.topHeight * scaleFactor
        );
        // top section background
        ctx.drawImage(this.background,
            xStart + 3 * scaleFactor, yStart + 4 * scaleFactor,
            this.width * scaleFactor, (this.topHeight - 1) * scaleFactor
        );

        // divider L side
        ctx.drawImage(this.divider,
            0, 0,
            2, 3,
            xStart, yStart + (3 + this.topHeight) * scaleFactor,
            2 * scaleFactor, 3 * scaleFactor
        );
        // divider middle
        ctx.drawImage(this.divider,
            2, 0,
            1, 4,
            xStart + 2 * scaleFactor, yStart + (3 + this.topHeight) * scaleFactor,
            (this.width + 3) * scaleFactor, 4 * scaleFactor
        );
        // divider R side
        ctx.drawImage(this.divider,
            3, 0,
            2, 3,
            xStart + (2 + this.width + 3) * scaleFactor, yStart + (3 + this.topHeight) * scaleFactor,
            2 * scaleFactor, 3 * scaleFactor
        );

        // L border bottom section
        ctx.drawImage(this.border,
            0, 3,
            3, 1,
            xStart, yStart + (3 + this.topHeight + 3) * scaleFactor,
            3 * scaleFactor, this.bottomHeight * scaleFactor
        );
        // R border bottom section
        ctx.drawImage(this.border,
            3, 3,
            4, 1,
            xStart + (3 + this.width) * scaleFactor, yStart + (3 + this.topHeight + 3) * scaleFactor,
            4 * scaleFactor, this.bottomHeight * scaleFactor
        );
        // L bottom corner
        ctx.drawImage(this.border,
            0, 4,
            3, 3,
            xStart, yStart + (3 + this.topHeight + 3 + this.bottomHeight) * scaleFactor,
            3 * scaleFactor, 3 * scaleFactor
        );
        // bottom border
        ctx.drawImage(this.border,
            3, 4,
            1, 3,
            xStart + 3 * scaleFactor, yStart + (3 + this.topHeight + 3 + this.bottomHeight) * scaleFactor,
            this.width * scaleFactor, 3 * scaleFactor 
        );
        // R bottom corner
        ctx.drawImage(this.border,
            4, 4,
            3, 3,
            xStart + (3 + this.width) * scaleFactor, yStart + (3 + this.topHeight + 3 + this.bottomHeight) * scaleFactor,
            3 * scaleFactor, 3 * scaleFactor
        );
        // bottom section background
        ctx.drawImage(this.background,
            xStart + 3 * scaleFactor, yStart + (3 + this.topHeight + 3 + 1) * scaleFactor,
            this.width * scaleFactor, (this.bottomHeight - 1) * scaleFactor
        );

        ctx.fillText(this.title,
            xStart + (3 + 2) * scaleFactor, yStart + (3 + 1 + this.topHeight - 4) * scaleFactor
        );

        let yBottom = 3 + this.topHeight + 3;
        let filledSpace = 0;

        ctx.font = `${8 * scaleFactor}px thin`;

        if ("recipe" in this.components) {
            ctx.fillText("Ingredients:",
                xStart + (3 + 4) * scaleFactor, yStart + (yBottom + 1 + 2 + 4) * scaleFactor
            );
            ctx.fillStyle = "#aaaaa";
            ctx.fillRect(
                xStart + (3 + 4) * scaleFactor, yStart + (yBottom + 1 + 2 + 7) * scaleFactor,
                (this.width - 8) * scaleFactor, 1
            );
            filledSpace += 10;
          
            this.components["recipe"].forEach((ingredient, index) => {
                ctx.fillStyle = "black";
                if ("category" in ingredient) {
                    ctx.fillText("Any " + ingredient["category"] + " (" + ingredient["amount"] + ")",
                        xStart + (3 + 4) * scaleFactor, yStart + (yBottom + 1 + 2 + 7 + 2 + index * 8 + 6) * scaleFactor 
                    )
                }
                else {
                    ctx.drawImage(this.spriteArray[index],
                        xStart + (3 + 2) * scaleFactor, yStart + (yBottom + 1 + 2 + 7 + 2 + index * 8) * scaleFactor,
                        8 * scaleFactor, 8 * scaleFactor
                    )

                    // if (this.player.inventory.countItem(ingredient["item"]) < ingredient["amount"]) {
                    //     ctx.fillStyle = "red";
                    // }
                    ctx.fillText(getItemTitle(ingredient["item"]) + " (" + ingredient["amount"] + ")",
                        xStart + (3 + 2 + 8 + 2) * scaleFactor, yStart + (yBottom + 1 + 2 + 7 + 2 + index * 8 + 6) * scaleFactor 
                    )
                }
                filledSpace += 8;
            });
            filledSpace += 2;
            ctx.fillRect(
                xStart + (3 + 4) * scaleFactor, yStart + (yBottom + filledSpace + 2) * scaleFactor,
                (this.width - 8) * scaleFactor, 1
            );
            filledSpace += 2;
        }

        renderWrappedText(ctx, this.description, xStart + (3 + 2) * scaleFactor, yStart + (yBottom + 1 + 2 + 6 + filledSpace) * scaleFactor, (this.width - 2) * scaleFactor, (6) * scaleFactor);
        filledSpace += this.descriptionHeight;

        if ("stamina" in this.components) {
            ctx.drawImage(this.stamina,
                xStart + (3 + 1) * scaleFactor, yStart + (yBottom + filledSpace - 1) * scaleFactor,
                8 * scaleFactor, 8 * scaleFactor
            );
            ctx.fillText(`+${this.components["stamina"]} Energy`,
                xStart + (3 + 1 + 8 + 1) * scaleFactor, yStart + (yBottom + filledSpace + 5) * scaleFactor
            );
            filledSpace += 8;
        }
    }
}