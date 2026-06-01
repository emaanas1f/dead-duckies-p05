export async function getJson(file_name) {
  let raw = await fetch(`/static/json/${file_name}`, {
    cache: 'no-store'
  })
  if (!raw.ok) {
    throw new Error('File not found (404)');
  }
  let parsed = await raw.json()
  return parsed;
}

export const TILE_SIZE = 16;
export const SCALE_FACTOR = 2;
export const X_RES = 30;
export const Y_RES = 16;

export const HOTBAR_SIZE = 12;
export const UI_FACTOR = 3
export const HOTBAR_WIDTH = 198;
export const HOTBAR_HEIGHT = 22;
export const INVENTORY_WIDTH = 208;
export const INVENTORY_HEIGHT = 64;
export const CRAFTING_MENU_HEIGHT = 112;

export const STARTING_STAMINA = 400;

export const CANVAS_WIDTH = TILE_SIZE * SCALE_FACTOR * X_RES;
export const CANVAS_HEIGHT = TILE_SIZE * SCALE_FACTOR * Y_RES;

export const DEFAULT_MOVEMENT_SPEED = 2;
export const FRAME_RATE = 16;
export const TIME_CONVERSION = 120; // HIGHER = Slower Time

export const ITEMS = await getJson("items.json");
export const RECIPES = await getJson("recipes.json")
export const ENTITIES = await getJson("entities.json")
export const CROPS = await getJson("crops.json")
export const MINES = await getJson("mines.json")

const PIERRE = await getJson("npcs/pierre.json")
const WILLY = await getJson("npcs/willy.json")
export const NPC_INFO = {"pierre": PIERRE, "willy": WILLY}

export const SHOPS = await getJson("shops.json");

const TILE_IMAGES = {
  "back": {},
  "middle": {},
  "front": {}
};

export function getTileImage(layer, name) {
  if (!Object.hasOwn(TILE_IMAGES[layer], name)) {
    TILE_IMAGES[layer][name] = new Image();
    TILE_IMAGES[layer][name].src = `/static/images/${layer}-layer/${name}.png`;
  }
  return TILE_IMAGES[layer][name];
}

// Base Tile in Image File
export const BIG_ENTITIES = await getJson("bigentities.json");

// export const STAMINA_COSTS = {
//   axe: 5,
//   hoe: 5,
//   pickaxe: 5,
//   fishing: 10
// }
