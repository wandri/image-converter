import { AlertCircle, CheckCircle2, Download, Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBytes, formatDimensions } from "../domain/files";
import type { ImageJob, JobStatus } from "../domain/types";

interface JobListProps {
  readonly jobs: readonly ImageJob[];
  readonly isConverting: boolean;
  readonly onDownload: (jobId: string) => void;
  readonly onRemove: (jobId: string) => void;
}

export function JobList({ jobs, isConverting, onDownload, onRemove }: JobListProps) {
  if (jobs.length === 0) {
    return (
      <Card className="min-h-80 justify-center" aria-label="No files selected">
        <CardContent className="grid place-items-center gap-5 text-center">
          <div
            className="grid aspect-video w-[min(360px,80%)] grid-cols-[1fr_0.8fr_1.1fr] gap-2 rounded-lg border bg-muted/40 p-2"
            aria-hidden="true"
          >
            <span className="rounded-md border bg-background" />
            <span className="rounded-md border bg-background" />
            <span className="rounded-md border bg-background" />
          </div>
          <h2 className="text-xl font-semibold tracking-normal">Ready for images</h2>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="grid gap-3" id="downloads" aria-label="Selected files">
      {jobs.map((job) => (
        <Card className="grid grid-cols-[7rem_minmax(0,1fr)_auto] gap-4 p-3 max-sm:grid-cols-[5rem_minmax(0,1fr)]" key={job.id}>
          <div className="aspect-square w-28 overflow-hidden rounded-lg border bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] max-sm:w-20">
            <img
              alt=""
              className="block size-full object-contain"
              src={job.output?.previewUrl ?? job.sourceUrl}
            />
          </div>
          <div className="grid min-w-0 content-start gap-2">
            <CardHeader className="grid gap-1 p-0 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <CardTitle className="overflow-wrap-anywhere text-sm leading-snug">
                  {job.file.name}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatDimensions(job.originalDimensions)} /{" "}
                  {formatBytes(job.file.size)}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </CardHeader>

            {job.output ? (
              <div className="flex flex-wrap gap-1.5 text-xs">
                <Badge className="max-w-full overflow-wrap-anywhere h-auto whitespace-normal" variant="outline">
                  {job.output.outputName}
                </Badge>
                <Badge variant="secondary">
                  {job.output.width} x {job.output.height}
                </Badge>
                <Badge variant="secondary">{formatBytes(job.output.size)}</Badge>
                <Badge variant="secondary">{Math.round(job.output.durationMs)} ms</Badge>
              </div>
            ) : null}

            {job.output?.base64Sample ? (
              <code className="block max-w-full overflow-hidden rounded-lg border bg-muted/40 p-2 text-xs text-muted-foreground text-ellipsis whitespace-nowrap">
                {job.output.base64Sample}...
              </code>
            ) : null}

            {job.error ? (
              <p className="text-sm font-medium text-destructive">{job.error}</p>
            ) : null}
          </div>
          <div className="grid grid-rows-2 gap-2 max-sm:col-span-2 max-sm:grid-cols-2 max-sm:grid-rows-1">
            <Button
              aria-label={`Download ${job.file.name}`}
              disabled={!job.output}
              onClick={() => onDownload(job.id)}
              size="icon"
              title="Download"
              type="button"
              variant="outline"
            >
              <Download size={18} />
            </Button>
            <Button
              aria-label={`Remove ${job.file.name}`}
              disabled={isConverting}
              onClick={() => onRemove(job.id)}
              size="icon"
              title="Remove"
              type="button"
              variant="destructive"
            >
              <Trash2 size={18} />
            </Button>
          </div>
        </Card>
      ))}
    </section>
  );
}

function StatusBadge({ status }: { readonly status: JobStatus }) {
  const icon = getStatusIcon(status);

  return (
    <Badge className="h-7 gap-1.5 capitalize" variant={getStatusVariant(status)}>
      {icon}
      {status}
    </Badge>
  );
}

function getStatusVariant(status: JobStatus) {
  if (status === "error") {
    return "destructive";
  }

  if (status === "done") {
    return "default";
  }

  return "secondary";
}

function getStatusIcon(status: JobStatus) {
  if (status === "done") {
    return <CheckCircle2 size={15} aria-hidden="true" />;
  }

  if (status === "error") {
    return <AlertCircle size={15} aria-hidden="true" />;
  }

  if (status === "converting") {
    return <Loader2 className="animate-spin" size={15} aria-hidden="true" />;
  }

  return null;
}
