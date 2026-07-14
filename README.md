# Elysium — Living Digital World

Elysium is a static, deployable cinematic portfolio prototype for Sreeshanth Reddy Namireddy. It combines layered scene composition, canvas-based world simulation, climate controls, procedural audio, interactive hotspots, an operator console, and visit-memory unlocks.

## Run locally

```bash
npm start
```

Open `http://127.0.0.1:4173`.

## Validate and build

```bash
npm run check
npm run build
npm run preview
```

The production artifact is emitted to `dist/` and can be deployed to Vercel, Netlify, GitHub Pages, Cloudflare Pages, or any static host.

## Current production limits

This is a strong interactive prototype, not a final AAA/game-engine-grade world. The main remaining work is shader-quality rendering, asset direction, spatial audio, state persistence, mobile optimization, and a real portfolio content pipeline.
