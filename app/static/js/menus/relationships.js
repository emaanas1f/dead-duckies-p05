import {} from '../constants.js';
import NPC from '../ui/npc.js';

export default class Relationships {
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
    if (this.currentNpc < this.npc.length) {
      this.currentNpc--;
    }
  }

  renderMenu(ctx, player) {
    
  }

}
