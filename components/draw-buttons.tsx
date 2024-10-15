import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { PiMapPinBold as LocationIcon } from "react-icons/pi";
import { PiFlagPennantBold as FlagIcon } from "react-icons/pi";
import { BrickWall as WallIcon } from "lucide-react";
import { LuEraser as EraserIcon } from "react-icons/lu";
import { PiNoteBlankBold as BlankIcon } from "react-icons/pi";
import { CellType } from "@/types";
import { cn } from "@/lib/utils";

// Interface for individual DrawButton props
interface DrawButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  icon: ReactNode;
  tooltip: string;
}

// DrawButton component: Renders a single button with tooltip
function DrawButton({
  isActive,
  onClick,
  disabled,
  icon,
  tooltip,
}: DrawButtonProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className={`${
              isActive
                ? "border-primary bg-primary/25 hover:bg-primary/25"
                : ""
            }`}
            size="icon"
            onClick={onClick}
            disabled={disabled}
            variant="outline"
          >
            {icon}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Interface for DrawButtons component props
interface DrawButtonsProps {
  className?: string;
  drawType: CellType | null;
  setDrawType: (drawType: CellType | null) => void;
  clearGrid: () => void;
  resetVisualization: () => void;
  disabled: boolean;
}

// Main DrawButtons component: Renders a set of drawing tool buttons
export default function DrawButtons({
  className,
  drawType,
  setDrawType,
  clearGrid,
  resetVisualization,
  disabled,
}: DrawButtonsProps) {
  // Handler for selecting a draw type
  function handleSelectDrawType(type: CellType) {
    resetVisualization();
    setDrawType(drawType === type ? null : type);
  }

  return (
    <div className={cn("flex gap-1.5", className)}>
      {/* Start point button */}
      <DrawButton
        isActive={drawType === CellType.Start}
        onClick={() => handleSelectDrawType(CellType.Start)}
        disabled={disabled}
        icon={<LocationIcon className="size-4" />}
        tooltip="Set start"
      />
      {/* Goal point button */}
      <DrawButton
        isActive={drawType === CellType.Goal}
        onClick={() => handleSelectDrawType(CellType.Goal)}
        disabled={disabled}
        icon={<FlagIcon className="size-4" />}
        tooltip="Set goal"
      />
      {/* Wall drawing button */}
      <DrawButton
        isActive={drawType === CellType.Wall}
        onClick={() => handleSelectDrawType(CellType.Wall)}
        disabled={disabled}
        icon={<WallIcon className="size-4" />}
        tooltip="Draw wall"
      />
      {/* Eraser button */}
      <DrawButton
        isActive={drawType === CellType.Unexplored}
        onClick={() => handleSelectDrawType(CellType.Unexplored)}
        disabled={disabled}
        icon={<EraserIcon className="size-4" />}
        tooltip="Erase"
      />
      {/* Clear grid button */}
      <DrawButton
        isActive={false}
        onClick={() => {
          resetVisualization();
          clearGrid();
        }}
        disabled={disabled}
        icon={<BlankIcon className="size-4" />}
        tooltip="Clear grid"
      />
    </div>
  );
}