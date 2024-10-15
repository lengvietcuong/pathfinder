"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PiUploadSimpleBold as UploadIcon } from "react-icons/pi";

interface UploadButtonProps {
  onFileUpload?: (fileContent: string) => void; // Callback for file upload
  className?: string;
  disabled?: boolean;
}

export default function UploadButton({
  className,
  disabled,
  onFileUpload,
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref to access the hidden input

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; // Get selected file
    if (file && onFileUpload) {
      const reader = new FileReader();
      reader.onload = () => onFileUpload(reader.result as string); // Pass file content to callback
      reader.readAsText(file);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()} // Trigger file input click
        className={className}
        disabled={disabled}
      >
        <UploadIcon className="size-4 mr-2" />
        Upload .txt file
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt"
        className="hidden"
        onChange={handleFileChange} // Handle file selection
      />
    </>
  );
}
