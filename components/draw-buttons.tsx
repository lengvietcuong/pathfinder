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

interface DrawButtonProps {
  isActive: boolean;
  onClick: () => void;
  disabled: boolean;
  icon: ReactNode;
  tooltip: string;
}

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

interface DrawButtonsProps {
  className?: string;
  drawType: CellType | null;
  setDrawType: (drawType: CellType | null) => void;
  clearGrid: () => void;
  resetVisualization: () => void;
  disabled: boolean;
}

export default function DrawButtons({
  className,
  drawType,
  setDrawType,
  clearGrid,
  resetVisualization,
  disabled,
}: DrawButtonsProps) {
  function handleSelectDrawType(type: CellType) {
    resetVisualization();
    setDrawType(drawType === type ? null : type);
  }

  return (
    <div className={cn("flex gap-1.5", className)}>
      <DrawButton
        isActive={drawType === CellType.Start}
        onClick={() => handleSelectDrawType(CellType.Start)}
        disabled={disabled}
        icon={<LocationIcon className="size-4" />}
        tooltip="Set start"
      />
      <DrawButton
        isActive={drawType === CellType.Goal}
        onClick={() => handleSelectDrawType(CellType.Goal)}
        disabled={disabled}
        icon={<FlagIcon className="size-4" />}
        tooltip="Set goal"
      />
      <DrawButton
        isActive={drawType === CellType.Wall}
        onClick={() => handleSelectDrawType(CellType.Wall)}
        disabled={disabled}
        icon={<WallIcon className="size-4" />}
        tooltip="Draw wall"
      />
      <DrawButton
        isActive={drawType === CellType.Unexplored}
        onClick={() => handleSelectDrawType(CellType.Unexplored)}
        disabled={disabled}
        icon={<EraserIcon className="size-4" />}
        tooltip="Erase"
      />
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
