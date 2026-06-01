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
        fishPool = []
        hour = time / 60 + 6
        Object.keys(FISH).forEach((fish) => {
          if (location in fish["locations"]) {
            fish["timeRanges"].forEach((range) => {
              if (range == [] || (time >= range[0] && time <= range[1]) {
                fishPool.push(fish)
              }
            });
          }
        });

        weightedSum = 0
        weightArray = []
        fishPool.forEach((fish) => {
          weightedSum += 1 / fish["rarity"]
          weightArray.push(1 / fish["rarity"])
        });

        randNum = Math.random() * weightedSum
        weightArray.forEach((weight, i) => {
          randNum -= weight
          if (randNum <= 0) {
            return Object.keys(FISH)[i]
          }
        });
        return Object.keys(FISH)[-1]
    }

    renderMinigame(ctx, scaleFactor, rod) {

    }

    renderResult(ctx, scaleFactor) {

    }
}
