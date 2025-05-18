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

let showTickSpeed;
let showSettings;

let play_button;

let population;

window.onload = function() {
    showTickSpeed = document.getElementById("tickspeed");
    showSettings = document.getElementById("settings");
    population = document.getElementById("population");
    play_button = document.getElementById("play_stop_button");


    population.innerHTML = "POPULATION: " + colony.livingAnts;
    
    let initialPop = document.getElementById("initial_population");
    initialPop.value = initialPopulation;
    initialPop.onchange = function() {
        if(parseInt(initialPop.value) !== NaN && parseInt(initialPop.value) >= 0) {
            initialPopulation = parseInt(initialPop.value);
        } else {
            initialPop.value = initialPopulation;
        }
    };


    let maxPopulation = document.getElementById("max_population");
    maxPopulation.value = MAX_ANTS;
    maxPopulation.onchange = function() {
        if(parseInt(maxPopulation.value) !== NaN && parseInt(maxPopulation.value) >= 0) {
            MAX_ANTS = parseInt(maxPopulation.value);
        } else {
            maxPopulation.value = MAX_ANTS;
        }
    };


    let mc = document.getElementById("mutation_chance");
    mc.value = MUTATION_CHANCE;
    mc.onchange = function() {
        if(parseFloat(mc.value) !== NaN && parseFloat(mc.value) >= 0) {
            MUTATION_CHANCE = parseFloat(mc.value);
        } else {
            mc.value = MUTATION_CHANCE;
        }
    };

    let ms = document.getElementById("mutation_strength");
    ms.value = MUTATION_STRENGTH;
    ms.onchange = function() {
        if(parseFloat(ms.value) !== NaN && parseFloat(ms.value) >= 0) {
            MUTATION_STRENGTH = parseFloat(ms.value);
        } else {
            ms.value = MUTATION_STRENGTH;
        }
    };

    const NOISE_IN = document.getElementById("noise_in");
    const NOISE_OUT = document.getElementById("noise_out");
    NOISE_IN.value = NOISE_IN_MULTIPLIER;
    NOISE_OUT.value = NOISE_OUT_MULTIPLIER;
    NOISE_IN.onchange = function() {
        if(parseFloat(NOISE_IN.value) !== NaN && parseFloat(NOISE_IN.value) >= 0) {
            NOISE_IN_MULTIPLIER = parseFloat(NOISE_IN.value);
        } else {
            NOISE_IN.value = NOISE_IN_MULTIPLIER;
        }
    };
    NOISE_OUT.onchange = function() {
        if(parseFloat(NOISE_OUT.value) !== NaN && parseFloat(NOISE_OUT.value) >= 0) {
            NOISE_IN_MULTIPLIER = parseFloat(NOISE_OUT.value);
        } else {
            NOISE_OUT.value = NOISE_IN_MULTIPLIER;
        }
    };
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