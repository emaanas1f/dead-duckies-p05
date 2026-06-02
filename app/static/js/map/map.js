import BigEntity from './big-entity.js';
import { TILE_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT, X_RES, Y_RES, SCALE_FACTOR, NPC_INFO, MINES, getJson } from '../constants.js'
import Tile from './tile.js';
import NPC from '../npc.js';

export default class Map {
  constructor(name) {
    this.name = name;
    this.image = new Image();
    this.image.src = `/static/images/maps/${name}.png`
    this.bigEntities = [];
    this.npcList = [];
    this.crops = [];
  }

  async loadTiles(name, game) {
    this.tiles = [];
    const data = await getJson(`maps/${name}.json`);
    for (let x = 0; x < data.length; x++) {
      this.tiles.push([]);
      for (let y = 0; y < data[x].length; y++) {
        this.tiles.at(-1).push(new Tile(x, y, data[x][y]));
      }
    }
    try {
      const metadata = await getJson(`metadata/${name}.json`);
      metadata["npcs"].forEach((data) => {
        let npc = new NPC(data["name"], data["x"], data["y"], this);
        this.npcList.push(npc);
        game.npcList.push(npc);
      });
    } catch (error) {} // OK if no NPC
  }

  // Physical coordinate in unscaled map
  getTile(x, y) {
    x = Math.round(x / TILE_SIZE);
    y = Math.round(y / TILE_SIZE);
    if (x < 0 || y < 0 || x >= this.tiles.length || y >= this.tiles[x].length) {
      return null;
    }
    return this.tiles[x][y];
  }

  // Indices
  addBigEntity(x, y, type) {
    if (this.tiles[x][y].layers["front"] instanceof BigEntity) {
      throw new Error(`Tile ${x}, ${y} already has a big entity!`);
    }
    let bigEnt = new BigEntity(x, y, type, this);
    this.bigEntities.push(bigEnt);
    this.bigEntities.sort((a, b) => a.y - b.y); // For rendering
  }

  hitBigEntity(x, y, player, remove=false) {
    if (!this.tiles[x][y].layers["front"] instanceof BigEntity) {
      throw new Error(`Tile ${x}, ${y} doesn't have a big entity!`);
    }
    let destroyed = remove;
    if (false) {
      this.tiles[x][y].layers["front"].destroy(this);
    } else {
      // destroyed = this.tiles[x][y].layers["front"].hit(this, player);
    }
    if (destroyed) {
      this.bigEntities = this.bigEntities.filter((ent) => {
        return ent.x != x || ent.y != y;
      })
    }
  }

  clampEdges() {
    this.x = Math.max(0, Math.min(this.x, this.image.width - TILE_SIZE * X_RES));
    this.y = Math.max(0, Math.min(this.y, this.image.height - TILE_SIZE * Y_RES));
  }

  follow(player) {
    this.x = player.x - CANVAS_WIDTH / SCALE_FACTOR / 2;
    this.y = player.y - CANVAS_HEIGHT / SCALE_FACTOR / 2;
    this.clampEdges();
  }

  render(ctx, player) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.drawImage(this.image, this.x, this.y,
      X_RES * TILE_SIZE, Y_RES * TILE_SIZE, 0, 0,
      CANVAS_WIDTH, CANVAS_HEIGHT);
    let leftBound = Math.trunc(this.x / TILE_SIZE);
    let rightBound = Math.ceil((this.x + CANVAS_WIDTH / SCALE_FACTOR) / TILE_SIZE);
    let topBound = Math.trunc(this.y / TILE_SIZE);
    let bottomBound = Math.ceil((this.y + CANVAS_HEIGHT / SCALE_FACTOR) / TILE_SIZE);
    for (let x = leftBound; x < rightBound; x++) {
      for (let y = topBound; y < bottomBound; y++) {
        if (x < 0 || y < 0 || x >= this.tiles.length || y >= this.tiles[x].length) continue;
        this.tiles[x][y].render(ctx, this);
      }
    }

    this.bigEntities.forEach((ent) => {
      if (ent.x > leftBound - 5 && ent.x < rightBound + 5
        && ent.y > topBound - 5 && ent.y < bottomBound + 5
      ) {
        ent.render(ctx, this, player);
      }
    })

    let npcsToDraw = [];
    this.npcList.forEach((npc) => {
      if (npc.x > leftBound - 5 && npc.x < rightBound + 5
        && npc.y > topBound - 5 && npc.y < bottomBound + 5
      ) {
        if (player.y + TILE_SIZE * 2 <= npc.y * TILE_SIZE + 15 && Math.abs(player.x - npc.x * TILE_SIZE) <= TILE_SIZE) {
          npcsToDraw.push(npc);
        } else {
          npc.render(ctx, this);
        }
      }
    });

    return npcsToDraw;
  }

  respawnForageables() {
    const FORAGEABLES = [
      "spring-forageables/daffodil",
      "spring-forageables/dandelion",
      "spring-forageables/leek",
      "spring-forageables/parsnip"
    ];

    for (let x = 0; x < this.tiles.length; x++) {
      for (let y = 0; y < this.tiles.length[x]; y++) {
        let middlelayer = this.tiles[x][y].layers["middle"]
        if (middleLayer && typeof middleLayer === "string" && middleLayer.startsWith("spring_forageables/")) {
          this.tiles[x][y].remove("middle");
        }
        if (!map.tiles[x][y].spawnable) continue;
        if (this.tiles[x][y].layers["middle"] != null) continue;
        if (Math.random() < 0.03) {
          this.tiles[x][y].add(FORAGEABLES[Math.floor(Math.random() * FORAGEABLES.length)], "middle");
        }
      }
    }
  }
}
       
export function initializeFarm(map, player) {
  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[x].length; y++) {
      if (!map.tiles[x][y].tillable) continue;
      const randomNum = Math.floor(Math.random() * 100);
      if (randomNum < 1) {
        map.addBigEntity(x, y, "oak_tree");
      } else if (randomNum < 2) {
        map.addBigEntity(x, y, "pine_tree");
      } else if (randomNum < 7) {
        map.tiles[x][y].add("stone", "middle");
      } else if (randomNum < 12) {
        map.tiles[x][y].add("twig", "middle");
      } else if (randomNum < 17) {
        map.tiles[x][y].add("weed", "middle");
      }
    }
  }
  let playerTile = map.getTile(player.x, player.y + 23);
  playerTile.remove("middle");
  map.hitBigEntity(playerTile.x, playerTile.y, true);
}

export function initializeMine(map) {
  let spawnedLadder = false;
  let tile;
  let level = parseInt(map.name.split("/")[1]);
  if (level == 5) spawnedLadder = true;
  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[x].length; y++) {
      if (!map.tiles[x][y].spawnable) continue;
      let randomNum = Math.floor(Math.random() * 100);
      tile = map.tiles[x][y];
      if (randomNum < 5) {
        tile.add("ore/coal", "middle");
      } else if (randomNum < 10) {
        tile.add("ore/copper", "middle");
      } else if (randomNum < 15) {
        tile.add("ore/gold", "middle");
      } else if (randomNum < 30) {
        let stone = "stone" + (Math.floor(Math.random() * 4) + 1);
        tile.add(`ore/${stone}`, "middle");
      } else if (randomNum < 35 && level > 3) {
        tile.add('ore/topaz', "middle");
      } else if (randomNum < 40 && level > 3) {
        tile.add('ore/ruby', "middle");
      } else if (randomNum < 45 && level > 4) {
        tile.add('ore/emerald', "middle");
      } else if (randomNum < 50 && level > 4) {
        tile.add('ore/amethyst', "middle");
      }
      randomNum = Math.floor(Math.random() * 100);
      if (!spawnedLadder && randomNum < 1) {
        tile.add("ladder", "back");
        spawnedLadder = true;
      }
    }
  }
  if (!spawnedLadder) {
    tile.add("ladder", "back");
  }
  let mine = MINES[parseInt(map.name.split("/")[1]) - 1]
  let playerTile = map.getTile(mine["spawnX"], mine["spawnY"]);
  playerTile.remove("middle");
}

export function initializeForest(map) {
  for (let x = 0; x < map.tiles.length; x++) {
    for (let y = 0; y < map.tiles[x].length; y++) {
      if (!map.tiles[x][y].spawnable) continue;
      const randomNum = Math.floor(Math.random() * 100);
      if (randomNum < 1) {
        map.addBigEntity(x, y, "oak_tree");
      } else if (randomNum < 2) {
        map.addBigEntity(x, y, "pine_tree");
      } else if (randomNum < 8) {
        map.tiles[x][y].add("stone", "middle");
      } else if (randomNum < 13) {
        map.tiles[x][y].add("twig", "middle");
      } else if (randomNum < 18) {
        map.tiles[x][y].add("weed", "middle");
      }
    }
  }
  map.respawnForageables();
}
