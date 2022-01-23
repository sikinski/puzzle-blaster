class Scene{
    constructor(screen, controls) {
        this.canvas = screen.canvas
        this.ctx = this.canvas.getContext('2d')
        this.controls = controls
    }
}
// map 9x10
let map = [
    [red, green, green. green, yellow, yellow, red, red, red],
    [red, yellow, green. green, violet, yellow, blue, blue, red],
    [blue, blue, green. green, yellow, yellow, red, red, red],
    [blue, blue, blue. blue, yellow, yellow, red, red, red],
    [blue, blue, green. green, violet, yellow, red, red, red],
    [red, green, green. green, violet, yellow, red, red, red],
    [red, violet, violet. violet, violet, violet, violet, violet, violet],
    [red, green, yellow. green, violet, yellow, red, red, red],
    [red, yellow, green. green, violet, green, red, red, red],
    [red, red, red. green, violet, green, red, red, red]
]
