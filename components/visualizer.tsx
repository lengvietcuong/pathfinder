"use client";

import { useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Grid from "./grid";
import { GRID_ROWS, GRID_COLS } from "@/constants";
import {
  CellType,
  Algorithm,
  CellCoordinates,
  Direction,
  Delay,
} from "@/types";
import {
  createEmptyGrid,
  createRandomGrid,
  parseGrid,
  findStartAndGoals,
  resetVisualization,
} from "@/gridFunctions";
import { delay, stringToCell } from "@/utils";
import { findPath } from "@/algorithms";
import ControlPanel from "./control-panel";

export default function Visualizer({
  initialGrid = createEmptyGrid(GRID_ROWS, GRID_COLS),
}: {
  initialGrid?: CellType[][];
}) {
  // State declarations for grid, algorithm, visualization progress, and user interactions
  const [grid, setGrid] = useState<CellType[][]>(initialGrid);
  const [algorithm, setAlgorithm] = useState<Algorithm>(Algorithm.AStar);
  const [numCellsExplored, setNumCellsExplored] = useState(0);
  const [path, setPath] = useState(new Map());

  const [drawType, setDrawType] = useState<CellType | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const delayBetweenSteps = useRef(Delay.Fast);
  const { toast } = useToast();

  // Main function to run the pathfinding visualization
  async function visualize() {
    resetResults();
    setDrawType(null);

    const currentGrid: CellType[][] = resetVisualization(grid);
    setGrid(currentGrid);
    if (!validateGrid(currentGrid)) return;

    setIsVisualizing(true);
    try {
      const steps = findPath(currentGrid, algorithm);
      let step = steps.next();
      while (!step.done) {
        if (Array.isArray(step.value)) {
          const cells = step.value;
          expandFrontier(cells);
        } else {
          const cell = step.value;
          exploreCell(cell);
        }
        if (delayBetweenSteps.current > 0) {
          await delay(delayBetweenSteps.current);
        }
        step = steps.next();
      }
      const path = step.value;
      traceback(path);
    } catch (error) {
      // An error is raised if no path is found
      // If pathLength is still 0 after the algorithm finishes, "Not found" is displayed in the Result component
    }
    setIsVisualizing(false);
  }

  // Helper functions for grid manipulation and visualization
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

  function expandFrontier(cells: CellCoordinates[]) {
    setGrid((previousGrid) => {
      const newGrid = [...previousGrid];
      for (const cell of cells) {
        const { row, col } = cell;
        if (
          previousGrid[row][col] !== CellType.Start &&
          previousGrid[row][col] !== CellType.Goal
        ) {
          newGrid[row][col] = CellType.Frontier;
        }
      }
      return newGrid;
    });
  }

  function exploreCell(cell: CellCoordinates) {
    const { row, col } = cell;
    setGrid((previousGrid) => {
      const newGrid = [...previousGrid];
      if (
        previousGrid[row][col] !== CellType.Start &&
        previousGrid[row][col] !== CellType.Goal
      ) {
        newGrid[row][col] = CellType.Explored;
      }
      return newGrid;
    });

    setNumCellsExplored((prev) => prev + 1);
  }

  function traceback(path: Map<string, Direction>) {
    setGrid((previousGrid) => {
      const newGrid = [...previousGrid];
      path.forEach((_, cellString) => {
        const { row, col } = stringToCell(cellString);
        if (
          grid[row][col] !== CellType.Start &&
          grid[row][col] !== CellType.Goal
        ) {
          newGrid[row][col] = CellType.Path;
        }
      });
      return newGrid;
    });
    setPath(path);
  }

  // Functions for grid manipulation (randomize, clear, load)
  function randomizeGrid() {
    setGrid(createRandomGrid(GRID_ROWS, GRID_COLS));
    resetResults();
  }

  function clearGrid() {
    setGrid(createEmptyGrid(GRID_ROWS, GRID_COLS));
    resetResults();
  }

  function loadGrid(fileContents: string) {
    try {
      const grid = parseGrid(fileContents);
      setGrid(grid);
      resetResults();
    } catch (error) {
      toast({
        title: "Invalid grid",
        variant: "destructive",
        description: "Please check your file input",
      });
    }
  }

  // Functions to reset visualization state
  function resetResults() {
    setNumCellsExplored(0);
    setPath(new Map());
  }

  function resetVisualizaton() {
    setGrid(resetVisualization(grid));
    resetResults();
  }

  // Functions to handle user interactions (drawing on the grid)
  function handleDraw(row: number, col: number) {
    if (drawType === null) return;

    setGrid((prevGrid) => {
      const newGrid = [...prevGrid];
      if (drawType === CellType.Start) {
        // Only 1 starting cell can exist, so erase the old starting cell
        for (let r = 0; r < prevGrid.length; r++) {
          for (let c = 0; c < prevGrid[r].length; c++) {
            if (prevGrid[r][c] === CellType.Start) {
              newGrid[r][c] = CellType.Unexplored;
            }
          }
        }
      }
      newGrid[row][col] = drawType;
      return newGrid;
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

  function handleAlgorithmChange(algorithm: Algorithm) {
    setAlgorithm(algorithm);
    resetVisualizaton();
  }

  // Render the Visualizer component
  return (
    <div className="flex lg:flex-row flex-col-reverse gap-6 mx-auto">
      <Grid
        grid={grid}
        path={path}
        drawType={drawType}
        onMouseDown={handleMouseDown}
        onMouseOver={handleMouseOver}
        onMouseUp={() => setIsDrawing(false)}
      />
      <ControlPanel
        randomizeGrid={randomizeGrid}
        clearGrid={clearGrid}
        onFileUpload={loadGrid}
        drawType={drawType}
        setDrawType={setDrawType}
        algorithm={algorithm}
        onAlgorithmChange={handleAlgorithmChange}
        delay={delayBetweenSteps.current}
        onDelayChange={(delay) => (delayBetweenSteps.current = delay)}
        visualize={visualize}
        isVisualizing={isVisualizing}
        resetVisualization={resetVisualizaton}
        numCellsExplored={numCellsExplored}
        pathLength={path.size}
      />
    </div>
  );
}