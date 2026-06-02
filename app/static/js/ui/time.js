import { TILE_SIZE, SCALE_FACTOR, CANVAS_WIDTH, CANVAS_HEIGHT, FRAME_RATE, X_RES, Y_RES, TIME_CONVERSION } from "../constants.js";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default class Time {
  // currData, numTicks, currTime
  constructor() {
    this.currYear = 1;
    this.currDay = 1;
    this.currTime = 0; //600-2600 (mod 2400 for display)
    this.numTicks = 0;
    this.display = new Image();
    this.display.src = "/static/images/ui/clock.png";
  }

  getTime() {
    return currTime;
  }

  nextDay(game) {
    this.currDay++;
    if (this.currDay == 29) {
      this.currYear++;
      this.currDay = 1;
    }

    game.maps["farm"].crops.forEach(crop => {
      crop.update();
    })
    
    if (this.currDay % 7 == 0) {
      if (game.maps["forest"]) {
        game.maps["forest"].respawnForageables();
      }
    }

    game.npcList.forEach(npc => {
      Object.keys(npc.talked).forEach(player => {
        npc.talked[player] = false;
      });
      Object.keys(npc.gifted).forEach(player => {
        npc.gifted[player] = false;
      });
      if (this.currDay % 7 == 1) {
        Object.keys(npc.giftNumber).forEach(player => {
          npc.giftNumber[player] = 0;
        });
      }
    });
    //handling sleep/knockout
    if (!game.stamina.isEmpty()) {
      if (this.currTime < 1080) {
        game.stamina.restoreFull();
      }
      else {
        let timePastMidnight = Math.min(1, (this.currTime - 1080) / (1200 - 1080));
        let restorePercent = 1 - timePastMidnight * 0.8;
        game.stamina.restoreEnergy(Math.floor(game.stamina.max * restorePercent));
      }
    }
  }
  
  // Overlay on top of upper right of canvas (Only update when time changes)
  render(ctx, scaleFactor) {
    let hour = Math.floor(this.currTime / 60 + 6) % 12;
    if (hour == 0) {
      hour = 12;
    }
    let min = this.currTime % 60 / 10;
    let time = String(hour) + ":" + String(min) + "0";
    if (this.currTime < 360 || this.currTime >= 1080) {
      time += " am";
    }
    else {
      time += " pm";
    }
    let date = days.at(this.currDay % 7 - 1) + ". " + String(this.currDay);
    ctx.drawImage(this.display,
      .8 * CANVAS_WIDTH, .01 * CANVAS_HEIGHT,
      72 * scaleFactor, 40 * scaleFactor
    );
    ctx.font = "25px thin";
    ctx.fillText(time, (.8 + .19 * .42) * CANVAS_WIDTH, (.01 + .19 * .89) * CANVAS_HEIGHT);
    ctx.fillText(date, (.8 + .19 * .42) * CANVAS_WIDTH, (.01 + .19 * .31) * CANVAS_HEIGHT);
  }

  // called upon each frame load
  // Returns true when new day
  update(game) {
    this.numTicks++
    if (this.numTicks % TIME_CONVERSION == 0) {
      this.currTime += 10;
    }

    if (this.currTime >= 1200 && game.menu !== "sleeping") {
      game.startSleep();
    }
  }
}
