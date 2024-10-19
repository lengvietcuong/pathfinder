"use client";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PiUploadSimpleBold as UploadIcon } from "react-icons/pi";

// Props interface for the upload button component
// Handles both click-to-upload and drag-and-drop functionality
interface UploadButtonProps {
  onFileUpload?: (fileContent: string) => void;  // Callback when file is uploaded
  className?: string;                            // Additional CSS classes
  disabled?: boolean;                            // Disable upload functionality
}

export default function UploadButton({
  className = "",
  disabled = false,
  onFileUpload,
}: UploadButtonProps) {
  // Reference to hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);
  // State to track active drag operation
  const [isDragging, setIsDragging] = useState(false);

  // Handles file reading and triggers callback with file contents
  function handleFileChange(file: File) {
    if (file && onFileUpload) {
      const reader = new FileReader();
      reader.onload = () => onFileUpload(reader.result as string);
      reader.readAsText(file);
    }
  }

  // Drag event handlers
  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  // Handles file drop event
  // Only processes .txt files and respects disabled state
  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file && file.type === "text/plain") {
      handleFileChange(file);
    }
  }

  return (
    // Container div that handles drag and drop events
    <div
      className={`relative ${className}`}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Visible button that triggers file selection */}
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={`w-full h-16 flex flex-col gap-1 ${
          isDragging ? "bg-primary/15 border-primary" : "bg-none"
        }`}
      >
        <UploadIcon className="size-4" />
        <span>Upload or drag & drop .txt file</span>
      </Button>

      {/* Hidden file input element */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".txt"
        className="sr-only"
        onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
        aria-label="Upload .txt file"
      />
    </div>
  );
}