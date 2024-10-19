import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"
import UploadButton from "./upload-button";
import DrawButtons from "./draw-buttons";
import DelaySelection from "./delay-selection";
import AlgorithmSelection from "./algorithm-selection";
import { HiOutlineSparkles as SparklesIcon } from "react-icons/hi";
import { PiPlayBold as PlayIcon } from "react-icons/pi";
import { Algorithm, CellType, Delay } from "@/types";

// Props interface for the main control panel component
// Handles grid manipulation, algorithm selection, and visualization controls
interface ControlPanelProps {
  // Grid generation controls
  randomizeWithMultipleGoals: boolean;
  setRandomizeWithMultipleGoals: (randomizeWithMultipleGoals: boolean) => void;
  randomizeGrid: () => void;
  clearGrid: () => void;
  onFileUpload: (fileContents: string) => void;
  
  // Drawing controls
  drawType: CellType | null;
  setDrawType: (drawType: CellType | null) => void;
  
  // Algorithm and visualization settings
  algorithm: Algorithm;
  setAlgorithm: (algorithm: Algorithm) => void;
  delay: Delay;
  onDelayChange: (delay: Delay) => void;
  
  // Visualization controls and state
  visualize: () => void;
  isVisualizing: boolean;
  resetVisualization: () => void;
  
  // Results display
  numNodesCreated: number;
  pathLength: number;
}

export default function Component({
  randomizeWithMultipleGoals,
  setRandomizeWithMultipleGoals,
  randomizeGrid,
  clearGrid,
  onFileUpload,
  drawType,
  setDrawType,
  algorithm,
  setAlgorithm,
  delay,
  onDelayChange,
  visualize,
  isVisualizing,
  resetVisualization,
  numNodesCreated,
  pathLength,
}: ControlPanelProps) {
  return (
    // Main control panel container with card styling
    <div className="border bg-card py-4 px-6 rounded-lg min-w-80">
      {/* Grid Setup Section */}
      <h2
        className={`mb-3 md:text-lg font-semibold ${
          isVisualizing ? "text-muted-foreground" : ""
        }`}
      >
        Setup grid
      </h2>
      <div className="flex flex-col gap-2.5">
        {/* Multiple goals checkbox and randomize button */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 py-2 border rounded-md">
            <Label htmlFor="randomize-with-multiple-goals">
              Randomize multiple goals
            </Label>
            <Switch
              id="randomize-with-multiple-goals"
              checked={randomizeWithMultipleGoals}
              onCheckedChange={setRandomizeWithMultipleGoals}
              disabled={isVisualizing}
            />
          </div>
          <Button
            className="flex-1"
            onClick={randomizeGrid}
            disabled={isVisualizing}
            variant="secondary"
          >
            <SparklesIcon className="mr-2 size-4" />
            Randomize
          </Button>
        </div>
        
        {/* Grid manipulation buttons */}
        <UploadButton
          className="flex-1"
          disabled={isVisualizing}
          onFileUpload={onFileUpload}
        />
        <DrawButtons
          className="flex-1 justify-evenly"
          drawType={drawType}
          setDrawType={setDrawType}
          clearGrid={clearGrid}
          resetVisualization={resetVisualization}
          disabled={isVisualizing}
        />
      </div>

      {/* Algorithm Configuration Section */}
      <h2 className="lg:mt-8 mt-6 mb-3 md:text-lg font-semibold">
        Run algorithm
      </h2>
      {/* Algorithm dropdown with automatic visualization reset on change */}
      <AlgorithmSelection
        className="flex-1"
        disabled={isVisualizing}
        algorithm={algorithm}
        onAlgorithmChange={(algorithm: Algorithm) => {
          resetVisualization();
          setAlgorithm(algorithm);
        }}
      />
      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 mt-2.5">
        {/* Visualization speed control and start button */}
        <DelaySelection
          delay={delay}
          onDelayChange={onDelayChange}
          className="flex-1 lg:flex-initial lg:w-full"
        />
        <Button onClick={visualize} disabled={isVisualizing} className="flex-1">
          <PlayIcon className="mr-2 size-4" />
          Visualize
        </Button>
      </div>

      {/* Results Section - Only shown when algorithm has been run */}
      {numNodesCreated > 0 && (
        <Result
          numNodesCreated={numNodesCreated}
          pathLength={pathLength}
          isVisualizing={isVisualizing}
        />
      )}
    </div>
  );
}

// Component to display algorithm execution results
// Shows number of cells explored and final path length
interface ResultProps {
  numNodesCreated: number;  // Total cells visited during search
  pathLength: number;       // Length of found path (0 if no path found)
  isVisualizing: boolean;   // Whether algorithm is currently running
}

function Result({ numNodesCreated, pathLength, isVisualizing }: ResultProps) {
  return (
    <>
      <h2 className="lg:mt-8 mt-6 mb-3 md:text-lg font-semibold">Result</h2>
      <div className="flex gap-4">
        {/* Display number of explored cells */}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            Cells explored
          </h3>
          <p className="mt-0.5 text-xl font-medium">{numNodesCreated}</p>
        </div>
        {/* Display path length (only when visualization is complete) */}
        <div className="flex-1">
          {!isVisualizing && (
            <>
              <h3 className="text-sm font-medium text-muted-foreground">
                Path length
              </h3>
              {pathLength > 0 ? (
                <p className="mt-0.5 text-xl font-medium">{pathLength}</p>
              ) : (
                <p className="mt-0.5 text-destructive font-medium">Not found</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}