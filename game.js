let LEFT_WIDTH = 20;
let RIGHT_WIDTH = 20;
let UP_HEIGHT = 20;
let DOWN_HEIGHT = 20;

let sims = [];
let MAX_ANTS = 100;

function setUpCamera(gridContainer) {
    for(let i = -CAMERA_RADIUS; i <= CAMERA_RADIUS; i++) {
        for(let l = -CAMERA_RADIUS; l <= CAMERA_RADIUS; l++) {
            const visualSquare = document.createElement('div');
            visualSquares.push(visualSquare);
            gridContainer.appendChild(visualSquare);
        }
    }
}

function setUpSimulations() {
    for(let i = 0; i < concurrentSimulations.value; i++) {
        sims.push(new Simulation());
    }
}

function update() {
    render(sims[observedIndex].world);
}

function moveUp() {
    cameraY++;
    update();
}

function moveDown() {
    cameraY--;
    update();
}

function moveLeft() {
    cameraX--;
    update();
}

function moveRight() {
    cameraX++;
    update();
}

let ticks = 1;

function tick() {
    for(let i = 0; i < concurrentSimulations.value; i++) {
        sims[i].tick();
    }
    if(ticks % colonyLife.value === 0) {
        evolveSimulations();
    }
    render(sims[observedIndex].world);
    ticks++;
}

let tickspeed = 100;
let interval;

function toggle_play() {
    if(interval) {
        clearInterval(interval);
        interval = null;
        update();
    } else {
        interval = setInterval(tick, tickspeed);
        updateTickSpeedLable();
    }
}

function speed_up() {
    if(interval) {
        if(tickspeed * 0.9 < 1) {
            tickspeed = 1;
            return;
        } else if(tickspeed * 0.9 <= 10) {
            tickspeed -= 1;
        } else if(tickspeed ) {
            tickspeed *= 0.9;
        }
        clearInterval(interval);
        interval = setInterval(tick, tickspeed);
        updateTickSpeedLable();
    }
}

function speed_down() {
    if(interval) {
        tickspeed *= 1.1;
        clearInterval(interval);
        interval = setInterval(tick, tickspeed);
        updateTickSpeedLable();
    }
}

function toggle_showFood() {
    render_mode != "food" ? render_mode = "food" : render_mode = "normal";
    update();   
}

function changeWorldUp() {
    const input = document.getElementById("up");
    if(parseInt(input.value) !== NaN && parseInt(input.value) >= 0) {
        UP_HEIGHT = parseInt(input.value);
        buildTiles();
        update();
    } else {
        input.value = UP_HEIGHT;
    }
}

function changeWorldDown() {
    const input = document.getElementById("down");
    if(parseInt(input.value) !== NaN && parseInt(input.value) >= 0) {
        DOWN_HEIGHT = parseInt(input.value);
        buildTiles();
        update();
    } else {
        input.value = DOWN_HEIGHT;
    }
}

function changeWorldLeft() {
    const input = document.getElementById("left");
    if(parseInt(input.value) !== NaN && parseInt(input.value) >= 0) {
        LEFT_WIDTH = parseInt(input.value);
        buildTiles();
        update();
    } else {
        input.value = LEFT_WIDTH;
    }
}

function changeWorldRight() {
    const input = document.getElementById("right");
    if(parseInt(input.value) !== NaN && parseInt(input.value) >= 0) {
        RIGHT_WIDTH = parseInt(input.value);
        buildTiles();
        update();   
    } else {
        input.value = RIGHT_WIDTH;
    }
}


class Simulation {
    colony;
    world;

    ticks;
    constructor() {
        this.ticks = 0;
        this.world = new World();
        this.colony = new Colony(0, 0, this.world);
    }
    tick() {
        for(let ant of this.colony.ants) {
            ant.step();
        }
        if(ticks % 10 === 0) {
            this.world.fade();
        }
        this.ticks++;

        if(this.colony.livingAnts === 0) { this.restart(); }    
    }
    restart() {
        this.world.blank();
        this.colony = new Colony(0, 0, this.world);
    }
}

function evolveSimulations() {
    let bestIndex = 0;
    let bestFitness = 0;
    for(let i = 0; i < sims.length; i++) {
        let sim = sims[i];
        fitness = sim.colony.gatheredFood;
        if(fitness > bestFitness) {
            bestFitness = fitness;
            bestIndex = i;
        };
    }
    observedIndex = bestIndex;
    console.log("New Generation, Best Fitness: " + bestFitness);
    generations++;
    generations_element.innerHTML = "GENERATION: " + generations;
    let bestBrain = sims[bestIndex].colony.brain;
    for(let i = 0; i < concurrentSimulations.value; i++) {
        sims[i] = new Simulation();
        if(i !== bestIndex) {
            sims[i].colony.brain.parseParameters(getMutatedBrainParameters(bestBrain));
        } else {
            sims[i].colony.brain.parseParameters(bestBrain.getParameters());
        }
    }
}