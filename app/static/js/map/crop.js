import { TILE_SIZE, CROPS, SCALE_FACTOR } from '../constants.js'

let loadedCrops = {};

export default class Crop {
  constructor(x, y, map) {
    this.type = null;
    this.tile = map.tiles[x][y];

    this.tile.add("tilled", "back");
    this.tile.add(this, "middle");
    this.x = x;
    this.y = y;

    this.watered = false;
  }

  water() {
    this.tile.add("watered", "back");
    this.watered = true;
  }

  dry() {
    this.tile.add("tilled", "back");
    this.watered = false;
  }

  plant(type) {
    this.type = type;
    if (type in loadedCrops) {
      this.image = loadedCrops[type];
    } else {
      let asset = new Image();
      asset.src = `/static/images/middle-layer/crops/${type}.png`;
      loadedCrops[type] = asset;
      this.image = asset;
    }

    this.growthTime = CROPS[type]["growthTime"];
    this.recurring = CROPS[type]["recurring"];

    this.growthStage = 0;
    this.remainingTime = this.growthTime[0];
    
    this.matured = false;
    this.harvestable = false;
  }

  update() {
    if (this.type == null && !this.watered) {
      if (Math.floor(Math.random() * 100) < 20) this.remove();
    }

    if (this.type) {
      if (!this.watered && !this.harvestable) {
        this.wilt();
      }

      if (this.remainingTime > 0) {
        this.remainingTime--;
        if (this.remainingTime == 0) {
          if (!this.recurring || !this.matured) {
            this.growthStage++;
            this.remainingTime = this.growthTime[this.growthStage];
          }

          if (this.growthStage == this.growthTime.length) {
            this.matured = true;
            this.harvestable = true;
          }

          if (this.matured && this.recurring && !this.harvestable) {
            this.harvestable = true;
            this.growthStage--;
          }
        }
      }
    }

    this.dry();
  }

  remove() {
    this.tile.remove("back");
    this.tile.remove("middle");
  }

  wilt() {
    this.type = null;
    delete this.growthTime;
    delete this.growthStage;
    delete this.remainingTime;
    delete this.recurring;
    delete this.harvestable
    delete this.image;
    this.dry();
  }

  harvest(inventory) {
    if (!this.harvestable) return;
    for (const [key, value] of Object.entries(CROPS[this.type]["yield"])) {
      inventory.addItem(key, value);
    }
    if (this.recurring) {
      this.growthStage++;
      this.harvestable = false;
      this.remainingTime = CROPS[this.type]["regrowth"];
    } else {
      this.wilt();
    }
  }

  render(ctx, map) {
    if (this.type != null) {
      ctx.drawImage(this.image, (this.growthStage + 1) * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE * 2,
        (this.x * TILE_SIZE - map.x) * SCALE_FACTOR,
        ((this.y - 1) * TILE_SIZE - map.y) * SCALE_FACTOR,
        TILE_SIZE * SCALE_FACTOR, TILE_SIZE * 2 * SCALE_FACTOR)
    }
  }
}
