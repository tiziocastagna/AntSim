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

let maxFood = 30;
let foodRefill = 1;

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
        this.food_channel = 0;
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

function createFoodPile(x, y, radius) {
    for(let dy = -radius; dy <= radius; dy++) {
        for(let dx = -radius; dx <= radius; dx++) {
            const current_x = x + dx;
            const current_y = y + dy;

            const distance_squared = dx**2 + dy**2;
            if(distance_squared <= radius**2) {
                const tile = getTile(current_x, current_y);
                if (tile !== VOIDTILE) {
                    tile.addFood(255);
                }
            }
        }
    }
}

function getRandomX_Y() {
    // Generate x in [-LEFT_WIDTH, RIGHT_WIDTH] inclusive
    const x = Math.floor(Math.random() * (RIGHT_WIDTH + LEFT_WIDTH + 1)) - LEFT_WIDTH;
    // Generate y in [-DOWN_HEIGHT, UP_HEIGHT] inclusive
    const y = Math.floor(Math.random() * (UP_HEIGHT + DOWN_HEIGHT + 1)) - DOWN_HEIGHT;
    return [x, y];
}

let diffuse = false;
const WEIGHT_NEIGHBOURS = 1;
const WEIGHT_CENTER = 80;
const WEIGHT_SUM = WEIGHT_NEIGHBOURS * 4 + WEIGHT_CENTER
const MULT_NEIGHBOURS = WEIGHT_NEIGHBOURS / WEIGHT_SUM;
const MULT_CENTER = WEIGHT_CENTER / WEIGHT_SUM;

let FADING_CONSTANT = 0.95;

function only_fade() {
    const max_i = tiles.length;
    const max_j = tiles[0].length;
    for(let i = 0; i < max_i; i++) {
        for(let j = 0; j < max_j; j++) {
            const tile = tiles[i][j];
            tile.chemicalRGB[0] *= FADING_CONSTANT;
            tile.chemicalRGB[1] *= FADING_CONSTANT;
            tile.chemicalRGB[2] *= FADING_CONSTANT;
            if(tile.food_channel < maxFood) {
                tile.food_channel += foodRefill;
            }
            // TODO: find a more elegant solution
            if(tile.ant_number < 0) {tile.ant_number = 0;}
        }
    }
}

function updateTiles() {
    let foodInPlay = 0;
    const max_i = tiles.length;
    const max_j = tiles[0].length;

    for(let i = 0; i < max_i; i++) {
        for(let j = 0; j < max_j; j++) {
            const tile = tiles[i][j];
            const current_tile_x = tile.x;
            const current_tile_y = tile.y;
            const others = [
                getTile(current_tile_x, current_tile_y + 1), // North
                getTile(current_tile_x, current_tile_y - 1), // South
                getTile(current_tile_x + 1, current_tile_y), // East
                getTile(current_tile_x - 1, current_tile_y)  // West
            ];
            const r = tile.chemicalRGB[0];
            const g = tile.chemicalRGB[1];
            const b = tile.chemicalRGB[2];
            const f = tile.food_channel;
            for(let k = 0; k < 4; k++) {
                others[k].chemicalRGB_buffer[0] += r * MULT_NEIGHBOURS;
                others[k].chemicalRGB_buffer[1] += g * MULT_NEIGHBOURS;
                others[k].chemicalRGB_buffer[2] += b * MULT_NEIGHBOURS;
                others[k].food_channel_buffer += f * MULT_NEIGHBOURS;
            }
            tile.chemicalRGB_buffer[0] += r * MULT_CENTER;
            tile.chemicalRGB_buffer[1] += g * MULT_CENTER;
            tile.chemicalRGB_buffer[2] += b * MULT_CENTER;
            tile.food_channel_buffer += f * MULT_CENTER;
        }
    }

    for(let i = 0; i < max_i; i++) {
        for(let j = 0; j < max_j; j++) {
            const tile = tiles[i][j];
            tile.food_channel = 0;
            tile.chemicalRGB = [0, 0, 0];
            tile.addChemical(0, tile.chemicalRGB_buffer[0] * FADING_CONSTANT);
            tile.addChemical(1, tile.chemicalRGB_buffer[1] * FADING_CONSTANT);
            tile.addChemical(2, tile.chemicalRGB_buffer[2] * FADING_CONSTANT);
            tile.addFood(tile.food_channel_buffer);
            tile.chemicalRGB_buffer = [0, 0, 0];
            tile.food_channel_buffer = 0;
            foodInPlay += tile.food_channel;
            if(tile.food_channel < maxFood) {
                tile.food_channel += foodRefill;
            }
            // TODO: find a more elegant solution
            if(tile.ant_number < 0) {tile.ant_number = 0;}
        }
    }
}