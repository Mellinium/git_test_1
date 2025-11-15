# FocusPDF

A dark-mode-only PDF study companion built with Next.js, React, and Tailwind CSS. Upload any PDF to read one page at a time, collect AI explanations for highlighted snippets, take page-specific notes, and stay on task with an integrated focus timer.

## Features

- **Upload to study** – Drag or pick a PDF and the app streams it in-memory via a Blob URL.
- **Single-page focus viewer** – Navigate page by page with pdf.js rendering.
- **Smart highlighting** – Select text directly on the page to surface an inline “Explain” action and persistent highlight overlays.
- **AI assist on demand** – Sends the selected text plus the current page context to `/api/explain` for concise explanations.
- **Per-page notes** – Notes and explanations are stored by page number so context follows you.
- **Focus timer** – Fixed Pomodoro-style timer across the bottom of the screen.
- **Dark theme everywhere** – Tailored palette for low-distraction study sessions.

## Getting started

```bash
npm install
npm run dev
```

The development server runs on [http://localhost:3000](http://localhost:3000).

## Environment variables

Create a `.env.local` file at the project root with your OpenAI API key:

```bash
OPENAI_API_KEY=sk-your-key-here
```

## Tech stack & project structure

- [Next.js 14](https://nextjs.org/) with the App Router and TypeScript.
- [Tailwind CSS](https://tailwindcss.com/) for the dark UI system.
- [react-pdf](https://github.com/wojtekmaj/react-pdf) / pdf.js for document rendering and text extraction.
- API route at `app/api/explain/route.ts` proxies requests to OpenAI’s Chat Completions endpoint.

### Key directories

```
app/
  layout.tsx        # App shell + dark styling
  page.tsx          # Upload flow, viewer layout, state management
  api/explain/      # AI explanation endpoint
components/
  FocusTimer.tsx    # Fixed bottom focus timer
  PdfViewer.tsx     # Page navigation, text selection, highlight overlay
  StudySidebar.tsx  # AI explanations + per-page notes
  UploadScreen.tsx  # Opening upload screen
lib/
  pdf.ts            # Per-page text extraction helper
  types.ts          # Shared TypeScript types
```

## How highlighting works

1. The pdf.js text layer allows standard browser selections. `PdfViewer` listens for `mouseup`, reads `window.getSelection()`, and captures both the raw text and bounding rects relative to the viewer.
2. When you confirm by pressing **Explain**, the selection text and per-page coordinates are stored alongside `currentPage`. Highlights persist by page, and the API receives only the selected text plus that page’s full text.

## Production build

```bash
npm run build
npm start
```

---

If you swap to a different AI provider, update `app/api/explain/route.ts` to call your model while keeping the request payload (`selectedText`, `pageText`, `pageNumber`) intact.
