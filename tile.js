const tiles = []

class Tile {
    x;
    y;
    color;
    covered;
    chemicalRGB
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = "rgb(" + String(34 + Math.random() * 10) + "," + String(139 + Math.random() * 10) + "," + String(39 + Math.random() * 10) + ")"    // random shade of green
        this.chemicalRGB = [0, 0, 0]
    }
    addChemical(channel, quantity) {
        if(this.chemicalRGB[channel] + quantity > 255) {
            this.chemicalRGB[channel] = 255;
        } else {
            this.chemicalRGB[channel] += quantity
        }
    }
    render() {
        if(this.covered) {return "black"}
        return this.color;
    }
    render_chemical() {
        if(this.covered) {return "white"}
        return "rgb(" + this.chemicalRGB[0] + "," + this.chemicalRGB[1] + "," + this.chemicalRGB[2] + ")";
    }
}

const VOIDTILE = new Tile(Infinity, Infinity)
VOIDTILE.chemicalRGB = [255, 0, 0]

// TODO: implemet in such a way to not make my eyes bleed
function getTile(x, y) {
    for(let tile of tiles) {
        if(tile.x === x && tile.y === y) {
            return tile;
        }
    }
    return VOIDTILE;
}