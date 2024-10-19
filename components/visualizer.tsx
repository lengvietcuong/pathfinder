"use client";

import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Grid from "./grid";
import { GRID_ROWS, GRID_COLS } from "@/constants";
import {
  CellType,
  Algorithm,
  CellCoordinates,
  Delay,
  SearchResult,
} from "@/types";
import {
  createEmptyGrid,
  createRandomGrid,
  parseGrid,
  findStartAndGoals,
  resetVisualization,
} from "@/gridFunctions";
import { cellToString, delay } from "@/utils";
import { findPath } from "@/algorithms";
import ControlPanel from "./control-panel";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Main component for pathfinding visualization. Supports multiple pages of grids
// to show different stages of pathfinding for multiple goals
export default function Visualizer({
  initialGrid = createEmptyGrid(GRID_ROWS, GRID_COLS),
}: {
  initialGrid?: CellType[][];
}) {
  // Configuration state for pathfinding behavior
  const [randomizeWithMultipleGoals, setRandomizeWithMultipleGoals] =
    useState(false);
  const [algorithm, setAlgorithm] = useState<Algorithm>(Algorithm.AStar);

  // State for handling multiple grids/pages during multi-goal pathfinding
  const [grids, setGrids] = useState<CellType[][][]>([initialGrid]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([
    { nodesCreated: new Set(), path: [] },
  ]);

  // Drawing state for wall/path creation via mouse interactions
  const [drawType, setDrawType] = useState<CellType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const delayBetweenSteps = useRef(Delay.Fast);
  const { toast } = useToast();

  // Main visualization function that runs the selected pathfinding algorithm
  // and updates the grid state as the algorithm progresses
  async function visualize() {
    const initialGrid = resetVisualization(grids[0]);
    setGrids([initialGrid]);
    if (!validateGrid(initialGrid)) return;

    resetResults();
    setDrawType(null);
    setIsVisualizing(true);

    // Process each step of the pathfinding algorithm
    const steps = findPath(initialGrid, algorithm);
    let step = steps.next();

    // These variables are used if instant speed is selected
    let currentGrid = [...initialGrid];
    let currentSearchResult = searchResults[0];

    while (!step.done) {
      const value = step.value;
      if (value.type === "grid") {
        // A goal is found -> create new page (new grid) for the next goal
        await delay(1_000); // Delay for 1 second for the user to see the path found
        setGrids((prevGrids) => [...prevGrids, value.grid]);
        setSearchResults((prevResults) => [
          ...prevResults,
          { nodesCreated: new Set(), path: [] },
        ]);
        setCurrentPageIndex((prevIndex) => prevIndex + 1);
        
        currentGrid = value.grid;
        currentSearchResult = { nodesCreated: new Set(), path: [] };

        step = steps.next();
        continue;
      }

      // In the search process -> update the current grid
      let cellType: CellType, cells: CellCoordinates[];
      if (value.type === "path") {
        cellType = CellType.Path;
        cells = value.path;
      } else if (value.type === "explore") {
        cellType = CellType.Explored;
        cells = [value.cell];
      } else {
        cellType = CellType.Frontier;
        cells = value.cells;
      }

      // If there is delay, update the UI every step
      if (delayBetweenSteps.current > 0) {
        udpateVisualization(cells, cellType);
        await delay(delayBetweenSteps.current);
        step = steps.next();
        continue;
      }

      // Otherwise, update the grid all at once without re-renders for intermediate steps
      markCells(cells, cellType, currentGrid);
      // Only re-render when a path is found
      if (cellType === CellType.Path) {
        currentSearchResult.path = cells;
        setGrids((prevGrids) => [...prevGrids.slice(0, -1), currentGrid]);
        setSearchResults((prevResults) => [
          ...prevResults.slice(0, -1),
          currentSearchResult,
        ]);
      } else {
        for (const cell of cells) {
          currentSearchResult.nodesCreated.add(cellToString(cell));
        }
      }

      step = steps.next();
    }

    setIsVisualizing(false);
  }

  // Validates that the grid has the required start and goal cells
  function validateGrid(grid: CellType[][]) {
    try {
      findStartAndGoals(grid);
      return true;
    } catch (error) {
      toast({
        title: "Invalid grid",
        variant: "destructive",
        description: (error as Error).message,
      });
      return false;
    }
  }

  function markCells(
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
    return grid;
  }

  // Updates the grid and tracking data when cells are marked during visualization
  function udpateVisualization(cells: CellCoordinates[], cellType: CellType) {
    setGrids((previousGrids) => {
      const newGrids = [...previousGrids];
      const grid = newGrids[newGrids.length - 1];
      markCells(cells, cellType, grid);
      return newGrids;
    });

    setSearchResults((prevResults) => {
      const newResults = [...prevResults];
      const result = newResults[newResults.length - 1];
      if (cellType === CellType.Path) {
        result.path = cells;
      } else {
        for (const cell of cells) {
          result.nodesCreated.add(cellToString(cell));
        }
      }
      return newResults;
    });
  }

  // Resets the search results and pagination state
  function resetResults() {
    setSearchResults([{ nodesCreated: new Set(), path: [] }]);
    setCurrentPageIndex(0);
  }

  // Grid manipulation functions
  function resetVisualizaton() {
    setGrids([resetVisualization(grids[0])]);
    resetResults();
  }

  function randomizeGrid() {
    setGrids([
      createRandomGrid(GRID_ROWS, GRID_COLS, randomizeWithMultipleGoals),
    ]);
    resetResults();
  }

  function clearGrid() {
    setGrids([createEmptyGrid(GRID_ROWS, GRID_COLS)]);
    resetResults();
  }

  // Handles grid loading from file, with size validation
  function loadGrid(fileContents: string) {
    try {
      const grid = parseGrid(fileContents);
      const numRows = grid.length;
      const numCols = grid[0].length;
      if (numRows > 50 || numCols > 50) {
        toast({
          title: "Grid too large",
          variant: "destructive",
          description: "Please input at most a 50x50 grid",
        });
        return;
      }
      setGrids([grid]);
      resetResults();
    } catch (error) {
      toast({
        title: "Invalid grid",
        variant: "destructive",
        description: "Please check your file input",
      });
    }
  }

  function handlePageChange(pageIndex: number) {
    if (pageIndex >= 0 && pageIndex < grids.length) {
      setCurrentPageIndex(pageIndex);
    }
  }

  // Drawing handlers for interactive grid modification
  function handleDraw(row: number, col: number) {
    if (drawType === null) return;

    setGrids((previousGrids) => {
      const previousGrid = previousGrids[0];
      const newGrid = [...previousGrid];
      if (drawType === CellType.Start) {
        // Only 1 starting cell can exist, so erase the old starting cell
        for (let r = 0; r < previousGrid.length; r++) {
          for (let c = 0; c < previousGrid[r].length; c++) {
            if (previousGrid[r][c] === CellType.Start) {
              newGrid[r][c] = CellType.Unexplored;
            }
          }
        }
      }
      newGrid[row][col] = drawType;
      return [newGrid];
    });
  }

  function handleMouseDown(row: number, col: number) {
    setIsDrawing(true);
    handleDraw(row, col);
  }

  function handleMouseOver(row: number, col: number) {
    if (
      isDrawing &&
      (drawType === CellType.Wall || drawType === CellType.Unexplored)
    ) {
      handleDraw(row, col);
    }
  }

  return (
    <div className="flex flex-col gap-6 mx-auto">
      <div className="flex lg:flex-row flex-col-reverse gap-6">
        <div className="flex flex-col items-center">
          <Grid
            grid={grids[currentPageIndex]}
            path={searchResults[currentPageIndex]?.path || []}
            drawType={drawType}
            onMouseDown={handleMouseDown}
            onMouseOver={handleMouseOver}
            onMouseUp={() => setIsDrawing(false)}
          />
          <Pagination
            className={`mt-4 ${grids.length === 1 ? "opacity-0" : ""}`}
          >
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPageIndex - 1)}
                />
              </PaginationItem>
              {grids.map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => handlePageChange(index)}
                    isActive={index === currentPageIndex}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPageIndex + 1)}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        <ControlPanel
          randomizeWithMultipleGoals={randomizeWithMultipleGoals}
          setRandomizeWithMultipleGoals={setRandomizeWithMultipleGoals}
          randomizeGrid={randomizeGrid}
          clearGrid={clearGrid}
          onFileUpload={loadGrid}
          drawType={drawType}
          setDrawType={setDrawType}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          delay={delayBetweenSteps.current}
          onDelayChange={(delay) => (delayBetweenSteps.current = delay)}
          visualize={visualize}
          isVisualizing={isVisualizing}
          resetVisualization={resetVisualizaton}
          numNodesCreated={
            searchResults[currentPageIndex]?.nodesCreated.size || 0
          }
          pathLength={searchResults[currentPageIndex]?.path.length || 0}
        />
      </div>
    </div>
  );
}
