import { FISH } from '../constants.js'

export default class Fish {
    constructor(game, inventory) {
        this.game = game
        this.player = game.player
        this.inventory = inventory
        this.fish = FISH

        this.types = ["mixed", "smooth", "sinker", "floater", "dart"]

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

    renderMinigame(ctx, scaleFactor, rod) {

    }

    renderResult(ctx, scaleFactor) {

    }
}
