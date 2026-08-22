# nexus-your-local-ai

Nexus is a local-first workspace for the open models already on your machine. The public website is the product surface. Chat with Ollama stays on your computer when you run the app locally.

**Live site:** [https://madiyarmoldakhmet-ai.github.io/nexus-your-local-ai/](https://madiyarmoldakhmet-ai.github.io/nexus-your-local-ai/)

## Rules

Follow these for every change. Do not invent a second visual language.

1. Treat the site like a Markdown document: one reading column, paper canvas, 88px of air between sections.
2. Follow `DESIGN.md` exactly. Tokens, pills (`rounded.full`), cards (`rounded.lg`), and the black/white/gray palette are the system.
3. No gradients, drop shadows, brand colors, or decorative photography. The llama mark is the only illustration.
4. Primary actions are a black pill. Dark mode inverts the canvas; it does not add a new palette.
5. Chat is a full-screen workspace, not a floating card with shadow. Composer is a pill. Messages sit in the 720px reading column.
6. Public GitHub Pages hosts the static site. Real model replies need Ollama on the machine (`ollama serve` + `npm run dev`).
7. Keep the Vite `base` as `/nexus-your-local-ai/` so GitHub Pages assets resolve.
8. Do not commit secrets, `.env` files, or `node_modules`. Deploy only through GitHub Actions on `main`.

## Local development

```bash
npm install
ollama serve
npm run dev
```

Vite serves the UI. `server.js` proxies `/api/models` and `/api/chat` to Ollama at `http://127.0.0.1:11434`.

## Website deploy

Push to `main`. `.github/workflows/deploy.yml` builds the static app and publishes GitHub Pages.

```bash
npm run build
```

The production bundle has no Express server. On the public site, chat is a preview of the workspace. For live local models, run the commands above.

## Stack

- React + Vite
- Express API for local Ollama (dev only)
- GitHub Pages for the website
- Design system: `DESIGN.md`
