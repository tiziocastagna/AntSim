class Vector2D {
    x;
    y;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(other) {
        this.x += other.x;
        this.y += other.y;
    }
}

class SquareMatrix2D {
    constructor(a, b, c, d) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d
    }
    transform(v) {
        return new Vector2D(v.x * this.a + v.y * this.c, v.x * this.b + v.y * this.d);
    }
}

function vector2Daddtion(v, w) {
    return new Vector2D(v.x + w.x, v.y + w.y);
}

const ROTATION_90 = new SquareMatrix2D(0, 1, -1, 0);
const ROTATION_180 = new SquareMatrix2D(-1, 0, 0, -1);
const ROTATION_270 = new SquareMatrix2D(0, -1, 1, 0);

const NORTH = new Vector2D(0, 1);
const EAST = new Vector2D(1, 0);
const SOUTH = new Vector2D(0, -1);
const WEST = new Vector2D(-1, 0);

const directions = [
    NORTH,
    EAST,
    SOUTH,
    WEST
];

function getRandomDirection() {
    const randomIndex = Math.floor(Math.random() * directions.length);
    return directions[randomIndex];
}

let ants = []
class Ant {
    position;
    home;
    direction;

    brain;
    constructor(x, y, home) {
        this.position = new Vector2D(x, y);
        this.direction = getRandomDirection();
        getTile(this.position.x, this.position.y).covered = true;     // Show itself as soon as it is created

        this.brain = new Network([5, 3, 2]);
        this.home = home;
    }
    neighbors() {
        const leftTile_position = vector2Daddtion(this.position, ROTATION_270.transform(this.direction));
        const rightTile_position = vector2Daddtion(this.position, ROTATION_90.transform(this.direction));
        const frontTile_position = vector2Daddtion(this.position, this.direction);

        const leftTile = getTile(leftTile_position.x, leftTile_position.y);
        const frontTile = getTile(frontTile_position.x, frontTile_position.y);
        const rightTile = getTile(rightTile_position.x, rightTile_position.y);

        return [leftTile, rightTile, frontTile];
    }
    move(direction) {
        let next_direction;
        if(direction === "left") {
            next_direction = ROTATION_270.transform(this.direction);
        } else if(direction === "right") {
            next_direction = ROTATION_90.transform(this.direction);
        } else if(direction === "forwards") {
            next_direction = this.direction;
        } else {    // TODO: do somthing
            return;
        }

        const next_position = vector2Daddtion(this.position, next_direction);
        const next_tile = getTile(next_position.x, next_position.y);

        const prevX = this.position.x;
        const prevY = this.position.y;

        if (next_tile !== VOIDTILE) {
            getTile(prevX, prevY).covered = false;      // Removes itself
            this.position = next_position;
            this.direction = next_direction;
            getTile(next_position.x, next_position.y).covered = true;     // Shows itself
        }
    }
    explore() {
        // leave a "I've already explored here sent"
        getTile(this.position.x, this.position.y).addChemical(0, 30);
    
        // Choose the path based on the concentration of red
        const [leftTile, rightTile, frontTile] = this.neighbors();

        const redValues = [
            { direction: "left", red: leftTile.chemicalRGB[0] },
            { direction: "forwards", red: frontTile.chemicalRGB[0] },
            { direction: "right", red: rightTile.chemicalRGB[0]}
        ];

        // Find the minimum red value among the three options
        let minRed = Math.min(redValues[0].red, redValues[1].red, redValues[2].red);

        // Filter for directions that have this minimum red value
        const bestDirections = redValues.filter(v => v.red === minRed);

        let chosenDirection;
        if (bestDirections.length > 0) {
            // If there's one or more 'best' directions (could be 1, 2, or 3 if all are equal min)
            // Pick one randomly from the best options
            const randomIndex = Math.floor(Math.random() * bestDirections.length);
            chosenDirection = bestDirections[randomIndex].direction;
        } else {
            // If it were reached, pick a completely random direction
            const allDirections = ["left", "forwards", "right"];
            chosenDirection = allDirections[Math.floor(Math.random() * allDirections.length)];
        }
        this.move(chosenDirection);
    }
}