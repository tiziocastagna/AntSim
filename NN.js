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
        if(inputArray.length != this.input_size) {console.log("incogruence in the input size");}
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
    kernal_number;
    kernel_radius; // Used for convolution calculation

    constructor(size, kernals) {
        this.size = size;
        this.kernal_number = kernals;
        this.kernals = [];
        for (let i = 0; i < this.kernal_number; i++) {
            this.kernals.push(new Matrix(size, size)); // Each kernel is a 'size x size' matrix
        }
        this.kernel_radius = Math.floor(size / 2);
    }

    random() {
        for(let k = 0; k < this.kernal_number; k++) {
            for(let i = 0; i < this.size; i++) {
                for(let j = 0; j < this.size; j++) {
                    if (this.kernals[k] && this.kernals[k].data && this.kernals[k].data[i]) {
                        this.kernals[k].data[i][j] = Math.random() * 2 - 1;
                    }
                }
            }
        }
    }

    feedForward(inputSignal) { // inputSignal is a Matrix
        if (!(inputSignal instanceof Matrix)) {
            console.error("Incorrect input type for Clayer.feedForward. Expected Matrix.");
            return [];
        }

        const inputRows = inputSignal.rows;
        const inputCols = inputSignal.cols;

        let outputFeatureMaps = [];
        for (let k = 0; k < this.kernal_number; k++) {
            const outputMap = new Matrix(inputRows, inputCols);
            // Initialize output matrix data to 0, as Matrix constructor might fill with random values
            for(let r = 0; r < inputRows; r++) {
                for(let c = 0; c < inputCols; c++) {
                    outputMap.data[r][c] = 0;
                }
            }
            outputFeatureMaps.push(outputMap);
        }

        for (let k = 0; k < this.kernal_number; k++) { // For each kernel
            const currentKernel = this.kernals[k]; // Matrix object
            const outputMapForKernel = outputFeatureMaps[k]; // Matrix object

            for (let i = 0; i < inputRows; i++) { // Iterate over each pixel of the output map (row)
                for (let j = 0; j < inputCols; j++) { // Iterate over each pixel of the output map (col)
                    let sum = 0;
                    for (let ki = 0; ki < this.size; ki++) { // Kernel row
                        for (let kj = 0; kj < this.size; kj++) { // Kernel col
                            const input_i = i - this.kernel_radius + ki;
                            const input_j = j - this.kernel_radius + kj;

                            if (input_i >= 0 && input_i < inputRows && input_j >= 0 && input_j < inputCols) {
                                sum += inputSignal.data[input_i][input_j] * currentKernel.data[ki][kj];
                            }
                        }
                    }
                    outputMapForKernel.data[i][j] = sum;
                }
            }
        }

        let result = [];
        for (let k = 0; k < this.kernal_number; k++) {
            result = result.concat(outputFeatureMaps[k].flatten());
        }
        result = result.map(item => RELU(item));
        return result;
    }

    getParameters() {
        let parameters = [];
        for (let k = 0; k < this.kernals.length; k++) {
            const kernelMatrix = this.kernals[k];
            for (let i = 0; i < kernelMatrix.rows; i++) {
                for (let j = 0; j < kernelMatrix.cols; j++) {
                    parameters.push(kernelMatrix.data[i][j]);
                }
            }
        }
        return parameters;
    }
    parseParameters(parameters) {
        if(parameters.length != this.kernal_number) {
            // This check is not robust. The number of parameters should be kernal_number * size * size.
            // console.warn("Clayer.parseParameters: Parameter count check might be inexact.");
        }
        const expectedParamCount = this.kernal_number * this.size * this.size;
        if (parameters.length < expectedParamCount) {
            console.error(`Clayer.parseParameters: Not enough parameters. Expected ${expectedParamCount}, got ${parameters.length}.`);
            // Potentially fill with what's available or throw an error
        }

        let index = 0;
        for(let k = 0; k < this.kernals.length; k++) {
            const kernelMatrix = this.kernals[k];
            for(let i = 0; i < kernelMatrix.rows; i++) { // kernelMatrix.rows is this.size
                for(let j = 0; j < kernelMatrix.cols; j++) { // kernelMatrix.cols is this.size
                    if(index < parameters.length) {
                        kernelMatrix.data[i][j] = parameters[index];
                        index++; // Increment index after using a parameter
                    } else {
                        // console.warn("Clayer.parseParameters: Ran out of parameters during parsing.");
                        return; // Stop if parameters run out
                    }
                }
            }
        }
    }
}