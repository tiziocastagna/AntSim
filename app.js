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

let showAnts = true;

window.onload = function() {
    showTickSpeed = document.getElementById("tickspeed");
    showSettings = document.getElementById("settings");
    population = document.getElementById("population");
    play_button = document.getElementById("play_stop_button");

    let fade = document.getElementById("fading_speed");
    fade.value = FADING_CONSTANT;
    fade.onchange = function() {
        if(parseFloat(fade.value) !== NaN && parseFloat(fade.value) >= 0) {
            FADING_CONSTANT = parseFloat(fade.value);
        } else {
            fade.value = FADING_CONSTANT;
        }
    };

    let diffuse_check = document.getElementById("diffuse");
    diffuse_check.checked = diffuse;
    diffuse_check.onchange = function() {
        diffuse = diffuse_check.checked;
    };

    let show_ants_box = document.getElementById("show_ants");
    show_ants_box.checked = true;
    show_ants_box.onchange = function() {
        showAnts = show_ants_box.checked;
        update();
    };


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

    let initialen = document.getElementById("initial_energy");
    initialen.value = startingEnergy;
    initialen.onchange = function() {
        if(parseInt(initialen.value) !== NaN && parseInt(initialen.value) >= 0) {
            startingEnergy = parseInt(initialen.value);
        } else {
            initialen.value = startingEnergy;
        }
    };

    let maxf = document.getElementById("max_food");
    maxf.value = maxFood;
    maxf.onchange = function() {
        if(parseFloat(maxf.value) !== NaN && parseFloat(maxf.value) >= 0) {
            maxFood = parseFloat(maxf.value);
        } else {
            maxf.value = maxFood;
        }
    };

    let ref = document.getElementById("food_refill");
    ref.value = foodRefill;
    ref.onchange = function() {
        if(parseFloat(ref.value) !== NaN && parseFloat(ref.value) >= 0) {
            foodRefill = parseFloat(ref.value);
        } else {
            ref.value = foodRefill;
        }
    };

    let reproduceFood = document.getElementById("food_to_reproduce");
    reproduceFood.value = foodToReproduce;
    reproduceFood.onchange = function() {
        if(parseInt(reproduceFood.value) !== NaN && parseInt(reproduceFood.value) >= 0) {
            foodToReproduce = parseInt(reproduceFood.value);
        } else {
            reproduceFood.value = foodToReproduce;
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