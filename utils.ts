import { CellCoordinates, Move, Direction, Offset, DIRECTION_TO_OFFSET } from "./types";

// Utility function that delays execution for a given number of milliseconds
export async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

// Compares two moves based on their priority and index
export function compareMoves(a: Move, b: Move) {
  const priorityDifference = a.priority! - b.priority!;
  if (priorityDifference !== 0) return priorityDifference;
  return a.index! - b.index!;
}

// Converts cell coordinates (row, col) into a string format "row,col"
export function cellToString(cell: CellCoordinates): string {
  return `${cell.row},${cell.col}`;
}

// Converts a string representation of a cell ("row,col") back into cell coordinates
export function stringToCell(cellString: string): CellCoordinates {
  const [row, col] = cellString.split(",").map(Number);
  return { row, col };
}

// Calculates the Manhattan distance between two cells (absolute row and column differences)
export function manhattanDistance(cellA: CellCoordinates, cellB: CellCoordinates) {
  return Math.abs(cellA.row - cellB.row) + Math.abs(cellA.col - cellB.col);
}

// Finds the nearest goal from a list of goals, based on Manhattan distance
export function nearestGoal(cell: CellCoordinates, goals: CellCoordinates[]) {
  let result = {
    goal: { row: NaN, col: NaN },
    distance: Infinity,
  };
  for (const goal of goals) {
    const distance = manhattanDistance(cell, goal);
    if (distance < result.distance) {
      result = { goal, distance };
    }
  }
  return result;
}

// Calculates the angle between two cells, primarily based on row and column differences
export function calculateAngle(cell: CellCoordinates, goal: CellCoordinates) {
  if (cell.row === goal.row || cell.col === goal.col) return 0;
  const dRow = Math.abs(goal.row - cell.row);
  const dCol = Math.abs(goal.col - cell.col);
  const angleA = Math.atan(dCol / dRow);
  const angleB = Math.atan(dRow / dCol);
  return Math.min(angleA, angleB);
}

// Determines the direction (from a predefined set) based on an offset (row/col difference)
export function getDirection(offset: Offset): Direction {
  for (const [direction, dirOffset] of Object.entries(DIRECTION_TO_OFFSET)) {
    if (dirOffset.dRow === offset.dRow && dirOffset.dCol === offset.dCol) {
      return Number(direction) as Direction;
    }
  }
  throw new Error("Invalid offset");
}

// Reconstructs a path from start to goal using a "cameFrom" map, returns path with directions
export function reconstructPath(
  start: CellCoordinates,
  goal: CellCoordinates,
  cameFrom: Map<string, CellCoordinates>
) {
  const path: CellCoordinates[] = [];
  let current = goal;
  while (current.row !== start.row || current.col !== start.col) {
    const currentString = cellToString(current);
    const previous = cameFrom.get(currentString)!;

    path.push(current);
    current = previous;
  }
  path.push(start);
  path.reverse();
  return path;
}

// Get the direction to move from each cell (which is displayed if finding a single goal)
export function getDirections(path: CellCoordinates[]): Map<string, Direction> {
  const directions = new Map();
  for (let i = 0; i < path.length - 1; i++) {
    const currentCell = path[i];
    const nextCell = path[i + 1];
    const offset = {
      dRow: nextCell.row - currentCell.row,
      dCol: nextCell.col - currentCell.col,
    };
    const direction = getDirection(offset);
    directions.set(cellToString(currentCell), direction);
  }
  return directions;
}

// Get the indexes of each cell in the entire path (which is displayed if finding multiple goals)
export function getIndexes(path: CellCoordinates[]): Map<string, number[]> {
  const indexes = new Map();
  for (let i = 0; i < path.length; i++) {
    const currentCell = path[i];
    const key = cellToString(currentCell);
    if (indexes.has(key)) {
      indexes.get(key)!.push(i);
    } else {
      indexes.set(key, [i]);
    }
  }
  return indexes;
}
