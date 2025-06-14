const visualSquares = [];
let cameraX = 0;
let cameraY = 0;
let readyToRender = false;

let render_ants = false;

let render_mode = "normal";

const CAMERA_RADIUS = 10;       // Due to grid size. Pay attention if changing

let observedIndex = 0;

function centerText(text, color) {
    visualSquares[220].style.color = color;
    visualSquares[220].innerText = text;
}

function grayscale(t) {
    for(let i = 0; i < visualSquares.length; i++) {
        const visualSquare = visualSquares[i];
        const x = i % 21;
        const y = Math.floor(i / 21);
        const gray = (x + y + t) * 10 % 255;
        visualSquare.style.backgroundColor = "rgb(" + String(gray) + "," + String(gray) + "," + String(gray) + ")"
    }
}

function render(world) {
    population.update();
    for (let i = -CAMERA_RADIUS; i <= CAMERA_RADIUS; i++) {
        for (let j = -CAMERA_RADIUS; j <= CAMERA_RADIUS; j++) {
            const visualSquare = visualSquares[(CAMERA_RADIUS + i) * (CAMERA_RADIUS * 2 + 1) + j + CAMERA_RADIUS];

            visualSquare.style.backgroundColor = 'white';
            visualSquare.style.backgroundImage = 'none';

            if(i === 0 && j === 0) {
                visualSquare.style.backgroundColor = 'red';
                continue;
            }

            const world_render_x = cameraX + j;
            const world_render_y = cameraY - i;     // Show Up up and Down down
            const square = world.getTile(world_render_x, world_render_y);
            if(square) {
                let color;
                if(render_mode == "normal") {
                    color = square.render();
                }
                if(render_mode == "chemical") {
                    color = square.render_chemical();
                }
                if(render_mode == "food") {
                    color = square.render_food();
                }
                visualSquare.style.backgroundColor = color;
            }
        }
    }
}