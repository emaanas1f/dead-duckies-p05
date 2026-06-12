import { FISH, CANVAS_WIDTH, CANVAS_HEIGHT, ITEMS } from '../constants.js'

export default class Fish {
    constructor(game, inventory) {
        this.game = game;
        this.player = game.player;
        this.inventory = inventory;
        this.fish = FISH;

        this.types = ["mixed", "smooth", "sinker", "floater", "dart"];
        this.currentFish = "";
        // this.currentRod = "";

        // this.meterProgress = .001;
        // this.fishPos = 130;
        // this.barPos = 0;
        // this.barSize = 0;
        this.gameSize = 141;

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

    startFish(location, level) {
      this.meterProgress = .1;

      this.fishPos = 0;
      this.fishVelocity = 0;
      this.fishAcceleration = 0;
      this.fishTarget = -1
      this.bufferCounter = 0;
      this.bufferTime = Math.random() * 150;

      this.barPos = 0;
      this.barVelocity = 0;
      this.barAcceleration = 0;
      this.barSize = 14 + 10 * level

      this.currentFish = this.getFish(location, this.game.time.currTime)
      console.log(this.currentFish)
      this.difficulty = FISH[this.currentFish]["difficulty"]
      this.behavior = FISH[this.currentFish]["behavior"]
      console.log(this.difficulty)
      console.log(this.behavior)
    }

    getFish(location, time) {
        // console.log("run")
        console.log(location)
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
        // console.log(randNum);
        for (const fish of fishPool) {
          randNum -= 1 / FISH[fish]["rarity"];
          if (randNum <= 0) {
            return fish;
          }
        }
        return fishPool[0];
    }

    updateBar() {
      if (this.game.mouse.isDown) {
        this.barAcceleration = .04;
      }
      else if (this.barPos > 0) {
        this.barAcceleration = -.06;
      }
      else {
        this.barAcceleration = 0
      }

      this.barVelocity += this.barAcceleration;
      this.barPos += this.barVelocity;

      // bouncing at bottom
      if (this.barPos < 0 && this.barVelocity < 0) {
        this.barVelocity *= -.75;
      }

      // stops at top
      if (this.barPos + this.barSize >= this.gameSize) {
        this.barVelocity = 0;
        this.barPos = this.gameSize - this.barSize
      }

      if (this.barPos <= 0.1) {
        this.barPos = 0
      }
      // console.log(this.barPos, this.barVelocity, this.barAcceleration);
    }

    updateFish() {
      this.bufferCounter += 1;
      if (this.bufferCounter > this.bufferTime || this.fishTarget == -1) {
        this.fishTarget = Math.random() ** (80 / this.difficulty) * (this.difficulty / 110) * (this.gameSize - 40) + 20;
        this.bufferCounter = 0;
        this.bufferTime = Math.random() * 150;
        if (this.behavior == 4) {
          this.bufferTime *= .1
          console.log(this.bufferTime)
        }
        if (this.behavior == 1) {
          this.bufferTime *= 1.5
        }
      }
      // console.log(.02 * (this.fishTarget - this.fishPos)^2, this.fishVelocity * Math.abs(this.fishVelocity));
      this.fishAcceleration = .0002 * (this.fishTarget - this.fishPos) * Math.abs(this.fishTarget - this.fishPos) - .04 * this.fishVelocity * Math.abs(this.fishVelocity);
      if ((this.behavior == 2 || this.behavior == 4) && this.fishAcceleration < 0) {
        this.fishAcceleration *= 4;
      }
      if ((this.behavior == 3 || this.behavior == 4) && this.fishAcceleration > 0) {
        this.fishAcceleration *= 4;
      }
      if (this.behavior == 1) {
        this.fishAcceleration *= .5
      }
      this.fishAcceleration *= (this.difficulty / 100) ** 4 + .1;
      this.fishVelocity += this.fishAcceleration;

      if ((this.fishPos >= 120 && this.fishVelocity > 0) || (this.fishPos <= 20 && this.fishVelocity < 0)) {
        this.fishVelocity *= .8;
      }

      this.fishPos += this.fishVelocity;
      // console.log(this.fishPos, this.fishVelocity, this.fishAcceleration);
    }

    renderMinigame(ctx, scaleFactor) {
      // console.log("renderfish")
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

      ctx.drawImage(this.bar,
        0, 0,
        9, 2,
        xMeter + 17 * scaleFactor, yMeter + (144 - this.barPos - this.barSize) * scaleFactor,
        9 * scaleFactor, 2 * scaleFactor
      );

      ctx.drawImage(this.bar,
        0, 2,
        9, 5,
        xMeter + 17 * scaleFactor, yMeter + (144 - this.barPos - this.barSize + 2) * scaleFactor,
        9 * scaleFactor, (this.barSize - 4) * scaleFactor
      );

      ctx.drawImage(this.bar,
        0, 7,
        9, 2,
        xMeter + 17 * scaleFactor, yMeter + (144 - this.barPos - 2) * scaleFactor,
        9 * scaleFactor, 2 * scaleFactor
      );

      ctx.drawImage(this.fishIcon,
        xMeter + 17 * scaleFactor, yMeter + (144 - 9 - this.fishPos) * scaleFactor,
        10 * scaleFactor, 10 * scaleFactor
      );

      // console.log(this.barPos, this.barSize, this.fishPos)
      if (this.fishPos + 10 >= this.barPos && this.fishPos <= this.barPos + this.barSize) {
        this.meterProgress += .002;
      }
      else {
        this.meterProgress -= .003;
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
        this.renderResult(ctx, scaleFactor);
        this.inventory.addItem(this.currentFish, 1)
        console.log("true 1")
        return true;
      }
      if (this.meterProgress < 0) {
        console.log("true 2")
        return true;
      }
      return false;
    }

    renderResult(ctx, scaleFactor) {

    }
}
