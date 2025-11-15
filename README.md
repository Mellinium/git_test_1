# FocusPDF

FocusPDF is a dark themed study workspace that runs in any modern browser. Upload a PDF, read one page at a time, request quick AI explanations for highlighted text, jot down page-specific notes, and keep a Pomodoro-style focus timer running along the bottom of the screen.

The project is split into two folders:

- `client/` – the React web application (built with Vite + TypeScript + Tailwind CSS).
- `server/` – a small Express server that forwards explanation requests to OpenAI (or shows a friendly placeholder if no key is provided).

---

## 1. What you need first

1. **Node.js 18 or newer** – download from [nodejs.org](https://nodejs.org/) and run the installer. It already includes npm.
2. **An OpenAI API key** (optional). If you do not have one yet, the app still runs, but the Explain button will return a helpful message instead of a real answer.

To check Node is ready, open a terminal (Command Prompt on Windows, Terminal on macOS) and run:

```bash
node -v
```

You should see a version number such as `v18.19.0`.

---

## 2. Download the project

1. Click the green **Code** button on GitHub and choose **Download ZIP**.
2. Unzip the file somewhere easy to find (for example `Documents/FocusPDF`).
3. Open a terminal and move into the unzipped folder. Example for Windows PowerShell:

   ```powershell
   cd $HOME\Documents\FocusPDF
   ```

---

## 3. Start the AI helper (server)

1. Move into the `server` folder:

   ```bash
   cd server
   ```

2. Install the server dependencies (only needed the first time):

   ```bash
   npm install
   ```

3. If you have an OpenAI key, copy `server/.env.example` to `server/.env` and paste your key:

   ```bash
   # macOS / Linux
   cp .env.example .env

   # Windows PowerShell
   Copy-Item .env.example .env
   ```

   Open the new `.env` file in a text editor and replace `sk-your-key-here` with your own key.

4. Start the server:

   ```bash
   npm run dev
   ```

   Leave this terminal window open. The server listens on [http://localhost:3001](http://localhost:3001) and the app will talk to it automatically.

---

## 4. Start the web app (client)

1. Open a **second** terminal window so the server can keep running in the first one.
2. Move into the `client` folder inside the project:

   ```bash
   cd path/to/FocusPDF/client
   ```

3. Install the web app dependencies (first run only):

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Your terminal will show a local address similar to `http://localhost:5173`. Open that link in your browser to use FocusPDF.

---

## 5. Using FocusPDF

1. **Upload a PDF** – The landing screen has a single “Choose PDF” card. Select any `.pdf` file from your computer.
2. **Read with focus** – The viewer shows one page at a time with Previous / Next buttons and a clear dark background.
3. **Highlight to explain** – Drag to select text on the page. A small “Explain” button appears next to the selection. Clicking it sends the highlighted text plus the full text of the current page to the AI helper.
4. **Review explanations** – Responses appear in the right-hand sidebar under “AI explanations”, grouped by page.
5. **Take page notes** – The notes textarea belongs to the current page only. Notes are saved in the browser so refreshing the tab keeps them.
6. **Stay on track** – The Focus Timer at the bottom lets you set minutes, then Start / Pause / Reset as needed. When the timer reaches 0 it gently highlights the countdown.

---

## 6. Project structure

```
client/
  index.html
  src/
    App.tsx              # Upload flow, PDF viewer layout, global state
    components/          # FocusTimer, PdfViewer, StudySidebar, UploadScreen
    lib/pdf.ts           # Helper that extracts text for the current PDF page
    lib/types.ts         # Shared TypeScript types
server/
  server.js              # Express API with /api/explain endpoint
  .env.example           # Template for your OpenAI key
```

### Data flow highlights

- The PDF is rendered in-browser with `react-pdf`, which streams the file via a temporary object URL created after upload.
- `App.tsx` tracks `currentPage`, per-page notes, explanations, and highlight rectangles.
- `PdfViewer` listens for mouse selections on the pdf.js text layer. When the user clicks **Explain**, the selection text and page number are sent to the server.
- The Express server forwards the request to OpenAI (only sending the current page text and the highlighted selection) and returns a simple explanation string.
- Notes are stored in browser `localStorage` using the page number as the key so they persist between refreshes.

---

## 7. Building for production (optional)

If you want to create optimized builds:

```bash
# From the server folder
npm run start    # uses the same command as development

# From the client folder
npm run build    # creates a production-ready bundle in client/dist
```

You can then serve the files in `client/dist` with any static web server while running the Express server separately.

---

## 8. Troubleshooting

- **Explain button says AI is not configured** – Make sure you created `server/.env` with your real OpenAI key and restarted the server.
- **Port already in use** – Another program may be using port 3001 or 5173. Close the other app or edit `server/.env` to change `PORT`, then update `client/vite.config.ts` to match the new server port.
- **npm install fails** – Confirm that Node.js and npm are installed correctly by running `node -v` and `npm -v`. A network firewall may also block npm downloads; try again on a different connection if needed.

Enjoy your focused study sessions!
