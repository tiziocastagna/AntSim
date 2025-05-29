function popcount(n) {
    n = n - ((n >>> 1) & 0x55555555);
    n = (n & 0x33333333) + ((n >>> 2) & 0x33333333);
    return (((n + (n >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}

function decimalToBitArray(n, bitLength) {
    return temp = n
     .toString(2)
     .padStart(bitLength, '0')
     .split('')
     .map(bit => parseInt(bit, 10));
}

class Bvector {
    content;
    bits;
    constructor(bits) {
        this.bits = bits;
        if(bits > 31) { console.error("youre FUKEDDDDDDDDDDDDDDDDDD"); }
        this.content = Math.floor(Math.random() * (1 << bits));
    }
    dot(vect) {
        return popcount(this.content & vect.content);
    }
    set(values) {
        if(values.length !== this.bits) { console.error("youre FUKEDDDDDDDDDDDDDDDDDD"); }
        this.content = 0; // Reset content before setting new values
        for(let i = 0; i < values.length; i++) {
            this.content += values[i] * 2 ** (this.bits - i - 1);
        }
    }
    // returns array with 0s and 1s
    getArray() {
        return decimalToBitArray(this.content, this.bits);
    }
}

function convertVectorToBvector(vect) {
    let result = new Bvector(vect.length);
    let array = new Array(vect.length);
    for(let i = 0; i < vect.length; i++) {
        array[i] = vect[i] > 0 ? true : false;
    }
    result.set(array);
    return result;
}

class Blayer {
    constructor(input_size, output_size) {
        this.rows = output_size;
        this.cols = input_size;
        this.weights = Array(this.rows);
        for(let i = 0; i < this.rows; i++) {
            this.weights[i] = new Bvector(this.cols);
        }
    }
    feedForward(vect) {
        vect = convertVectorToBvector(vect);
        let result = [];
        for(let i = 0; i < this.rows; i++) {
            result.push(this.weights[i].dot(vect) > 0 ? 1 : -1);
        }
        return result;
    }
}

class CrossNetwork {
    constructor(structure) {
        this.layers = [];
        this.layerTypes = [];
        for(let i = 0; i < structure.length; i++) {
            const layerInfo = structure[i];
            this.layerTypes.push(layerInfo.type);
            if(layerInfo.type === "Blayer") {
                this.layers.push(new Blayer(layerInfo.input_size, layerInfo.output_size));
            } else {
                this.layers.push(new Layer(layerInfo.input_size, layerInfo.output_size));
            }
        }
    }
    feedForward(inputArray) {
        let currentOutputArray = inputArray;
        for(let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            currentOutputArray = layer.feedForward(currentOutputArray);
        }
        return currentOutputArray;
    }
    getParameters() {
        let parameters = [];
        for(let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if(this.layerTypes[i] === "Blayer") {
                for(let j = 0; j < layer.weights.length; j++) {
                    parameters.push(layer.weights[j].getArray());
                }
            } else if(this.layerTypes[i] === "normal") {
                // Add all weight values
                for (let i = 0; i < layer.weights.rows; i++) {
                    for (let j = 0; j < layer.weights.cols; j++) {
                        parameters.push(layer.weights.data[i][j]);
                    }
                }
                // Add all bias values
                parameters = parameters.concat(layer.biases);
            }
        }
        return parameters;
    }
    parseParameters(parameters) {
        let index = 0;
        for(let i = 0; i < this.layers.length; i++) {
            const layer = this.layers[i];
            if(this.layerTypes[i] === "Blayer") {
                // BINARY
                for(let j = 0; j < layer.weights.length; j++) {
                    layer.weights[j].set(parameters[index]);
                    index++;
                }
            } else if(this.layerTypes[i] === "normal") {
                // NORMAL
                for (let i = 0; i < layer.weights.rows; i++) {
                    for (let j = 0; j < layer.weights.cols; j++) {
                        if (index < parameters.length) {
                            layer.weights.data[i][j] = parameters[index];
                            index++;
                        } else {
                            console.error("Not enough parameters to parse for weights.");
                            return; // Or throw an error
                        }
                    }
                }
                // Parse biases
                for (let i = 0; i < layer.biases.length; i++) {
                    if (index < parameters.length) {
                        layer.biases[i] = parameters[index];
                        index++;
                    } else {
                        console.error("Not enough parameters to parse for biases.");
                        return; // Or throw an error
                    }
                }
            }
        }
    }
}

let MUTATION_CHANCE = 0.01;
let MUTATION_STRENGTH = 0.1;

function getMutatedParameters(N) {
    let parameters = N.getParameters();
    for(let i = 0; i < parameters.length; i++) {
        if(typeof(parameters[i]) == 'object') {
            for(let j = 0; j < parameters[i].length; j++) {
                if(Math.random() < MUTATION_CHANCE) { parameters[i][j] = parameters[i][j] === 1 ? 0 : 1; }
            }
        } else {
            if(Math.random() < MUTATION_CHANCE) { parameters[i] += (Math.random() * 2 - 1) * MUTATION_STRENGTH; }
        }
    }
    return parameters;
}