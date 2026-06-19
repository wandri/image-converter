import { ImagePlus, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
            aria-hidden="true"
          >
            <ImagePlus size={22} />
          </span>
          <div>
            <h1 className="text-xl leading-tight font-semibold tracking-normal">
              Image Converter
            </h1>
            <p className="hidden text-sm text-muted-foreground sm:block">
              Local batch image processing
            </p>
          </div>
        </div>
        <Badge className="h-8 gap-1.5 px-3" variant="outline">
          <ShieldCheck size={17} aria-hidden="true" />
          <span className="hidden sm:inline">Browser only</span>
        </Badge>
      </div>
    </header>
  );
}
