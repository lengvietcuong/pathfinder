import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Algorithm } from "@/types";

interface AlgorithmSelectionProps {
  className?: string;
  disabled?: boolean;
  algorithm: Algorithm;
  onAlgorithmChange: (value: Algorithm) => void;
}

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
      <SelectTrigger className={className}>
        <SelectValue placeholder="Select algorithm" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(Algorithm).map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
