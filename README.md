# Image Converter

A TypeScript and React version inspired by
[renzhezhilu/webp2jpg-online](https://github.com/renzhezhilu/webp2jpg-online).
The app runs conversions in the browser, so selected files are not uploaded to a
server.

## Features

- React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, and ESLint.
- Batch import with file picker, drag and drop, and clipboard image paste.
- Browser-supported image input: JPEG, PNG, WebP, AVIF, GIF, SVG, BMP, ICO, and
  other image formats if the browser can decode them.
- Output to JPG, PNG, WebP, AVIF, or Base64 text.
- Quality control for lossy formats.
- Resize by original size, fit box, exact size, or percentage scale.
- Rotate, flip, flatten transparency, and set a background color.
- Rename outputs with `{name}`, `{index}`, `{date}`, `{width}`, and `{height}`
  tokens.
- Download files individually or as a ZIP archive.

## Browser Support Notes

This implementation intentionally uses readable browser APIs instead of copied
or obfuscated upstream bundles. Format support is therefore tied to the current
browser. HEIC, HEIF, TIFF, PSD, and some AVIF files may fail unless the browser
can decode them. Animated GIF/WebP inputs are rendered through Canvas as a static
frame.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Deployment

The repository includes a GitHub Actions workflow at
`.github/workflows/deploy.yml`.

To publish with GitHub Pages:

1. Push the project to the `main` branch.
2. In GitHub, open `Settings` -> `Pages`.
3. Under `Build and deployment`, set `Source` to `GitHub Actions`.
4. Run the `Deploy to GitHub Pages` workflow manually, or push to `main`.

For the `wandri/image-converter` repository, the project site is expected at:

```text
https://wandri.github.io/image-converter/
```

## Project Structure

```text
src/
  components/       React UI components
  components/ui/    shadcn-generated UI primitives
  domain/           typed conversion, file, and format logic
  hooks/            React state and browser event hooks
  lib/              shared UI utilities
```
