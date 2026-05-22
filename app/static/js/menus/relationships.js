import {  NPC_INFO } from '../constants.js';
import NPC from '../npc.js';

export default class RelationshipsMenu {
  constructor(npcs) {
    this.npcs = npcs;
    this.currentNpc = 0;
    this.display = new Image();
    this.display.src = "/static/images/ui/relationships.png";
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

    let fontSize = 12 * overlayScale
    ctx.textAlign = "left";
    ctx.letterSpacing = "1px";
    ctx.font = `${fontSize}px thin`
    ctx.fillStyle = "black";

    for (let i = 0; i < 4; i++) {
      let xRow = xStart + 5 * overlayScale;
      let yRow = yStart + 5 * overlayScale + 30 * overlayScale * i;
      if (currentNpc + i >= this.npcs.length) {
        ctx.fillText("???",
          xRow + 6 * overlayScale, yRow + 20 * overlayScale
        )
      }
      else {

      }
    }

  }

}
