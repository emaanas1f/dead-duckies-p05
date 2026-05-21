import RECIPES from "../../json/recipes.json" with { type: "json" };

export default class CraftingMenu {
  constructor(game) {
    this.game = game;
    this.open = false;
    this.slotSize = 64;

    this.startX = 200;
    this.startY = 120;

    this.hoveredRecipe = null;
  }

  //toggle() {
   // this.open = !this.open;
  //}

  update(mouseX, mouseY) {
    if (!this.open) return;
    this.hoveredRecipe = null;
    let unlockedRecipes = this.game.player.unlockedRecipes;

    for (let i = 0; i < unlockedRecipes.length; i++) {
      let recipeId = unlockedRecipes[i];
      let x = this.startX;
      let y = this.startY + i * 80;

      if ( mouseX > x && mouseX < x + 300 && mouseY > y && mouseY < y + 70) {
        this.hoveredRecipe = recipeId;
      }
    }
  }

  click(mouseX, mouseY) {
    if (!this.open) return;
    let unlockedRecipes = this.game.player.unlockedRecipes;

    for (let i = 0; i < unlockedRecipes.length; i++) {
      let recipeId = unlockedRecipes[i];
      let recipe = RECIPES[recipeId];
      let x = this.startX;
      let y = this.startY + i * 80;

      if ( mouseX > x && mouseX < x + 300 && mouseY > y && mouseY < y + 70) {
        this.game.player.craft(recipe);
        return;
      }
    }
  }

  render(ctx) {
    if (!this.open) return;
    let unlockedRecipes = this.game.player.unlockedRecipes;

//need assets :(
   // ctx.fillStyle = "rgba(0,0,0,0.7)";
   // ctx.fillRect(150, 70, 500, 500);
    //ctx.fillStyle = "white";

    for (let i = 0; i < unlockedRecipes.length; i++) {
      let recipeId = unlockedRecipes[i];
      let recipe = RECIPES[recipeId];
      let x = this.startX;
      let y = this.startY + i * 80;
      let canCraft = this.game.player.hasItems(recipe.ingredients);

      if (recipeId === this.hoveredRecipe) {
        ctx.fillStyle = "#777";
      }
      else {
        ctx.fillStyle = "#555";
      }
      ctx.fillRect(x, y, 300, 70);

      if (!canCraft) {
        ctx.globalAlpha = 0.5;
      }

      let outputImage = this.game.itemImages[recipe.output.item];

      if (outputImage) {
        ctx.drawImage(outputImage, x + 10, y + 10, 48, 48);
      }

      //ctx.globalAlpha = 1;
      //ctx.fillStyle = "white";
      //ctx.font = "20px Arial";
      //ctx.fillText(recipe.name, x + 70, y + 28);

      for (let j = 0; j < recipe.ingredients.length; j++) {
        let ingredient = recipe.ingredients[j];
        let ingredientX = x + 70 + j * 90;
        let ingredientY = y + 40;
        let ingredientImage = this.game.itemImages[ingredient.item];

        if (ingredientImage) {
           ctx.drawImage(ingredientImage, ingredientX, ingredientY, 24, 24);
        }

        let amountOwned = this.game.player.countItem(ingredient.item);

        if (amountOwned >= ingredient.amount) {
          ctx.fillStyle = "lime";
        }
        else {
          ctx.fillStyle = "red";
        }

        //ctx.font = "14px Arial";
       // ctx.fillText( amountOwned + "/" + ingredient.amount, ingredientX + 28, ingredientY + 16);
      }
    }
  }
}
