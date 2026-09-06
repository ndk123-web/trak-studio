<p align="center">
  <img src="public/trak.png" alt="Trak Studio Logo" width="100" />
</p>

<h1 align="center">⚡ Trak Studio</h1>

<p align="center">
  <strong>The local visual workspace & interactive code studio for Trak CLI.</strong>
</p>

<p align="center">
  <a href="https://github.com/ndk123-web/trak-studio"><img src="https://img.shields.io/badge/version-1.0.0-emerald.svg" alt="Version"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61dafb.svg?logo=react" alt="React 19"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-blue.svg?logo=typescript" alt="TypeScript"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-6.x-646CFF.svg?logo=vite" alt="Vite"></a>
  <a href="https://microsoft.github.io/monaco-editor/"><img src="https://img.shields.io/badge/Editor-Monaco-brightgreen.svg" alt="Monaco Editor"></a>
  <a href="https://github.com/ndk123-web/trak-studio/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

---

## 📌 Overview

**Trak Studio** is the companion local web IDE embedded directly inside the **[Trak CLI](https://github.com/ndk123-web/trak)**. 

When you run:
```bash
trak studio
```
Trak CLI spins up a lightweight local server on `http://localhost:8200` and serves Trak Studio directly from memory—giving you a visual coding interface without requiring Node.js, npm, or any external runtime installed on your machine.

---

## ✨ Key Features

- 💻 **Offline Monaco Code Editor** — Full-featured VS Code-style editor with syntax highlighting, IntelliSense, bracket matching, and multiple theme options.
- 📂 **Full File Tree Freedom** — Browse, create, edit, and organize files and folders directly within your active track exercise.
- 🧪 **Live Test Verification** — Run `trak verify` with one click from the UI and get real-time compiler, runtime, and test feedback.
- 📖 **Interactive Split README Preview** — Read module tutorials, instructions, and hints in formatted markdown right next to your code with a draggable divider.
- 🗺️ **Curriculum & Track Navigation** — View your complete track progression, list all exercises, and jump between learning modules effortlessly.
- 🎛️ **Resizable & Collapsible Panes** — Slidable file explorer, draggable split editor, and collapsible sidebars with layout persistence via `localStorage`.
- 📦 **Embedded Single-Binary Architecture** — Production builds (`dist/`) compile to static assets that embed into the Go binary (`//go:embed`).

---

## 🏗️ Architecture Flow

```
   ┌────────────────────────────────────────────────────────┐
   │                       Trak CLI                         │
   │  $ trak studio                                         │
   │                                                        │
   │  ┌──────────────────────┐    ┌──────────────────────┐  │
   │  │   Embedded UI        │    │     Local Bridge     │  │
   │  │   //go:embed dist    │    │     /api/workspace   │  │
   │  │   (Trak Studio)      │    │     /api/verify      │  │
   │  └──────────┬───────────┘    └──────────┬───────────┘  │
   └─────────────┼───────────────────────────┼──────────────┘
                 │                           │
                 ▼                           ▼
        http://localhost:8200 (Served entirely from Go binary)
                 │
                 ▼
        ┌─────────────────────────────────────────────────┐
        │              Trak Studio in Browser             │
        │  • Monaco Editor   • Markdown Split-view        │
        │  • File Explorer   • Exercise Verification      │
        └─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler**: [Vite 6](https://vitejs.dev/)
- **Editor**: [@monaco-editor/react](https://github.com/suren-atoyan/monaco-react)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Markdown & Code Highlighting**: `react-markdown`, `remark-gfm`, `rehype-highlight`

---

## 🚀 Getting Started (Local Development)

To run and develop Trak Studio independently in your browser:

### 1. Prerequisites
- Node.js (v18+)
- npm or pnpm

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:8200](http://localhost:8200) (or the port specified in terminal) in your browser.

---

## 📦 Building for Go CLI Embedding

To build and prepare static files for embedding into `trak-cli`:

### 1. Build the Production Bundle
```bash
npm run build
```
This generates optimized static files inside the `dist/` directory.

### 2. Copy `dist/` to Trak CLI
Copy the contents of `dist/` into `trak-cli/cmd/dist/`:

**Windows (PowerShell):**
```powershell
Copy-Item -Recurse -Force dist\* ..\trak-cli\cmd\dist\
```

**Linux / macOS:**
```bash
cp -r dist/* ../trak-cli/cmd/dist/
```

### 3. Compile Go Binary
```bash
cd ../trak-cli
go build -o trak .
```
Now `trak studio` will launch this bundled UI anywhere!

---

## 🔗 Related Projects

- **[trak-cli](https://github.com/ndk123-web/trak)** — The core Go terminal tool for interactive coding exercises.
- **[trak-web](https://github.com/ndk123-web/trak-web)** — The public web platform, track registry explorer, and Blueprint Studio.
- **[trak-registry](https://github.com/ndk123-web/trak-registry)** — Official curriculum repositories and exercise AST blueprints.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
