import { useId, useState } from "react";
import { Image, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FILE_INPUT_ACCEPT } from "../domain/files";

interface DropZoneProps {
  readonly disabled: boolean;
  readonly onFilesSelected: (files: FileList | readonly File[]) => Promise<unknown>;
}

export function DropZone({ disabled, onFilesSelected }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputId = useId();

  return (
    <Card
      className={`grid min-h-48 grid-cols-[4rem_minmax(0,1fr)_auto] items-center gap-5 border-dashed p-6 transition-colors max-sm:grid-cols-1 ${
        isDragging ? "border-primary bg-primary/5" : ""
      }`}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setIsDragging(false);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);

        if (!disabled && event.dataTransfer.files.length > 0) {
          void onFilesSelected(event.dataTransfer.files);
        }
      }}
    >
      <input
        className="pointer-events-none absolute size-px overflow-hidden opacity-0"
        accept={FILE_INPUT_ACCEPT}
        disabled={disabled}
        id={inputId}
        multiple
        onChange={(event) => {
          if (event.currentTarget.files) {
            void onFilesSelected(event.currentTarget.files);
            event.currentTarget.value = "";
          }
        }}
        type="file"
      />
      <div
        className="grid size-16 place-items-center rounded-lg border bg-background text-primary"
        aria-hidden="true"
      >
        <Image size={30} />
      </div>
      <div className="min-w-0">
        <h2 className="text-2xl leading-tight font-semibold tracking-normal">
          Drop images
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          JPEG, PNG, WebP, AVIF, GIF, SVG, BMP, ICO
        </p>
      </div>
      <Button asChild disabled={disabled} variant="secondary">
        <label htmlFor={inputId}>
          <Upload size={17} aria-hidden="true" />
          <span>Choose files</span>
        </label>
      </Button>
    </Card>
  );
}
