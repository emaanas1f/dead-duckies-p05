import {} from '../constants.js';
import NPC from '../npc.js';

export default class RelationshipsMenu {
  constructor(npcs) {
    this.npcs = npcs;
    this.currentNpc = 0;
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

  renderMenu(ctx, player) {

  }

}
