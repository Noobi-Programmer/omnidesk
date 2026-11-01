---
name: Executive Intelligence Workspace
colors:
  surface: '#111316'
  surface-dim: '#111316'
  surface-bright: '#37393c'
  surface-container-lowest: '#0c0e11'
  surface-container-low: '#1a1c1f'
  surface-container: '#1e2023'
  surface-container-high: '#282a2d'
  surface-container-highest: '#333538'
  on-surface: '#e2e2e6'
  on-surface-variant: '#c6c5d5'
  inverse-surface: '#e2e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#908f9e'
  outline-variant: '#454652'
  surface-tint: '#bdc2ff'
  primary: '#bdc2ff'
  on-primary: '#121f8b'
  primary-container: '#5e6ad2'
  on-primary-container: '#fdfaff'
  inverse-primary: '#4854bb'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#a36700'
  on-tertiary-container: '#fffaf9'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dfe0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000965'
  on-primary-fixed-variant: '#2e3aa2'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#111316'
  on-background: '#e2e2e6'
  surface-variant: '#333538'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Geist
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  mono-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style

This design system embodies a calm, precise, executive-grade workspace built for dense information consumption and sharp decision-making. Merging the utilitarian rhythm of Linear, the structural composure of Notion, and the typographic rigor of Stripe, the design ethos prioritizes focus, clarity, and understated craft. 

The aesthetic is functional minimalism executed with dark-mode discipline. It avoids decorative artifacts such as luminous neon glows, simulated glass gradients, or arbitrary flourishes. Every pixel serves to anchor structure, establish hierarchy, or reduce cognitive friction for operators managing high-consequence intelligence workflows. Visual poise is achieved strictly through precise spatial relationships, deliberate typographic contrast, and restrained chromatic signaling.

## Colors

The palette is tuned for long sessions in low-light environments, prioritizing eye comfort and low-vibrancy precision.

### Surfaces & Foundations
- **Canvas Base:** `#111315` — The deep foundation under all workspace panels and navigation gutters.
- **Main Surface:** `#181A1D` — The primary elevation for editors, main dashboards, feeds, and document bodies.
- **Secondary Surface:** `#1E2125` — Nested containers, toolbars, side drawers, table headers, and modal overlays.
- **Active / Hover Surface:** `#24282E` — Transient state feedback for interactive surface areas.
- **Subtle Border:** `#26292E` — The primary boundary line for delineating structural regions without high-contrast distraction.
- **Muted Border:** `#32363D` — Used sparingly for active focus outlines and elevated card dividers.

### Typography & Content
- **Primary Text:** `#F0F1F3` — High legibility neutral with softened contrast against dark grounds to prevent glare.
- **Secondary Text:** `#92979F` — Descriptive metadata, supporting labels, and passive interface elements.
- **Muted / Inactive Text:** `#6B7280` — Missing values, disabled controls, non-actionable placeholders, and system timestamps.

### Semantic Accents
- **Indigo Accent:** `#5E6AD2` — Primary interactive emphasis, key active states, selection pills, and structural focus rings.
- **Emerald Accent:** `#10B981` — Verified operational status, positive metrics, and completed checks.
- **Amber Accent:** `#F59E0B` — Restrained warning tags, pending approvals, and latency notices.
- **Destructive Accent:** `#EF4444` — Critical system failures and irreversible destructive confirmations.

## Typography

The type system balances technical precision and calm reading density. 

- **Geist** serves as the primary family across all interface text, headings, and functional controls. Its tight geometric curves and neutral proportions provide an uneditorial, executive tone suitable for fast scanning.
- **JetBrains Mono** is applied strictly to data-dense strings: prices, monetary calculations, network URLs, IDs, timestamps, and compact telemetry tags.

Headlines employ slight negative tracking (`letterSpacing`) to prevent loose letterforms at scale, while mono-tokens utilize optical parity with standard sizes to prevent uneven visual vertical alignment when interspersed in tabular displays.

## Layout & Spacing

Layouts follow a structured multi-pane architecture common to high-density productivity environments:

- **Desktop (>= 1280px):** Multi-pane layout consisting of a fixed navigation panel (240px), contextual master lists or metadata bars (320px), and an open content canvas that scales fluidly within an outer boundary margin of `margin-desktop`.
- **Tablet (768px - 1279px):** Contextual secondary panes convert into expandable overlay drawers; the primary canvas retains minimum widths to prevent data compression, utilizing `gutter` spacing between components.
- **Mobile (< 768px):** Single-column stacked mode with navigation collapsed into a bottom command trigger. Content cards and data tables convert to responsive key-value lists using horizontal edge padding bounded by `margin`.

Internal components strictly respect a compact 4px spatial rhythm (`space-xs` to `space-xl`), ensuring vertical tightness without overcrowding interactive hit states.

## Elevation & Depth

Visual hierarchy is constructed purely through **tonal separation** and **subtle 1px boundaries**, rejecting drop shadows, heavy blur filters, or bright borders.

1. **Base Layer (`#111315`):** Root shell, canvas background, and structural gutters.
2. **Standard Surface (`#181A1D`):** Primary workspaces, data sheets, and document cards. Delimited from the base layer via a solid `1px` border of `#26292E`.
3. **Elevated Surface (`#1E2125`):** Popovers, context menus, command bars, dropdown trays, and modal sheets. These surfaces rest on top of primary work areas and use a subtle border of `#32363D` paired with an understated, diffused shadow (`0px 8px 24px rgba(0, 0, 0, 0.45)`) to cleanly separate them from adjacent planes.
4. **Interactive Focus Layer:** Form controls and selected list rows never elevate via blur or glow; focus is rendered via an inset or immediate `1px` boundary stroke of `#5E6AD2`.

## Shapes

The interface utilizes a disciplined, soft shape radius (`roundedness: 1`, mapping to `4px` standard corners). 

- **Interactive Elements (Inputs, Buttons, Badges):** `4px` border-radius ensures a structured, compact presence that stacks cleanly within tight tables and utility ribbons.
- **Panels & Containers:** `6px` to `8px` (`rounded-lg`) border-radius on modal views and floating dialog windows, offering just enough softness to distinguish independent planes from the underlying canvas.
- **Pill Exceptions:** Rounded-full tokens are restricted solely to inline verification avatars and counter badges containing single numeric glyphs.

## Components

### Buttons
- **Primary:** Surface `#5E6AD2`, text `#F0F1F3`, border transparent. On hover: surface `#6C78DE`. Focus ring: `1px solid #5E6AD2`.
- **Secondary:** Surface `#1E2125`, text `#F0F1F3`, border `1px solid #26292E`. On hover: surface `#24282E`, border `#32363D`.
- **Ghost:** Surface transparent, text `#92979F`. On hover: surface `#1E2125`, text `#F0F1F3`.
- **Dimensions:** 28px height for compact metadata rows; 34px height for primary canvas actions. Padding: 8px horizontal (`space-sm`) to 12px horizontal (`space-md`).

### Status Badges & Chips
- **Neutral:** Surface `#181A1D`, border `1px solid #26292E`, text `#92979F` in `label-sm` with optional monospace detail.
- **Verified:** Surface `#10B981` at 10% opacity, border `1px solid rgba(16, 185, 129, 0.25)`, text `#10B981`.
- **Warning:** Surface `#F59E0B` at 10% opacity, border `1px solid rgba(245, 158, 11, 0.25)`, text `#F59E0B`.
- **Missing / Incomplete:** Surface `#1E2125`, border `1px solid #26292E`, text `#6B7280`.

### Data Lists & Tables
- Table headers use surface `#181A1D`, font `label-sm`, text `#92979F`, with a single bottom boundary `1px solid #26292E`.
- Rows use alternating state on interaction (`hover: #1E2125`), height 36px, with text `#F0F1F3` in `body-sm`. Numeric or hash records use `mono-sm`.
- Dividers between rows are continuous `1px solid #26292E`.

### Form Inputs
- Background `#181A1D`, border `1px solid #26292E`, text `#F0F1F3`, placeholder text `#6B7280`.
- Height 32px, inner padding `space-sm` horizontal.
- Active/Focus: Border transitions to `#5E6AD2`, zero outer shadow glow.

### Selection Controls (Checkboxes & Radios)
- Dimension: 14px × 14px, radius 3px for checkboxes, circular for radios.
- Unchecked: Background `#181A1D`, border `1px solid #32363D`.
- Checked: Background `#5E6AD2`, border `#5E6AD2`, checkmark icon `#F0F1F3`.

### Cards & Intelligence Panels
- Background `#181A1D`, border `1px solid #26292E`, corner radius 6px.
- Padding: `space-lg` (20px). Panel header contains title in `headline-sm`, right-aligned actions, separated from card content via a `1px solid #26292E` divider.
- No elevation drops; depth is communicated solely via contrast between `#111315` and `#181A1D`.