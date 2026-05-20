
export default class Gold {
    constructor(game, player) {
        this.game = game;
        this.player = player;
        this.amount = 500;

        this.display = new Image();
        this.display.src = "/static/images/ui/gold_meter.png";

        this.numbers = [];
        for (let i = 0; i < 10; i++) {
            this.numbers.push(new Image());
            this.numbers[i].src = `/static/images/ui/gold_numbers/${i}.png`;
        }
    }

    render(ctx, xStart, yStart, scaleFactor) {
        ctx.drawImage(this.display,
            xStart, yStart,
            65 * scaleFactor, 17 * scaleFactor
        )

        let goldString = (this.amount % 100_000_000).toString().split("").reverse()

        goldString.forEach((digit, i) => {
            ctx.drawImage(this.numbers[digit],
                xStart + 52 * scaleFactor - i * 6 * scaleFactor, yStart + 6 * scaleFactor,
                5 * scaleFactor, 7 * scaleFactor
            )
        });
    } 
}