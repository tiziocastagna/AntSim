let settingsMenu;

document.addEventListener('DOMContentLoaded', function() {
    settingsMenu = document.getElementById("settings");
    setUpButtons();
    const gridContainer = document.getElementById('game_grid');
    setUpCamera(gridContainer);
    setUpSimulations();
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

let showTickSpeed;
let showSettings;

let play_button;

let generations_element;

let showAnts = true;

window.onload = function() {
    showTickSpeed = document.getElementById("tickspeed");
    showSettings = document.getElementById("settings");
    play_button = document.getElementById("play_stop_button");
    generations_element = document.getElementById("generation");
    
    generations_element.innerHTML = "GENERATION: " + generations;

    let show_ants_box = document.getElementById("show_ants");
    show_ants_box.checked = true;
    show_ants_box.onchange = function() {
        showAnts = show_ants_box.checked;
        update();
    };
    
    update();
}

function updateTickSpeedLable() {
    showTickSpeed.innerHTML = "APX. TICKSPEED: ";
    tickspeed <= 1 ? showTickSpeed.innerHTML += "MAX" : showTickSpeed.innerHTML += Math.ceil(tickspeed);
}

function play_stop() {
    play_button.innerHTML === "▶" ? play_button.innerHTML = "❚❚" : play_button.innerHTML = "▶";
    toggle_play();
}

function play_backwards() {
    speed_down();
}

function play_forwards() {
    speed_up();
}

function toggle_xray() {
    render_mode === "normal" ? render_mode = "chemical" : render_mode = "normal";
    update();
}

function settings_button() {
    showSettings.style.display === "" ? showSettings.style.display = "block" : showSettings.style.display = "";
}