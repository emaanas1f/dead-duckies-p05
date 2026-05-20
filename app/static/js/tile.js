import { TILE_SIZE, SCALE_FACTOR, getTileImage, ENTITIES } from "./constants.js";
import BigEntity from "./big-entity.js"
import NPC from "./npc.js"
import Crop from "./crop.js"

export default class Tile {
  constructor(x, y, data) {
    this.x = x;
    this.y = y;

    for (const [key, value] of Object.entries(data)) {
      this[key] = value;
    }

    this.basePassable = this.passable;

    this.layers = {
      "back": null,
      "middle": null,
      "front": null // True if overlayed, BigEntity if centered
    };
  }

  add(entity, layer) {
    this.layers[layer] = entity;
    if (layer == "front" && entity instanceof BigEntity) {
      this.passable = false;
    }
    if (entity instanceof NPC) {
      this.passable = false;
    }
    if (layer == "middle" && !ENTITIES[entity]["passable"]) this.passable = false;
  }

  remove(layer) {
    this.layers[layer] = null;
    this.passable = this.basePassable;
    if (this.layers["front"] instanceof BigEntity ||
        (this.layers["middle"] && !ENTITIES[this.layers["middle"]]["passable"])) {
      this.passable = false;
    }
  }

  highlight(ctx, map, fill=false, color='rgba(255, 0, 0, 0.35)') {
    if (!fill) {
      ctx.strokeStyle = color;
      ctx.strokeRect((this.x * TILE_SIZE - map.x) * SCALE_FACTOR,
        (this.y * TILE_SIZE - map.y) * SCALE_FACTOR,
        TILE_SIZE * SCALE_FACTOR, TILE_SIZE * SCALE_FACTOR);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect((this.x * TILE_SIZE - map.x) * SCALE_FACTOR,
        (this.y * TILE_SIZE - map.y) * SCALE_FACTOR,
        TILE_SIZE * SCALE_FACTOR, TILE_SIZE * SCALE_FACTOR);
    }
    ctx.strokeStyle = '#000000'
    ctx.fillStyle = '#000000'
  }

  render(ctx, map) {
    // if (this.layers["front"] != null) this.highlight(ctx, map, true);
    for (const [key, value] of Object.entries(this.layers)) {
      if (value == null || key == "front") continue;
      if (value instanceof NPC) continue;

      if (value instanceof Crop) {
        value.render(ctx, map);
      } else {
        let image = getTileImage(key, value);
        ctx.drawImage(image, 0, 0, TILE_SIZE, TILE_SIZE,
          (this.x * TILE_SIZE - map.x) * SCALE_FACTOR,
          (this.y * TILE_SIZE - map.y) * SCALE_FACTOR,
          TILE_SIZE * SCALE_FACTOR, TILE_SIZE * SCALE_FACTOR
        )
      }

    }
  }
}
