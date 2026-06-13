import { Inventory } from '../menus/inventory.js';
import CraftingMenu from '../menus/crafting.js';
import { getItemTitle, getNumLines, renderWrappedText } from './text.js';
import { DESCRIPTIONS, CANVAS_HEIGHT, CANVAS_WIDTH } from '../constants.js';

export default class Tooltip {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.inventory = this.player.inventory;

        this.width = 0;
        this.top_height = 0;
        this.bottom_height = 0;
        this.components = {};
        this.title = "";
        this.description = "";

        this.border = new Image();
        this.border.src = "/static/images/ui/tooltip_borders.png";
        this.divider = new Image();
        this.divider.src = "/static/images/ui/tooltip_divider.png";
        this.background = new Image();
        this.background.src = "/static/images/ui/tooltip_background.png";
    }

    checkTriggers(ctx) {
        if (this.game.menu == "playerMenu" && (this.game.playerMenu.currTab == "inventory" || this.game.playerMenu.currTab == "crafting")) {
            let slot = this.inventory.getSlotAtPosition(this.game.mouse.mouseX, this.game.mouse.mouseY, 12, 3, 3);
            if (slot == null) {
                return false;
            }
            let item = this.inventory.slots[slot];
            // console.log(item)
            if (item == null || item["itemID"] == null) {
                return false;
            }
            this.title = getItemTitle(item["itemID"]);
            this.description = DESCRIPTIONS[this.title.replaceAll(" ", "") + "_Description"];

            // console.log(this.title)
            this.constructBox(ctx)
            return true;
        }
    }

    constructBox(ctx) {
        // 4 slots wide min, longer if item name exceeds that
        this.width = Math.max(4 * 16, ctx.measureText(this.title).width / 3 + 3);

        this.top_height = 14;
        ctx.font = `${8 * 3}px thin`;
        this.bottom_height = getNumLines(ctx, this.description, (this.width - 2) * 3) * 6 + 6;
    }

    render(ctx, scaleFactor) {
        ctx.font = `${12 * scaleFactor}px thin`;
        ctx.fillStyle = "black";
        ctx.letterSpacing = "1px";
        ctx.textAlign = "left";

        if (!this.checkTriggers(ctx)) {
            return false;
        }

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
            3 * scaleFactor, this.top_height * scaleFactor
        );
        // R border top section
        ctx.drawImage(this.border,
            3, 3,
            4, 1,
            xStart + (3 + this.width) * scaleFactor, yStart + 3 * scaleFactor,
            4 * scaleFactor, this.top_height * scaleFactor
        );
        // top section background
        ctx.drawImage(this.background,
            xStart + 3 * scaleFactor, yStart + 4 * scaleFactor,
            this.width * scaleFactor, (this.top_height - 1) * scaleFactor
        );

        // divider L side
        ctx.drawImage(this.divider,
            0, 0,
            2, 3,
            xStart, yStart + (3 + this.top_height) * scaleFactor,
            2 * scaleFactor, 3 * scaleFactor
        );
        // divider middle
        ctx.drawImage(this.divider,
            2, 0,
            1, 4,
            xStart + 2 * scaleFactor, yStart + (3 + this.top_height) * scaleFactor,
            (this.width + 3) * scaleFactor, 4 * scaleFactor
        );
        // divider R side
        ctx.drawImage(this.divider,
            3, 0,
            2, 3,
            xStart + (2 + this.width + 3) * scaleFactor, yStart + (3 + this.top_height) * scaleFactor,
            2 * scaleFactor, 3 * scaleFactor
        );

        // L border bottom section
        ctx.drawImage(this.border,
            0, 3,
            3, 1,
            xStart, yStart + (3 + this.top_height + 3) * scaleFactor,
            3 * scaleFactor, this.bottom_height * scaleFactor
        );
        // R border bottom section
        ctx.drawImage(this.border,
            3, 3,
            4, 1,
            xStart + (3 + this.width) * scaleFactor, yStart + (3 + this.top_height + 3) * scaleFactor,
            4 * scaleFactor, this.bottom_height * scaleFactor
        );
        // L bottom corner
        ctx.drawImage(this.border,
            0, 4,
            3, 3,
            xStart, yStart + (3 + this.top_height + 3 + this.bottom_height) * scaleFactor,
            3 * scaleFactor, 3 * scaleFactor
        );
        // bottom border
        ctx.drawImage(this.border,
            3, 4,
            1, 3,
            xStart + 3 * scaleFactor, yStart + (3 + this.top_height + 3 + this.bottom_height) * scaleFactor,
            this.width * scaleFactor, 3 * scaleFactor 
        );
        // R bottom corner
        ctx.drawImage(this.border,
            4, 4,
            3, 3,
            xStart + (3 + this.width) * scaleFactor, yStart + (3 + this.top_height + 3 + this.bottom_height) * scaleFactor,
            3 * scaleFactor, 3 * scaleFactor
        );
        // bottom section background
        ctx.drawImage(this.background,
            xStart + 3 * scaleFactor, yStart + (3 + this.top_height + 3 + 1) * scaleFactor,
            this.width * scaleFactor, (this.bottom_height - 1) * scaleFactor
        );

        ctx.fillText(this.title,
            xStart + (3 + 2) * scaleFactor, yStart + (3 + 1 + this.top_height - 4) * scaleFactor
        );

        ctx.font = `${8 * scaleFactor}px thin`;
        renderWrappedText(ctx, this.description, xStart + (3 + 2) * scaleFactor, yStart + (3 + this.top_height + 3 + 1 + 2 + 6) * scaleFactor, (this.width - 2) * scaleFactor, (6) * scaleFactor);

    }
}