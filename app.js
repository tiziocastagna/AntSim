document.addEventListener('DOMContentLoaded', function() {
    const gridContainer = document.getElementById('game_grid');
    setUpWorld(gridContainer);
});

document.addEventListener('keydown', function(event) {
    if(event.key === 'w') {
        moveUp();
    } else if(event.key === 's') {
        moveDown();
    } else if(event.key === 'a') {
        moveLeft();
    } else if(event.key === 'd') {
        moveRight();
    }
});

function play_stop() {
    toggle_play();
}

function play_backwards() {
    speed_down();
}

function play_forwards() {
    speed_up();
}