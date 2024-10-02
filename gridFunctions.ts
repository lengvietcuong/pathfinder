import { CellCoordinates, CellType, DIRECTION_TO_OFFSET } from "./types";
import { shuffle } from "fast-shuffle";

export function createEmptyGrid(
  numRows: number,
  numCols: number
): CellType[][] {
  const grid = new Array(numRows);
  for (let row = 0; row < numRows; row++) {
    grid[row] = new Array(numCols).fill(CellType.Unexplored);
  }

  return grid;
}

export function createRandomGrid(numRows: number, numCols: number) {
  const grid = new Array(numRows);
  // Each cell has a 20% chance of being a wall
  for (let row = 0; row < numRows; row++) {
    const currentRow = [];
    for (let col = 0; col < numCols; col++) {
      currentRow.push(
        Math.random() < 0.2 ? CellType.Wall : CellType.Unexplored
      );
    }
    grid[row] = currentRow;
  }

  // Place the starting cell in any of the four corners
  const corners = shuffle([
    { row: 0, col: 0 },
    { row: 0, col: numCols - 1 },
    { row: numRows - 1, col: 0 },
    { row: numRows - 1, col: numCols - 1 },
  ]);
  const start = corners.pop()!;
  grid[start.row][start.col] = CellType.Start;

  // Place the first goal in the opposite corner (diagonally)
  const goal1 = { row: numRows - 1 - start.row, col: numCols - 1 - start.col };
  grid[goal1.row][goal1.col] = CellType.Goal;
  corners.splice(corners.indexOf(goal1), 1);

  // Place the remaining goals conditionally
  if (Math.random() < 0.25) {
    const goal2 = corners.pop()!;
    grid[goal2.row][goal2.col] = CellType.Goal;
    if (Math.random() < 0.5) {
      const goal3 = corners.pop()!;
      grid[goal3.row][goal3.col] = CellType.Goal;
    }
  }

  return grid;
}

export function parseGrid(input: string): CellType[][] {
  const lines = input.trim().split("\n");

  const [numRows, numCols] = lines[0]
    .replace("[", "")
    .replace("]", "")
    .split(",")
    .map(Number);

  // Initialize the grid with Unexplored cells
  const grid: CellType[][] = Array.from({ length: numRows }, () =>
    Array(numCols).fill(CellType.Unexplored)
  );

  // Parse start coordinates and mark the start cell
  const [startCol, startRow] = lines[1]
    .replace("(", "")
    .replace(")", "")
    .split(",")
    .map(Number);
  grid[startRow][startCol] = CellType.Start;

  // Parse and mark the goal cells
  const goals = parseGoals(lines[2]);
  goals.forEach((goal) => {
    grid[goal.row][goal.col] = CellType.Goal;
  });

  // Parse and mark the wall cells
  for (let i = 3; i < lines.length; i++) {
    const walls = parseWall(lines[i]);
    walls.forEach((wall) => {
      grid[wall.row][wall.col] = CellType.Wall;
    });
  }

  return grid;
}

function parseGoals(goalsString: string): CellCoordinates[] {
  const goals: CellCoordinates[] = [];
  goalsString.split(" | ").forEach((goalString) => {
    const [col, row] = goalString
      .replace("(", "")
      .replace(")", "")
      .split(",")
      .map(Number);
    goals.push({ row, col });
  });
  return goals;
}

function parseWall(wallString: string): CellCoordinates[] {
  const walls: CellCoordinates[] = [];
  const [topLeftCol, topLeftRow, width, height] = wallString
    .replace("(", "")
    .replace(")", "")
    .split(",")
    .map(Number);

  for (let dCol = 0; dCol < width; dCol++) {
    for (let dRow = 0; dRow < height; dRow++) {
      walls.push({ row: topLeftRow + dRow, col: topLeftCol + dCol });
    }
  }
  return walls;
}

export function isInsideGrid(cell: CellCoordinates, grid: CellType[][]) {
  const { row, col } = cell;
  const numRows = grid.length;
  const numCols = grid[0].length;

  return row >= 0 && row < numRows && col >= 0 && col < numCols;
}

export function findStartAndGoals(grid: CellType[][]) {
  const numRows = grid.length;
  const numCols = grid[0].length;
  let start;
  const goals: CellCoordinates[] = [];

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

export function countSurroundingWalls(
  cell: CellCoordinates,
  grid: CellType[][]
) {
  let count = 0;
  for (const { dRow, dCol } of Object.values(DIRECTION_TO_OFFSET)) {
    const row = cell.row + dRow;
    const col = cell.col + dCol;
    if (isInsideGrid({ row, col }, grid) && grid[row][col] === CellType.Wall) {
      count++;
    }
  }
  return count;
}

export function resetVisualization(grid: CellType[][]) {
  const preservedTypes = [CellType.Start, CellType.Goal, CellType.Wall];
  return grid.map((row) =>
    row.map((cell) =>
      preservedTypes.includes(cell) ? cell : CellType.Unexplored
    )
  );
}
