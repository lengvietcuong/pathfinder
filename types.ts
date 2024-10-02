export enum Algorithm {
  DepthFirstSearch = "Depth-First Search",
  BreadthFirstSearch = "Breadth-First Search",
  GreedyBestFirstSearch = "Greedy Best-First Search",
  AStar = "A-Star",
  OpenSearch = "Open Search",
  StraightLineAStar = "Straight-Line A-Star",
}

export enum Delay {
  Instant = 0,
  Fast = 15,
  Normal = 50,
  Slow = 100,
}

export enum Direction {
  Up,
  Left,
  Down,
  Right,
}

export enum CellType {
  Unexplored,
  Frontier,
  Explored,
  Wall,
  Start,
  Goal,
  Path,
}

export type CellCoordinates = {
  row: number;
  col: number;
};


export type Offset = {
  dRow: number;
  dCol: number;
};

export const DIRECTION_TO_OFFSET: Record<Direction, Offset> = {
  [Direction.Up]: { dRow: -1, dCol: 0 },
  [Direction.Left]: { dRow: 0, dCol: -1 },
  [Direction.Down]: { dRow: 1, dCol: 0 },
  [Direction.Right]: { dRow: 0, dCol: 1 },
};

export type Move = {
  source: CellCoordinates;
  destination: CellCoordinates;
  priority?: number;
  index?: number;
};