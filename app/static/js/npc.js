import { NPC_INFO, ITEMS, CANVAS_WIDTH, CANVAS_HEIGHT, TILE_SIZE, SCALE_FACTOR } from "./constants.js"
import Shop from "./menus/shop.js"
import { renderWrappedText, getItemTitle } from "./ui/text.js";

const giftPoints = {"hate": -40, "dislike": -20, "neutral": 20, "like": 45, "love": 80}

export default class NPC {
  constructor(name, x, y, map, playerName) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.sprite = new Image();
    this.sprite.src = `/static/images/npcs/sprites/${name}.png`;
    this.box = new Image();
    this.box.src = `/static/images/ui/dialoguebox.png`
    this.portrait = new Image();
    this.portrait.src = `/static/images/npcs/portraits/${this.name}.png`;

    let tile = map.tiles[x][y];
    tile.add(this, "middle");

    this.points = {};
    this.giftNumber = {};
    this.talked = {};
    this.gifted = {};
    this.status = {};

    this.dialogue = "";

    this.reactions = {};
    Object.keys(NPC_INFO[this.name]["reactions"]).forEach(reaction => {
      NPC_INFO[this.name]["reactions"][reaction].forEach(item => {
        this.reactions[item] = reaction;
      })
    })
    this.normalDialogue = NPC_INFO[this.name]["normal_dialogue"];
    this.giftDialogue = NPC_INFO[this.name]["gift_dialogue"];
  }

  // possibly implement birthdays
  gift(player, item) {
    if (!(player in this.points)) {
      this.addPlayer(player);
    }
    if (this.giftNumber[player] == 2 || this.gifted[player]) {
      // possibly display msg
      return false;
    }
    let reaction = 0;
    if (item in this.reactions) { // checks npc-specific reactions
      reaction = this.reactions[item];
    }
    else { // defaults to universal reaction
      reaction = ITEMS[item]["reaction"];
    }
    this.points[player] += giftPoints[reaction];
    this.giftNumber[player] += 1;
    this.gifted[player] = true;
    this.dialogue = this.giftDialogue[reaction];
    this.dialogue = this.dialogue.replace("@", player)
    return true;
  }

  talk(player) {
    if (!(player in this.points)) {
      this.addPlayer(player)
      this.dialogue = this.normalDialogue[0]
    }
    else if (this.talked[player] == false) {
      this.points[player] += 20;
      this.dialogue = this.normalDialogue[Math.ceil(Math.random() * (this.normalDialogue.length - 1))] //random dialogue option (excluding intro dialogue stored at index 0 of array)
    }
    this.talked[player] = true;
    this.dialogue = this.dialogue.replace("@", player)
  }

  addPlayer(player){
    this.points[player] = 2000
    this.giftNumber[player] = 0
    this.talked[player] = true
    this.status[player] = null
    this.gifted[player] = false
  }

  renderDialogue(ctx, player) {
    // console.log(this.dialogue)
    let overlayScale = 2;
    let xStart = (CANVAS_WIDTH - 321 * overlayScale) / 2;
    let yStart = CANVAS_HEIGHT - (113 + 15) * overlayScale;
    let fontSize = 10 * overlayScale;

    ctx.drawImage(this.box,
      xStart, yStart,
      321 * overlayScale, 113 * overlayScale
    );
    ctx.drawImage(this.portrait,
      xStart + 223 * overlayScale, yStart + 15 * overlayScale,
      64 * overlayScale, 64 * overlayScale
    );

    ctx.textAlign = "left";
    ctx.font = `${fontSize}px bold`
    ctx.fillStyle = "#56160c";
    ctx.letterSpacing = "2px";
    renderWrappedText(ctx, this.dialogue,
      xStart + 14 * overlayScale, yStart + (11 + 3) * overlayScale + fontSize / 2,
      174 * overlayScale, fontSize + 2 * overlayScale
    );

    ctx.textAlign = "center";
    ctx.letterSpacing = "1px";
    ctx.fillText(getItemTitle(this.name),
      xStart + 255 * overlayScale, yStart + 97 * overlayScale
    );
  }

  render(ctx, map) {
    ctx.drawImage(this.sprite, 0, 0, TILE_SIZE, TILE_SIZE * 2,
      ((this.x * TILE_SIZE) - map.x) * SCALE_FACTOR, ((this.y - 1) * TILE_SIZE - map.y) * SCALE_FACTOR,
      TILE_SIZE * SCALE_FACTOR, TILE_SIZE * 2 * SCALE_FACTOR
    )
  }
}
