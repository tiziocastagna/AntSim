let playerX = 0;
let playerY = 0;

const LEFT_WIDTH = 100
const RIGHT_WIDTH = 100
const UP_HEIGHT = 50
const DOWN_HEIGHT = 50

// Ant Spawning Parameters
const SPAWN_RADIUS = 20;         // Radius within which ants are most likely to spawn
const MAX_SPAWN_PROB = 0.1;      // Max probability of spawning at the exact center (0,0) - Tunable
const SPAWN_PROB_POWER = 3;      // How quickly probability drops off with distance (higher = faster drop)

function setUpWorld(gridContainer) {
    for(let i = -DOWN_HEIGHT; i < UP_HEIGHT; i++) {
        for(let j = -LEFT_WIDTH / 2; j < RIGHT_WIDTH / 2; j++) {
            if(i > -CAMERA_RADIUS - 1 && j > -CAMERA_RADIUS - 1 && i < CAMERA_RADIUS + 1 && j < CAMERA_RADIUS + 1) {
                const visualSquare = document.createElement('div');
                visualSquares.push(visualSquare);
                gridContainer.appendChild(visualSquare);
            }

            tiles.push(new Tile(j, i));

            // Spawn ants probabilistically, concentrated near the center (0,0)
            const distance_from_center = Math.sqrt(j * j + i * i);
            
            // Only consider spawning within the defined radius
            if (distance_from_center < SPAWN_RADIUS) {
                // Probability decreases from MAX_SPAWN_PROB at center to 0 at SPAWN_RADIUS edge
                const spawn_prob = MAX_SPAWN_PROB * Math.pow(1 - distance_from_center / SPAWN_RADIUS, SPAWN_PROB_POWER);
                if (Math.random() < spawn_prob) {
                    ants.push(new Ant(j, i, [0, 0]));
                }
            }
        }
    }
    readyToRender = true;
    update();
}


function update() {
    if(readyToRender === true) {
        render();
    }
}

function moveUp() {
    playerY--;
    update();
}

function moveDown() {
    playerY++;
    update();
}

function moveLeft() {
    playerX--;
    update();
}

function moveRight() {
    playerX++;
    update();
}

function tick() {
    for(let ant of ants) {
        ant.explore();
    }
    update();
}

let tickspeed = 100;
let interval;

function toggle_play() {
    if(interval) {
        clearInterval(interval);
        interval = null;
        render_mode = "normal";
        update();
    } else {
        render_mode = "chemical";
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