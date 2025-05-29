class MutbleHypervalue {
    constructor(lable, type, defaultValue) {
        this.div = document.createElement("div");
        settingsMenu.appendChild(this.div);
        this.div.innerHTML = lable + ": ";
        this.input = document.createElement("input");
        this.div.appendChild(this.input);
        this.value = defaultValue;
        this.input.value = this.value.toString();

        this.input.onchange = (event) => {
            const inputValueString = event.target.value;
            let parsedValue;

            if(type === "float") {
                parsedValue = parseFloat(inputValueString);
            } else if (type === "int") {
                parsedValue = parseInt(inputValueString, 10);
            } else {
                console.error("Unsupported type for MutbleHypervalue:", type);
                event.target.value = this.value.toString();
                return;
            }

            if(!isNaN(parsedValue) && parsedValue >= 0) {
                this.value = parsedValue;
            } else {
                event.target.value = this.value.toString();
            }
        };
    }
}

class Stat {
    constructor(lable, defaultValue) {
        this.lable = lable;
        this.div = document.createElement("div");
        settingsMenu.appendChild(this.div);
        this.div.innerHTML = lable + ": " + defaultValue;
    }
    update(value) {
        this.div.innerHTML = this.lable + ": " + value;
    }
}

let fadingCoefficent;
let initialPopulation;
let maxPopulation;
let population;
let colonyLife;
let initialEnergy;
let initialFood;
let maxFood;
let foodRefill;
let foodToReproduce;
let mutationStrength;
let mutationChance;
let noiseIn;
let noiseOut;

function setUpButtons() {
    fadingCoefficent = new MutbleHypervalue("FADING COEFFICENT", "float", 0.9);
    initialPopulation = new MutbleHypervalue("INITIAL POPULATION", "int", 5);
    maxPopulation = new MutbleHypervalue("MAX POPULATION", "int", 100);
    population = new Stat("POPULATION", initialPopulation.value);
    colonyLife = new MutbleHypervalue("COLONY LIFE", "int", 2000);
    initialEnergy = new MutbleHypervalue("INITIAL ENERGY", "int", 500);
    initialFood = new MutbleHypervalue("INITIAL FOOD", "int", 30);
    maxFood = new MutbleHypervalue("MAX FOOD", "int", 50);
    foodRefill = new MutbleHypervalue("FOOD REFILL", "int", 4);
    foodToReproduce = new MutbleHypervalue("FOOD TO REPRODUCE", "int", 70);
    mutationStrength = new MutbleHypervalue("MUTATION STRENGTH", "float", 0.1);
    mutationChance = new MutbleHypervalue("MUTATION CHANCE", "float", 0.01);
    noiseIn = new MutbleHypervalue("NOISE IN", "float", 0);
    noiseOut = new MutbleHypervalue("NOISE OUT", "float", 0);
}