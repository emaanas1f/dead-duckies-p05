import { FISH, CANVAS_WIDTH, CANVAS_HEIGHT} from '../constants.js'

export default class Fish {
    constructor(game, inventory) {
        this.game = game;
        this.player = game.player;
        this.inventory = inventory;
        this.fish = FISH;

        this.types = ["mixed", "smooth", "sinker", "floater", "dart"];
        this.currentFish = "";
        this.currentRod = "";

        this.meterProgress = .001
        this.fishPos = 0
        this.barPos = 0
        this.barSize = 0

        this.background = new Image();
        this.background.src = "/static/images/ui/fishing_background.png";
        this.bar = new Image();
        this.bar.src = "/static/images/ui/fishing_bar.png";
        this.fishIcon = new Image();
        this.fishIcon.src = "/static/images/ui/fishing_icon.png";
        this.meter = new Image();
        this.meter.src = "/static/images/ui/fishing_meter.png";
        this.result = new Image();
        this.result.src = "/static/images/ui/fishing_result.png";

    }

    startFish() {

    }

    getFish(location, time) {
        console.log("run")
        let fishPool = [];
        let hour = time / 60 + 6;
        Object.keys(FISH).forEach((fish) => {
          if (FISH[fish]["locations"].includes(location)) {
            FISH[fish]["timeRanges"].forEach((range) => {
              if (range.length == 0 || (hour >= range[0] && hour <= range[1])) {
                fishPool.push(fish);
              }
            });
          }
        });

        // console.log(fishPool)
        let weightedSum = 0;
        fishPool.forEach((fish) => {
          weightedSum += 1 / FISH[fish]["rarity"];
        });

        let randNum = Math.random() * weightedSum;
        console.log(randNum);
        for (const fish of fishPool) {
          randNum -= 1 / FISH[fish]["rarity"];
          if (randNum <= 0) {
            return fish;
          }
        }
        return fishPool[0];
    }

    updateBar() {

    }

    updateFish() {

    }

    renderMinigame(ctx, scaleFactor) {
      console.log("renderfish")
      let xStart = scaleFactor * 10;
      let yStart = CANVAS_HEIGHT / 2 - 78 * scaleFactor;

      ctx.drawImage(this.background,
        xStart, yStart,
        46 * scaleFactor, 157 * scaleFactor
      );

      let xMeter = xStart + 4 * scaleFactor;
      let yMeter = yStart + 4 * scaleFactor;

      ctx.drawImage(this.meter,
        xMeter, yMeter,
        38 * scaleFactor, 150 * scaleFactor
      );

      if (this.fishPos >= this.barPos && this.fishPos <= this.barPos + this.barSize) {
        this.meterProgress += .001;
      }
      else {
        this.meterProgress -= .002;
      }

      if (this.meterProgress > 0.5) {
          ctx.fillStyle = `rgb(${Math.round(255 * (1 - this.meterProgress) * 2)}, 210, 50)`;
      }
      else {
          ctx.fillStyle = `rgb(220, ${Math.round(180 * this.meterProgress * 2)}, 30`;
      }

      let meterHeight = 144 * this.meterProgress;

      ctx.fillRect(xMeter + 32 * scaleFactor, yMeter + 146 * scaleFactor - meterHeight * scaleFactor, 4 * scaleFactor, meterHeight * scaleFactor);

      if (this.meterProgress >= 1) {
        renderResult(ctx, scaleFactor);
        return true;
      }
      return false;
    }

    renderResult(ctx, scaleFactor) {

    }
}
