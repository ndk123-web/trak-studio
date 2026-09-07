# Trak Studio — Design System & AI Prompt Kit

Paste the **System Rules** block at the top of any AI coding session (Cursor, v0, Claude, Windsurf, etc.) before asking it to build a screen or component. Then use the **Component Prompt Template** for each individual request.

---

## 1. SYSTEM RULES (paste this once per session)

```
You are building UI for "Trak Studio" — a local-first developer tool dashboard,
similar in feel to n8n, Jenkins, or Linear. It is NOT a marketing site. It is a
control panel a developer stares at for hours. Follow these rules strictly:

## Layout
- Persistent left sidebar, fixed width 240-280px, for navigation/workspace switching.
- Top bar shows a breadcrumb-style location (e.g. "trak / go-mastery / 02-escape-analysis"), not a page title.
- No hero sections, no marketing copy, no centered landing-page layouts. Every
  screen is a working view — dense, functional, immediately useful.
- Use a 4px/8px spacing grid ONLY. Every margin/padding/gap must be a multiple
  of 4 (4, 8, 12, 16, 24, 32, 48, 64px). Never use arbitrary values like 13px, 22px, 27px.

## Color — Dark Mode (default)
- Primary background: #07090e
- Surface / sidebar: #0b0f19 or #0e131f
- Elevated cards/panels: #161c2d
- Borders: rgba(255,255,255,0.05) to rgba(255,255,255,0.08) — thin borders only,
  NEVER box-shadows for separating panels in dark mode (shadows don't read on dark bg).
- Primary accent (emerald): #10b981 or #00bb7f
- Optional background grid on canvas/workspace areas only (NOT behind text/cards):
  32px x 32px grid lines at rgba(255,255,255,0.03)

## Color — Light Mode
- Canvas background: #f8fafc
- Card/surface: #ffffff with subtle drop shadow (shadows ARE fine in light mode)
- Borders: #e2e8f0
- Primary accent: #059669 or #047857
- Active highlight background: #ecfdf5
- Primary text: #0f172a

## Accent color discipline (CRITICAL)
- The emerald accent must cover no more than ~10% of any screen's pixels.
- Use it ONLY for: primary buttons, active/selected nav item, progress bars,
  success states, focus rings, checkmarks.
- Everything else must be neutral (gray/white/slate text, neutral card backgrounds).
- If you're using green for more than 2-3 elements on one screen, stop and switch
  the extra ones to neutral gray.

## Semantic status colors (always pair color WITH an icon/shape, never color alone)
- Success/Pass: #10b981 (emerald) + checkmark icon
- Error/Fail: #fb2c36 (red) + X icon
- Warning/In-progress: #f59e0b (amber) + warning triangle icon
- Info/Links: #06b6d4 or #38bdf8 (cyan)

## Typography
- UI font: system sans stack — -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Code/terminal font: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas
- Max 2 font weights per screen (e.g. 400 regular + 600 semibold). Never use
  more than 2 weights — it looks amateur.
- Type scale (px): 12, 14, 16, 20, 24, 32, 48. Never use a size outside this scale.

## Component conventions
- Buttons: 8px border-radius, no gradients, solid emerald fill for primary,
  transparent/outlined for secondary.
- Cards: #161c2d bg (dark) or #ffffff (light), thin border, 8-12px border-radius, no shadow in dark mode.
- Code editor (Monaco): custom theme matching #07090e background and #10b981
  accents — do NOT use Monaco's default vs-dark theme unmodified.
- Progress/completion views: prefer node-graph / connected-flowchart visuals
  (modules as nodes, filled emerald = complete, outlined = pending) over plain
  progress bars, to match the "blueprint" aesthetic.

## Things to NEVER do
- No multiple gradient colors or rainbow gradients.
- No centered marketing-style hero layouts.
- No random spacing values outside the 4px grid.
- No shadows in dark mode for panel separation (use borders).
- No more than one accent color total.
- No color-only status indicators (always pair with icon/shape).
```

---

## 2. COMPONENT PROMPT TEMPLATE (use per request)

Fill in the blanks and paste as your actual task prompt, right after the system rules above:

```
Build [COMPONENT/SCREEN NAME] for Trak Studio.

Context: [what this screen does, e.g. "shows curriculum progress across all
modules in the active workspace"]

Requirements:
- [functional requirement 1]
- [functional requirement 2]
- [functional requirement 3]

Follow the design system rules above exactly. In particular for this screen:
- Mode: [dark / light / both]
- Where should the emerald accent appear specifically: [e.g. "only on the
  'Continue Learning' button and the progress ring"]
- Reference style: [e.g. "Linear's project view", "Jenkins' pipeline stage view",
  "n8n's node canvas"] — match spacing density and information hierarchy from
  this, not colors.

Do not invent new colors, fonts, or spacing values outside the system above.
```

---

## 3. Example filled-in prompt (for your progress dashboard)

```
Build the "trak status" progress dashboard screen for Trak Studio.

Context: shows curriculum completion across all modules in the active workspace,
similar to `trak status` CLI output but as a visual web view.

Requirements:
- Show each module as a node in a connected flowchart (sequential path)
- Completed modules: filled emerald node with checkmark
- Pending modules: outlined node, neutral gray
- Current/next module: emerald border pulse or highlight ring
- Top of screen: overall % complete as a large number + thin progress bar
- Sidebar stays visible (workspace/track switcher)

Follow the design system rules above exactly. In particular for this screen:
- Mode: dark (default)
- Emerald accent only on: completed nodes, the current-module ring, and the
  top progress bar fill
- Reference style: Jenkins' pipeline stage view, but nodes should feel more
  like a tech-tree / skill-tree than a linear pipeline

Do not invent new colors, fonts, or spacing values outside the system above.
```

---

**Tip:** Keep this file in your repo (e.g. `/docs/DESIGN_SYSTEM.md`) and reference it explicitly in Cursor/Claude Code sessions ("read DESIGN_SYSTEM.md before building this") so every AI-generated screen stays consistent instead of drifting screen to screen — that drift is usually the real reason AI-built UIs feel inconsistent across a whole app.