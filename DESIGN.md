---
name: High-Velocity Engineering
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#c0c1ff'
  on-secondary: '#1000a9'
  secondary-container: '#3131c0'
  on-secondary-container: '#b0b2ff'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
  surface-elevated: '#1E293B'
  border-subtle: '#334155'
  status-operational: '#10B981'
  status-degraded: '#F59E0B'
  status-critical: '#EF4444'
  status-new: '#6366F1'
typography:
  display:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-code:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 24px
  gutter-default: 16px
  sidebar-width: 240px
  density-compact: 8px
  density-comfortable: 16px
---

## Brand & Style
The design system is engineered for high-density DevOps environments where clarity and speed are paramount. It targets senior engineers and site reliability specialists who require immediate cognitive processing of complex data. 

The aesthetic is **Modern Corporate with subtle Glassmorphism**, leaning heavily into a "Dark Mode First" philosophy. It draws inspiration from high-productivity tools like Linear, prioritizing functional elegance over decorative elements. The visual language uses deep slate depths, crisp borders, and electric blue accents to create a focused, low-strain interface.

## Colors
This system utilizes a hierarchical slate palette to define spatial depth. 
- **Primary Surface:** `#0F172A` serves as the canvas for the entire application.
- **Secondary Surface:** `#1E293B` is used for cards, sidebars, and elevated containers.
- **Accents:** Electric Blue (`#3B82F6`) is reserved for primary actions and active states. 
- **Semantic Status:** Status colors use high-saturation tokens to ensure they are glanceable against the dark background. Operational states should use low-opacity backgrounds with high-opacity text to maintain density.

## Typography
The system uses a triple-font approach to maximize readability in data-heavy contexts. 
- **Geist** is used for headlines to provide a sharp, technical feel.
- **Inter** handles all primary body text and interface labels for its high legibility at small scales.
- **JetBrains Mono** is mandatory for all technical IDs (e.g., `INC-2938`), commit hashes, and log data. Use it with tabular lining figures to ensure vertical alignment in tables and lists.

## Layout & Spacing
A 4px baseline grid governs all spacing. The layout philosophy is a **Fixed-Fluid Hybrid**:
- **Navigation:** A fixed 240px left-hand sidebar.
- **Content:** Fluid grid with a maximum container width of 1600px for dashboard views.
- **Density:** Default to "Compact" (8px spacing) for data tables and "Comfortable" (16px spacing) for settings or documentation.
- **Breakpoints:** Mobile (under 768px) collapses the sidebar into a bottom navigation or drawer; Tablet (768px-1024px) uses a slim iconic sidebar.

## Elevation & Depth
In the absence of heavy shadows, depth is achieved through **Tonal Layering** and **Subtle Border Glows**:
- **Level 0 (Base):** `#0F172A` (Backdrop).
- **Level 1 (Card):** `#1E293B` with a 1px border of `#334155`.
- **Level 2 (Hover/Overlay):** Same as Level 1 but with a subtle inner-glow: `box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.05)`.
- **Active State:** Elements should feature a 2px outer glow using a 10% opacity version of the Primary Blue (`#3B82F6`) to simulate an "energized" interface.

## Shapes
The system uses **Rounded (0.5rem)** as the base radius for most containers to maintain a modern, approachable feel without appearing "bubbly." 
- **Cards/Modals:** Use `rounded-xl` (1.5rem) for a distinct separation from the background.
- **Status Tags/Pills:** Use a full pill shape (999px) to differentiate them from interactive buttons.
- **Micro-badges:** Small 4px circles are used alongside text to indicate "live" connectivity or status.

## Components
- **Buttons:** Primary buttons use a solid `#3B82F6` with white text. Secondary buttons use the surface-elevated color with a subtle border.
- **Pill Status Tags:** Backgrounds should be 10-15% opacity of the status color with 100% opacity text (e.g., Critical uses 15% `#EF4444` background).
- **Input Fields:** Use `#0F172A` for the input background with a `#334155` border. On focus, the border transitions to Primary Blue with a 2px soft glow.
- **Data Tables:** Row height should be fixed at 40px for high density. Use JetBrains Mono for ID columns and Inter for descriptive columns.
- **Micro-Badges:** Used for notifications or count indicators; these should be placed in the top-right corner of icons with a 2px stroke matching the background color to create a "cutout" effect.
- **Command Palette:** A central, modal-based search/action component (`Cmd+K`) featuring high-contrast text and keyboard shortcut hints in mono-space labels.