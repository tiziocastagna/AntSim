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


let NOISE_IN_MULTIPLIER = 0;
let NOISE_OUT_MULTIPLIER = 0;

let foodToReproduce = 10;

let startingEnergy = 500;
let metabolism = 1;

// TODO: implemet a more elegant solution with tensors
class Brain {
    constructor() {
        this.redConvolutionalLayer = new Clayer(3, 2);
        this.greenConvolutionalLayer = new Clayer(3, 2);
        this.blueConvolutionalLayer = new Clayer(3, 2);
        this.foodConvolutionalLayer = new Clayer(3, 2);
        this.spacialProcesser = new CrossNetwork([
            {type: "normal", input_size: 120, output_size: 32},
        ]);
        this.network = new CrossNetwork([
            {type: "normal", input_size: 32 + 3, output_size: 16},
            {type: "normal", input_size: 16, output_size: 18}
        ]);
    }
    spacialFeedForward(spacialInput) {
        const redInput = this.redConvolutionalLayer.feedForward(spacialInput[0]);
        const greenInput = this.greenConvolutionalLayer.feedForward(spacialInput[1]);
        const blueInput = this.blueConvolutionalLayer.feedForward(spacialInput[2]);
        const foodInput = this.foodConvolutionalLayer.feedForward(spacialInput[3]);
        return this.spacialProcesser.feedForward(redInput.concat(greenInput).concat(blueInput).concat(foodInput));
    }

    feedForward(spacialInput, otherInput) {
        const input = this.spacialFeedForward(spacialInput).concat(otherInput);
        const output = this.network.feedForward(input);
        return output;
    }
    getParameters() {
        let parameters = [];
        parameters = parameters.concat(this.redConvolutionalLayer.getParameters());
        parameters = parameters.concat(this.greenConvolutionalLayer.getParameters());
        parameters = parameters.concat(this.blueConvolutionalLayer.getParameters());
        parameters = parameters.concat(this.foodConvolutionalLayer.getParameters());
        parameters = parameters.concat(this.spacialProcesser.getParameters());
        parameters = parameters.concat(this.network.getParameters());
        return parameters;
    }
    parseParameters(parameters) {
        let index = 0;
        for(let i = 0; i < this.redConvolutionalLayer.kernals.length; i++) {
            for(let j = 0; j < this.redConvolutionalLayer.kernals[i].data.length; j++) {
                for(let k = 0; k < this.redConvolutionalLayer.kernals[i].data[j].length; k++) {
                    this.redConvolutionalLayer.kernals[i].data[j][k] = parameters[index];
                    index++;
                }
            }
        }
        for(let i = 0; i < this.greenConvolutionalLayer.kernals.length; i++) {
            for(let j = 0; j < this.greenConvolutionalLayer.kernals[i].data.length; j++) {
                for(let k = 0; k < this.greenConvolutionalLayer.kernals[i].data[j].length; k++) {
                    this.greenConvolutionalLayer.kernals[i].data[j][k] = parameters[index];
                    index++;
                }
            }
        }
        for(let i = 0; i < this.blueConvolutionalLayer.kernals.length; i++) {
            for(let j = 0; j < this.blueConvolutionalLayer.kernals[i].data.length; j++) {
                for(let k = 0; k < this.blueConvolutionalLayer.kernals[i].data[j].length; k++) {
                    this.blueConvolutionalLayer.kernals[i].data[j][k] = parameters[index];
                    index++;
                }
            }
        }
        for(let i = 0; i < this.foodConvolutionalLayer.kernals.length; i++) {
            for(let j = 0; j < this.foodConvolutionalLayer.kernals[i].data.length; j++) {
                for(let k = 0; k < this.foodConvolutionalLayer.kernals[i].data[j].length; k++) {
                    this.foodConvolutionalLayer.kernals[i].data[j][k] = parameters[index];
                    index++;
                }
            }
        }
        for(let i = 0; i < this.spacialProcesser.layers.length; i++) {
            const layer = this.spacialProcesser.layers[i];
            if(this.spacialProcesser.layerTypes[i] === "normal") {
                for (let j = 0; j < layer.weights.rows; j++) {
                    for (let k = 0; k < layer.weights.cols; k++) {
                        layer.weights.data[j][k] = parameters[index];
                        index++;
                    }
                }
                for (let j = 0; j < layer.biases.length; j++) {
                    layer.biases[j] = parameters[index];
                    index++;
                }
            }
        }
        for(let i = 0; i < this.network.layers.length; i++) {
            const layer = this.network.layers[i];
            if(this.network.layerTypes[i] === "normal") {
                for (let j = 0; j < layer.weights.rows; j++) {
                    for (let k = 0; k < layer.weights.cols; k++) {
                        layer.weights.data[j][k] = parameters[index];
                        index++;
                    }
                }
                for (let j = 0; j < layer.biases.length; j++) {
                    layer.biases[j] = parameters[index];
                    index++;
                }
            }
        }
    }
}

function getMutatedBrainParameters(brain) {
    const parameters = brain.getParameters();
    for(let i = 0; i < parameters.length; i++) {
        if(Math.random() < MUTATION_CHANCE) {
            parameters[i] += (Math.random() * 2 - 1) * MUTATION_STRENGTH;
        }
    }
    return parameters;
}

class Ant {
    position;
    home;
    hill;
    index;
    direction;

    samples;

    food_carried;
    energy;
    alive;
    score;

    brain;
    constructor(hill, index) {
        this.index = index;
        this.hill = hill;
        this.home = hill.position;
        this.position = new Vector2D(this.home.x, this.home.y);
        this.home = new Vector2D(this.home.x, this.home.y);
        this.direction = getRandomDirection();

        this.samples = [];
        for (let i = 0; i < 4; i++) {
            this.samples.push(new Matrix(3, 5)); // Assuming Matrix(rows, cols)
        }

        this.food_carried = 0;
        this.energy = startingEnergy;
        this.alive = true;
        this.score = 0;

        getTile(this.position.x, this.position.y).ant_number++;

        this.brain = new Brain();
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
    
    sample() {
        const forward_vector = this.direction;
        // ROTATION_270 effectively rotates by -90 degrees for a right-hand vector
        const right_vector = ROTATION_270.transform(this.direction); 

        for (let i = 0; i < 3; i++) { // Corresponds to sample matrix row index
            for (let j = 0; j < 5; j++) { // Corresponds to sample matrix col index
                const lx = i - 1;
                const ly = j - 1;

                const world_offset_x = right_vector.x * lx + forward_vector.x * ly;
                const world_offset_y = right_vector.y * lx + forward_vector.y * ly;

                const tile_to_sample_x = this.position.x + world_offset_x;
                const tile_to_sample_y = this.position.y + world_offset_y;

                const tile = getTile(tile_to_sample_x, tile_to_sample_y);
                this.samples[0].data[i][j] = tile.chemicalRGB[0] / 255;
                this.samples[1].data[i][j] = tile.chemicalRGB[1] / 255;
                this.samples[2].data[i][j] = tile.chemicalRGB[2] / 255;
                this.samples[3].data[i][j] = tile.food_channel / 255;
            }
        }
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

        if(next_tile !== VOIDTILE) {
            const posX = this.position.x;
            const posY = this.position.y;
            getTile(posX, posY).ant_number--;
            this.position = next_position;
            this.direction = next_direction;
            getTile(this.position.x, this.position.y).ant_number++;
        } else {
            // DO NOTHING
        }
    }

    reachForFood(tile) {
        if(tile.food_channel > 0 && this.food_carried < 255) {
            const FoodThatCanBePickedUp = Math.min(100, tile.food_channel / tile.ant_number);
            this.food_carried += FoodThatCanBePickedUp;
            tile.removeFood(FoodThatCanBePickedUp);
        }
    }

    home_beavieur() {
        if(this.food_carried > 0) {
            if(this.food_carried > foodToReproduce) {
                this.score += this.food_carried;
                for(let i = 0; i < Math.floor(this.food_carried / foodToReproduce); i++) {
                    this.hill.makeOffspring(this.index);
                    this.food_carried -= foodToReproduce;
                }
            }
        }
    }

    turn_back() {
        this.direction = ROTATION_180.transform(this.direction);
    }

    turn_left() {
        this.direction = ROTATION_270.transform(this.direction);
    }

    turn_right() {
        this.direction = ROTATION_90.transform(this.direction);
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
            this.position.x === this.hill.position.x && this.position.y === this.hill.position.y ? 1 : 0,
            this.food_carried / 255,
            this.energy / startingEnergy
        ];

        // Add noise to the input vector
        for (let i = 0; i < INPUTS.length; i++) {
            INPUTS[i] += (Math.random() * 2 - 1) * NOISE_IN_MULTIPLIER;
        }
        this.sample();
        const OUTPUT = this.brain.feedForward(this.samples, INPUTS);

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
            this.move("left");
        } else if(maxIndex === 1) {
            this.move("forwards");
        } else if(maxIndex === 2) {
            this.move("right");
        } else if(maxIndex === 3) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            tile.addChemical(0, chemical_quantity);
        } else if(maxIndex === 4) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            tile.addChemical(1, chemical_quantity);
        } else if(maxIndex === 5) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            tile.addChemical(2, chemical_quantity);
        } else if(maxIndex === 6) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            leftTile.addChemical(0, chemical_quantity);
        } else if(maxIndex === 7) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            leftTile.addChemical(1, chemical_quantity);
        } else if(maxIndex === 8) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            leftTile.addChemical(2, chemical_quantity);
        } else if(maxIndex === 9) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            rightTile.addChemical(0, chemical_quantity);
        } else if(maxIndex === 10) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            rightTile.addChemical(1, chemical_quantity);
        } else if(maxIndex === 11) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            rightTile.addChemical(2, chemical_quantity);
        } else if(maxIndex === 12) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            frontTile.addChemical(0, chemical_quantity);
        } else if(maxIndex === 13) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            frontTile.addChemical(1, chemical_quantity);
        } else if(maxIndex === 14) {
            let activation_strength = OUTPUT[maxIndex];
            let chemical_quantity = Math.max(0, activation_strength) * 255;
            frontTile.addChemical(2, chemical_quantity);
        } else if(maxIndex === 15) {
            this.turn_back();
        } else if(maxIndex === 16) {
            this.turn_left();
        } else if(maxIndex === 17) {
            this.turn_right();
        } else if(maxIndex === 18) {
            // DO NOTHING
        }
        this.removeEnergy(metabolism);
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
        tile.addFood(this.food_carried);
        tile.ant_number--;
        this.hill.processDeath(this.index);
    }
}

let colonyLife = 2000;
let generations = 1;
let initialPopulation = 20;

const VOIDANT = {
    alive: false,
    step: function() {},
};

class Colony {
    position;
    age;

    ants;
    livingAnts;
    bestGenes;
    bestScore;
    constructor(x, y, queenGenes = "random") {
        this.position = new Vector2D(x, y);
        this.age = 0;

        this.ants = new Array(MAX_ANTS).fill(VOIDANT);
        this.ants[0] = new Ant(this, 0);
        if(queenGenes !== "random") {
            this.ants[0].brain.parseParameters(queenGenes);
        }
        this.livingAnts = 1;
        for(let i = 0; i < initialPopulation - 1; i++) {
            this.makeOffspring(0);
        }
        this.bestScore = 0;
        this.bestGenes = this.ants[0].brain.getParameters();
    }

    step() {
        this.age++;
        for(let i = 0; i < this.ants.length; i++) {
            this.ants[i].step();
        }
    }

    getFreeIndex() {
        for(let i = 0; i < this.ants.length; i++) {
            if(this.ants[i].alive === false) { return i; }
        }
        return -1;
    }

    processDeath(index) {
        this.livingAnts--;
        const score = this.ants[index].score;
        if(score > this.bestScore) {
            this.bestScore = score;
            this.bestGenes = getMutatedBrainParameters(this.ants[index].brain);
        }
        this.ants[index] = VOIDANT;
    }

    makeOffspring(index) {
        this.livingAnts++;
        const newIndex = this.getFreeIndex();
        if(newIndex === -1) {
            console.error("population overflow");
            return;
        }
        let result = new Ant(this, newIndex);
        const mother = this.ants[index];
        result.brain.parseParameters(getMutatedBrainParameters(mother.brain));
        this.ants[newIndex] = result;
    }

    createChildColony() {
        return new Colony(this.position.x, this.position.y, this.bestGenes);
    }
}