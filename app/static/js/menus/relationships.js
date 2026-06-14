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

    this.checkSprite = new Image();
    this.checkSprite.src = "/static/images/ui/check.png";
  }

  menuUp() {
    if (this.currentNpc > 0) {
      this.currentNpc--;
    }
  }

  menuDown() {
    if (this.currentNpc < this.npcs.length - 4) {
      this.currentNpc++;
    }
  }

  render(ctx, player, xStart, yStart, overlayScale) {
    ctx.drawImage(this.display,
      xStart, yStart,
      208 * overlayScale, 128 * overlayScale
    );

    // console.log(this.npcs)
    for (let i = 0; i < 4; i++) {
      let xRow = xStart + 5 * overlayScale;
      let yRow = yStart + 5 * overlayScale + 30 * overlayScale * i;

      let fontSize = 10 * overlayScale
      ctx.textAlign = "center";
      ctx.letterSpacing = "1px";
      ctx.font = `${fontSize}px thin`
      ctx.fillStyle = "black";
      if (this.currentNpc + i >= this.npcs.length) {
        ctx.fillText("???",
          xRow + 39 * overlayScale, yRow + 17 * overlayScale
        )
        continue;
      }
      
      let npc = this.npcs[this.currentNpc + i];
      ctx.drawImage(npc.sprite,
        0, 0,
        16, 24,
        xRow + 3 * overlayScale, yRow + 4 * overlayScale,
        16 * overlayScale, 24 * overlayScale
      )

      ctx.fillText(getItemTitle(npc.name),
        xRow + 39 * overlayScale, yRow + 17 * overlayScale
      );

      if (["boyfriend", "girlfriend"].includes(npc.status[player.name])) {
        ctx.font = `${fontSize - 4 * overlayScale}px thin`;
        ctx.fillText("(" + npc.status[player.name] + ")",
          xRow + 39 * overlayScale, yRow + 24 * overlayScale
        ) 
      }
      else if (npc.datingDialogue != null) {
        ctx.font = `${fontSize - 4 * overlayScale}px thin`;
        console.log(ctx.font)
        ctx.fillText("(single)",
          xRow + 39 * overlayScale, yRow + 24 * overlayScale
        ) 
      }

      let hearts = Math.floor(npc.points[player.name] / 250);
      for (let heart = 0; heart < hearts; heart++) {
        ctx.drawImage(this.heartSprite,
          xRow + 64 * overlayScale + heart * 8 * overlayScale, yRow + 11 * overlayScale,
          7 * overlayScale, 6 * overlayScale
        );
      }

      if (npc.giftNumber[player.name] >= 1) {
        ctx.drawImage(this.checkSprite,
          xRow + 165 * overlayScale, yRow + 17 * overlayScale,
          7 * overlayScale, 7 * overlayScale
        )
      }
      if (npc.giftNumber[player.name] >= 2) {
        ctx.drawImage(this.checkSprite,
          xRow + 155 * overlayScale, yRow + 17 * overlayScale,
          7 * overlayScale, 7 * overlayScale
        )
      }

      if (npc.talked[player.name]) {
        ctx.drawImage(this.checkSprite,
          xRow + 185 * overlayScale, yRow + 17 * overlayScale,
          7 * overlayScale, 7 * overlayScale
        )
      }
      
    }

  }

}
