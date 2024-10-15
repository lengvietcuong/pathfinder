"use client";

import { useState } from "react";
import { Delay } from "@/types"; // Enum for delay values
import { Button } from "@/components/ui/button";

interface DelaySelectionProps {
  delay: Delay; // Initial delay value
  onDelayChange: (delay: Delay) => void; // Callback when delay changes
}

// Labels for each delay option
const LABELS: Record<Delay, string> = {
  [Delay.Slow]: "Slow",
  [Delay.Normal]: "Normal",
  [Delay.Fast]: "Fast",
  [Delay.Instant]: "Instant",
};

export default function DelaySelection({
  delay,
  onDelayChange,
}: DelaySelectionProps) {
  const [selectedDelay, setSelectedDelay] = useState(delay); // Local state for selected delay

  // Renders a button for each delay option
  function renderDelayButton(delay: Delay) {
    return (
      <Button
        key={delay}
        onClick={() => {
          onDelayChange(delay); // Update the parent with the selected delay
          setSelectedDelay(delay); // Update the local state
        }}
        variant="ghost"
        size="sm"
        className={`flex-1 text-xs ${delay === selectedDelay ? "bg-muted" : ""}`} // Highlight selected button
      >
        {LABELS[delay]}
      </Button>
    );
  }

  return (
    <div className="flex gap-1">
      {renderDelayButton(Delay.Slow)}
      {renderDelayButton(Delay.Normal)}
      {renderDelayButton(Delay.Fast)}
      {renderDelayButton(Delay.Instant)}
    </div>
  );
}
