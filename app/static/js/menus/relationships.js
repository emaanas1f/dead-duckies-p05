import {  NPC_INFO } from '../constants.js';
import NPC from '../npc.js';
import {getItemTitle } from "../ui/text.js";

export default class RelationshipsMenu {
  constructor(npcs) {
    this.npcs = npcs;
    this.currentNpc = 0;
    this.display = new Image();
    this.display.src = "/static/images/ui/relationships.png";

    this.heartSprite = new Image();
    this.heartSprite.src = "/static/images/ui/heart.png";
  }

  menuUp() {
    if (this.currentNpc > 0) {
      this.currentNpc++;
    }
  }

  menuDown() {
    if (this.currentNpc < this.npcs.length) {
      this.currentNpc--;
    }
  }

  render(ctx, player, xStart, yStart, overlayScale) {
    ctx.drawImage(this.display,
      xStart, yStart,
      208 * overlayScale, 128 * overlayScale
    );

    let fontSize = 10 * overlayScale
    ctx.textAlign = "center";
    ctx.letterSpacing = "1px";
    ctx.font = `${fontSize}px thin`
    ctx.fillStyle = "black";
    // console.log(this.npcs)
    for (let i = 0; i < 4; i++) {
      let xRow = xStart + 5 * overlayScale;
      let yRow = yStart + 5 * overlayScale + 30 * overlayScale * i;
      if (this.currentNpc + i >= this.npcs.length) {
        ctx.fillText("???",
          xRow + 30 * overlayScale, yRow + 17 * overlayScale
        )
      }
      else {
        let npc = this.npcs[this.currentNpc + i];
        ctx.fillText(getItemTitle(npc.name),
          xRow + 30 * overlayScale, yRow + 17 * overlayScale
        )
        let hearts = Math.floor(npc.points[player.name] / 250);
        console.log(hearts)
        console.log(npc.points[player.name])
        for (let heart = 0; heart < hearts; heart++) {
          ctx.drawImage(this.heartSprite,
            xRow + 64 * overlayScale + heart * 8 * overlayScale, yRow + 11 * overlayScale,
            7 * overlayScale, 6 * overlayScale
          );
        }
      }
    }

  }

}
