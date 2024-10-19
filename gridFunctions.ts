import { CellCoordinates, CellType, DIRECTION_TO_OFFSET } from "./types";
import { shuffle } from "fast-shuffle";

// Converts a string representation of coordinates to an array of numbers
export function getCoordinates(input: string): number[] {
  const cleanedString = input.trim().replace(/[()\[\]\s]/g, ""); // Remove unwanted characters
  return cleanedString.split(",").map(Number); // Convert to an array of numbers
}

// Creates a 2D grid initialized with 'Unexplored' cells
export function createEmptyGrid(
  numRows: number,
  numCols: number
): CellType[][] {
  const grid = new Array(numRows);
  for (let row = 0; row < numRows; row++) {
    grid[row] = new Array(numCols).fill(CellType.Unexplored); // Fill each row with 'Unexplored' cells
  }

  return grid;
}

// Generates a random grid with walls and places start/goal cells at random corners
export function createRandomGrid(
  numRows: number,
  numCols: number,
  hasMultipleGoals: boolean
) {
  const grid = new Array(numRows);
  // Fill each cell with either 'Wall' or 'Unexplored', with a 20% chance of being a wall
  for (let row = 0; row < numRows; row++) {
    const currentRow = [];
    for (let col = 0; col < numCols; col++) {
      currentRow.push(
        Math.random() < 0.2 ? CellType.Wall : CellType.Unexplored
      );
    }
    grid[row] = currentRow;
  }

  // Randomly shuffle the corners to pick start and goal positions
  const corners = shuffle([
    { row: 0, col: 0 },
    { row: 0, col: numCols - 1 },
    { row: numRows - 1, col: 0 },
    { row: numRows - 1, col: numCols - 1 },
  ]);
  const start = corners.pop()!; // Pick the start position from a corner
  grid[start.row][start.col] = CellType.Start;

  // Place the first goal diagonally opposite the start
  const goal1 = { row: numRows - 1 - start.row, col: numCols - 1 - start.col };
  grid[goal1.row][goal1.col] = CellType.Goal;
  // Remove the first goal from the corners array
  corners.splice(
    corners.findIndex(
      (corner) => corner.row === goal1.row && corner.col === goal1.col
    ),
    1
  );

  // Optionally place more goal cells
  if (hasMultipleGoals) {
    const goal2 = corners.pop()!;
    grid[goal2.row][goal2.col] = CellType.Goal;
    // There may be a goal in the final corner
    if (Math.random() < 0.5) {
      const goal3 = corners.pop()!;
      grid[goal3.row][goal3.col] = CellType.Goal;
    }
    // There may be a goal in the center
    if (Math.random() < 0.5) {
      grid[Math.floor(numRows / 2)][Math.floor(numCols / 2)] = CellType.Goal;
    }
  }

  return grid;
}

// Parses a grid from a string format and fills it with start, goal, and wall cells
export function parseGrid(input: string): CellType[][] {
  const lines = input.trim().split("\n");

  const [numRows, numCols] = getCoordinates(lines[0]); // First line contains grid dimensions

  // Initialize the grid with 'Unexplored' cells
  const grid: CellType[][] = Array.from({ length: numRows }, () =>
    Array(numCols).fill(CellType.Unexplored)
  );

  const [startCol, startRow] = getCoordinates(lines[1]); // Second line contains start coordinates
  grid[startRow][startCol] = CellType.Start;

  // Parse and mark the goal cells
  const goals = parseGoals(lines[2]);
  goals.forEach((goal) => {
    grid[goal.row][goal.col] = CellType.Goal;
  });

  // Parse and mark the wall cells from remaining lines
  for (let i = 3; i < lines.length; i++) {
    const walls = parseWall(lines[i]);
    walls.forEach((wall) => {
      grid[wall.row][wall.col] = CellType.Wall;
    });
  }

  return grid;
}

// Helper to parse goal cell coordinates from a string
function parseGoals(goalsString: string): CellCoordinates[] {
  const goals: CellCoordinates[] = [];
  goalsString.split(" | ").forEach((goalString) => {
    const [col, row] = getCoordinates(goalString);
    goals.push({ row, col });
  });
  return goals;
}

// Helper to parse wall coordinates and size from a string
function parseWall(wallString: string): CellCoordinates[] {
  const walls: CellCoordinates[] = [];
  const [topLeftCol, topLeftRow, width, height] = getCoordinates(wallString);

  // Create wall cells based on width and height
  for (let dCol = 0; dCol < width; dCol++) {
    for (let dRow = 0; dRow < height; dRow++) {
      walls.push({ row: topLeftRow + dRow, col: topLeftCol + dCol });
    }
  }
  return walls;
}

// Checks if a cell is within the grid bounds
export function isInsideGrid(cell: CellCoordinates, grid: CellType[][]) {
  const { row, col } = cell;
  const numRows = grid.length;
  const numCols = grid[0].length;

  return row >= 0 && row < numRows && col >= 0 && col < numCols;
}

// Finds the start cell and all goal cells in a given grid
export function findStartAndGoals(grid: CellType[][]) {
  const numRows = grid.length;
  const numCols = grid[0].length;
  let start;
  const goals: CellCoordinates[] = [];

  // Search through the grid for start and goal cells
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      const cell = grid[row][col];
      if (cell === CellType.Start) {
        start = { row, col };
      } else if (cell === CellType.Goal) {
        goals.push({ row, col });
      }
    }
  }

  if (!start) throw new Error("Could not find the starting cell");
  if (goals.length === 0) throw new Error("Could not find any goals");

  return { start, goals };
}

// Counts how many walls surround a given cell in the grid
export function countSurroundingWalls(
  cell: CellCoordinates,
  grid: CellType[][]
) {
  let count = 0;
  // Check the neighboring cells in all directions
  for (const { dRow, dCol } of Object.values(DIRECTION_TO_OFFSET)) {
    const row = cell.row + dRow;
    const col = cell.col + dCol;
    if (isInsideGrid({ row, col }, grid) && grid[row][col] === CellType.Wall) {
      count++;
    }
  }
  return count;
}

// Resets the grid by turning all non-essential cells back to 'Unexplored'
export function resetVisualization(grid: CellType[][]) {
  const preservedTypes = [CellType.Start, CellType.Goal, CellType.Wall];
  return grid.map((row) =>
    row.map((cell) =>
      preservedTypes.includes(cell) ? cell : CellType.Unexplored
    )
  );
}

export function markCells(
  cells: CellCoordinates[],
  cellType: CellType,
  grid: CellType[][]
) {
  for (const cell of cells) {
    const { row, col } = cell;
    if (
      grid[row][col] !== CellType.Start &&
      grid[row][col] !== CellType.Goal
    ) {
      grid[row][col] = cellType;
    }
  }
}