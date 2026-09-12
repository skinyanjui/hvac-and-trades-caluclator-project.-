---
version: "superdesign-alpha"
name: "Wireframe Diagram Light"
description: "Near-white editorial system built from schematic line-art diagrams, hairline dashed connectors, and a single solid black CTA pill against a flat neutral canvas."
colors:
  background: "#FFFFFF"
  surface: "#F2F2F2"
  surface-alt: "#141414"
  text-primary: "#000000"
  text-secondary: "#999999"
  border: "#000000"
  border-subtle: "#F2F2F2"
typography:
  display-lg:
    fontFamily: "xVFDisplay"
    fontSize: "48px"
    fontWeight: 500
    lineHeight: "1.08"
    letterSpacing: "-0.5px"
  headline-md:
    fontFamily: "xVF"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "1"
    letterSpacing: "0.1px"
  body-md:
    fontFamily: "xVF"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.53"
  label-md:
    fontFamily: "xVF"
    fontSize: "32px"
    fontWeight: 500
    lineHeight: "1.13"
    letterSpacing: "-0.3px"
  body-base:
    fontFamily: "xVF"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.5"
spacing:
  base: "8px"
  micro: "2px"
  gap-sm: "4px"
  gap-md: "16px"
  gap-lg: "24px"
  section-padding: "48px"
rounded:
  control-soft: "14px"
  card: "16px"
  pill: "9999px"
  sharp: "14px"
components:
  button-primary-hero:
    background: "#000000"
    text-color: "#FFFFFF"
    radius: "9999px"
    height: "24px"
    padding: "0px 12px"
    hover-background: "rgba(0, 0, 0, 0.8)"
  button-secondary-ghost:
    background: "rgba(0, 0, 0, 0.05)"
    text-color: "#000000"
    radius: "9999px"
    height: "24px"
    padding: "0px 12px"
    hover-background: "rgba(0, 0, 0, 0.1)"
  button-nav-utility:
    background: "transparent"
    text-color: "#000000"
    radius: "9999px"
    height: "22px"
    padding: "0px 0px 0px 8px"
  button-footer-link:
    background: "transparent"
    text-color: "#000000"
    radius: "0px"
    height: "20px"
    padding: "0px"
  card-diagram-panel:
    background: "#F2F2F2"
    radius: "0px"
    padding: "24px 0px 0px"
    border: "none"
  card-stat-block:
    background: "#F2F2F2"
    radius: "0px"
    padding: "0px"
  card-expandable-faq:
    background: "transparent"
    radius: "14.4px"
    padding: "16px 18px"
    border: "1px solid #F2F2F2"
  card-testimonial-dark:
    background: "#141414"
    text-color: "#FFFFFF"
    radius: "0px"
    padding: "0px"
---
# Wireframe Diagram Light
Source: https://business.x.com/en/advertising

## Overview
This is a minimalist, editorial system that substitutes photography and product screenshots with schematic line-art diagrams — dashed radiating connectors, small circle/square nodes, and thin-ruled boxes standing in for testimonials, performance charts, and offers. The palette is almost monochrome: near-white dominates (~83% of rendered pixels plus a further ~14% light gray), black carries all text and the single filled CTA, and one near-black panel is rationed for a testimonial callout. Typography is a single variable sans (xVF/xVFDisplay) doing all the work — no serif or script accents anywhere. The feel is Swiss/International in spirit: a strict grid, restrained palette, ruled hairlines, generous whitespace, and diagrams that behave like technical illustration rather than decoration.

## Composition
The first screen opens with a large two-line display headline flush left, immediately followed by a full-width diagram band (#F2F2F2) containing three linked line-art panels (testimonial, performance bars, offer) connected by radiating dashed lines — an explanatory schematic in place of a hero visual. Below it sits a short supporting line and the button pair (solid black primary + ghost secondary). Section rhythm continues predictably down the page: a three-up feature row of small icon-diagrams with captions, a large circular dashed-line "offer" diagram interrupting the flow at roughly half width, a stat/testimonial band mixing oversized numerals with a dark testimonial card, a tabbed step-by-step process module, a four-item asymmetric format showcase (one wide hero-style tile, two half-width tiles, one wide tile), a form-with-diagram contact band, an FAQ accordion, and a dense multi-column footer capped by a full-bleed outline wordmark. The deliberate choice is diagram-as-illustration over any photographic or screenshot imagery in the upper two-thirds of the page — this rejects the more common hero pattern of showing an actual product screenshot, instead keeping every visual abstract and line-based until the format-showcase cards near the bottom, which finally use light gray placeholder blocks to suggest real UI.

## Colors
Background is flat white (#FFFFFF, ~83–89% of the page) with a secondary near-white/light-gray surface (#F2F2F2, ~14%, declared area 50.1%) used for diagram bands, stat blocks, and card fills — the two are visually indistinguishable at a glance and together read as the "paper" of the page. Black (#000000, declared area 1.3%) is rationed to text, hairline strokes, diagram nodes, and the single solid CTA pill; it is the only saturated value in the system, functioning as the de facto brand/accent color in the total absence of hue. A near-black surface (#141414, ~3.2% area) appears once, as the fill of a testimonial card, giving it elevated, discrete weight against the white page. Grays (#999999, #D9D9D9) handle secondary/muted text and subtle dividers. Nothing is tinted or saturated — color itself is deliberately withheld so that structure, line weight, and typographic scale carry all hierarchy.

## Typography
A single variable sans family (xVF, with xVFDisplay for the largest size) spans the whole system — there is no accent serif or mono face. Display headlines run at 48px/500 weight, 1.08 line-height, -0.5px tracking (xVFDisplay) — used for page-level and section headlines. A large label size at 32px/500, 1.13 line-height, -0.3px tracking appears in the stat/numeral row for oversized figures. Small headline/label text sits at 13px/500, 1.0 line-height, 0.1px tracking — used for eyebrows, step numbers, and dense captions. Body copy runs 13px/400 at 1.53 line-height for tight paragraph text, with a slightly larger 16px/400 body mode for primary reading copy (black ink, secondary tone in white where reversed on dark cards). Hierarchy is built entirely through size and weight steps within one family, not through family-switching — a hallmark of this Swiss-leaning system.

## Layout
Content sits in an 8-column grid (measured gaps of 48px row / 16px column) inside a 1440px max-width container. Card and panel rows are consistently transparent-background, 0px-radius rectangles except for the rounded (14.4px) FAQ/expandable rows and the pill controls — radius is reserved for interactive or expandable elements only, never for static content panels. Row compositions observed: the first-screen feature trio runs as row-widths [24/24/24 | 24/24/24] (two rows of three even panels); the format showcase reads as one wide tile, then a row of two half-width tiles, then one wide tile again — an asymmetric magazine-style spanning pattern, not a uniform card grid; the stat/testimonial band runs [31/31/31 | 31/31] — three then two, uneven closing row; the FAQ list is a strict single-column stack (100% width rows repeated seven times). Spacing throughout uses an 8px-based scale (48, 24, 16, 8, 4, 2px), with 48px separating major diagram bands and 16px governing internal card gutters. The system does not lean on shadow or elevation to separate cards — separation comes from the #F2F2F2/white flip and hairline rules alone.

## Components
- **Navbar**: edge-to-edge, transparent/white bar, fixed height ~48px equivalent row, left-aligned logomark + product-switcher label, no visible center nav (docs-style left rail sits below it instead); four ghost-style utility buttons at far right/within the rail, each transparent, 9999px radius, 22px height, padding `0px 0px 0px 8px` — icon-led toggles, not primary actions. No CTA sits in the navbar itself; it is a documentation-shell header, not a marketing bar.
- **Button — primary (hero)**: solid black fill `#000000`, white text, radius `9999px` (full pill), height `24px`, padding `0px 12px`; hover darkens to `rgba(0,0,0,0.8)`. This is the single highest-contrast control on the first screen and the system's primary CTA.
- **Button — secondary (ghost)**: `rgba(0,0,0,0.05)` fill, black text, same pill radius `9999px`, height `24px`, padding `0px 12px`; hover to `rgba(0,0,0,0.1)`. Sits directly beside the primary button as the "talk to someone" alternative — visibly lower-contrast, reads as secondary/tertiary.
- **Button — footer/inline link**: fully transparent, black text, radius `0px`, height `20px`, no padding — plain underline-free text links used across the footer's four link columns.
- **Diagram panel (hero triptych)**: appears once, directly under the first headline, spanning the full content width at `#F2F2F2` fill, `0px` radius, `24px 0px 0px` padding; contains three bordered sub-panels (testimonial box with an oversized quote-glyph and a numeral+caption pairing, a bar-chart panel with circular node markers, an offer panel with a large numeral and small caption) linked by dashed radiating lines fanning to the panel edges.
- **Feature triptych (icon-diagram cards)**: three-per-row, ×2 rows (six total), transparent background, `0px` radius, top-padding `24px`; each card stacks a small abstract node-diagram illustration over a bold short heading and a two-line caption — no photography, no numerals here.
- **Stat/numeral row**: mixed grid of four to five blocks at `#F2F2F2` fill, `0px` radius, no padding; each block pairs one oversized numeral (32px label-md scale) with a short caption beneath — plus one darkened testimonial card at `#141414` fill carrying reversed white text, a small quote, and an attribution line with a tiny logo mark.
- **Stepper/tabs module**: a four-item horizontal tab row (numbered 01–04) with an active underline state, sitting above a two-column content area pairing a dashed-line diagram illustration on the left with descriptive copy on the right.
- **Format showcase cards**: four cards in an asymmetric arrangement — one wide tile with a large media placeholder and play-icon glyph, a mid-row pair of half-width tiles each showing a simplified card-in-card mockup (avatar block, text bars, thumbnail grid), and a closing wide tile again pairing a feed-style mockup with caption text; all transparent/`#F2F2F2` fills, `0px` radius, each paired with a small numeral label (01–04) and a heading + short paragraph.
- **Contact/lead form band**: two-column layout — left side a dashed circular-line diagram with a headline and short support line; right side a labeled form grid (First Name, Last Name, Company Name, Company Handle, Business Email, Phone, two select dropdowns, and a textarea), each field white-background with a thin border, plain black labels above; a solid black `Submit` button at bottom-right matches the primary button's radius and fill.
- **FAQ accordion**: single-column stack of seven rows at `14.4px` radius, `16px 18px` padding, each combining a heading, a trailing plus/expand icon, and collapsed body text — the only rounded-corner card family outside of buttons.
- **Footer**: full-width white (`#FFFFFF`) band, four link columns (27 links total) under plain black column headers, a language selector control, small platform-mode icon toggles (device/sun/moon), copyright line, and a giant full-bleed outlined wordmark treatment closing the page.

## Graphics & Effects
Two small linear gradients are used only as thin scrim edges, not backgrounds: `linear-gradient(rgb(255, 255, 255), rgba(0, 0, 0, 0))` and `linear-gradient(to top, rgb(255, 255, 255), rgba(0, 0, 0, 0))`, each covering roughly 0.4% of the page — these are fade-to-transparent edges on small diagram or card elements, not full-section washes. Two backdrop-filter blur values are present (`blur(12px)` and `blur(2px)`), applied to small overlay/glass-adjacent elements rather than any large panel — this is not a glassmorphic system overall; it is a flat, hairline-and-diagram system with only incidental blur on isolated components. No photographic imagery, noise, or grain texture appears; all "illustration" is vector line-art with dashed strokes and small circle/square node markers, giving the page a blueprint/schematic texture throughout.

## Motion
Interactive color/background changes use a fast, standard easing: `color, background-color, border-color, outline-color, ... 0.15s cubic-bezier(0.4, 0, 0.2, 1)`, matched by a slightly slower `opacity 0.15s cubic-bezier(0.4, 0, 0.2, 1)` for fades and a gentler `opacity 0.5s cubic-bezier(0.32, 0.72, 0, 1)` for larger reveal transitions. A secondary `font-variation-settings, color 0.2s ease` transition supports the variable font's weight-axis animation on hover/focus states. Named keyframe animations (`post-wall-drift`, `post-wall-float`, `post-carousel-drift`, `ad-format-float`, `ad-format-breathe`, `ad-format-orbit`) drive slow, looping ambient motion on the diagram illustrations — drifting, floating, breathing, and orbiting node elements — giving the otherwise static line-art a subtle continuous life without any hard cuts or bounces.

## Guardrails
- Never fill the hero or any full section with a saturated gradient — gradients here are sub-1%-of-page edge scrims only.
- Never round the static content/diagram panels — 0px radius is structural to this system; reserve 9999px and 14.4px radii strictly for buttons and expandable FAQ rows.
- Never introduce a second typeface — all hierarchy comes from one variable sans at different sizes/weights, not family-switching.
- Never replace the line-art/diagram illustrations with photography or screenshots above the format-showcase section — abstraction is the visual identity through the first two-thirds of the page.
- Never mistake the ghost/ring button for the primary CTA — the solid black pill is always the higher-contrast, primary action.
- Keep color rationed to black-on-white plus one dark testimonial panel; do not add hue anywhere else in the system.