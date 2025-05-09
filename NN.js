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
        this.data = Array(this.rows).fill().map(() => Array(this.cols).fill(Math.random() * 2 - 1));
    }
    randomize() {
        this.data = this.data.map(row => row.map(() => Math.random() * 2 - 1));
    }

    map(matrix, func) {
        let result = new Matrix(matrix.rows, matrix.cols);
        result.data = matrix.data.map((row, i) => row.map((val, j) => func(val, i, j)));
        return result;
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
}

class Layer {
    constructor(input_size, output_size, activation_function = RELU) {
        this.input_size = input_size;
        this.output_size = output_size;
        this.activation_function = activation_function;
        this.weights = new Matrix(output_size, input_size);
        this.biases = new Array(output_size).fill().map(() => Math.random() * 2 - 1);
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

}