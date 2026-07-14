# Elysium — The Living Valley Design System Bible

This document establishes the visual, interactive, and structural guidelines for the Elysium living portfolio world. Every component, whether built from scratch or adapted from libraries (like Componentry, Magic UI, or React Bits), must adhere to these specifications.

---

## 1. Color Palette

The palette is derived directly from the valley's natural cycle (dawn, sun rays, river flow, and dark foliage).

| Role | Color | HSL / Hex | Description |
| :--- | :--- | :--- | :--- |
| **Midnight Base** | Primary BG | `hsl(240, 29%, 4%)` / `#050508` | Deep night sky backdrop |
| **Living Amber** | Primary Accent | `hsl(16, 100%, 60%)` / `#ff6b35` | Energetic orange representing warmth and dawn |
| **Glacial Stream** | Water Accent | `hsl(169, 58%, 66%)` / `#78dcca` | Calm river flow and waterfall mist |
| **Forest Leaf** | Growth Accent | `hsl(142, 72%, 60%)` / `#4ade80` | Technical system terminals & developer markers |
| **Volumetric Sun** | Dawn Accent | `hsl(45, 91%, 70%)` / `#f8d66d` | Volumetric sunlight rays and highlight items |
| **Elysian Slate** | Text primary | `hsl(210, 40%, 98%)` / `#f8fafc` | Bright text with soft contrast |
| **Overcast Grey** | Text secondary | `hsl(215, 16%, 65%)` / `#94a3b8` | Muted descriptions and secondary text |

---

## 2. Typography

We employ a tripartite font hierarchy to anchor different modes of information.

- **Primary Interface (Outfit)**: Sans-serif font used for UI, labels, and telemetry. Highly readable under low contrast.
- **Operator Console (Fira Code)**: Monospaced font for technical specs, logs, developer metrics, and CLI inputs.
- **Narrative Titles (Playfair Display)**: Classic serif with high elegance, used only for narrative headers, lore markers, and scenic modal titles.

---

## 3. Motion Principles

Motion in Elysium is driven by natural forces (wind, water currents, gravity) rather than linear ease-in-out loops.

- **Natural Easing**: Use spring physics (`framer-motion` springs or CSS `cubic-bezier(0.16, 1, 0.3, 1)` - Ease Out Expo) to mimic organic momentum.
- **Hover Transitions**: Standard interactive state duration should be **200ms–300ms** to feel responsive yet calm.
- **Volumetric/Depth Motion**: Interactive camera zooms must feel like camera drones—gliding with high damping (`damping: 30`, `stiffness: 350`).
- **Preloader and Entrances**: Entrance animations fade from bottom to top with a slight offset, mirroring dawn spreading across the valley.

---

## 4. Glassmorphism & Refraction

UI overlays exist as physical structures placed in the valley. They are carved from "digital crystal".

- **Background**: `rgba(10, 10, 18, 0.55)` to ensure readability against dynamic canvas particles.
- **Backdrop Blur**: Minimum `backdrop-filter: blur(12px)`.
- **Borders**: Thin `1px` border with light opacity: `rgba(255, 255, 255, 0.08)`.
- **Active State Border**: Shifts to `rgba(255, 255, 255, 0.18)` or matching accent color glow on focus/hover.
- **Depth shadow**: Large, diffuse shadow `rgba(0, 0, 0, 0.4)` to elevate panels above background canvas elements.

---

## 5. Lighting & Glow Rules

Light is tangible in the valley.

- **Accent Glow**: Sub-elements can emit a soft glow using `box-shadow: 0 0 15px var(--accent-glow)`.
- **Volumetric Flares**: Subtle gradient overlays in the background (`radial-gradient`) simulating light scattering.
- **Interactive Triggers**: Hovering nodes must increase local particle velocity on the interactive canvases and brighten local glows.

---

## 6. Sound Design Principles

- **Ambient Audio**: Synthesized nature sounds (wind, water, birds) generated dynamically or layered via Web Audio API.
- **Dynamic Occlusion**: High-frequency sounds should attenuate (lowpass filter) when menus or modal screens are opened.
- **Fades**: Audio transition duration when muting or changing ambient mode must be at least **1.5 seconds** (using `exponentialRampToValueAtTime`) to avoid popping clicks.

---

## 7. Accessibility (A11y) & Reduced Motion

A living world must be accessible to all.

- **Reduced Motion Media Query**: All CSS/JS animations must honor `prefers-reduced-motion`. In this mode:
  - Complex canvas FAUNA particles stop moving.
  - Camera glides are skipped or instantly teleported.
  - Hover fanning/card stack rotations are collapsed into simple flat cards.
- **Screen Reader Support**: Ensure all custom modal triggers and CLI buttons have descriptive `aria-label` attributes.

---

## 8. Performance Budgets

To maintain the illusion of a living world, the site must run at high framerates.

- **Target Framerate**: **60 FPS** on mid-range mobile and desktop devices.
- **Memory Management**: Dispose of Three.js materials, geometries, and Web Audio synthesizers when navigating or turning off audio to prevent leaks.
- **DOM Size Limit**: Maintain static DOM elements under **1000 nodes**; dynamic elements should be computed on canvas to avoid reflow overhead.
