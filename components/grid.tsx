import { CellType, CellCoordinates, Direction } from "@/types";
import { PiMapPinBold as LocationIcon } from "react-icons/pi";
import { PiFlagPennantBold as FlagIcon } from "react-icons/pi";
import { cellToString } from "@/utils";

interface GridProps {
  grid: CellType[][];
  path: Map<string, Direction>;
  drawType: CellType | null;
  onMouseDown: (row: number, col: number) => void;
  onMouseOver: (row: number, col: number) => void;
  onMouseUp: () => void;
}

const CELL_COLOR: { [key in CellType]: string } = {
  [CellType.Unexplored]: "bg-card",
  [CellType.Frontier]: "bg-primary/35",
  [CellType.Explored]: "bg-muted",
  [CellType.Wall]: "bg-slate-500",
  [CellType.Start]: "bg-rose-800",
  [CellType.Goal]: "bg-emerald-800",
  [CellType.Path]: "bg-primary",
};

const CURSOR_ICON: Record<CellType, string> = {
  [CellType.Start]: "cursor-location",
  [CellType.Goal]: "cursor-flag",
  [CellType.Wall]: "cursor-wall",
  [CellType.Unexplored]: "cursor-eraser",
  [CellType.Frontier]: "cursor-default",
  [CellType.Explored]: "cursor-default",
  [CellType.Path]: "cursor-default",
};

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

export default function Grid({
  grid,
  path,
  drawType,
  onMouseDown,
  onMouseOver,
  onMouseUp,
}: GridProps) {
  function renderCell({ row, col }: CellCoordinates) {
    const cell = grid[row][col];

    const cellString = cellToString({ row, col });
    const direction = path.get(cellString);
    let CellIcon = null;
    if (cell === CellType.Start) {
      CellIcon = LocationIcon;
    } else if (cell === CellType.Goal) {
      CellIcon = FlagIcon;
    }

    return (
      <>
        {/* Desktop size */}
        <div
          key={`d-${row}-${col}`}
          className={`hidden lg:grid relative max-w-16 max-h-16 place-items-center ${CELL_COLOR[cell]}`}
          style={{
            height: `min(calc(60svw / ${numCols}), calc(75svh / ${numRows}))`,
            width: `min(calc(60svw / ${numCols}), calc(75svh / ${numRows}))`,
          }}
          onMouseDown={() => onMouseDown(row, col)}
          onMouseOver={() => onMouseOver(row, col)}
          onMouseUp={onMouseUp}
        >
          {CellIcon && <CellIcon className="size-2/3" />}
          {direction !== undefined && (
            <div
              className={`z-10 absolute bg-foreground ${DIRECTION_BAR[direction]}`}
            />
          )}
        </div>

        {/* Mobile and tablet size */}
        <div
          key={`m-${row}-${col}`}
          className={`grid lg:hidden relative max-w-16 max-h-16 place-items-center ${CELL_COLOR[cell]}`}
          style={{
            height: `min(calc(90svw / ${numCols}), calc(90svh / ${numRows}))`,
            width: `min(calc(90svw / ${numCols}), calc(90svh / ${numRows}))`,
          }}
          onMouseDown={() => onMouseDown(row, col)}
          onMouseOver={() => onMouseOver(row, col)}
          onMouseUp={onMouseUp}
        >
          {CellIcon && <CellIcon className="size-2/3" />}
          {direction !== undefined && (
            <div
              className={`z-10 absolute bg-foreground ${DIRECTION_BAR[direction]}`}
            />
          )}
        </div>
      </>
    );
  }

  if (!grid.length || !grid[0].length) return null;

  const numRows = grid.length;
  const numCols = grid[0].length;
  const cursorIcon =
    drawType !== null ? CURSOR_ICON[drawType] : "cursor-default";

  return (
    <div
      className={`w-fit h-fit mx-auto grid border-4 bg-slate-800/75 rounded-lg gap-[1px] ${cursorIcon}`}
      style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
      onMouseLeave={onMouseUp}
    >
      {grid.map((row, rowIndex) =>
        row.map((_, colIndex) => renderCell({ row: rowIndex, col: colIndex }))
      )}
    </div>
  );
}
