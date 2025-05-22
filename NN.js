function RELU(x) {
    return Math.max(0, x);
}

function array_sum(a, b) {
    let result = []
    for(let i = 0; i < a.length; i++) {
        result.push(a[i] + b[i]);
    }
    return result;
}

class Matrix {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                this.data[i][j] = Math.random() * 2 - 1;
            }
        }
    }
    randomize() {
        for(let i = 0; i < this.rows; i++) {
            for(let j = 0; j < this.cols; j++) {
                this.data[i][j] = Math.random() * 2 - 1;
            }
        }
    }

    transform(vector) {
        let result = new Array(this.rows).fill(0);
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result[i] += this.data[i][j] * vector[j];
            }
        }
        return result;
    }
    flatten() {
        let result = [];
        for(let i = 0; i < this.cols; i++) {
            for(let j = 0; j < this.rows; j++) {
                result.push(this.data[j][i]);
            }
        }
        return result;
    }
}

class Layer {
    constructor(input_size, output_size, activation_function = RELU) {
        this.input_size = input_size;
        this.output_size = output_size;
        this.activation_function = activation_function;
        this.weights = new Matrix(output_size, input_size);
        this.biases = [];
        for(let i = 0; i < output_size; i++) {
            this.biases.push(Math.random() * 2 - 1); 
        }
    }

    feedForward(inputArray) {
        // Calculate weighted sum: weights * input
        let weightedSum = this.weights.transform(inputArray);

        // Add biases: (weights * input) + biases
        let biasedSum = array_sum(weightedSum, this.biases); // Use static add

        // Apply activation function element-wise
        let outputArray = biasedSum.map(item => this.activation_function(item))

        // Return the result as a matrix for chaining
        return outputArray;
    }
}

class Network {
    constructor(structure) {
        this.layers = [];
        // Create layers based on the structure array
        // structure = [input_size, hidden1_size, ..., output_size]
        for (let i = 0; i < structure.length - 1; i++) {
            let input_size = structure[i];
            let output_size = structure[i + 1];
            // TODO: Allow specifying activation functions per layer if needed
            this.layers.push(new Layer(input_size, output_size, RELU)); // Using RELU for all layers for now
        }
    }

    feedForward(inputArray) {
        // Convert input array to matrix for the first layer
        let currentOutputArray = inputArray;

        // Pass the data through each layer sequentially
        for (let layer of this.layers) {
            currentOutputArray = layer.feedForward(currentOutputArray);
        }

        return currentOutputArray;
    }
    getParameters() {
        let parameters = [];
        for (let layer of this.layers) {
            // Add all weight values
            for (let i = 0; i < layer.weights.rows; i++) {
                for (let j = 0; j < layer.weights.cols; j++) {
                    parameters.push(layer.weights.data[i][j]);
                }
            }
            // Add all bias values
            parameters = parameters.concat(layer.biases);
        }
        return parameters;
    }

    parseParameters(parameters) {
        let index = 0;
        for (let layer of this.layers) {
            // Parse weights
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

class Clayer {
    size;
    kernals;
    constructor(size, kernals) {
        this.size = size;
        this.kernal_number = kernals;
        this.kernals = new Array(kernals).fill(new Matrix(size, size));
        this.random();
        this.margin = Math.floor(size / 2 - 1);
    }
    random() {
        for(let k = 0; k < this.kernal_number; k++) {
            for(let i = 0; i < this.size; i++) {
                for(let j = 0; j < this.size; j++) {
                    this.kernals[k].data[i][j] = Math.random() * 2 - 1;
                }
            }
        }
    }

    feedForward(inputSignal) {
        if(!inputSignal instanceof Matrix) {console.error("Incorrect input type"); return;}
        const inputWidth = inputSignal.data.length;
        const inputHeight = inputSignal.data[0].length;
        
        let outputSignal = new Array(this.kernal_number).fill(new Matrix(inputWidth, inputHeight));
        for(let i = 0; i < inputWidth; i++) {
            for(let j = 0; j < inputHeight; j++) {
                for(let k = 0; k < this.kernal_number; k++) {
                    for(let k1 = -this.margin; k1 <= this.margin; k1++) {
                        for(let k2 = -this.margin; k2 < -this.margin; k2++) {
                            if(i + k1 < 0 || i + k1 >= inputWidth || j + k2 < 0 || j + k2 >= inputHeight)
                            outputSignal[k].data[i][j] += inputSignal.data[i + k1][j + k2] * this.kernals[k].data[k1][k2];
                        }
                    }
                }
            }
        }
        let result = [];
        for(let i = 0; i < outputSignal.length; i++) {
            result = result.concat(outputSignal[i].flatten());
        }
        return result;
    }
    getParameters() {
        let parameters = [];
        for (let k = 0; k < this.kernals.length; k++) {
            for (let i = 0; i < this.kernals[k].length; i++) {
                for (let j = 0; j < this.kernals[k][i].length; j++) {
                    parameters.push(this.kernals[k][i][j]);
                }
            }
        }
        return parameters;
    }
    parseParameters(parameters) {
        if(parameters.length != this.kernal_number) {
            console.error("Not enough parameters to parse for kernal.");
            return;
        }
        let index = 0;
        for(let k = 0; k < this.kernals.length; k++) {
            for(let i = 0; i < this.kernals[k].length; i++) {
                for(let j = 0; j < this.kernals[k][i].length; j++) {
                    if(index < parameters.length) {
                        this.kernals[k][i][j] = parameters[index];
                    }
                }
            }
        }
    }
}