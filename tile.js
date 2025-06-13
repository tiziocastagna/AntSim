let tiles = [];

function colorSum(a, b) {
    const r = a[0] + b[0] > 255 ? 255 : a[0] + b[0];
    const g = a[1] + b[1] > 255 ? 255 : a[1] + b[1];
    const b_val = a[2] + b[2] > 255 ? 255 : a[2] + b[2]; // Renamed to avoid conflict if 'b' is a parameter name elsewhere
    return [r, g, b_val];
}

function arrayToRGB(color) {
    return "rgb(" + String(color[0]) + "," + String(color[1]) + "," + String(color[2]) +")";
}

function scaleColor(color, factor) {
    return [color[0] * factor, color[1] * factor, color[2] * factor]
}


class Tile {
    x;
    y;

    ant_number;

    chemicalRGB;
    food_channel;
    chemicalRGB_buffer;
    food_channel_buffer
    color;
    food_color;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        
        this.color = [34 + Math.random() * 10, 139 + Math.random() * 10, 39 + Math.random() * 10];
        this.food_color = [255, 239, 10];
        this.chemicalRGB = [0, 0, 0];
        this.food_channel = 30;
        this.food_channel_buffer = 0;
        this.chemicalRGB_buffer = [0, 0, 0];
        this.ant_number = 0;
    }
    addChemical(channel, quantity) {
        if(this.chemicalRGB[channel] + quantity > 255) {
            this.chemicalRGB[channel] = 255;
        } else {
            this.chemicalRGB[channel] += quantity;
        }
    }
    removeChemical(channel, quantity) {
        if(this.chemicalRGB[channel] - quantity < 0) {
            this.chemicalRGB[channel] = 0;
        } else {
            this.chemicalRGB[channel] -= quantity;
        }
    }
    addFood(quantity) {
        const temp = this.food_channel;
        if(this.food_channel + quantity > 255) {
            this.food_channel = 255;
        } else {
            this.food_channel += quantity;
        }
    }
    removeFood(quantity) {
        const temp = this.food_channel;
        if(this.food_channel - quantity < 0) {
            this.food_channel = 0;
        } else {
            this.food_channel -= quantity;
        }
    }
    clearFood() {
        this.food_channel = 0;
    }
    render() {
        if(this.x == 0 && this.y == 0) { return "brown"; }      // Anthill at the center
        else if(this.ant_number > 0 && showAnts) { return "black"; }
        else { return arrayToRGB(this.color); }
    }
    render_chemical() {
        if(this.ant_number > 0 && showAnts) { return "white"; }
        return "rgb(" + this.chemicalRGB[0] + "," + this.chemicalRGB[1] + "," + this.chemicalRGB[2] + ")";
    }
    render_food() {
        if(this.ant_number > 0 && showAnts) { return "white"; }
        return arrayToRGB(scaleColor(this.food_color, this.food_channel / 255));
    }
}

const VOIDTILE = new Tile(Infinity, Infinity);
VOIDTILE.color = "white";
VOIDTILE.chemicalRGB = [255, 0, 0];
VOIDTILE.food_channel = 0;

function getTile(x, y) {
    if(x < -LEFT_WIDTH || x > RIGHT_WIDTH || y < -DOWN_HEIGHT || y > UP_HEIGHT) { return VOIDTILE; }
    return tiles[DOWN_HEIGHT + y][LEFT_WIDTH + x];
}

function fade() {
    const max_i = tiles.length;
    const max_j = tiles[0].length;
    for(let i = 0; i < max_i; i++) {
        for(let j = 0; j < max_j; j++) {
            const tile = tiles[i][j];
            tile.chemicalRGB[0] *= fadingCoefficent.value;
            tile.chemicalRGB[1] *= fadingCoefficent.value;
            tile.chemicalRGB[2] *= fadingCoefficent.value;
            if(tile.food_channel < maxRefill.value) {
                tile.food_channel += foodRefill.value;
            }
            // TODO: find a more elegant solution
            if(tile.ant_number < 0) {tile.ant_number = 0;}
        }
    }
}

class World {
    leftWidth;
    rightWidth;
    downHeight;
    upHeight;
    constructor() {
        this.leftWidth = LEFT_WIDTH;
        this.rightWidth = RIGHT_WIDTH;
        this.downHeight = DOWN_HEIGHT;
        this.upHeight = UP_HEIGHT;
        this.blank();
    }
    blank() {
        this.tiles = [];
        for(let i = -this.downHeight; i <= this.upHeight; i++) {
            let row = []
            for(let j = -this.leftWidth; j <= this.rightWidth; j++) {
                row.push(new Tile(j, i));
            }
            this.tiles.push(row);
        }
    }
    getTile(x, y) {
        if(x < -this.leftWidth || x > this.rightWidth || y < -this.downHeight || y > this.upHeight) { return VOIDTILE; }
        return this.tiles[this.downHeight + y][this.leftWidth + x];
    }

    fade() {
        const max_i = this.tiles.length;
        const max_j = this.tiles[0].length;
        for(let i = 0; i < max_i; i++) {
            for(let j = 0; j < max_j; j++) {
                const tile = this.tiles[i][j];
                tile.chemicalRGB[0] *= fadingCoefficent.value;
                tile.chemicalRGB[1] *= fadingCoefficent.value;
                tile.chemicalRGB[2] *= fadingCoefficent.value;
                if(tile.food_channel < maxRefill.value) {
                    tile.food_channel += foodRefill.value;
                }
                // TODO: find a more elegant solution
                if(tile.ant_number < 0) {tile.ant_number = 0;}
            }
        }
    }
}