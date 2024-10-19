import {
  CellCoordinates,
  CellType,
  Move,
  Algorithm,
  DIRECTION_TO_OFFSET,
  SearchStep,
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
import { resetVisualization } from "@/gridFunctions";
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

// Main generator function that orchestrates pathfinding between multiple goals
// Yields intermediate search steps for visualization purposes
export function* findPath(
  grid: CellType[][],
  algorithm: Algorithm,
) {
  const { goals } = findStartAndGoals(grid);
  const search = ALGORITHMS[algorithm];
  // Search for each goal one by one
  // After finding a goal, erase the previous start and set the new start to be the goal just found
  let previousStart: CellCoordinates | null = null;
  let previousGoal: CellCoordinates | null = null;
  try {
    for (let i = 0; i < goals.length; i++) {
      grid = resetVisualization(grid);
  
      if (previousStart !== null && previousGoal !== null) {
        grid[previousStart.row][previousStart.col] = CellType.Unexplored;
        grid[previousGoal.row][previousGoal.col] = CellType.Start;
        yield { type: "grid", grid } as SearchStep;
      }
  
      const result = yield* search(grid);
      yield result;
  
      const path = "path" in result ? result.path : [];
      previousStart = path[0];
      previousGoal = path[path.length - 1];
    }
  } catch (error) {
    // Cannot reach a goal after exploring the entire grid
  }
}

// Returns valid moves from a given cell by checking all four directions
// A move is valid if it's within grid bounds, not a wall, and hasn't been visited
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

// Classic DFS implementation using a stack
// Explores deeply along each branch before backtracking
function* depthFirstSearch(grid: CellType[][]) {
  const { start } = findStartAndGoals(grid);
  const stack = [
    {
      source: { row: NaN, col: NaN },
      destination: start,
    },
  ];
  // cameFrom tracks the path and prevents cycles
  const cameFrom = new Map<string, CellCoordinates>();

  while (stack.length > 0) {
    const { source, destination } = stack.pop()!;
    if (cameFrom.has(cellToString(destination))) continue;

    cameFrom.set(cellToString(destination), source);
    yield { type: "explore", cell: destination } as SearchStep;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return {
        type: "path",
        path: reconstructPath(start, destination, cameFrom),
      } as SearchStep;
    }

    // Reverse moves to maintain ULDR search order with stack's LIFO nature
    const newMoves = getValidMoves(destination, grid, cameFrom).reverse();
    yield {
      type: "frontier",
      cells: newMoves.map((move) => move.destination),
    } as SearchStep;
    stack.push(...newMoves);
  }

  throw new Error("Could not find any path to a goal");
}

// BFS implementation using a queue for level-order traversal
// Guarantees shortest path in terms of number of steps
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
    yield { type: "explore", cell: destination } as SearchStep;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return {
        type: "path",
        path: reconstructPath(start, destination, cameFrom),
      } as SearchStep;
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      queue.push({
        source: destination,
        destination: newMove.destination,
      });
    }
    yield {
      type: "frontier",
      cells: newMoves.map((move) => move.destination),
    } as SearchStep;
  }

  throw new Error("Could not find any path to a goal");
}

// Greedy Best-First Search uses a priority queue to always explore the cell closest to goal
// Fast but doesn't guarantee shortest path
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
    yield { type: "explore", cell: destination } as SearchStep;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return {
        type: "path",
        path: reconstructPath(start, destination, cameFrom),
      } as SearchStep;
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      // Priority is just the distance to nearest goal (heuristic only, no path cost)
      const priority = nearestGoal(newMove.destination, goals).distance;
      heap.add({
        source: destination,
        destination: newMove.destination,
        priority,
        index: index++,
      });
    }
    yield {
      type: "frontier",
      cells: newMoves.map((move) => move.destination),
    } as SearchStep;
  }

  throw new Error("Could not find any path to a goal");
}

// A* combines path cost and heuristic for optimal pathfinding
// Guarantees shortest path while typically exploring fewer cells than BFS
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
  // Track number of steps to reach each cell for path cost calculation
  const numSteps = new Map<string, number>();
  numSteps.set(cellToString(start), 0);
  let index = 0;

  while (!heap.isEmpty()) {
    const { source, destination } = heap.poll()!;
    if (cameFrom.has(cellToString(destination))) continue;

    cameFrom.set(cellToString(destination), source);
    yield { type: "explore", cell: destination } as SearchStep;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return {
        type: "path",
        path: reconstructPath(start, destination, cameFrom),
      } as SearchStep;
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      const numStepsSoFar = numSteps.get(cellToString(destination))!;
      const numStepsToNeighbor = numStepsSoFar + 1;
      if (
        numSteps.has(cellToString(newMove.destination)) &&
        numStepsToNeighbor >= numSteps.get(cellToString(newMove.destination))!
      )
        continue;

      numSteps.set(cellToString(newMove.destination), numStepsToNeighbor);
      // Priority combines actual path cost (numStepsToNeighbor) with heuristic (distance to goal)
      const priority =
        numStepsToNeighbor + nearestGoal(newMove.destination, goals).distance;
      heap.add({
        source: destination,
        destination: newMove.destination,
        priority,
        index: index++,
      });
    }
    yield {
      type: "frontier",
      cells: newMoves.map((move) => move.destination),
    } as SearchStep;
  }

  throw new Error("Could not find any path to a goal");
}

// OpenSearch prioritizes cells with fewer surrounding walls
// Good for finding paths through open areas of the grid
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
    yield { type: "explore", cell: destination } as SearchStep;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return {
        type: "path",
        path: reconstructPath(start, destination, cameFrom),
      } as SearchStep;
    }

    const newMoves = getValidMoves(destination, grid, cameFrom);
    for (const newMove of newMoves) {
      // Priority is determined by number of surrounding walls - fewer is better
      const priority = countSurroundingWalls(newMove.destination, grid);
      heap.add({
        source: destination,
        destination: newMove.destination,
        priority,
        index: index++,
      });
    }
    heap.print();
    yield {
      type: "frontier",
      cells: newMoves.map((move) => move.destination),
    } as SearchStep;
  }

  throw new Error("Could not find any path to a goal");
}

// A* variant that considers angle to goal in its heuristic
// Tends to find straighter paths compared to regular A*
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
    yield { type: "explore", cell: destination } as SearchStep;

    if (grid[destination.row][destination.col] === CellType.Goal) {
      return {
        type: "path",
        path: reconstructPath(start, destination, cameFrom),
      } as SearchStep;
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
      // Include angle cost in priority calculation to favor straighter paths
      const angleCost = calculateAngle(newMove.destination, goal);
      const priority = numStepsToNeighbor + distance + angleCost;
      heap.add({
        source: destination,
        destination: newMove.destination,
        priority,
        index: index++,
      });
    }
    yield {
      type: "frontier",
      cells: newMoves.map((move) => move.destination),
    } as SearchStep;
  }

  throw new Error("Could not find any path to a goal");
}