import {
  CellCoordinates,
  CellType,
  Move,
  Algorithm,
  DIRECTION_TO_OFFSET,
} from "@/types";
import {
  isInsideGrid,
  findStartAndGoals,
  countSurroundingWalls,
} from "@/gridFunctions";
import {
  cellToString,
  compareMoves,
  nearestGoal,
  calculateAngle,
  reconstructPath,
} from "@/utils";
import { Queue, MinPriorityQueue } from "data-structure-typed";

// Map of algorithm names to their corresponding functions
const ALGORITHMS = {
  [Algorithm.DepthFirstSearch]: depthFirstSearch,
  [Algorithm.BreadthFirstSearch]: breadthFirstSearch,
  [Algorithm.GreedyBestFirstSearch]: greedyBestFirstSearch,
  [Algorithm.AStar]: aStar,
  [Algorithm.OpenSearch]: openSearch,
  [Algorithm.StraightLineAStar]: straightLineAStar,
};

// Main function to find path using the specified algorithm
export function findPath(grid: CellType[][], algorithm: Algorithm) {
  return ALGORITHMS[algorithm](grid);
}

// Helper function to get valid moves from a given cell
function getValidMoves(
  source: CellCoordinates,
  grid: CellType[][],
  cameFrom: Map<string, CellCoordinates>
) {
  const validMoves = [];
  for (const { dRow, dCol } of Object.values(DIRECTION_TO_OFFSET)) {
    const row = source.row + dRow;
    const col = source.col + dCol;
    const destination: CellCoordinates = { row, col };

    // Check if the neighbor is inside the grid, not a wall, and hasn't been visited
    if (
      isInsideGrid(destination, grid) &&
      grid[row][col] !== CellType.Wall &&
      !cameFrom.has(cellToString(destination))
    ) {
      validMoves.push({ source, destination });
    }
  }
  return validMoves;
}

// Depth-First Search algorithm
function* depthFirstSearch(grid: CellType[][]) {
  const { start } = findStartAndGoals(grid);
  const stack = [
    {
      source: { row: NaN, col: NaN },
      destination: start,
    },
  ];
  const cameFrom = new Map<string, CellCoordinates>();

  while (stack.length > 0) {
    const { source, destination } = stack.pop()!;
    if (cameFrom.has(cellToString(destination))) continue;

    cameFrom.set(cellToString(destination), source);
    yield destination;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return reconstructPath(start, destination, cameFrom);
    }

    // To maintain the search order U -> L -> D -> R with the stack's LIFO nature, add moves in the order R -> D -> L -> U
    const newMoves = getValidMoves(destination, grid, cameFrom).reverse();
    yield newMoves.map((move) => move.destination);
    stack.push(...newMoves);
  }

  throw new Error("Could not find a path to the goal");
}

// Breadth-First Search algorithm
function* breadthFirstSearch(grid: CellType[][]) {
  const { start } = findStartAndGoals(grid);
  const queue = new Queue<{
    source: CellCoordinates;
    destination: CellCoordinates;
  }>();
  queue.push({
    source: { row: NaN, col: NaN },
    destination: start,
  });
  const cameFrom = new Map<string, CellCoordinates>();

  while (!queue.isEmpty()) {
    const { source, destination } = queue.shift()!;
    if (cameFrom.has(cellToString(destination))) continue;

    cameFrom.set(cellToString(destination), source);
    yield destination;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return reconstructPath(start, destination, cameFrom);
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      queue.push({
        source: destination,
        destination: newMove.destination,
      });
    }
    yield newMoves.map((move) => move.destination);
  }

  throw new Error("Could not find a path to the goal");
}

// Greedy Best-First Search algorithm
function* greedyBestFirstSearch(grid: CellType[][]) {
  const { start, goals } = findStartAndGoals(grid);
  const heap = new MinPriorityQueue<Move>([], {
    comparator: compareMoves,
  });
  heap.add({
    source: { row: NaN, col: NaN },
    destination: start,
  });
  const cameFrom = new Map<string, CellCoordinates>();
  let index = 0;

  while (!heap.isEmpty()) {
    const { source, destination } = heap.poll()!;
    if (cameFrom.has(cellToString(destination))) continue;

    cameFrom.set(cellToString(destination), source);
    yield destination;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return reconstructPath(start, destination, cameFrom);
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      const priority = nearestGoal(newMove.destination, goals).distance;
      heap.add({
        source: destination,
        destination: newMove.destination,
        priority,
        index: index++,
      });
    }
    yield newMoves.map((move) => move.destination);
  }

  throw new Error("Could not find a path to the goal");
}

// A* Search algorithm
function* aStar(grid: CellType[][]) {
  const { start, goals } = findStartAndGoals(grid);
  const heap = new MinPriorityQueue<Move>([], {
    comparator: compareMoves,
  });
  heap.add({
    source: { row: NaN, col: NaN },
    destination: start,
  });
  const cameFrom = new Map<string, CellCoordinates>();
  const numSteps = new Map<string, number>();
  numSteps.set(cellToString(start), 0);
  let index = 0;

  while (!heap.isEmpty()) {
    const { source, destination } = heap.poll()!;
    if (cameFrom.has(cellToString(destination))) continue;

    cameFrom.set(cellToString(destination), source);
    yield destination;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return reconstructPath(start, destination, cameFrom);
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      const numStepsSoFar = numSteps.get(cellToString(destination))!;
      const numStepsToNeighbor = numStepsSoFar + 1;
      // Skip the move if a shorter path to its destination cell is already found
      if (
        numSteps.has(cellToString(newMove.destination)) &&
        numStepsToNeighbor >= numSteps.get(cellToString(newMove.destination))!
      )
        continue;

      numSteps.set(cellToString(newMove.destination), numStepsToNeighbor);
      const priority =
        numStepsToNeighbor + nearestGoal(newMove.destination, goals).distance;
      heap.add({
        source: destination,
        destination: newMove.destination,
        priority,
        index: index++,
      });
    }
    yield newMoves.map((move) => move.destination);
  }

  throw new Error("Could not find a path to the goal");
}

// Open Search algorithm (prioritizes cells with fewer surrounding walls)
function* openSearch(grid: CellType[][]) {
  const { start } = findStartAndGoals(grid);
  const heap = new MinPriorityQueue<Move>([], {
    comparator: compareMoves,
  });
  heap.add({
    source: { row: NaN, col: NaN },
    destination: start,
  });
  const cameFrom = new Map<string, CellCoordinates>();
  let index = 0;

  while (!heap.isEmpty()) {
    const { source, destination } = heap.poll()!;
    if (cameFrom.has(cellToString(destination))) continue;

    cameFrom.set(cellToString(destination), source);
    yield destination;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return reconstructPath(start, destination, cameFrom);
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      const priority = countSurroundingWalls(newMove.destination, grid);
      heap.add({
        source: destination,
        destination: newMove.destination,
        priority,
        index: index++,
      });
    }
    heap.print();
    yield newMoves.map((move) => move.destination);
  }

  throw new Error("Could not find a path to the goal");
}

// Straight Line A* algorithm (considers angle to goal in heuristic)
function* straightLineAStar(grid: CellType[][]) {
  const { start, goals } = findStartAndGoals(grid);
  const heap = new MinPriorityQueue<Move>([], {
    comparator: compareMoves,
  });
  heap.add({
    source: { row: NaN, col: NaN },
    destination: start,
  });
  const cameFrom = new Map<string, CellCoordinates>();
  const numSteps = new Map<string, number>();
  numSteps.set(cellToString(start), 0);
  let index = 0;

  while (!heap.isEmpty()) {
    const { source, destination } = heap.poll()!;
    if (cameFrom.has(cellToString(destination))) continue;

    cameFrom.set(cellToString(destination), source);
    yield destination;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return reconstructPath(start, destination, cameFrom);
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      const numStepsSoFar = numSteps.get(cellToString(destination))!;
      const numStepsToNeighbor = numStepsSoFar + 1;

      // Check if found a shorter path than the one in the map
      const neighborString = cellToString(newMove.destination);
      if (
        numSteps.has(neighborString) &&
        numSteps.get(neighborString)! <= numStepsToNeighbor
      ) {
        continue;
      }

      numSteps.set(neighborString, numStepsToNeighbor);
      const { goal, distance } = nearestGoal(newMove.destination, goals);
      const angleCost = calculateAngle(newMove.destination, goal);
      const priority = numStepsToNeighbor + distance + angleCost;
      heap.add({
        source: destination,
        destination: newMove.destination,
        priority,
        index: index++,
      });
    }
    yield newMoves.map((move) => move.destination);
  }

  throw new Error("Could not find a path to the goal");
}