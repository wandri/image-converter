import { useEffect } from "react";

export function usePasteImages(
  onFilesPasted: (files: readonly File[]) => Promise<unknown>,
): void {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const files = Array.from(event.clipboardData?.items ?? [])
        .filter((item) => item.kind === "file")
        .map((item) => item.getAsFile())
        .filter((file): file is File => Boolean(file));

      if (files.length > 0) {
        void onFilesPasted(files);
      }
    };

    window.addEventListener("paste", handlePaste);

    return () => window.removeEventListener("paste", handlePaste);
  }, [onFilesPasted]);
}
