const LEFT_WIDTH = 5;
const RIGHT_WIDTH = 15;
const UP_HEIGHT = 15;
const DOWN_HEIGHT = 5;

let colony;

function setUpWorld(gridContainer) {
    for(let i = -CAMERA_RADIUS; i <= CAMERA_RADIUS; i++) {
        for(let l = -CAMERA_RADIUS; l <= CAMERA_RADIUS; l++) {
                const visualSquare = document.createElement('div');
                visualSquares.push(visualSquare);
                gridContainer.appendChild(visualSquare);
        }
    }

    for(let i = -DOWN_HEIGHT; i <= UP_HEIGHT; i++) {
        let row = []
        for(let j = -LEFT_WIDTH; j <= RIGHT_WIDTH; j++) {
            row.push(new Tile(j, i));
        }
        tiles.push(row);
    }

    spawnReward();
    colony = new Colony(0, 0);

    


    readyToRender = true;
    update();
}

function spawnReward() {
    // const randomX_Y = getRandomX_Y();
    createFoodPile(7, 7, 3);
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
    let energySum = 0;
    for(let ant of colony.ants) {
        ant.step();
        energySum += ant.energy;
    }
    update();
    if(ticks % 10 === 0) { updateTiles(); }
    if(ticks % 1000 === 0) {
        colony.removeCorps();
    }
    ticks++;
    // Restart
    if(energySum < 0.1) { restart(); }
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
    }
}

function speed_up() {
    if(interval) {
        tickspeed *= 0.9;
        clearInterval(interval);
        interval = setInterval(tick, tickspeed);
    }
}

function speed_down() {
    if(interval) {
        tickspeed *= 1.1;
        clearInterval(interval);
        interval = setInterval(tick, tickspeed);
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
    spawnReward();
    colony = new Colony(0, 0);
}

function toggle_showFood() {
    render_mode === "food" ? render_mode = "normal" : render_mode = "food";
}