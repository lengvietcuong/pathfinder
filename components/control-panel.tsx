import { Button } from "@/components/ui/button";
import UploadButton from "./upload-button";
import DrawButtons from "./draw-buttons";
import DelaySelection from "./delay-selection";
import AlgorithmSelection from "./algorithm-selection";
import { parseGrid } from "@/gridFunctions";
import { HiOutlineSparkles as SparklesIcon } from "react-icons/hi";
import { PiPlayBold as PlayIcon } from "react-icons/pi";
import { Algorithm, CellType, Delay } from "@/types";

interface ControlPanelProps {
  randomizeGrid: () => void;
  clearGrid: () => void;
  onFileUpload: (fileContents: string) => void;
  drawType: CellType | null;
  setDrawType: (drawType: CellType | null) => void;
  algorithm: Algorithm;
  onAlgorithmChange: (algorithm: Algorithm) => void;
  delay: Delay;
  onDelayChange: (delay: Delay) => void;
  visualize: () => void;
  isVisualizing: boolean;
  resetVisualization: () => void;
  numCellsExplored: number;
  pathLength: number;
}

export default function Component({
  randomizeGrid,
  clearGrid,
  onFileUpload,
  drawType,
  setDrawType,
  algorithm,
  onAlgorithmChange,
  delay,
  onDelayChange,
  visualize,
  isVisualizing,
  resetVisualization,
  numCellsExplored,
  pathLength,
}: ControlPanelProps) {
  return (
    <div className="border bg-card py-4 px-6 rounded-lg min-w-80">
      <h2
        className={`mb-3 md:text-lg font-semibold ${
          isVisualizing ? "text-muted-foreground" : ""
        }`}
      >
        Setup grid
      </h2>
      <div className="flex flex-col sm:flex-row gap-2.5 lg:flex-col">
        <Button
          className="flex-1"
          onClick={randomizeGrid}
          disabled={isVisualizing}
          variant="secondary"
        >
          <SparklesIcon className="mr-2 size-4" />
          Randomize
        </Button>
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

      <h2
        className="lg:mt-8 mt-6 mb-3 md:text-lg font-semibold"
      >
        Run algorithm
      </h2>
      <DelaySelection
        delay={delay}
        onDelayChange={onDelayChange}
      />
      <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 mt-2.5">
        <AlgorithmSelection
          className="flex-1"
          disabled={isVisualizing}
          algorithm={algorithm}
          onAlgorithmChange={onAlgorithmChange}
        />
        <Button onClick={visualize} disabled={isVisualizing} className="flex-1">
          <PlayIcon className="mr-2 size-4" />
          Visualize
        </Button>
      </div>

      {numCellsExplored > 0 && (
        <Result
          numCellsExplored={numCellsExplored}
          pathLength={pathLength}
          isVisualizing={isVisualizing}
        />
      )}
    </div>
  );
}

interface ResultProps {
  numCellsExplored: number;
  pathLength: number;
  isVisualizing: boolean;
}

function Result({ numCellsExplored, pathLength, isVisualizing }: ResultProps) {
  return (
    <>
      <h2 className="lg:mt-8 mt-6 mb-3 md:text-lg font-semibold">Result</h2>
      <div className="flex gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">
            Cells explored
          </h3>
          <p className="mt-0.5 text-xl font-medium">{numCellsExplored}</p>
        </div>
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
