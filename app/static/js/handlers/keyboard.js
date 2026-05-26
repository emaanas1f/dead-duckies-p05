export default class InputHandler {
  constructor(game) {
    this.keys = {};
    window.addEventListener('keydown', e => {
      if (game.menu == null) {
        if (['W', 'w', 'A', 'a', 'S', 's', 'D', 'd'].includes(e.key)) {
          this.keys[e.key] = true;
          e.preventDefault();
        }

        else if (Number.isInteger(parseInt(e.key))) {
          if (parseInt(e.key) == 0) {
            game.player.inventory.selectSlot(9);
          } else {
            game.player.inventory.selectSlot(e.key - 1);
          }
          game.player.inventory.renderHotbar(game.hotbarCtx, game.hotbarCanvas);
        } else if (e.key == "-") {
          game.player.inventory.selectSlot(10);
          game.player.inventory.renderHotbar(game.hotbarCtx, game.hotbarCanvas);
        } else if (e.key == "=") {
          game.player.inventory.selectSlot(11);
          game.player.inventory.renderHotbar(game.hotbarCtx, game.hotbarCanvas);
        } else if (e.key == "c" || e.key == "C") {
          game.player.interact(game.map, game.stamina);
        }

        else if (e.key == "e" || e.key == "E") {
          game.clearMenus();
          game.menu = "playerMenu";
        }
      } // END NO MENUs

      else if (game.menu == "shop") {
        if (e.key == "ArrowUp") {
          game.player.currentShop.moveUp();
        }
        else if (e.key == "ArrowDown") {
          game.player.currentShop.moveDown();
        }
        else if (e.key == "Shift") {
          game.player.quantity = 5;
        }
        else if (e.key == "Control") {
          game.player.quantity = 25;
        }
        else {
          game.player.quantity = 1;
        }
      } // END SHOP

      else if (game.menu == "playerMenu") {
        game.playerMenu.keyPress(e);
      }

      if (e.key == "Escape") {
        game.clearMenus();
        game.mouseToggled = false;
      }
    });

    window.addEventListener('keyup', e => {
      this.keys[e.key] = false;
      game.player.quantity = 1;
    });
  }
}
