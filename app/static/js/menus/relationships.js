import { UI_FACTOR, NPC_INFO } from '../constants.js';
import NPC from '../npc.js';

export default class RelationshipsMenu {
  constructor(npcs) {
    this.npcs = npcs;
    this.currentNpc = 0;
    this.display = new Image();
    this.display.src = "/static/images/ui/relatinships.png";
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

  renderMenu(ctx, player, xStart, yStart) {
    ctx.drawImage(this.display,
      xStart, yStart,
      208 * UI_FACTOR, 128 * UI_FACTOR
    );

    this.npcs.forEach((npc, i) => {

    });

  }

}
