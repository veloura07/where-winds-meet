# Walkthrough: Living Valley Design System & React Integration

We have successfully integrated the **Living Valley Design System** and set up the compiler pipeline to run your React/Framer Motion component (`TeamPreview` and `OrbitCardStack`) alongside the Three.js ecosystem.

---

## What was completed

1. **Design System Specification**
   - Created [DESIGN_SYSTEM.md](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/DESIGN_SYSTEM.md) defining the color palette (amber, stream, forest leaf, sky), typography hierarchy, glassmorphism rules, spring motion curves, audio occlusion, accessibility focus, and performance targets.

2. **React Compiler Configuration (Vite + TS + Tailwind)**
   - Configured Vite: Created [vite.config.ts](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/vite.config.ts) for JSX compilation and path resolution.
   - Configured TypeScript: Created [tsconfig.json](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/tsconfig.json) mapping `@/*` paths to target files.
   - Configured Tailwind CSS: Created [tailwind.config.js](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/tailwind.config.js) and [postcss.config.js](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/postcss.config.js) mapping system colors.
   - Updated [package.json](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/package.json) devDependencies and dev scripts.

3. **Helper & Component Implementations**
   - Created [lib/utils.ts](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/lib/utils.ts) with the `cn` className helper.
   - Added [components/ui/orbit-card-stack.tsx](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/components/ui/orbit-card-stack.tsx) containing the fanning card stack logic.
   - Added [components/TeamPreview.tsx](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/components/TeamPreview.tsx) containing your team data mapping.
   - Created the entrypoint [src/main.tsx](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/src/main.tsx) to mount the React container.

4. **DOM/HTML Layout Integration**
   - Updated [index.html](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/index.html):
     - Widened the "About Me" modal card (`max-w-[950px]`) and split it into a 2-column grid.
     - Placed the bio/philosophy on the left and the React team container `#react-team-root` on the right.
     - Loaded the module script `/src/main.tsx` dynamically.

5. **Interactive Core Upgrades**
   - **Dynamic Color-Shifting Cursor**: Programmed custom hover event hooks. When hovering over hotspots or compass nodes, the custom cursor smoothly morphs color (e.g. teal for the waterfall, green for the village, gold for the shrine) to establish ambient feedback.
   - **Canvas Particle Trail Color Sync**: Linked the WebGL/Canvas mascot core and its trailing spark particles to shift color dynamically in tandem with the HTML custom cursor.
   - **Cinematic Parallax Focal Shifts ("Page Moving")**: Programmed automatic camera focus lens tracking. When you open a modal, the landscape smoothly zooms in (scale shifts from `1.03` to `1.15`) and pans specifically to focus on that node's spot in the valley, returning to normal when closed.
   - **Wind Force Console Command**: Added the `wind [low/medium/high]` command to the Operator Console. Running this command modifies the Three.js ecosystem simulation speed and updates CSS variables for tree sways in real-time.

---

## Local Setup & Run Instructions

To test your new interactive team view and sways:

### Step 1: Copy Visual Assets (including the clean background artwork)
Since you want a clean nature-only background, double-click:
- [run_copy_bg.bat](file:///c:/Users/namir/OneDrive/Documents/where%20winds%20meet%202/run_copy_bg.bat)
This runs the Python script `copy_bg.py` which copies the generated `nature_valley.png` (with the Hokage carvings removed) into your local `assets/` folder.

### Step 2: Install compiler dependencies
Open your command terminal in the project directory `c:\Users\namir\OneDrive\Documents\where winds meet 2` and run:
```bash
pnpm install
```

### Step 3: Run the interactive developer server
Run the following script command:
```bash
pnpm dev
```
Open the local URL `http://127.0.0.1:4173` in your browser. 

Click on the **Wooden Bridge** node (or click "S" on the compass menu) to trigger the modal. You'll see your bio on the left and the gorgeous interactive fanning cards showing your creative leads on the right!
