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



let metabolism = 1;

// TODO: implemet a more elegant solution with tensors
class Brain {
    constructor() {
        this.redConvolutionalLayer = new Clayer(3, 1);
        this.greenConvolutionalLayer = new Clayer(3, 1);
        this.blueConvolutionalLayer = new Clayer(3, 1);
        this.foodConvolutionalLayer = new Clayer(3, 1);
        this.spacialProcesser = new CrossNetwork([
            {type: "normal", input_size: 60, output_size: 16},
        ]);
        this.network = new CrossNetwork([
            {type: "normal", input_size: 16 + 3, output_size: 9}
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
        if(Math.random() < mutationChance.value) {
            parameters[i] += (Math.random() * 2 - 1) * mutationStrength.value;
        }
    }
    return parameters;
}

class Ant {
    position;
    colony;
    world;
    index;
    direction;

    samples;

    food_carried;
    energy;
    alive;
    constructor(colony, index, world) {
        this.index = index;
        this.colony = colony;
        this.world = world;
        this.position = new Vector2D(colony.position.x, this.colony.position.y);
        this.direction = getRandomDirection();

        this.samples = [];
        for (let i = 0; i < 4; i++) {
            this.samples.push(new Matrix(3, 5)); // Assuming Matrix(rows, cols)
        }

        this.food_carried = 0;
        this.energy = initialEnergy.value;
        this.alive = true;

        world.getTile(this.position.x, this.position.y).ant_number++;

        this.brain = colony.brain;
    }
    getLeftTile() {
        const position = vector2Daddtion(this.position, ROTATION_270.transform(this.direction));
        return this.world.getTile(position.x, position.y);
    }
    getRightTile() {
        const position = vector2Daddtion(this.position, ROTATION_90.transform(this.direction));
        return this.world.getTile(position.x, position.y);
    }
    getFrontTile() {
        const position = vector2Daddtion(this.position, this.direction);
        return this.world.getTile(position.x, position.y);
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

                const tile = this.world.getTile(tile_to_sample_x, tile_to_sample_y);
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
            console.error("invalid direction");
            return;
        }

        const next_position = vector2Daddtion(this.position, next_direction);
        const next_tile = this.world.getTile(next_position.x, next_position.y);

        if(next_tile !== VOIDTILE) {
            const posX = this.position.x;
            const posY = this.position.y;
            this.world.getTile(posX, posY).ant_number--;
            this.position = next_position;
            this.direction = next_direction;
            this.world.getTile(this.position.x, this.position.y).ant_number++;
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
            if(this.food_carried > foodToReproduce.value) {
                for(let i = 0; i < Math.floor(this.food_carried / foodToReproduce.value); i++) {
                    this.colony.makeOffspring();
                    this.food_carried -= foodToReproduce.value;
                    this.colony.gatheredFood += foodToReproduce.value;
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
        const tile = this.world.getTile(this.position.x, this.position.y);
        const frontTile = this.getFrontTile();
        const leftTile = this.getLeftTile();
        const rightTile = this.getRightTile();

        if(this.position.x === this.colony.position.x && this.position.y === this.colony.position.y) { this.home_beavieur(); }
        this.reachForFood(tile);

        const INPUTS = [
            this.position.x === this.colony.position.x && this.position.y === this.colony.position.y ? 1 : 0,
            this.food_carried / 255,
            this.energy / initialEnergy.value
        ];

        // Add noise to the input vector
        for (let i = 0; i < INPUTS.length; i++) {
            INPUTS[i] += (Math.random() * 2 - 1) * noiseIn.value;
        }
        this.sample();
        const OUTPUT = this.brain.feedForward(this.samples, INPUTS);

        // Add noise to the output vector
        for (let i = 0; i < OUTPUT.length; i++) {
            OUTPUT[i] += (Math.random() * 2 - 1) * noiseOut.value;
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
            this.turn_back();
        } else if(maxIndex === 7) {
            this.turn_left();
        } else if(maxIndex === 8) {
            this.turn_right();
        } else if(maxIndex === 9) {
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
        const tile = this.world.getTile(this.position.x, this.position.y);
        tile.addFood(this.food_carried);
        tile.ant_number--;
        this.colony.processDeath(this.index);
    }
}

let generations = 1;

const VOIDANT = {
    alive: false,
    step: function() {},
};

class Colony {
    world;
    position;
    age;

    ants;
    brain;
    livingAnts;

    gatheredFood;
    constructor(x, y, world, queenGenes = "random") {
        this.world = world;
        this.position = new Vector2D(x, y);
        this.age = 0;

        this.brain = new Brain();
        if(queenGenes !== "random") {
            this.brain.parseParameters(queenGenes);
        }

        this.gatheredFood = 0;

        this.ants = new Array(maxPopulation.value).fill(VOIDANT);
        
        this.livingAnts = initialPopulation.value;
        for(let i = 0; i < initialPopulation.value; i++) {
            this.ants[i] = new Ant(this, i, world);
        }
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
        this.ants[index] = VOIDANT;
    }

    makeOffspring() {
        this.livingAnts++;
        const newIndex = this.getFreeIndex();
        if(newIndex === -1) {
            console.error("population overflow");
            return;
        }
        this.ants[newIndex] = new Ant(this, newIndex, this.world);
    }

    createChildColony() {
        return new Colony(this.position.x, this.position.y, this.world, getMutatedBrainParameters(this.brain));
    }
}