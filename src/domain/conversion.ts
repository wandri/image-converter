import { getOutputFormatOption } from "./formats";
import { stripFileExtension } from "./files";
import type {
  ConversionOptions,
  ConversionResult,
  ImageDimensions,
  RotationDegrees,
} from "./types";

const MAX_CANVAS_SIDE = 16_384;
const MIME_SUPPORT_CACHE = new Map<string, boolean>();

export async function convertImage(
  file: File,
  options: ConversionOptions,
  sequence: number,
): Promise<ConversionResult> {
  const startedAt = performance.now();
  const image = await loadImageFromFile(file);
  const canvas = renderToCanvas(image, options);
  const format = getOutputFormatOption(options.format);
  const outputMimeType = options.format === "base64" ? "image/png" : format.mimeType;

  if (options.format !== "base64") {
    assertCanvasMimeTypeSupport(outputMimeType);
  }

  const quality = format.supportsQuality ? options.quality / 100 : undefined;
  const dataUrl =
    options.format === "base64" ? canvas.toDataURL(outputMimeType) : undefined;
  const blob =
    options.format === "base64"
      ? new Blob([dataUrl ?? ""], { type: "text/plain;charset=utf-8" })
      : await canvasToBlob(canvas, outputMimeType, quality);

  return {
    blob,
    outputName: buildOutputName(file.name, sequence, options, {
      width: canvas.width,
      height: canvas.height,
    }),
    width: canvas.width,
    height: canvas.height,
    size: blob.size,
    mimeType: blob.type || format.mimeType,
    durationMs: performance.now() - startedAt,
    base64Sample: dataUrl?.slice(0, 180),
  };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const sourceUrl = URL.createObjectURL(file);

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(sourceUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(sourceUrl);
      reject(
        new Error(
          "This file could not be decoded by the browser. HEIC, TIFF, and animated formats depend on browser support.",
        ),
      );
    };
    image.src = sourceUrl;
  });
}

function renderToCanvas(
  image: HTMLImageElement,
  options: ConversionOptions,
): HTMLCanvasElement {
  const rotated = drawTransformCanvas(image, options.transform.rotation, {
    flipHorizontal: options.transform.flipHorizontal,
    flipVertical: options.transform.flipVertical,
  });
  const targetSize = getTargetSize(
    {
      width: rotated.width,
      height: rotated.height,
    },
    options,
  );
  const canvas = createCanvas(targetSize.width, targetSize.height);
  const context = getCanvasContext(canvas);

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  if (shouldFlattenTransparency(options)) {
    context.fillStyle = options.backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(rotated, 0, 0, canvas.width, canvas.height);

  return canvas;
}

function drawTransformCanvas(
  image: HTMLImageElement,
  rotation: RotationDegrees,
  transform: Pick<ConversionOptions["transform"], "flipHorizontal" | "flipVertical">,
): HTMLCanvasElement {
  const isSideways = rotation === 90 || rotation === 270;
  const width = isSideways ? image.naturalHeight : image.naturalWidth;
  const height = isSideways ? image.naturalWidth : image.naturalHeight;
  const canvas = createCanvas(width, height);
  const context = getCanvasContext(canvas);

  context.translate(width / 2, height / 2);
  context.rotate((rotation * Math.PI) / 180);
  context.scale(transform.flipHorizontal ? -1 : 1, transform.flipVertical ? -1 : 1);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);

  return canvas;
}

function getTargetSize(
  source: ImageDimensions,
  options: ConversionOptions,
): ImageDimensions {
  const { resize } = options;

  if (resize.mode === "original") {
    return source;
  }

  if (resize.mode === "scale") {
    const scale = clamp(resize.scale, 1, 400) / 100;

    return roundDimensions({
      width: source.width * scale,
      height: source.height * scale,
    });
  }

  if (resize.mode === "exact") {
    return roundDimensions({
      width: positiveNumberOrFallback(resize.width, source.width),
      height: positiveNumberOrFallback(resize.height, source.height),
    });
  }

  const maxWidth = positiveNumberOrFallback(resize.width, source.width);
  const maxHeight = positiveNumberOrFallback(resize.height, source.height);
  const fitScale = Math.min(maxWidth / source.width, maxHeight / source.height);
  const boundedScale = resize.allowUpscale ? fitScale : Math.min(fitScale, 1);

  return roundDimensions({
    width: source.width * boundedScale,
    height: source.height * boundedScale,
  });
}

function shouldFlattenTransparency(options: ConversionOptions): boolean {
  return options.format === "jpeg" || options.flattenTransparency;
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const safeWidth = Math.round(width);
  const safeHeight = Math.round(height);

  if (
    !Number.isFinite(safeWidth) ||
    !Number.isFinite(safeHeight) ||
    safeWidth < 1 ||
    safeHeight < 1
  ) {
    throw new Error("Calculated image size is invalid.");
  }

  if (safeWidth > MAX_CANVAS_SIDE || safeHeight > MAX_CANVAS_SIDE) {
    throw new Error(`Output is too large. Keep each side under ${MAX_CANVAS_SIDE}px.`);
  }

  const canvas = document.createElement("canvas");

  canvas.width = safeWidth;
  canvas.height = safeHeight;

  return canvas;
}

function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    throw new Error("Canvas 2D rendering is not available in this browser.");
  }

  return context;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`The browser could not encode ${mimeType}.`));
          return;
        }

        resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

function assertCanvasMimeTypeSupport(mimeType: string): void {
  const cached = MIME_SUPPORT_CACHE.get(mimeType);

  if (cached === false) {
    throw new Error(`${mimeType} output is not supported by this browser.`);
  }

  if (cached === true) {
    return;
  }

  const canvas = createCanvas(1, 1);
  const isSupported = canvas.toDataURL(mimeType).startsWith(`data:${mimeType}`);

  MIME_SUPPORT_CACHE.set(mimeType, isSupported);

  if (!isSupported) {
    throw new Error(`${mimeType} output is not supported by this browser.`);
  }
}

function buildOutputName(
  originalName: string,
  sequence: number,
  options: ConversionOptions,
  dimensions: ImageDimensions,
): string {
  const format = getOutputFormatOption(options.format);
  const now = new Date();
  const baseName = sanitizeFileName(stripFileExtension(originalName)) || "image";
  const replacementValues: Record<string, string> = {
    name: baseName,
    index: String(sequence).padStart(2, "0"),
    width: String(dimensions.width),
    height: String(dimensions.height),
    format: format.extension,
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 8).replaceAll(":", ""),
  };
  const pattern = options.renamePattern.trim() || "{name}-{index}";
  const resolvedName = pattern.replace(/\{([a-z]+)\}/gi, (match, token: string) => {
    return replacementValues[token.toLowerCase()] ?? match;
  });
  const safeName = sanitizeFileName(resolvedName) || baseName;

  return `${safeName}.${format.extension}`;
}

function sanitizeFileName(value: string): string {
  return value
    .replace(/[<>:"/\\|?*]+/g, "-")
    .split("")
    .filter((character) => character.charCodeAt(0) >= 32)
    .join("")
    .replace(/\s+/g, " ")
    .replace(/[-. ]+$/g, "")
    .trim();
}

function roundDimensions(dimensions: ImageDimensions): ImageDimensions {
  return {
    width: Math.max(1, Math.round(dimensions.width)),
    height: Math.max(1, Math.round(dimensions.height)),
  };
}

function positiveNumberOrFallback(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
