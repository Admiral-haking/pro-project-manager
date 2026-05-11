# Changelog

All notable changes to **Project Manager Pro** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-18

### 🚀 Initial Release

#### ✨ Features
- **Dashboard** — Overview with recent projects, server shortcuts, and reminders
- **Project Management** — Full CRUD with categories, contractors, linked servers & repos
- **Repository Catalogue** — Store local paths, branches, run/build commands & deploy scripts
- **Server Inventory** — Credential vaulting with SSH terminal helpers
- **Rich Note-Taking** — Tiptap editor with images, code blocks, file uploads via GridFS
- **Bash Script Library** — Store and run automation scripts
- **Integrated Terminal** — node-pty + xterm embedded terminal
- **AI Assistant** — DeepSeek-powered chat integration
- **Financial Tracking** — Accounts, transactions, categories, and reporting
- **System Tray** — Quick access menu with shortcuts
- **MongoDB GridFS** — File storage for images and documents
- **Theming** — Customizable MUI theme with light/dark modes
- **Settings** — Configurable terminal, proxy, IDE, and browser commands

#### 🛠️ Tech Stack
- Electron 38 + tsup bundling
- Next.js 15 (App Router) with static export
- React 19 + Material UI 7
- MongoDB + Mongoose
- TypeScript (strict mode)
- node-pty + xterm for terminal
- Zod for validation

#### 📦 Packaging
- Linux: `.deb` via electron-builder
- Windows: `.exe` via NSIS installer
- macOS: (coming soon)

---

## [Unreleased]

### Planned
- [ ] macOS packaging support
- [ ] Automated CI/CD pipeline
- [ ] Unit & integration tests
- [ ] Plugin/extension system
- [ ] Docker development environment
- [ ] Multi-language support (i18n)
- [ ] PWA companion app
EOF 