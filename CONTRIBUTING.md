# Contributing to Project Manager Pro

We love contributions! Thank you for considering helping improve **Project Manager Pro**. Please take a moment to review this guide.

## 🧭 Code of Conduct

This project adheres to a [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🐛 Reporting Bugs

1. **Search existing issues** first — someone may have already reported it.
2. If not found, [open a new issue](https://github.com/Admiral-haking/pro-project-manager/issues/new).
3. Use the **Bug Report** template and fill in all relevant sections.
4. Include:
   - OS and version
   - Node.js / npm versions
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots / logs if applicable

## 💡 Feature Requests

We welcome new ideas! Open a **Feature Request** issue and describe:
- What the feature does
- Why it's useful
- How it should work (mockups help!)

## 🔧 Setting Up Development

```bash
# 1. Fork & clone the repo
git clone git@github.com:YOUR_USERNAME/pro-project-manager.git
cd pro-project-manager

# 2. Install dependencies
npm install

# 3. Set up MongoDB (default: mongodb://127.0.0.1:27017/project-manager)
export MONGODB_URI="mongodb://127.0.0.1:27017/project-manager"

# 4. Start development
npm run dev
```

## 📝 Coding Guidelines

- **TypeScript**: All code must be typed. Use strict TypeScript checks.
- **Formatting**: We follow standard Prettier rules (single quotes, trailing commas).
- **Commits**: Use [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation only
  - `refactor:` code change that neither fixes nor adds
  - `chore:` maintenance tasks
- **Branching**: Create a feature branch from `main`:
  ```bash
  git checkout -b feat/your-feature-name
  ```

## 🧪 Testing

```bash
npm run lint    # TypeScript type checking
npm run build   # Full build (Electron + Next.js)
```

## 📤 Pull Request Process

1. Ensure your branch is up to date with `main`.
2. Run `npm run build` and `npm run lint` successfully.
3. Write a clear PR description explaining what and why.
4. Link related issues (e.g., `Closes #12`).
5. Wait for review — address feedback if needed.

## 📦 Project Structure

```
src/
├── electron/          # Electron main process
│   ├── backend/       # MongoDB models, services, connection
│   ├── main/          # Main process entry, IPC, windows, tray
│   ├── preload/       # Preload bridge
│   └── shared/        # Shared utilities
├── next/              # Next.js frontend (App Router)
│   ├── app/           # Pages & layouts
│   ├── components/    # Shared UI components
│   ├── layouts/       # App layout & navigation
│   ├── views/         # Feature views
│   ├── theme/         # MUI theme config
│   └── hooks/         # Custom React hooks
assets/                # App icons & images
```

## ❓ Questions

Open a [Discussion](https://github.com/Admiral-haking/pro-project-manager/discussions) or contact the maintainer.

---

**Thank you for contributing! 🚀**
EOF 