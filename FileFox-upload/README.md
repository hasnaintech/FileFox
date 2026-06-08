# 🦊 FileFox

A secure, lightning-fast **client-side** image, video, and document format converter. All conversions happen entirely in your browser — files never leave your device.

## Features

- **Image conversion** — PNG, JPG/JPEG, WebP, GIF, ICO
- **Document export** — convert images to PDF
- **Video conversion** — MP4, WebM, MOV, AVI, MKV (via the browser's `MediaRecorder` API)
- **Image → video** and **video → video** transcoding
- **100% client-side** — no uploads, no servers handling your files, fully private
- **Conversion history** and adjustable **quality settings**

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- `pdf-lib` for PDF generation
- `motion` for animations, `lucide-react` for icons

## Run Locally

**Prerequisites:** [Node.js](https://nodejs.org/) (v18+ recommended)

1. Install dependencies:
   ```bash
   npm install
   ```
2. (Optional) Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` if you want to enable the Gemini-powered features:
   ```bash
   cp .env.example .env.local
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The app runs at `http://localhost:3000`.

## Build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build
```

## Project Structure

```
src/
├── components/   # UI: ConverterUI, SettingsDrawer, HistoryDrawer, Background
├── context/      # AppContext (global state)
├── lib/          # converter.ts (core conversion logic), utils.ts
├── App.tsx
├── main.tsx
└── types.ts
```

## License

Released under the [MIT License](LICENSE).
