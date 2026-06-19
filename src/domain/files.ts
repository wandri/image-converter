import type { ImageDimensions } from "./types";

const SUPPORTED_EXTENSIONS = [
  "avif",
  "bmp",
  "gif",
  "heic",
  "heif",
  "ico",
  "jpeg",
  "jpg",
  "png",
  "svg",
  "tif",
  "tiff",
  "webp",
];

export const FILE_INPUT_ACCEPT = SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(",");

export function isSupportedImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) {
    return true;
  }

  const extension = getFileExtension(file.name);

  return Boolean(extension && SUPPORTED_EXTENSIONS.includes(extension));
}

export function getFileExtension(fileName: string): string | undefined {
  const [, extension] = /(?:\.([^.]+))?$/.exec(fileName) ?? [];

  return extension?.toLowerCase();
}

export function stripFileExtension(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, "");
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"] as const;
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** unitIndex;
  const fractionDigits = value >= 10 || unitIndex === 0 ? 0 : 1;

  return `${value.toFixed(fractionDigits)} ${units[unitIndex]}`;
}

export function formatDimensions(dimensions?: ImageDimensions): string {
  if (!dimensions) {
    return "Unknown";
  }

  return `${dimensions.width} x ${dimensions.height}`;
}

export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  anchor.click();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function readImageDimensions(sourceUrl: string): Promise<ImageDimensions> {
  const image = await loadImageElement(sourceUrl);

  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

function loadImageElement(sourceUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The browser could not read this image."));
    image.src = sourceUrl;
  });
}
