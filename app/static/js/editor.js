// key bindings
// t - add tile/remove tile mode
// s - download JSON
// p - print tile to console

const TILE_SIZE = 16;

const propertySelect = document.getElementById('property-select');
const mapSelect = document.getElementById('map-select');

const DEBUG = true;
const TILLABLE_HELPER = false;
const UNTILLABLE_HELPER = false;
const SPAWNABLE_HELPER = false;
const INVERSE_SPAWNABLE = true;
const PROPERTIES = {
  passable: {defaultValue: false},
  tillable: {defaultValue: false},
  teleporter: {defaultValue: false},
  spawnable: {defaultValue: false},
  interactable: {defaultValue: false},
  water: {defaultValue: false},
  forest_lake: {defaultValue: false}
};

for (const [key, value] of Object.entries(PROPERTIES)) {
  if (value["defaultValue"]) {
    value["color"] = 'rgba(255, 0, 0, 0.35)';
  } else {
    value["color"] = 'rgba(0, 255, 0, 0.35)';
  }
  propertySelect.innerHTML += `<option value=${key}>${key.toLocaleUpperCase()}</option>`;
}
propertySelect.innerHTML += `<option value="setwarp">Set Warp Destination</option>`

async function getJson(file_name) {
  let raw = await fetch(`/static/json/${file_name}`, {
    cache: 'no-store'
  })
  if (!raw.ok) {
    throw new Error('File not found (404)');
  }
  let parsed = await raw.json()
  return parsed;
}

let currentProperty = 'passable';
let currentMap = 'farm';

let map = new Image();
map.src = `/static/images/maps/${currentMap}.png`

async function initializeTiles() {
  let tiles = [];
  for (let x = 0; x < map.width / TILE_SIZE; x++) {
    tiles.push([]);
    for (let y = 0; y < map.height / TILE_SIZE; y++) {
      let newTile = {};
      for (const [key, val] of Object.entries(PROPERTIES)) {
        newTile[key] = PROPERTIES[key]["defaultValue"];
        newTile["destination"] = null; // Otherwise {"map": <mapName>, "tile": [<x>, <y>]}
      }
      tiles.at(-1).push(newTile);
    }
  }
  return tiles;
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(map, 0, 0, map.width, map.height, 0, 0, map.width, map.height);

  let key = currentProperty;
  if (currentProperty == "setwarp") key = "teleporter";
  let def = PROPERTIES[key];
  // for (const [key, def] of Object.entries(PROPERTIES)) {
    ctx.fillStyle = def.color;
    for (let x = 0; x < map.width / TILE_SIZE; x++) {
      for (let y = 0; y < map.height / TILE_SIZE; y++) {
        if (tiles[x][y][key] != def.defaultValue) {
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  // }
}

// MAIN LOGIC

const canvas = document.getElementById("main-canvas");
const ctx = canvas.getContext("2d");

let tiles;

map.onload = async () => {
  canvas.width = map.width;
  canvas.height = map.height;
  tiles = [];
  try {
    tiles = await getJson(`maps/${currentMap}.json`);

    //add water and forest lake attributes to json files that don't already have them
    // for (const col of tiles) {
    //   for (const tile of col) {
    //     if (!Object.hasOwn(tile, 'water')) tile.water = false;
    //     if (!Object.hasOwn(tile, 'forest_lake')) tile.forest_lake = false;
    //   }
    // }
  } catch (error) {
    tiles = await initializeTiles();
  }
  if (TILLABLE_HELPER) await tillableHelper();
  if (UNTILLABLE_HELPER) await untillableHelper();
  if (SPAWNABLE_HELPER) await spawnableHelper();
  if (INVERSE_SPAWNABLE) await inverseSpawnable();
  render();
}

// DRAWING

let paint = true;
let held = false;

function draw(e) {
  const x = Math.floor((e.offsetX) / TILE_SIZE);
  const y = Math.floor((e.offsetY) / TILE_SIZE);
  if (DEBUG) console.log(`${x}, ${y}`);
  if (currentProperty === 'setwarp') {
    if (!tiles[x][y].teleporter) {
      return;
    }
    held = false;
    const destination = prompt('destination map?');
    if (!destination) return;
    const destX = parseInt(prompt('destination x?'));
    if (isNaN(destX)) return;
    const destY = parseInt(prompt("destination y?"));
    if (isNaN(destY)) return;
    tiles[x][y].destination = { map: destination, x: destX, y: destY};
    render();
    return;
  }
  if (paint) {
    tiles[x][y][currentProperty] = !PROPERTIES[currentProperty].defaultValue;
  } else {
    tiles[x][y][currentProperty] = PROPERTIES[currentProperty].defaultValue;
  }
  render();
}

// EVENT LISTENERS

window.addEventListener('keydown', e => {
  if (e.key === 'p') {
    console.log(JSON.stringify(tiles));
  } else if (e.key === 's') {
    let a = document.createElement("a");
    let json = JSON.stringify(tiles, null, 2);
    let file = new Blob([json], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = "thing.json";
    a.click();
  } else if (e.key === 't') {
    paint = !paint;
  }
});

propertySelect.addEventListener('change', () => {
  currentProperty = propertySelect.value;
  render();
});

mapSelect.addEventListener('change', async () => {
  currentMap = mapSelect.value;
  map = new Image()
  map.src = `/static/images/maps/${currentMap}.png`

  map.onload = async () => {
    try {
      tiles = await getJson(`maps/${currentMap}.json`);
    } catch (error) {
      console.log("Error");
      tiles = await initializeTiles();
    }

    canvas.width = map.width;
    canvas.height = map.height;
    ctx.imageSmoothingEnabled = false;
    render();
  };
});

canvas.addEventListener('mousedown', e => {
  held = true;
  draw(e);
});

canvas.addEventListener('mousemove', e => {
  if (held) draw(e);
});

canvas.addEventListener('mouseup', e => {
  held = false;
});

// HELPER MODIFICATIONS

//this converts every impassable tile into an untillable one
async function tillableHelper() {
  for (const col of tiles) {
    for (const tile of col) {
      if (!tile.passable) {
        tile.tillable = false;
      }
    }
  }
  render();
}

//this converts every tile to untillable
async function untillableHelper() {
  for (const col of tiles) {
    for (const tile of col) {
      tile.tillable = false;
    }
  }
  render();
}

//this converts every passable to spawnable
async function spawnableHelper() {
  for (const col of tiles) {
    for (const tile of col) {
      if (tile.passable) {
        tile.spawnable = true;
      }
    }
  }
}

//this turns every unspawnable tile to spawnable and vice versa
async function inverseSpawnable() {
  for (const col of tiles) {
    for (const tile of col) {
      tile.spawnable = !tile.spawnable;
    }
  }
}
