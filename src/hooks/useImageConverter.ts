import { useCallback, useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { convertImage } from "../domain/conversion";
import { downloadBlob, isSupportedImageFile, readImageDimensions } from "../domain/files";
import type { ConversionOptions, ImageJob, ImageJobOutput } from "../domain/types";

interface AddFilesSummary {
  readonly added: number;
  readonly rejected: number;
}

interface UseImageConverterResult {
  readonly jobs: readonly ImageJob[];
  readonly isConverting: boolean;
  readonly isPreparingZip: boolean;
  readonly addFiles: (files: FileList | readonly File[]) => Promise<AddFilesSummary>;
  readonly convertAll: (options: ConversionOptions) => Promise<void>;
  readonly removeJob: (jobId: string) => void;
  readonly clearJobs: () => void;
  readonly downloadJob: (jobId: string) => void;
  readonly downloadZip: () => Promise<void>;
}

export function useImageConverter(): UseImageConverterResult {
  const [jobs, setJobs] = useState<readonly ImageJob[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isPreparingZip, setIsPreparingZip] = useState(false);
  const jobsRef = useRef<readonly ImageJob[]>([]);

  useEffect(() => {
    jobsRef.current = jobs;
  }, [jobs]);

  useEffect(() => {
    return () => {
      jobsRef.current.forEach(releaseJobUrls);
    };
  }, []);

  const addFiles = useCallback(async (files: FileList | readonly File[]) => {
    const fileArray = Array.from(files);
    const supportedFiles = fileArray.filter(isSupportedImageFile);
    const rejected = fileArray.length - supportedFiles.length;
    const preparedJobs = await Promise.all(supportedFiles.map(createImageJob));

    setJobs((currentJobs) => [...currentJobs, ...preparedJobs]);

    return {
      added: preparedJobs.length,
      rejected,
    };
  }, []);

  const removeJob = useCallback((jobId: string) => {
    const existingJob = jobsRef.current.find((job) => job.id === jobId);

    if (existingJob) {
      releaseJobUrls(existingJob);
    }

    setJobs((currentJobs) => currentJobs.filter((job) => job.id !== jobId));
  }, []);

  const clearJobs = useCallback(() => {
    jobsRef.current.forEach(releaseJobUrls);
    setJobs([]);
  }, []);

  const updateJob = useCallback((jobId: string, patch: Partial<ImageJob>) => {
    setJobs((currentJobs) =>
      currentJobs.map((job) => (job.id === jobId ? { ...job, ...patch } : job)),
    );
  }, []);

  const convertAll = useCallback(async (options: ConversionOptions) => {
    const snapshot = jobsRef.current;

    if (snapshot.length === 0) {
      return;
    }

    setIsConverting(true);

    for (const [index, job] of snapshot.entries()) {
      updateJob(job.id, {
        status: "converting",
        error: undefined,
      });

      try {
        const result = await convertImage(job.file, options, index + 1);
        const output = createJobOutput(result);
        const existingJob = jobsRef.current.find((item) => item.id === job.id);

        if (existingJob?.output?.previewUrl) {
          URL.revokeObjectURL(existingJob.output.previewUrl);
        }

        updateJob(job.id, {
          status: "done",
          output,
          error: undefined,
        });
      } catch (error) {
        updateJob(job.id, {
          status: "error",
          error: getErrorMessage(error),
        });
      }
    }

    setIsConverting(false);
  }, [updateJob]);

  const downloadJob = useCallback((jobId: string) => {
    const output = jobsRef.current.find((job) => job.id === jobId)?.output;

    if (!output) {
      return;
    }

    downloadBlob(output.blob, output.outputName);
  }, []);

  const downloadZip = useCallback(async () => {
    const completedJobs = jobsRef.current.filter((job) => job.output);

    if (completedJobs.length === 0) {
      return;
    }

    setIsPreparingZip(true);

    try {
      const zip = new JSZip();

      completedJobs.forEach((job) => {
        if (job.output) {
          zip.file(job.output.outputName, job.output.blob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });

      downloadBlob(zipBlob, `image-converter-${new Date().toISOString().slice(0, 10)}.zip`);
    } finally {
      setIsPreparingZip(false);
    }
  }, []);

  return {
    jobs,
    isConverting,
    isPreparingZip,
    addFiles,
    convertAll,
    removeJob,
    clearJobs,
    downloadJob,
    downloadZip,
  };
}

async function createImageJob(file: File): Promise<ImageJob> {
  const sourceUrl = URL.createObjectURL(file);
  const originalDimensions = await readDimensionsSafely(sourceUrl);

  return {
    id: crypto.randomUUID(),
    file,
    sourceUrl,
    originalDimensions,
    status: "queued",
  };
}

function createJobOutput(result: Omit<ImageJobOutput, "previewUrl">): ImageJobOutput {
  const previewUrl = result.mimeType.startsWith("image/")
    ? URL.createObjectURL(result.blob)
    : undefined;

  return {
    ...result,
    previewUrl,
  };
}

async function readDimensionsSafely(sourceUrl: string) {
  try {
    return await readImageDimensions(sourceUrl);
  } catch {
    return undefined;
  }
}

function releaseJobUrls(job: ImageJob): void {
  URL.revokeObjectURL(job.sourceUrl);

  if (job.output?.previewUrl) {
    URL.revokeObjectURL(job.output.previewUrl);
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Conversion failed.";
}
