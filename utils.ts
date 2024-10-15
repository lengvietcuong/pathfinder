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
  const path = new Map();
  let current = goal;
  while (current.row !== start.row || current.col !== start.col) {
    const currentString = cellToString(current);
    const previous = cameFrom.get(currentString)!;
    const previousString = cellToString(previous);
    
    // Calculate offset between current and previous cells to determine the direction
    const offset = {
      dRow: current.row - previous.row,
      dCol: current.col - previous.col,
    };
    const direction = getDirection(offset);
    
    // Map the previous cell's string to the direction to travel
    path.set(previousString, direction);
    current = previous;
  }
  return path;
}
