import type { ConversionOptions, OutputFormat, OutputFormatOption } from "./types";

export const OUTPUT_FORMATS: readonly OutputFormatOption[] = [
  {
    value: "jpeg",
    label: "JPG",
    mimeType: "image/jpeg",
    extension: "jpg",
    supportsQuality: true,
    description: "Small, widely supported files",
  },
  {
    value: "png",
    label: "PNG",
    mimeType: "image/png",
    extension: "png",
    supportsQuality: false,
    description: "Lossless output with transparency",
  },
  {
    value: "webp",
    label: "WebP",
    mimeType: "image/webp",
    extension: "webp",
    supportsQuality: true,
    description: "Modern browser image format",
  },
  {
    value: "avif",
    label: "AVIF",
    mimeType: "image/avif",
    extension: "avif",
    supportsQuality: true,
    description: "High compression when supported",
  },
  {
    value: "base64",
    label: "Base64",
    mimeType: "text/plain",
    extension: "txt",
    supportsQuality: false,
    description: "Data URL saved as text",
  },
];

export const DEFAULT_CONVERSION_OPTIONS: ConversionOptions = {
  format: "jpeg",
  quality: 82,
  resize: {
    mode: "original",
    width: 1600,
    height: 1600,
    scale: 100,
    allowUpscale: false,
  },
  transform: {
    rotation: 0,
    flipHorizontal: false,
    flipVertical: false,
  },
  flattenTransparency: true,
  backgroundColor: "#ffffff",
  renamePattern: "{name}-{index}",
};

export function getOutputFormatOption(format: OutputFormat): OutputFormatOption {
  const option = OUTPUT_FORMATS.find((item) => item.value === format);

  if (!option) {
    throw new Error(`Unknown output format: ${format}`);
  }

  return option;
}
