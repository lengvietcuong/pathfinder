"use client";

import { useState } from "react";
import { Delay } from "@/types";
import { Button } from "@/components/ui/button";

interface DelaySelectionProps {
  delay: Delay;
  onDelayChange: (delay: Delay) => void;
}

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
  const [selectedDelay, setSelectedDelay] = useState(delay);

  function renderDelayButton(delay: Delay) {
    return (
      <Button
        key={delay}
        onClick={() => {
          onDelayChange(delay);
          setSelectedDelay(delay);
        }}
        variant="ghost"
        size="sm"
        className={`flex-1 text-xs ${delay === selectedDelay ? "bg-muted" : ""}`}
      >
        {LABELS[delay]}
      </Button>
    )
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
