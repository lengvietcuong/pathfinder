import { CellType, CellCoordinates, Direction } from "@/types";
import { PiMapPinBold as LocationIcon } from "react-icons/pi";
import { PiFlagPennantBold as FlagIcon } from "react-icons/pi";
import { IconType } from "react-icons/lib";
import { getDirections, getIndexes, cellToString } from "@/utils";

interface GridProps {
  grid: CellType[][];
  path: CellCoordinates[];
  findAllGoals: boolean;
  drawType: CellType | null;
  onMouseDown: (row: number, col: number) => void;
  onMouseOver: (row: number, col: number) => void;
  onMouseUp: () => void;
}

// Color classes for each cell type
const CELL_COLOR: { [key in CellType]: string } = {
  [CellType.Unexplored]: "bg-card",
  [CellType.Frontier]: "bg-primary/35",
  [CellType.Explored]: "bg-muted",
  [CellType.Wall]: "bg-slate-500",
  [CellType.Start]: "bg-rose-800",
  [CellType.Goal]: "bg-emerald-800",
  [CellType.Path]: "bg-primary",
};

// Cursor icons for different cell types
const CURSOR_ICON: Record<CellType, string> = {
  [CellType.Start]: "cursor-location",
  [CellType.Goal]: "cursor-flag",
  [CellType.Wall]: "cursor-wall",
  [CellType.Unexplored]: "cursor-eraser",
  [CellType.Frontier]: "cursor-default",
  [CellType.Explored]: "cursor-default",
  [CellType.Path]: "cursor-default",
};

// CSS classes for direction lines (arrows)
const DIRECTION_BAR: Record<Direction, string> = {
  [Direction.Up]:
    "h-full w-0.5 md:w-1 left-1/2 -translate-x-1/2 -translate-y-1/2",
  [Direction.Down]:
    "h-full w-0.5 md:w-1 left-1/2 -translate-x-1/2 translate-y-1/2",
  [Direction.Left]:
    "h-0.5 md:h-1 w-full top-1/2 -translate-y-1/2 -translate-x-1/2",
  [Direction.Right]:
    "h-0.5 md:h-1 w-full top-1/2 -translate-y-1/2 translate-x-1/2",
};

interface CellProps {
  row: number;
  col: number;
  numRows: number;
  numCols: number;
  onMouseDown: (row: number, col: number) => void;
  onMouseOver: (row: number, col: number) => void;
  onMouseUp: () => void;
  cellType: CellType;
  direction?: Direction; // This is used to display the direction bar if only needs to find 1 goal
  indexes?: number[]; // This is used to index each cell if finding multiple goals
}

function Cell({
  row,
  col,
  numRows,
  numCols,
  onMouseDown,
  onMouseOver,
  onMouseUp,
  cellType,
  direction,
  indexes,
}: CellProps) {
  let CellIcon: IconType | null = null;
  if (cellType === CellType.Start) {
    CellIcon = LocationIcon;
  } else if (cellType === CellType.Goal) {
    CellIcon = FlagIcon;
  }

  return (
    <>
      {["desktop", "mobile"].map((device) => {
        const responsiveClassName =
          device === "desktop" ? "hidden lg:grid" : "grid lg:hidden";
        const size =
          device === "desktop"
            ? `min(calc(65svw / ${numCols}), calc(90svh / ${numRows}))`
            : `min(calc(90svw / ${numCols}), calc(90svh / ${numRows}))`;

        return (
          <div
            key={`${device[0]}-${row}-${col}`}
            className={`${responsiveClassName} relative max-w-16 max-h-16 place-items-center ${CELL_COLOR[cellType]}`}
            style={{
              height: size,
              width: size,
            }}
            onMouseDown={() => onMouseDown(row, col)}
            onMouseOver={() => onMouseOver(row, col)}
            onMouseUp={onMouseUp}
          >
            {/* Display the cell icon if there are no indexes to be shown */}
            {CellIcon !== null && indexes === undefined && <CellIcon className="size-2/3" />}

            {/* Display the direction bar if only needs to find 1 goal */}
            {direction !== undefined && (
              <div
                className={`z-10 absolute bg-foreground ${DIRECTION_BAR[direction]}`}
              />
            )}

            {/* Display the indexes if finding multiple goals */}
            {indexes !== undefined && (
              <div className="z-10 absolute text-[10px] text-center">
                {indexes.map((index) => (
                  <p key={index}>{index}</p>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

export default function Grid({
  grid,
  path,
  findAllGoals,
  drawType,
  onMouseDown,
  onMouseOver,
  onMouseUp,
}: GridProps) {
  const numRows = grid.length;
  const numCols = grid[0].length;
  if (!numRows || !numCols) return null; // Grid is empty

  const cursorIcon =
    drawType !== null ? CURSOR_ICON[drawType] : "cursor-default"; // Set the cursor icon
  // If finding a single goal, display a direction bar for each cell
  // If finding multiple goals, display the indexes of each cell
  const directions = findAllGoals ? null : getDirections(path);
  const indexes = findAllGoals ? getIndexes(path) : null;

  return (
    <div
      className={`w-fit h-fit mx-auto grid border-4 bg-slate-800/75 rounded-lg gap-[1px] ${cursorIcon}`}
      style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }} // Define grid columns based on the number of columns
      onMouseLeave={onMouseUp}
    >
      {/* Render each cell */}
      {grid.map((row, rowIndex) =>
        row.map((_, colIndex) => (
          <Cell
            row={rowIndex}
            col={colIndex}
            numRows={numRows}
            numCols={numCols}
            onMouseDown={onMouseDown}
            onMouseOver={onMouseOver}
            onMouseUp={onMouseUp}
            cellType={grid[rowIndex][colIndex]}
            direction={directions?.get(cellToString({ row: rowIndex, col: colIndex }))}
            indexes={indexes?.get(cellToString({ row: rowIndex, col: colIndex }))}
          />
        ))
      )}
    </div>
  );
}
