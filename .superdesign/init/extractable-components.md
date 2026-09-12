# Extractable components

## AppShell

- Source: `index.html` — `shell()`
- Category: layout
- Description: Sticky header, legal/code-context bars, desktop sidebar, mobile selector, and main region
- Extractable props: `activeRoute`, `calculatorCount`, `unitGroupCount`
- Hardcoded: HVAC Workbench brand, utility route labels, layout structure

## SidebarNavigation

- Source: `index.html` — `renderNav()`
- Category: layout
- Description: Searchable calculator navigation grouped by discipline
- Extractable props: `activeRoute`, `searchQuery`
- Hardcoded: group order and group display names

## CalculatorWorkspace

- Source: `index.html` — `render()`
- Category: layout
- Description: Two-panel inputs/result workspace with disclaimer and formula disclosure
- Extractable props: `title`, `description`, `badge`, `resultState`
- Hardcoded: Inputs/Reset labels, form/result structure

## Field

- Source: `index.html` — `fieldHTML()`
- Category: basic
- Description: Accessible numeric input or select with unit and help copy
- Extractable props: `label`, `value`, `unit`, `hint`, `disabled`
- Hardcoded: input/select structure and focus behavior

## ResultHero

- Source: `index.html` — `run()`
- Category: basic
- Description: Primary result, units, equivalents, detail rows, and formula disclosure
- Extractable props: `label`, `value`, `unit`, `status`
- Hardcoded: typography and numeric alignment

## CodeDisclaimer

- Source: `index.html` — `render()`
- Category: basic
- Description: Per-tool model-code scope, provenance, and AHJ/PE limitations
- Extractable props: `content`, `status`
- Hardcoded: disclaimer visual treatment

## CrossCodeChip

- Source: `index.html` — `run()`
- Category: basic
- Description: Cross-discipline handoff or deeplink card
- Extractable props: `id`, `label`, `body`, `cta`, `route`
- Hardcoded: source/target terminology and visual structure
