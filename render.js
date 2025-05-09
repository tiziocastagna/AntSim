const visualSquares = [];
let cameraX = 0;
let cameraY = 0;
let readyToRender = false;

let render_mode = "normal"

const CAMERA_RADIUS = 10

function updateCamera() {
    cameraX = playerX;
    cameraY = playerY;
}

function render_normal() {
    updateCamera();
    for (let i = 0; i < CAMERA_RADIUS * 2 + 1; i++) {
        for (let j = 0; j < CAMERA_RADIUS * 2 + 1; j++) {
            const visualSquare = visualSquares[i * (CAMERA_RADIUS * 2 + 1) + j];

            visualSquare.style.backgroundColor = 'white';
            visualSquare.style.backgroundImage = 'none';

            const isPlayer = i === CAMERA_RADIUS + playerX - cameraX && j === CAMERA_RADIUS + playerY - cameraY;
            if(isPlayer) {
                visualSquare.style.backgroundColor = 'red';
                continue;
            }

            const square = getTile(j + cameraX - CAMERA_RADIUS, i + cameraY - CAMERA_RADIUS);
            if(square) {
                visualSquare.style.backgroundColor = square.render();
            }
        }
    }
}

function render_chemical() {
    updateCamera();
    for (let i = 0; i < CAMERA_RADIUS * 2 + 1; i++) {
        for (let j = 0; j < CAMERA_RADIUS * 2 + 1; j++) {
            const visualSquare = visualSquares[i * (CAMERA_RADIUS * 2 + 1) + j];

            visualSquare.style.backgroundColor = 'white';
            visualSquare.style.backgroundImage = 'none';

            const isPlayer = i === CAMERA_RADIUS + playerX - cameraX && j === CAMERA_RADIUS + playerY - cameraY;
            if(isPlayer) {
                visualSquare.style.backgroundColor = 'red';
                continue;
            }

            const square = getTile(j + cameraX - CAMERA_RADIUS, i + cameraY - CAMERA_RADIUS);
            if(square) {
                visualSquare.style.backgroundColor = square.render_chemical();
            }
        }
    } 
}

function render() {
    if(render_mode == "normal") {
        render_normal();
    }
    if(render_mode == "chemical") {
        render_chemical();
    }
}