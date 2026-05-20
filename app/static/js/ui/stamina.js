import { CANVAS_WIDTH, CANVAS_HEIGHT } from "../constants.js";

export default class Stamina {
    constructor(max) { //in game it is 270 but doubt we need that much
        this.max = max;
        this.curr = max;
        this.display = new Image();
        this.display.src = "/static/images/ui/energy.png";
    }

    //add flash messages for stamina
    useEnergy(energy) {
        this.curr = Math.max(0, this.curr - energy);
    }

    restoreFull() {
        this.curr = this.max;
    }

    restoreEnergy(energy) {
        this.curr = Math.min(this.max, this.curr + energy);
    }

    isLow() {
      return (this.curr/this.max) <= 0.2;
    }
    isEmpty() {
        return this.curr <= 0;
    }

    render(ctx) {
        //i js kinda tweaked around for these, no idea how it works so do not touch
        const imgW = 0.04 * CANVAS_WIDTH * 0.85;
        const imgH = imgW * 5 * 0.85;
        const x = CANVAS_WIDTH - imgW - 0.01 * CANVAS_WIDTH;
        const y = CANVAS_HEIGHT - imgH - 0.01 * CANVAS_HEIGHT;
        const staminaPercent = this.curr / this.max;
        const insetS = imgW * 0.28;
        const insetT = imgH * 0.24;
        const insetB = imgH * 0.04;
        const barX = x + insetS;
        const barW = imgW - (2 * insetS);
        const barMaxH = imgH - insetT - insetB;
        const barH = barMaxH * staminaPercent;
        if (staminaPercent > 0.5) {
            ctx.fillStyle = `rgb(${Math.round(255 * (1 - staminaPercent) * 2)}, 210, 50)`;
        }
        else {
            ctx.fillStyle = `rgb(220, ${Math.round(180 * staminaPercent * 2)}, 30`;
        }
        ctx.drawImage(this.display, x, y, imgW, imgH);
        ctx.fillRect(barX, y + insetT + barMaxH - barH, barW, barH);
    }
}
