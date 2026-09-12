# HVAC Workbench design system

## Product

HVAC Workbench is a dense professional utility for technicians, designers, inspectors, and engineers. It provides 47 engineering calculators and national-US model-code screening tools. The interface must prioritize fast calculator discovery, clear inputs, legible results, explicit source provenance, and persistent AHJ/PE limitations.

## Design direction

Inspired by the editorial restraint and schematic visual language extracted from `https://business.x.com/en/advertising`, adapted to a technical workbench rather than copied:

- white paper-like canvas with light-gray technical panels,
- black carries primary hierarchy and actions,
- restrained teal is retained only for source links, focus, and verified-navigation cues,
- large, tight display typography for route titles,
- 8-column editorial grid and 8 px spacing rhythm,
- hairline rules and dashed schematic connectors instead of shadows,
- pill treatment for actions and status controls,
- square/static content panels; rounded corners reserved for controls, disclosures, and alerts,
- one near-black surface may be used for the primary legal/provenance panel,
- no gradients, glassmorphism, photography, decorative illustration, or copied X branding.

## Typeface

Use **Geist Variable** for every interface role. Use Geist Mono only for formulas, identifiers, and code.

```css
@font-face {
  font-family: "Geist Variable";
  font-style: normal;
  font-display: swap;
  font-weight: 100 900;
  src: url("https://cdn.jsdelivr.net/fontsource/fonts/geist:vf@5.3.0/latin-wght-normal.woff2") format("woff2-variations");
}
```

- Display: 48 px / 1.08 / 560, tracking -0.04em
- Calculator title: clamp(32 px, 4vw, 48 px) / 1.06 / 560
- Section title: 24–32 px / 1.15 / 560
- Card title: 15 px / 1.3 / 560
- Body: 14–16 px / 1.55 / 400
- Label: 13 px / 1.25 / 520
- Metadata: 11–12 px / 1.4 / 500
- Formula: Geist Mono, 12–13 px / 1.6

## Colors

```css
--paper: #ffffff;
--canvas: #f6f6f6;
--ink: #0a0a0a;
--ink-soft: #262626;
--muted: #6b6b6b;
--quiet: #999999;
--line: #dedede;
--line-strong: #0a0a0a;
--dark: #141414;
--accent: #087e8b;
--accent-soft: #e8f4f5;
--danger: #9b3a1d;
--danger-soft: #fff1eb;
```

Black/white/light gray should occupy nearly the entire page. Teal must remain a functional semantic accent, not a decorative fill.

## Spacing and grid

- Base unit: 8 px
- Micro: 2, 4 px
- Control gaps: 8, 12, 16 px
- Panel padding: 16, 24, 32 px
- Route spacing: 32, 48 px
- Desktop content container: max 1440 px
- Sidebar: 232–248 px
- Main calculator grid: 8 columns; input/result panels each span 4
- Tablet: one-column panels
- Mobile: 16 px page gutter, 48 px minimum tap targets

## Components

### Header

48–56 px, white, one hairline bottom border. Brand at left; small utility pills at right. No oversized marketing CTA.

### Sidebar

Fixed/sticky desktop rail. Search control is a light-gray pill. Group labels are uppercase 11 px metadata. Active route uses black text, a light-gray or pale-teal fill, and a 2 px leading rule.

### Route heading

Large left-aligned calculator title with short supporting copy. Badge is a compact pill. Do not make each calculator page a marketing hero; preserve vertical efficiency.

### Input and result panels

Static panel geometry is square or 2–4 px radius with 1 px lines and no shadows. Inputs use 12–14 px corner radius because they are interactive. Result number is 48–64 px with tabular numerals.

### Buttons

- Primary: black fill, white text, full pill, 40–44 px height
- Secondary: `rgba(0,0,0,.05)` fill, black text, full pill
- Text/source: teal text, no fill
- Destructive/error: danger colors only when needed

### Disclaimers and provenance

Global legal/AHJ information uses one compact near-black band. Per-tool disclaimers use light-gray panels with a strong left rule and concise copy. Never reduce or hide safety language.

### Cross-code handoffs

Use schematic cards with a small identifier, source → target connector, short explanation, and pill CTA. Dashed connector lines are acceptable; do not use decorative illustrations.

### Results

The hero result is the strongest element after the route title. Detail rows use hairline separators. Formula disclosure remains collapsed by default, keyboard accessible, and uses Geist Mono.

## Motion

Use only 150–200 ms color, opacity, border, and small translate transitions. Disable all nonessential movement under `prefers-reduced-motion`. No ambient animations in the calculator workspace.

## Content and trust constraints

- Never claim “code compliant,” “approved,” “certified,” or “100% compliant.”
- Clearly distinguish engineering formulas, code-derived values, unverified examples, checklists, and path gates.
- Non-2024 project-context selections must state that embedded 2024 values do not change.
- Never invent proprietary table cells, refrigerant limits, ppm setpoints, conductor sizes, or AHJ decisions.
- Preserve visible source links, formula explanations, errors, keyboard behavior, and print output.

## Reference adaptation

Borrowed characteristics: editorial whitespace, monochrome hierarchy, Geist-compatible single-family typography, hairline grid, schematic handoff language, black pill actions, light-gray technical panels, and restrained motion.

Excluded characteristics: X branding, xVF fonts, advertising copy, testimonials, promotional claims, social-media imagery, and any layout that slows routine calculator use.
