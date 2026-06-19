export type OutputFormat = "jpeg" | "png" | "webp" | "avif" | "base64";

export type ResizeMode = "original" | "fit" | "exact" | "scale";

export type JobStatus = "queued" | "converting" | "done" | "error";

export type RotationDegrees = 0 | 90 | 180 | 270;

export interface OutputFormatOption {
  readonly value: OutputFormat;
  readonly label: string;
  readonly mimeType: string;
  readonly extension: string;
  readonly supportsQuality: boolean;
  readonly description: string;
}

export interface ImageDimensions {
  readonly width: number;
  readonly height: number;
}

export interface ResizeOptions {
  readonly mode: ResizeMode;
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  readonly allowUpscale: boolean;
}

export interface TransformOptions {
  readonly rotation: RotationDegrees;
  readonly flipHorizontal: boolean;
  readonly flipVertical: boolean;
}

export interface ConversionOptions {
  readonly format: OutputFormat;
  readonly quality: number;
  readonly resize: ResizeOptions;
  readonly transform: TransformOptions;
  readonly flattenTransparency: boolean;
  readonly backgroundColor: string;
  readonly renamePattern: string;
}

export interface ConversionResult {
  readonly blob: Blob;
  readonly outputName: string;
  readonly width: number;
  readonly height: number;
  readonly size: number;
  readonly mimeType: string;
  readonly durationMs: number;
  readonly base64Sample?: string;
}

export interface ImageJobOutput extends ConversionResult {
  readonly previewUrl?: string;
}

export interface ImageJob {
  readonly id: string;
  readonly file: File;
  readonly sourceUrl: string;
  readonly originalDimensions?: ImageDimensions;
  readonly status: JobStatus;
  readonly output?: ImageJobOutput;
  readonly error?: string;
}
