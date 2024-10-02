"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { PiUploadSimpleBold as UploadIcon } from "react-icons/pi";

interface UploadButtonProps {
  onFileUpload?: (fileContent: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function UploadButton({
  className,
  disabled,
  onFileUpload,
}: UploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && onFileUpload) {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        onFileUpload(content);
      };
      reader.readAsText(file);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
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
        onChange={handleFileChange}
      />
    </>
  );
}
