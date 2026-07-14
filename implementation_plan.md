# Implementation Plan: Living Valley Design System & React Component Integration

This plan outlines the steps to initialize the **Living Valley Design System** (creating `DESIGN_SYSTEM.md`), integrate a React compiling framework (Vite + TypeScript + Tailwind CSS), and deploy the requested `OrbitCardStack` and `TeamPreview` components.

---

## User Review Required

> [!IMPORTANT]
> The project currently runs as a static HTML/JS site without a bundler, which makes it impossible to directly run React `.tsx` components (like `TeamPreview` and `OrbitCardStack` using JSX, Framer Motion, and Tailwind CSS) without a build step.
> 
> We propose **introducing Vite + TypeScript + Tailwind CSS** as a modern compiler pipeline.
> This will allow bundling React components, compiling TypeScript/JSX, and optimizing the static files for production, while keeping your existing Three.js world (`engine.js` and `script.js`) fully operational.

---

## Proposed Changes

### Component 1: Design System Documentation

#### [NEW] [DESIGN_SYSTEM.md](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/DESIGN_SYSTEM.md)
Create a comprehensive design system document that defines:
- **Color Palette**: High-fidelity HSL/hex color codes derived from the artwork (e.g., Warm Orange `#ff6b35`, Dark Background `#050508`, and accents like Emerald, Teal, and Amber).
- **Typography**: Specifying fonts (`Outfit`, `Fira Code`, `Playfair Display`) and scale.
- **Glassmorphism Rules**: Standards for frosted panels, borders, and blurs.
- **Motion Principles**: Defining easing (`cubic-bezier`), spring configurations, and reduce-motion guidelines.
- **Lighting & Depth**: Standardizing glows, volumetric rays, and depth stacking (`zIndex`).

---

### Component 2: React Build & Config Setup

We will configure Vite, PostCSS, Tailwind CSS, and TypeScript so that the project can build React components locally.

#### [MODIFY] [package.json](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/package.json)
- Add devDependencies: `vite`, `typescript`, `@types/react`, `@types/react-dom`, `@types/three`, `tailwindcss`, `postcss`, `autoprefixer`, `vite-tsconfig-paths`.
- Add dependencies: `framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`.
- Add npm scripts: `dev` (runs vite dev server), `build` (compiles and bundles via Vite).

#### [NEW] [vite.config.ts](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/vite.config.ts)
Vite configuration to bundle TypeScript/React and resolve path aliases (`@/*`).

#### [NEW] [tsconfig.json](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/tsconfig.json)
TypeScript configuration supporting React and JSX.

#### [NEW] [tailwind.config.js](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/tailwind.config.js)
Tailwind configuration referencing all source files.

#### [NEW] [postcss.config.js](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/postcss.config.js)
PostCSS configuration to compile Tailwind.

---

### Component 3: Component Implementation

We will add the components and mount them in the DOM.

#### [NEW] [utils.ts](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/lib/utils.ts)
Helper function `cn` for joining Tailwind classes.

#### [NEW] [orbit-card-stack.tsx](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/components/ui/orbit-card-stack.tsx)
The OrbitCardStack component retrieved from the componentry.dev registry.

#### [NEW] [TeamPreview.tsx](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/components/TeamPreview.tsx)
The TeamPreview component provided in the user request.

#### [NEW] [main.tsx](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/src/main.tsx)
React entrypoint. This will mount `<TeamPreview />` to a specific container in the HTML page.

#### [MODIFY] [index.html](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/index.html)
- Add a root element container inside the "About Me" modal (`modal-about`) or create a new dedicated hotspot/modal for the "Team Preview".
- Add the entrypoint `<script type="module" src="/src/main.tsx"></script>`.

---

## Verification Plan

### Automated Verification
Since local process execution (`run_command`) is restricted by OneDrive directory ACLs, verification will be done via static checks:
- Verify that `DESIGN_SYSTEM.md` compiles successfully and covers all required design aspects.
- Run `npm run check` (static files check) to ensure no breakage.

### Manual Verification
1. Run `pnpm install` in the workspace directory.
2. Run `pnpm dev` to launch the Vite local server and test the interactive **Orbit Card Stack** and animations.
3. Validate that the React component renders beautifully inside the glassmorphism modal on the page.
