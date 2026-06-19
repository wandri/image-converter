import { Archive, Download, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ActionBarProps {
  readonly totalCount: number;
  readonly completedCount: number;
  readonly failedCount: number;
  readonly isConverting: boolean;
  readonly isPreparingZip: boolean;
  readonly onClear: () => void;
  readonly onConvert: () => void;
  readonly onDownloadZip: () => void;
}

export function ActionBar({
  totalCount,
  completedCount,
  failedCount,
  isConverting,
  isPreparingZip,
  onClear,
  onConvert,
  onDownloadZip,
}: ActionBarProps) {
  const hasFiles = totalCount > 0;
  const hasCompletedFiles = completedCount > 0;

  return (
    <Card
      className="flex flex-row items-center justify-between gap-3 p-3 max-md:flex-col max-md:items-stretch"
      aria-label="Batch actions"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Metric label="Queued" value={totalCount} />
        <Metric label="Done" value={completedCount} />
        <Metric label="Failed" value={failedCount} />
      </div>
      <Separator className="hidden h-10 md:block" orientation="vertical" />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          disabled={!hasFiles || isConverting}
          onClick={onConvert}
          type="button"
        >
          <Play size={17} aria-hidden="true" />
          <span>{isConverting ? "Converting" : "Convert"}</span>
        </Button>
        <Button
          disabled={!hasCompletedFiles || isPreparingZip}
          onClick={onDownloadZip}
          type="button"
          variant="outline"
        >
          <Archive size={17} aria-hidden="true" />
          <span>{isPreparingZip ? "Preparing" : "ZIP"}</span>
        </Button>
        <Button asChild variant="outline">
          <a
            aria-disabled={!hasCompletedFiles}
            className={!hasCompletedFiles ? "pointer-events-none opacity-50" : ""}
            href="#downloads"
            onClick={(event) => {
              if (!hasCompletedFiles) {
                event.preventDefault();
              }
            }}
          >
            <Download size={17} aria-hidden="true" />
            <span>Files</span>
          </a>
        </Button>
        <Button
          aria-label="Clear files"
          disabled={!hasFiles || isConverting}
          onClick={onClear}
          size="icon"
          title="Clear files"
          type="button"
          variant="destructive"
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </Card>
  );
}

function Metric({ label, value }: { readonly label: string; readonly value: number }) {
  return (
    <span className="grid min-h-12 min-w-20 content-center rounded-lg border bg-muted/40 px-3 py-1">
      <strong className="text-lg leading-none">{value}</strong>
      <span className="text-xs text-muted-foreground">{label}</span>
    </span>
  );
}
