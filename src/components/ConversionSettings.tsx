import {
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  RotateCw,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { getOutputFormatOption, OUTPUT_FORMATS } from "../domain/formats";
import type {
  ConversionOptions,
  ResizeMode,
  ResizeOptions,
  RotationDegrees,
  TransformOptions,
} from "../domain/types";

interface ConversionSettingsProps {
  readonly options: ConversionOptions;
  readonly disabled: boolean;
  readonly onChange: (options: ConversionOptions) => void;
}

export function ConversionSettings({
  options,
  disabled,
  onChange,
}: ConversionSettingsProps) {
  const selectedFormat = getOutputFormatOption(options.format);

  const updateOptions = (patch: Partial<ConversionOptions>) => {
    onChange({
      ...options,
      ...patch,
    });
  };

  const updateResize = (patch: Partial<ResizeOptions>) => {
    updateOptions({
      resize: {
        ...options.resize,
        ...patch,
      },
    });
  };

  const updateTransform = (patch: Partial<TransformOptions>) => {
    updateOptions({
      transform: {
        ...options.transform,
        ...patch,
      },
    });
  };

  const rotate = (delta: -90 | 90) => {
    updateTransform({
      rotation: normalizeRotation(options.transform.rotation + delta),
    });
  };

  return (
    <Card className="sticky top-20 gap-0" aria-label="Conversion settings">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Settings2 size={18} aria-hidden="true" />
          Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-5 pt-4">
        <section className="grid gap-3" aria-labelledby="format-heading">
          <SectionHeading id="format-heading">Format</SectionHeading>
          <div className="grid grid-cols-2 gap-2" role="group" aria-label="Output format">
            {OUTPUT_FORMATS.map((format) => (
              <Button
                className="h-auto min-h-17 flex-col items-start justify-center gap-1 px-3 py-2 text-left whitespace-normal"
                disabled={disabled}
                key={format.value}
                onClick={() => updateOptions({ format: format.value })}
                type="button"
                variant={options.format === format.value ? "default" : "outline"}
              >
                <span className="font-semibold">{format.label}</span>
                <span className="text-xs opacity-75">{format.description}</span>
              </Button>
            ))}
          </div>

          {selectedFormat.supportsQuality ? (
            <div className="grid gap-2">
              <FieldLabel htmlFor="quality">Quality</FieldLabel>
              <div className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3">
                <Slider
                  disabled={disabled}
                  id="quality"
                  max={100}
                  min={1}
                  onValueChange={([quality]) => updateOptions({ quality })}
                  value={[options.quality]}
                />
                <strong className="text-right text-sm">{options.quality}%</strong>
              </div>
            </div>
          ) : null}
        </section>

        <Separator />

        <section className="grid gap-3" aria-labelledby="resize-heading">
          <SectionHeading id="resize-heading">Size</SectionHeading>
          <div className="grid gap-2">
            <FieldLabel htmlFor="resize-mode">Mode</FieldLabel>
            <Select
              disabled={disabled}
              onValueChange={(mode: ResizeMode) => updateResize({ mode })}
              value={options.resize.mode}
            >
              <SelectTrigger className="w-full" id="resize-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">Original</SelectItem>
                <SelectItem value="fit">Fit within</SelectItem>
                <SelectItem value="exact">Exact size</SelectItem>
                <SelectItem value="scale">Scale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {options.resize.mode === "scale" ? (
            <div className="grid gap-2">
              <FieldLabel htmlFor="scale">Scale</FieldLabel>
              <div className="grid grid-cols-[minmax(0,1fr)_3rem] items-center gap-3">
                <Slider
                  disabled={disabled}
                  id="scale"
                  max={400}
                  min={1}
                  onValueChange={([scale]) => updateResize({ scale })}
                  value={[options.resize.scale]}
                />
                <strong className="text-right text-sm">{options.resize.scale}%</strong>
              </div>
            </div>
          ) : null}

          {options.resize.mode === "fit" || options.resize.mode === "exact" ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <FieldLabel htmlFor="resize-width">
                  {options.resize.mode === "fit" ? "Max width" : "Width"}
                </FieldLabel>
                <Input
                  disabled={disabled}
                  id="resize-width"
                  min={1}
                  onChange={(event) =>
                    updateResize({ width: event.currentTarget.valueAsNumber })
                  }
                  type="number"
                  value={options.resize.width}
                />
              </div>
              <div className="grid gap-2">
                <FieldLabel htmlFor="resize-height">
                  {options.resize.mode === "fit" ? "Max height" : "Height"}
                </FieldLabel>
                <Input
                  disabled={disabled}
                  id="resize-height"
                  min={1}
                  onChange={(event) =>
                    updateResize({ height: event.currentTarget.valueAsNumber })
                  }
                  type="number"
                  value={options.resize.height}
                />
              </div>
            </div>
          ) : null}

          {options.resize.mode === "fit" ? (
            <CheckField
              checked={options.resize.allowUpscale}
              disabled={disabled}
              id="allow-upscale"
              label="Allow upscaling"
              onCheckedChange={(checked) => updateResize({ allowUpscale: checked })}
            />
          ) : null}
        </section>

        <Separator />

        <section className="grid gap-3" aria-labelledby="transform-heading">
          <SectionHeading id="transform-heading">Transform</SectionHeading>
          <div className="grid grid-cols-4 gap-2">
            <Button
              aria-label="Rotate left"
              disabled={disabled}
              onClick={() => rotate(-90)}
              size="icon"
              title="Rotate left"
              type="button"
              variant="outline"
            >
              <RotateCcw size={18} />
            </Button>
            <Button
              aria-label="Rotate right"
              disabled={disabled}
              onClick={() => rotate(90)}
              size="icon"
              title="Rotate right"
              type="button"
              variant="outline"
            >
              <RotateCw size={18} />
            </Button>
            <Button
              aria-label="Flip horizontal"
              disabled={disabled}
              onClick={() =>
                updateTransform({
                  flipHorizontal: !options.transform.flipHorizontal,
                })
              }
              size="icon"
              title="Flip horizontal"
              type="button"
              variant={options.transform.flipHorizontal ? "default" : "outline"}
            >
              <FlipHorizontal size={18} />
            </Button>
            <Button
              aria-label="Flip vertical"
              disabled={disabled}
              onClick={() =>
                updateTransform({
                  flipVertical: !options.transform.flipVertical,
                })
              }
              size="icon"
              title="Flip vertical"
              type="button"
              variant={options.transform.flipVertical ? "default" : "outline"}
            >
              <FlipVertical size={18} />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Rotation: {options.transform.rotation} deg
          </p>
        </section>

        <Separator />

        <section className="grid gap-3" aria-labelledby="naming-heading">
          <SectionHeading id="naming-heading">Output</SectionHeading>
          <CheckField
            checked={options.flattenTransparency}
            disabled={disabled || options.format === "jpeg"}
            id="flatten-transparency"
            label="Flatten transparency"
            onCheckedChange={(checked) =>
              updateOptions({ flattenTransparency: checked })
            }
          />

          <div className="grid gap-2">
            <FieldLabel htmlFor="background-color">Background</FieldLabel>
            <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-2">
              <Input
                aria-label="Background color"
                className="p-1"
                disabled={disabled}
                id="background-color"
                onChange={(event) =>
                  updateOptions({ backgroundColor: event.currentTarget.value })
                }
                type="color"
                value={options.backgroundColor}
              />
              <Input
                disabled={disabled}
                onChange={(event) =>
                  updateOptions({ backgroundColor: event.currentTarget.value })
                }
                type="text"
                value={options.backgroundColor}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <FieldLabel htmlFor="rename-pattern">Name pattern</FieldLabel>
            <Input
              disabled={disabled}
              id="rename-pattern"
              onChange={(event) =>
                updateOptions({ renamePattern: event.currentTarget.value })
              }
              spellCheck={false}
              type="text"
              value={options.renamePattern}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Tokens: {"{name}"} {"{index}"} {"{date}"} {"{width}"} {"{height}"}
          </p>
        </section>
      </CardContent>
    </Card>
  );
}

function SectionHeading({
  children,
  id,
}: {
  readonly children: React.ReactNode;
  readonly id: string;
}) {
  return (
    <h3 className="text-xs font-semibold tracking-normal text-muted-foreground uppercase" id={id}>
      {children}
    </h3>
  );
}

function FieldLabel({
  children,
  htmlFor,
}: {
  readonly children: React.ReactNode;
  readonly htmlFor: string;
}) {
  return (
    <Label className="text-sm font-medium" htmlFor={htmlFor}>
      {children}
    </Label>
  );
}

function CheckField({
  checked,
  disabled,
  id,
  label,
  onCheckedChange,
}: {
  readonly checked: boolean;
  readonly disabled: boolean;
  readonly id: string;
  readonly label: string;
  readonly onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={checked}
        disabled={disabled}
        id={id}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      />
      <Label className="text-sm font-medium" htmlFor={id}>
        {label}
      </Label>
    </div>
  );
}

function normalizeRotation(value: number): RotationDegrees {
  const normalized = ((value % 360) + 360) % 360;

  return normalized as RotationDegrees;
}
