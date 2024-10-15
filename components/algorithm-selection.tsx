import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Algorithm } from "@/types";

// Interface for AlgorithmSelection component props
interface AlgorithmSelectionProps {
  className?: string;
  disabled?: boolean;
  algorithm: Algorithm;
  onAlgorithmChange: (value: Algorithm) => void;
}

// AlgorithmSelection component: Renders a dropdown for selecting pathfinding algorithms
export default function AlgorithmSelection({
  className,
  disabled = false,
  algorithm,
  onAlgorithmChange,
}: AlgorithmSelectionProps) {
  return (
    <Select
      value={algorithm}
      onValueChange={onAlgorithmChange}
      disabled={disabled}
    >
      {/* Trigger for the select dropdown */}
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select algorithm" />
      </SelectTrigger>
      
      {/* Content of the select dropdown */}
      <SelectContent>
        {/* Dynamically generate SelectItems based on available Algorithm values */}
        {Object.values(Algorithm).map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}