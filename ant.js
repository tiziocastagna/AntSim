class Vector2D {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
    }
}

class SquareMatrix2D {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d
    }
    transform(v) {
        return new Vector2D(v.x * this.a + v.y * this.c, v.x * this.b + v.y * this.d);
    }
}

function vector2Daddtion(v, w) {
    return new Vector2D(v.x + w.x, v.y + w.y);
}

const ROTATION_90 = new SquareMatrix2D(0, 1, -1, 0);
const ROTATION_180 = new SquareMatrix2D(-1, 0, 0, -1);
const ROTATION_270 = new SquareMatrix2D(0, -1, 1, 0);

const NORTH = new Vector2D(0, 1);
const EAST = new Vector2D(1, 0);
const SOUTH = new Vector2D(0, -1);
const WEST = new Vector2D(-1, 0);

const directions = [
    NORTH,
    EAST,
    SOUTH,
    WEST
];

function getRandomDirection() {
    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
}

// Helper function for shuffling an array in place (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
}

let food_home = 0;

const BRAIN_STRUCTURE = [18, 32, 9];
const NOISE_IN_MULTIPLIER = 0.05;
const NOISE_OUT_MULTIPLIER = 0.05;

class Ant {
    position;
    home;
    hill;
    direction;

    food_carried;
    energy;
    alive;

    brain;
    constructor(hill) {
        this.hill = hill;
        this.home = hill.position;
        this.position = new Vector2D(this.home.x, this.home.y);
        this.home = new Vector2D(this.home.x, this.home.y);
        this.direction = getRandomDirection();
        getTile(this.position.x, this.position.y).ant_number += 1;     // Show itself as soon as it is created

        this.food_carried = 0;
        this.energy = 1500;
        this.alive = true;

        this.brain = new Network(BRAIN_STRUCTURE);
    }
    getLeftTile() {
        const position = vector2Daddtion(this.position, ROTATION_270.transform(this.direction));
        return getTile(position.x, position.y);
    }
    getRightTile() {
        const position = vector2Daddtion(this.position, ROTATION_90.transform(this.direction));
        return getTile(position.x, position.y);
    }
    getFrontTile() {
        const position = vector2Daddtion(this.position, this.direction);
        return getTile(position.x, position.y);
    }
    
    move(direction) {
        if(this.alive === false) { return; }
        let next_direction;
        if(direction === "left") {
            next_direction = ROTATION_270.transform(this.direction);
        } else if(direction === "right") {
            next_direction = ROTATION_90.transform(this.direction);
        } else if(direction === "forwards") {
            next_direction = this.direction;
        } else {    // TODO: do somthing
            return;
        }

        const next_position = vector2Daddtion(this.position, next_direction);
        const next_tile = getTile(next_position.x, next_position.y);

        const prevX = this.position.x;
        const prevY = this.position.y;

        if(next_tile !== VOIDTILE) {
            getTile(prevX, prevY).ant_number -= 1;      // Removes itself
            this.position = next_position;
            this.direction = next_direction;
            getTile(next_position.x, next_position.y).ant_number += 1;     // Shows itself
        } else {
            // DO NOTHING
        }
    }

    getDirectionPreferences(channel, preference_type, leftTile, frontTile, rightTile) {
        let Values = [ // Use let as we will modify it by shuffling parts
            { direction: "left", value: leftTile.chemicalRGB[channel] },
            { direction: "forwards", value: frontTile.chemicalRGB[channel] },
            { direction: "right", value: rightTile.chemicalRGB[channel]}
        ];
 
        if (preference_type === "avoid") {
            // Sort by chemical value ascending (lower is better)
            Values.sort((a, b) => a.value - b.value);
        } else if (preference_type === "follow") {
            // Sort by chemical value descending (higher is better)
            Values.sort((a, b) => b.value - a.value);
        }
 
        // Shuffle groups with tied values to ensure random choice among equally good options
        let i = 0;
        while (i < Values.length) {
            let j = i;
            // Find end of the current tied group (elements with the same value)
            while (j < Values.length && Values[j].value === Values[i].value) {
                j++;
            }
            // If there's a group of more than one item with the same value
            if (j - i > 1) {
                const tiedGroup = Values.slice(i, j);
                shuffleArray(tiedGroup); // Shuffle this specific group
                // Place the shuffled group back into the Values array
                for (let k = 0; k < tiedGroup.length; k++) {
                    Values[i + k] = tiedGroup[k];
                }
            }
            i = j; // Move to the start of the next distinct group
        }
        return Values.map(item => item.direction);
    }

    reachForFood(tile) {
        if(tile.food_channel > 0 && this.food_carried < 255) {
            const FoodThatCanBePickedUp = tile.food_channel > 100 ? 100 : tile.food_channel;
            this.food_carried += FoodThatCanBePickedUp;
            tile.removeFood(FoodThatCanBePickedUp);
        }
    }

    depoiteFood() {
        this.food_carried = 0;
    }

    home_beavieur() {
        if(this.food_carried > 0) {
            food_home += this.food_carried;
            if(this.food_carried >= 5) {
                this.makeOffspring();
                console.log("food deposited", this.food_carried);
            }
            this.depoiteFood();
        }
    }

    turn_back() {
        this.direction = ROTATION_180.transform(this.direction);
    }

    explore(tile, leftTile, frontTile, rightTile) {
        tile.addChemical(0, 10);
        this.move(this.getDirectionPreferences(0, "avoid", leftTile, frontTile, rightTile)[0]);
    }

    step() {
        if(this.alive === false) { return; }
        const tile = getTile(this.position.x, this.position.y);
        const frontTile = this.getFrontTile();
        const leftTile = this.getLeftTile();
        const rightTile = this.getRightTile();

        if(this.position.x === this.home.x && this.position.y === this.home.y) { this.home_beavieur(); }
        this.reachForFood(tile);

        const INPUTS = [
            this.food_carried > 0 ? 1 : 0,
            tile.food_channel / 255,
            tile.chemicalRGB[0] / 255,
            tile.chemicalRGB[1] / 255,
            tile.chemicalRGB[2] / 255,
            frontTile.food_channel / 255,
            frontTile.chemicalRGB[0] / 255,
            frontTile.chemicalRGB[1] / 255,
            frontTile.chemicalRGB[2] / 255,
            leftTile.food_channel / 255,
            leftTile.chemicalRGB[0] / 255,
            leftTile.chemicalRGB[1] / 255,
            leftTile.chemicalRGB[2] / 255,
            rightTile.food_channel / 255,
            rightTile.chemicalRGB[0] / 255,
            rightTile.chemicalRGB[1] / 255,
            rightTile.chemicalRGB[2] / 255,
            this.food_carried / 255
        ];

        // Add noise to the input vector
        for (let i = 0; i < INPUTS.length; i++) {
            INPUTS[i] += (Math.random() * 2 - 1) * NOISE_IN_MULTIPLIER;
        }

        const OUTPUT = this.brain.feedForward(INPUTS);

        // Add noise to the output vector
        for (let i = 0; i < OUTPUT.length; i++) {
            OUTPUT[i] += (Math.random() * 2 - 1) * NOISE_OUT_MULTIPLIER;
        }

        let maxIndex = 0;
        for (let i = 1; i < OUTPUT.length; i++) {
            if (OUTPUT[i] > OUTPUT[maxIndex]) {
                maxIndex = i;
            }
        }

        if(maxIndex === 0) {
            this.removeEnergy(2);
            this.move("left");
        } else if(maxIndex === 1) {
            this.removeEnergy(2);
            this.move("forwards");
        } else if(maxIndex === 2) {
            this.removeEnergy(2);
            this.move("right");
        } else if(maxIndex === 3) {
            this.removeEnergy(5);
            tile.addChemical(0, 10);
        } else if(maxIndex === 4) {
            this.removeEnergy(5);
            tile.addChemical(1, 10);
        } else if(maxIndex === 5) {
            this.removeEnergy(5);
            tile.addChemical(2, 10);
        } else if(maxIndex === 6) {
            this.removeEnergy(1);
            this.turn_back();
        } else if(maxIndex === 7) {
            this.removeEnergy(10);
            this.explore(tile, leftTile, frontTile, rightTile);
        } else if(maxIndex === 8) {
            // DO NOTHING
        }
        this.removeEnergy(1);
    }

    makeOffspring() {
        const result = new Ant(this.hill);
        const parameters = this.brain.getParameters();
        for(let i = 0; i < parameters.length; i++) {
            parameters[i] += (Math.random() * 2 - 1) * 0.001;
        }
        result.brain.parseParameters(parameters);
        this.hill.ants.push(result);
    }

    removeEnergy(quantity) {
        if(this.alive === false) { return; }
        if(this.energy - quantity <= 0) {
            this.energy = 0;
            this.die();
        } else {
            this.energy -= quantity;
        }
    }

    die() {
        const tile = getTile(this.position.x, this.position.y);
        tile.ant_number -= 1;
        this.alive = false;
        tile.addFood(this.food_carried);
    }
}

class Colony {
    position;

    ants;
    constructor(x, y) {
        this.position = new Vector2D(x, y);
        this.ants = [];
        const queen = new Ant(this);
        for(let i = 0; i < 10; i++) {
            queen.makeOffspring();
        }
    }

    removeCorps() {
        let new_ants = [];
        for(let i = 0; i < this.ants.length; i++) {
            const ant = this.ants[i];
            if(ant.alive) { new_ants.push(ant); }
        }
        this.ants = new_ants;
    }
}