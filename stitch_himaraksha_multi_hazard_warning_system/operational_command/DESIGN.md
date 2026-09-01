---
name: Operational Command
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1b1b1d'
  surface-container: '#1f1f21'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e4e2e4'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e4e2e4'
  inverse-on-surface: '#303032'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#b9c7e0'
  on-secondary: '#233144'
  secondary-container: '#3c4a5e'
  on-secondary-container: '#abb9d2'
  tertiary: '#dec29a'
  on-tertiary: '#3e2d11'
  tertiary-container: '#231500'
  on-tertiary-container: '#957d5a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#fcdeb5'
  tertiary-fixed-dim: '#dec29a'
  on-tertiary-fixed: '#271901'
  on-tertiary-fixed-variant: '#574425'
  background: '#131315'
  on-background: '#e4e2e4'
  surface-variant: '#353436'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 12px
  margin: 16px
---

## Brand & Style

This design system is engineered for high-stakes operational environments, specifically disaster management and emergency response. The personality is authoritative, reliable, and strictly functional, prioritizing the rapid absorption of critical information over aesthetic flair. 

The style is a blend of **Corporate Modern** and **Utility-Driven Minimalism**. It utilizes a "Command Center" aesthetic characterized by high information density, structural rigidity, and a complete absence of decorative elements like gradients or blurs. Every visual choice is made to reduce cognitive load during emergencies, ensuring that users—from government officials to citizens in distress—can make informed decisions instantly.

## Colors

The palette is rooted in a deep navy and slate scale to provide a high-contrast foundation that reduces eye strain during long-term monitoring. Color is used strictly as a semantic tool for status signaling and data visualization.

- **Surface & Backgrounds**: Utilize `#0F172A` (Slate 950) for primary backgrounds and `#1E293B` (Slate 800) for containers to create clear hierarchy without shadows.
- **Semantic Status**: These colors are reserved for alerts and data points only. 
    - **Critical (#EF4444)**: Immediate life-safety threats.
    - **Warning (#F97316)**: High risk, action required.
    - **Watch (#F59E0B)**: Moderate risk, monitoring required.
    - **Success (#10B981)**: Safe zones, completed evacuations, or stable systems.
- **Interactions**: Use neutral grays and whites for buttons and inputs to avoid clashing with semantic status indicators.

## Typography

The typography system relies on **Inter** for all UI and prose elements due to its exceptional legibility at small sizes and high x-height. For telemetry, coordinates, and data-heavy tables, **JetBrains Mono** is used to ensure numerical clarity and character distinction (e.g., distinguishing '0' from 'O').

- **Hierarchy**: Use `label-caps` for section headers in sidebars and `data-mono` for all live-updating metrics.
- **Density**: Line heights are kept tight (1.2x to 1.5x) to maximize the amount of visible data on dashboards.
- **Mobile**: Scale `display-lg` down to `28px` for mobile alerts, but maintain `body-md` at `14px` for legibility.

## Layout & Spacing

This design system uses a **Fluid Grid** model with high-density spacing. The grid is based on a 4px baseline to allow for precise alignment of data modules and map overlays.

- **Dashboards**: Use a 12-column layout with 12px gutters. Sidebars should be fixed-width (approx. 280px to 320px) to maximize map/GIS real estate.
- **Padding**: Internal padding for data cards and table cells should be `sm` (8px) or `md` (16px) to allow more rows of data to be visible.
- **Adaptation**: On mobile, the layout collapses to a single column, but the header always maintains critical alert status visibility. Maps should allow for full-screen "Theater Mode" to facilitate field use.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Crisp Outlines** rather than shadows. In a disaster management context, shadows can muddy the interface and reduce the clarity of map features.

- **Layer 0 (Base)**: `#0F172A` - The primary background for the application.
- **Layer 1 (Container)**: `#1E293B` - Used for dashboard cards, sidebar background, and navigation. 
- **Layer 2 (Popovers/Modals)**: `#334155` - Used for tooltips and floating map controls.
- **Borders**: All containers must have a 1px solid border using `#475569` (Slate 600) to define boundaries on dark backgrounds.
- **Interactive States**: Use `#384455` for hover states and `#000000` for active/pressed states.

## Shapes

The shape language is rigid and industrial. A `Soft` (4px) corner radius is applied to UI components to provide a modern feel without sacrificing the "engineered" aesthetic. 

- **Cards & Containers**: 4px radius (`rounded-sm`).
- **Inputs & Buttons**: 4px radius.
- **Status Badges**: 2px radius for a sharper, more alert-like appearance.
- **Map Overlays**: 0px (sharp) edges where overlays meet the screen edge to maximize viewable area.

## Components

### Buttons
- **Primary**: Solid background (Slate 100), dark text (Slate 900). 
- **Secondary**: Outlined (1px Slate 600), transparent background.
- **Alert/Action**: Use semantic colors (Red/Orange) only for destructive or critical confirmation actions (e.g., "Broadcast Emergency Alert").

### Data Tables
- **Header**: High contrast background (`#334155`), bold `label-caps` text.
- **Rows**: Alternating subtle zebra striping for readability. 1px bottom border on every row.
- **Density**: Compact height (32px - 40px per row).

### GIS & Map Controls
- Floating control groups should be grouped vertically in the top-right. 
- Zoom levels and coordinate displays must use `data-mono` typography.
- Map markers for "Critical" status should include a subtle pulse animation to draw attention.

### Alert Banners
- Full-width bars at the top of the viewport.
- Background uses the semantic color (Red/Orange/Yellow) with white or black text depending on contrast requirements.
- Must include a clear "Time Elapsed" or "Timestamp" in the top right corner.

### Input Fields
- Dark backgrounds (`#0F172A`) with 1px Slate 600 borders.
- Focused state uses a 1px White border for maximum visibility.
- Error states use the Critical Red border color.