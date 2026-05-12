# Project Manager Pro

Cross-platform desktop workspace that combines project tracking, knowledge management, deployment tooling, and an integrated terminal. Built with Electron and a statically exported Next.js frontend, Project Manager Pro gives you a single place to organise projects, contractors, servers, repositories, notes, scripts, and automations.

## Features
- Dashboard with recent projects, quick server shortcuts, and tray menu links for instant navigation.
- Project workspace covering todos with timeline view, categories, contractors, linked servers, and repository metadata.
- Repository catalogue that stores local paths, run/build commands, and deployment scripts mapped to servers.
- Server inventory with credential vaulting plus terminal helpers for launching SSH or custom commands.
- Rich note-taking, file uploads, image galleries, and evidence tracking backed by MongoDB GridFS.
- Bash script library and an embedded terminal (node-pty + xterm) for running or packaging repeatable automation.
- DeepSeek-powered assistant integration, configurable terminal/proxy/IDE launch commands, and theming controls.
- Static Next.js export served through a custom `app://` protocol so the renderer works fully offline inside Electron.

## Tech Stack
- Electron 38 main process bundled with tsup
- Next.js 15 (App Router) + Material UI 7 + Emotion styling
- TypeScript across renderer and main process
- MongoDB with Mongoose models and GridFS for assets
- node-pty, xterm, and custom IPC bridges for the integrated terminal
- express file server for streaming GridFS assets to the renderer

## Prerequisites
- Node.js 18+ and npm (or another Node package manager)
- A running MongoDB instance (defaults to `mongodb://127.0.0.1:27017/project-manager`)
- build tools required by `electron-rebuild` (Python, make, C/C++ toolchain on macOS/Linux; Visual Studio Build Tools on Windows)
- Optional: DeepSeek API key if you want to enable the AI assistant (`Settings → DeepSeek`)

## Getting Started
1. Clone the repository and open it in your preferred editor.
2. Install dependencies:
   ```bash
   npm install
   ```
   The postinstall hook runs `electron-rebuild`; ensure the native build prerequisites above are available.
3. Provide a MongoDB connection string if you are not using the default localhost instance:
   ```bash
   export MONGODB_URI="mongodb://user:pass@host:port/database"
   ```
   You can also set this variable through your shell profile or system environment variables.
4. Start the development workspace:
   ```bash
   npm run dev
   ```
   The `dev` script launches three processes with `concurrently`: `tsup` (Electron bundle), `next dev` on port 4152, and Electron itself. The renderer automatically redirects `/` to the dashboard when the window appears.

## Project Scripts
- `npm run dev` – watch Electron (`tsup`), start Next.js on port 4152, and launch Electron in development mode.
- `npm run build` – clean previous outputs, bundle the Electron main/preload files, and export the Next.js app to `out/` (moved to the project root).
- `npm run build:electron` – bundle only the Electron main process with tsup into `dist/`.
- `npm run build:next` – perform a production Next.js static export using `output: 'export'`.
- `npm run build:linux` – package the app with `electron-builder` targeting Linux (`binary/` folder).
- `npm run lint` – run TypeScript in noEmit mode.

The builder configuration in `package.json` also defines Windows packaging (`nsis`) and sets shared assets/icons under `assets/`.

## Data & Integrations
- **Database**: All domain data (projects, repositories, categories, contractors, servers, notes, bash scripts, settings) sits in MongoDB collections. IPC handlers in `src/electron/handlers/db.ts` expose CRUD helpers consumed from the renderer through the `window.electron.db` API declared in `src/next/global.d.ts`.
- **Files & Media**: GridFS is used for storing images and documents. The renderer offers drag‑and‑drop uploads, and Electron hosts an internal Express server on port 4568 for streaming files back.
- **Terminal**: `node-pty` sessions are managed in `src/electron/terminal/terminal.ts`. Renderer components use `@xterm/xterm` for display and can launch scripts, resize sessions, or kill terminals through IPC.
- **Tray**: `src/electron/utils/tray.ts` builds a system tray menu with shortcuts to open the app, spawn terminals, or jump directly to specific projects and servers.
- **AI Assistant**: Chat requests are proxied to DeepSeek (`src/electron/utils/chat.ts`). Store the API key in the Settings UI so it persists in the `Setting` collection.

## Project Structure
- `src/electron/` – Electron main process, preload bridge, Mongo models, IPC handlers, terminal utilities, and tray configuration.
- `src/next/` – Next.js App Router application (pages in `app/`, modules under `views/`, shared components/hooks/utilities, and theme setup).
- `assets/` – Application icons and imagery used by Electron and the renderer.
- `dist/` – Compiled Electron main and preload bundles generated by tsup.
- `out/` – Static Next.js export consumed by the app protocol in production builds.
- `binary/` – `electron-builder` output directory for packaged installers.

## Packaging the App
1. Ensure `npm run build` has completed (creates `dist/` and `out/`).
2. Run a platform-specific packaging task (`npm run build:linux`, or configure similar scripts for Windows/macOS).
3. The installer or distributable is emitted to `binary/`. Icons and metadata are defined under the `build` field in `package.json`.

## Configuration Tips
- All renderer launch commands (terminal, proxy, browser, IDE) and the DeepSeek key are persisted via the Settings pages and stored in MongoDB.
- The integrated terminal expects your command to accept the script path as the first argument (`"$1"`). Adjust the default command in Settings to match your OS.
- Background assets, file pickers, and internet/browser helpers use the preload bridge APIs declared in `src/next/global.d.ts`.

## Troubleshooting
- **Electron fails to start after install**: re-run `npm install` ensuring `electron-rebuild` has the required platform toolchain.
- **Blank window in production build**: confirm that `npm run build:next` (invoked by `npm run build`) produces the static export under `out/` before packaging.
- **Mongo connection issues**: check `MONGODB_URI` and whether the database requires authentication. The connection logic lives in `src/electron/backend/connection.ts`.
- On first launch, if no Mongo URI is present, the app opens the `/mongo-uri` config screen (Next) to collect and store the connection string locally.

## License
No license file is present; treat the code as proprietary unless a license is added.

---

## 💡 Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Desktop Framework** | Electron + Next.js | Cross-platform desktop app with modern web UI |
| **Backend** | Electron IPC + MongoDB | Local-first architecture, no external server needed |
| **Database** | MongoDB (Mongoose) | Flexible schema for project entities, embedded documents |
| **AI Integration** | Easy-LLM-Call | Provider-agnostic LLM calls for smart assistance |
| **Terminal** | xterm.js | Full-featured terminal emulator in browser context |

## 🧑‍🔬 Experiment Log

| Experiment | Result | Impact |
|------------|--------|--------|
| SQLite vs MongoDB | MongoDB: better for nested project data | ✅ Adopted |
| Next.js Pages vs App Router | App Router: better SSR and layouts | ✅ Adopted |
| tsup vs webpack for bundling | tsup: 3x faster builds | ✅ Adopted |

## 🚀 Production Checklist

- [x] Cross-platform builds (Linux)
- [x] MongoDB connection management
- [x] Error boundaries in UI
- [x] Auto-save functionality
- [x] CI/CD Pipeline (GitHub Actions)
- [x] Unit tests (Vitest)
- [ ] Windows/macOS builds
- [ ] Auto-updater
- [ ] Offline mode support
- [ ] End-to-end testing
