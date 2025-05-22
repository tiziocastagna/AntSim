let LEFT_WIDTH = 50;
let RIGHT_WIDTH = 50;
let UP_HEIGHT = 50;
let DOWN_HEIGHT = 50;

let colony;
let MAX_ANTS = 1000;

function setUpWorld(gridContainer) {
    for(let i = -CAMERA_RADIUS; i <= CAMERA_RADIUS; i++) {
        for(let l = -CAMERA_RADIUS; l <= CAMERA_RADIUS; l++) {
                const visualSquare = document.createElement('div');
                visualSquares.push(visualSquare);
                gridContainer.appendChild(visualSquare);
        }
    }

    buildTiles();

    colony = new Colony(0, 0);

    readyToRender = true;
    update();
}

function buildTiles() {
    tiles = [];
    for(let i = -DOWN_HEIGHT; i <= UP_HEIGHT; i++) {
        let row = []
        for(let j = -LEFT_WIDTH; j <= RIGHT_WIDTH; j++) {
            row.push(new Tile(j, i));
        }
        tiles.push(row);
    }
}

function update() {
    if(readyToRender === true) {
        render();
    }
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

let ticks = 0;

function tick() {
    for(let ant of colony.ants) {
        ant.step();
    }
    if(ticks % 10 === 0) {
        diffuse ? updateTiles() : only_fade();
        population.innerHTML = "POPULATION: " + colony.livingAnts;
    }
    update();
    ticks++;
    // Restart
    if(colony.livingAnts === 0) { restart(); }
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

function restart() {
    console.log("restart!!");
    for(let ant of colony.ants) {
        if(ant.alive) {
            ant.die();
        }
    }
    for(let i = 0; i < tiles.length; i++) {
        for(let l = 0; l < tiles[i].length; l++) {
            tiles[i][l].chemicalRGB = [0, 0, 0];
            tiles[i][l].food_channel = 0;
        }
    }
    colony = new Colony(0, 0);
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


// NOT YET IMPLEMENTED
class Simulation {
    colony;
    constructor() {
        this.colony = new Colony(0, 0);
    }
    tick() {
        for(let ant of this.colony.ants) {
            ant.step();
        }
    }
}