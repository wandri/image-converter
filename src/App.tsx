import { useMemo, useState } from "react";
import { ActionBar } from "./components/ActionBar";
import { AppHeader } from "./components/AppHeader";
import { ConversionSettings } from "./components/ConversionSettings";
import { DropZone } from "./components/DropZone";
import { JobList } from "./components/JobList";
import { DEFAULT_CONVERSION_OPTIONS } from "./domain/formats";
import { useImageConverter } from "./hooks/useImageConverter";
import { usePasteImages } from "./hooks/usePasteImages";

function App() {
  const [options, setOptions] = useState(DEFAULT_CONVERSION_OPTIONS);
  const converter = useImageConverter();

  usePasteImages(converter.addFiles);

  const completedCount = useMemo(
    () => converter.jobs.filter((job) => job.status === "done").length,
    [converter.jobs],
  );
  const failedCount = useMemo(
    () => converter.jobs.filter((job) => job.status === "error").length,
    [converter.jobs],
  );

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(280px,350px)_minmax(0,1fr)] items-start gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(280px,350px)_minmax(0,1fr)] max-lg:grid-cols-1">
        <ConversionSettings
          disabled={converter.isConverting}
          onChange={setOptions}
          options={options}
        />

        <div className="grid min-w-0 gap-4">
          <DropZone
            disabled={converter.isConverting}
            onFilesSelected={converter.addFiles}
          />
          <ActionBar
            completedCount={completedCount}
            failedCount={failedCount}
            isConverting={converter.isConverting}
            isPreparingZip={converter.isPreparingZip}
            onClear={converter.clearJobs}
            onConvert={() => void converter.convertAll(options)}
            onDownloadZip={() => void converter.downloadZip()}
            totalCount={converter.jobs.length}
          />
          <JobList
            isConverting={converter.isConverting}
            jobs={converter.jobs}
            onDownload={converter.downloadJob}
            onRemove={converter.removeJob}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
